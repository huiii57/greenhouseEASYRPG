import { notion } from './notionClient.js';

// 書櫃內文讀取／編輯策略：
//
// 支援的「文字型」block（會轉換成一行文字，並標上好認的前綴）：
//   paragraph        → （無前綴）
//   heading_1/2/3     → # / ## / ###
//   bulleted_list_item → -
//   numbered_list_item → 1.（實際編號由 Notion 自動處理，我們只是顯示用）
//   to_do             → [ ] / [x]
//   toggle            → ▸（子內容會遞迴往下讀，並用縮排表示層級）
//   quote             → >
//
// 不支援直接編輯的 block（資料庫、表格、嵌入內容、圖片、程式碼等）：
// 讀取時會保留一行提示文字讓你知道那裡有東西，但不會嘗試轉成純文字，
// 也「絕對不會」在儲存時被刪除重建——只要頁面裡有任何一個這種 block，
// 整頁就會被標記為 unsupported，前端會改成唯讀顯示，不提供編輯／儲存，
// 避免不小心把你的資料庫、表格等內容整個砍掉。

const PREFIX_MAP = {
  heading_1: '# ',
  heading_2: '## ',
  heading_3: '### ',
  bulleted_list_item: '- ',
  numbered_list_item: '1. ',
  quote: '> '
};

// 這些 block 類型的 rich_text 藏在 block[type].rich_text 裡，可以用同一種方式讀取
const TEXT_BLOCK_TYPES = new Set([
  'paragraph',
  'heading_1',
  'heading_2',
  'heading_3',
  'bulleted_list_item',
  'numbered_list_item',
  'to_do',
  'toggle',
  'quote'
]);

// 這些是常見「不支援線上編輯」的內容型態
const UNSUPPORTED_LABELS = {
  child_database: '資料庫',
  child_page: '子頁面',
  table: '表格',
  table_row: '表格列',
  embed: '嵌入內容',
  image: '圖片',
  video: '影片',
  file: '檔案',
  pdf: 'PDF',
  code: '程式碼區塊',
  column_list: '分欄版面',
  column: '分欄',
  link_preview: '連結預覽',
  bookmark: '書籤',
  callout: '標註框',
  divider: '分隔線',
  table_of_contents: '目錄',
  synced_block: '同步區塊'
};

function extractRichText(block) {
  const type = block.type;
  const data = block[type];
  if (!data || !Array.isArray(data.rich_text)) return null;
  return data.rich_text.map((t) => t.plain_text).join('');
}

function blockToLine(block, depth) {
  const indent = '  '.repeat(depth);
  const type = block.type;

  if (type === 'to_do') {
    const text = extractRichText(block) || '';
    const checked = block.to_do?.checked ? '[x] ' : '[ ] ';
    return `${indent}${checked}${text}`;
  }

  if (type === 'toggle') {
    const text = extractRichText(block) || '';
    return `${indent}▸ ${text}`;
  }

  if (PREFIX_MAP[type]) {
    const text = extractRichText(block) || '';
    return `${indent}${PREFIX_MAP[type]}${text}`;
  }

  // paragraph 或其他有 rich_text 的型別：無前綴
  const text = extractRichText(block);
  if (text !== null) {
    return `${indent}${text}`;
  }

  return null;
}

async function listChildren(blockId) {
  const blocks = [];
  let cursor;
  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor
    });
    blocks.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);
  return blocks;
}

// 遞迴讀取內容，回傳 { lines, hasUnsupported }
async function readBlocksRecursive(blockId, depth = 0) {
  const blocks = await listChildren(blockId);
  const lines = [];
  let hasUnsupported = false;

  for (const block of blocks) {
    if (!TEXT_BLOCK_TYPES.has(block.type)) {
      const label = UNSUPPORTED_LABELS[block.type] || block.type;
      lines.push(`${'  '.repeat(depth)}［不支援線上編輯的內容：${label}，請直接到 Notion 修改］`);
      hasUnsupported = true;
      continue;
    }

    const line = blockToLine(block, depth);
    if (line !== null) lines.push(line);

    // toggle 底下可能還有子內容，遞迴往下讀（縮排 +1）
    if (block.has_children) {
      const nested = await readBlocksRecursive(block.id, depth + 1);
      lines.push(...nested.lines);
      if (nested.hasUnsupported) hasUnsupported = true;
    }
  }

  return { lines, hasUnsupported };
}

export async function readBlocksAsText(pageId) {
  const { lines, hasUnsupported } = await readBlocksRecursive(pageId, 0);
  return { content: lines.join('\n'), hasUnsupported };
}

// --- 寫入：把每一行文字依前綴轉回對應的 block type ---
// 只支援單層（不含 toggle 巢狀子內容），因為這是「重新整批建立」的簡化寫法。
// 呼叫端在 hasUnsupported 為 true 時不應該呼叫這個函式（前端也會擋掉存檔按鈕）。

function lineToBlock(line) {
  const trimmed = line;

  let match;
  if ((match = trimmed.match(/^### (.*)$/))) {
    return { type: 'heading_3', heading_3: { rich_text: textRich(match[1]) } };
  }
  if ((match = trimmed.match(/^## (.*)$/))) {
    return { type: 'heading_2', heading_2: { rich_text: textRich(match[1]) } };
  }
  if ((match = trimmed.match(/^# (.*)$/))) {
    return { type: 'heading_1', heading_1: { rich_text: textRich(match[1]) } };
  }
  if ((match = trimmed.match(/^\[x\] (.*)$/i))) {
    return { type: 'to_do', to_do: { rich_text: textRich(match[1]), checked: true } };
  }
  if ((match = trimmed.match(/^\[ \] (.*)$/))) {
    return { type: 'to_do', to_do: { rich_text: textRich(match[1]), checked: false } };
  }
  if ((match = trimmed.match(/^▸ (.*)$/))) {
    return { type: 'toggle', toggle: { rich_text: textRich(match[1]) } };
  }
  if ((match = trimmed.match(/^> (.*)$/))) {
    return { type: 'quote', quote: { rich_text: textRich(match[1]) } };
  }
  if ((match = trimmed.match(/^-\s(.*)$/))) {
    return { type: 'bulleted_list_item', bulleted_list_item: { rich_text: textRich(match[1]) } };
  }
  if ((match = trimmed.match(/^\d+\.\s(.*)$/))) {
    return { type: 'numbered_list_item', numbered_list_item: { rich_text: textRich(match[1]) } };
  }

  return { type: 'paragraph', paragraph: { rich_text: textRich(trimmed) } };
}

function textRich(text) {
  return text ? [{ type: 'text', text: { content: text } }] : [];
}

function textToBlocks(content) {
  const lines = (content || '').split('\n');
  return lines.map((line) => ({ object: 'block', ...lineToBlock(line) }));
}

export async function replaceBlocksWithText(pageId, content) {
  const existing = await listChildren(pageId);

  for (const block of existing) {
    await notion.blocks.delete({ block_id: block.id });
  }

  const newBlocks = textToBlocks(content);
  if (newBlocks.length > 0) {
    await notion.blocks.children.append({
      block_id: pageId,
      children: newBlocks
    });
  }
}
