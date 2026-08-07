import { readBlocksAsText, replaceBlocksWithText } from '../_lib/blocks.js';
import { requireAuth } from '../_lib/session.js';

// 書櫃內文讀取／編輯（GET ?pageId=xxx, PATCH {pageId, content}）

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
    const content = await readBlocksAsText(pageId);
    res.status(200).json({ content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '讀取內文失敗' });
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
    console.error(err);
    res.status(500).json({ error: '更新內文失敗' });
  }
}
