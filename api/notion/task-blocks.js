import { readBlocksAsText, replaceBlocksWithText } from '../_lib/blocks.js';
import { requireAuth } from '../_lib/session.js';
import { sendError } from '../_lib/errors.js';

// 書櫃內文讀取／編輯（GET ?pageId=xxx, PATCH {pageId, content}）
// GET 現在會多回傳 hasUnsupported：true 代表頁面裡有資料庫/表格等無法安全編輯的內容，
// 前端遇到這個狀況會切換成唯讀模式，不會顯示存檔按鈕。

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  if (req.method === 'GET') {
    return handleGet(req, res);
  }
  if (req.method === 'PATCH') {
    return handlePatch(req, res);
  }
  res.status(405).json({ error: 'Method not allowed' });
}

async function handleGet(req, res) {
  try {
    const { pageId } = req.query;
    if (!pageId) {
      res.status(400).json({ error: '缺少 pageId' });
      return;
    }
    const { content, hasUnsupported } = await readBlocksAsText(pageId);
    res.status(200).json({ content, hasUnsupported });
  } catch (err) {
    sendError(res, 500, err, '讀取內文失敗');
  }
}

async function handlePatch(req, res) {
  try {
    const { pageId, content } = req.body || {};
    if (!pageId) {
      res.status(400).json({ error: '缺少 pageId' });
      return;
    }
    await replaceBlocksWithText(pageId, content || '');
    res.status(200).json({ success: true });
  } catch (err) {
    sendError(res, 500, err, '更新內文失敗');
  }
}
