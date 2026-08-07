import { notion } from './notionClient.js';

// 把內文簡化為「純文字段落」處理：簡單、可靠、容易維護。
// 讀取：把所有 paragraph block 用換行接成一個字串。
// 寫入：整批刪除舊 block，重新依換行切段落 append。

function blockToText(block) {
  if (block.type !== 'paragraph') return '';
  return block.paragraph.rich_text.map((t) => t.plain_text).join('');
}

function textToBlocks(content) {
  const lines = (content || '').split('\n');
  return lines.map((line) => ({
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: line ? [{ type: 'text', text: { content: line } }] : []
    }
  }));
}

export async function readBlocksAsText(pageId) {
  const blocks = [];
  let cursor;
  do {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor
    });
    blocks.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  return blocks.map(blockToText).join('\n');
}

export async function replaceBlocksWithText(pageId, content) {
  let cursor;
  const existing = [];
  do {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor
    });
    existing.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

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
