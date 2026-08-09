import { notion, getCheckbox, getSelect, getMultiSelect, getDate, todayStr, normalizeDatabaseId } from '../_lib/notionClient.js';
import { readBlocksAsText, replaceBlocksWithText } from '../_lib/blocks.js';
import { requireAuth } from '../_lib/session.js';
import { sendError } from '../_lib/errors.js';

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  if (req.method === 'GET') return handleGet(req, res);
  if (req.method === 'POST') return handleCreate(req, res);
  if (req.method === 'PATCH') return handleUpdate(req, res);
  res.status(405).json({ error: 'Method not allowed' });
}

function getDbId(res) {
  const dbId = normalizeDatabaseId(process.env.NOTION_DB_JOURNAL);
  if (!dbId) {
    res.status(500).json({ error: '環境變數 NOTION_DB_JOURNAL 未設定，請檢查 Vercel 的 Environment Variables' });
    return null;
  }
  return dbId;
}

// 查詢今天是否已有日記，若有就一併回傳內文
async function handleGet(req, res) {
  try {
    const dbId = getDbId(res);
    if (!dbId) return;
    const today = todayStr();

    const response = await notion.databases.query({
      database_id: dbId,
      filter: {
        property: '日期',
        date: { equals: today }
      }
    });

    if (response.results.length === 0) {
      res.status(200).json({ exists: false, date: today });
      return;
    }

    const page = response.results[0];
    const p = page.properties;
    const { content, hasUnsupported } = await readBlocksAsText(page.id);

    res.status(200).json({
      exists: true,
      id: page.id,
      date: getDate(p['日期']),
      聊天: getCheckbox(p['聊天']),
      學習: getCheckbox(p['學習']),
      運動: getCheckbox(p['運動']),
      飲料: getSelect(p['飲料']),
      TAG: getMultiSelect(p['TAG']),
      content,
      hasUnsupported
    });
  } catch (err) {
    sendError(res, 500, err, '讀取星辰卷軸失敗');
  }
}

async function handleCreate(req, res) {
  try {
    const dbId = getDbId(res);
    if (!dbId) return;
    const today = todayStr();

    // 防呆：即使前端邏輯正常，後端也再次確認今天是否已存在，避免重複新增
    const existingCheck = await notion.databases.query({
      database_id: dbId,
      filter: { property: '日期', date: { equals: today } }
    });
    if (existingCheck.results.length > 0) {
      res.status(409).json({ error: '今天已經有日記了，請改用編輯' });
      return;
    }

    const { 聊天, 學習, 運動, 飲料, TAG, content } = req.body || {};

    const page = await notion.pages.create({
      parent: { database_id: dbId },
      properties: {
        '日期': { date: { start: today } },
        '聊天': { checkbox: !!聊天 },
        '學習': { checkbox: !!學習 },
        '運動': { checkbox: !!運動 },
        '飲料': 飲料 ? { select: { name: 飲料 } } : { select: null },
        'TAG': { multi_select: (TAG || []).map((name) => ({ name })) }
      }
    });

    if (content) {
      await replaceBlocksWithText(page.id, content);
    }

    res.status(200).json({ success: true, id: page.id });
  } catch (err) {
    sendError(res, 500, err, '新增星辰卷軸失敗');
  }
}

async function handleUpdate(req, res) {
  try {
    const { id, 聊天, 學習, 運動, 飲料, TAG, content } = req.body || {};
    if (!id) {
      res.status(400).json({ error: '缺少 id' });
      return;
    }

    await notion.pages.update({
      page_id: id,
      properties: {
        '聊天': { checkbox: !!聊天 },
        '學習': { checkbox: !!學習 },
        '運動': { checkbox: !!運動 },
        '飲料': 飲料 ? { select: { name: 飲料 } } : { select: null },
        'TAG': { multi_select: (TAG || []).map((name) => ({ name })) }
      }
    });

    if (typeof content === 'string') {
      await replaceBlocksWithText(id, content);
    }

    res.status(200).json({ success: true });
  } catch (err) {
    sendError(res, 500, err, '更新星辰卷軸失敗');
  }
}
