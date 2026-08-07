import { notion, getTitle, getMultiSelect, getSelect, getRichText, getDate, getUrl } from '../_lib/notionClient.js';
import { requireAuth } from '../_lib/session.js';

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  if (req.method === 'GET') return handleGet(req, res);
  if (req.method === 'POST') return handleCreate(req, res);
  if (req.method === 'PATCH') return handleUpdate(req, res);
  if (req.method === 'DELETE') return handleDelete(req, res);
  res.status(405).json({ error: 'Method not allowed' });
}

function pageToItem(page) {
  const p = page.properties;
  return {
    id: page.id,
    商品: getTitle(p['商品']),
    tag: getMultiSelect(p['tag']),
    分類: getSelect(p['分類']),
    價格類型: getSelect(p['價格類型']),
    價格範圍: getRichText(p['價格範圍']),
    交易狀態: getSelect(p['交易狀態']),
    交易日期: getDate(p['交易日期']),
    商品類型: getSelect(p['商品類型']),
    link: getUrl(p['link'])
  };
}

function itemToProperties(body) {
  const { 商品, tag, 分類, 價格類型, 價格範圍, 交易狀態, 交易日期, 商品類型, link } = body;
  const properties = {};
  if (商品 !== undefined) properties['商品'] = { title: [{ text: { content: 商品 || '' } }] };
  if (tag !== undefined) properties['tag'] = { multi_select: (tag || []).map((name) => ({ name })) };
  if (分類 !== undefined) properties['分類'] = 分類 ? { select: { name: 分類 } } : { select: null };
  if (價格類型 !== undefined) properties['價格類型'] = 價格類型 ? { select: { name: 價格類型 } } : { select: null };
  if (價格範圍 !== undefined) properties['價格範圍'] = { rich_text: [{ text: { content: 價格範圍 || '' } }] };
  if (交易狀態 !== undefined) properties['交易狀態'] = 交易狀態 ? { select: { name: 交易狀態 } } : { select: null };
  if (交易日期 !== undefined) properties['交易日期'] = 交易日期 ? { date: { start: 交易日期 } } : { date: null };
  if (商品類型 !== undefined) properties['商品類型'] = 商品類型 ? { select: { name: 商品類型 } } : { select: null };
  if (link !== undefined) properties['link'] = { url: link || null };
  return properties;
}

async function handleGet(req, res) {
  try {
    const dbId = process.env.NOTION_DB_TRADEMARKET;
    const response = await notion.databases.query({
      database_id: dbId,
      sorts: [{ timestamp: 'created_time', direction: 'descending' }]
    });
    const items = response.results.map(pageToItem);
    res.status(200).json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '讀取交易市場資料失敗' });
  }
}

async function handleCreate(req, res) {
  try {
    const dbId = process.env.NOTION_DB_TRADEMARKET;
    const page = await notion.pages.create({
      parent: { database_id: dbId },
      properties: itemToProperties(req.body || {})
    });
    res.status(200).json({ success: true, id: page.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '新增商品失敗' });
  }
}

async function handleUpdate(req, res) {
  try {
    const { id, ...rest } = req.body || {};
    if (!id) {
      res.status(400).json({ error: '缺少 id' });
      return;
    }
    await notion.pages.update({
      page_id: id,
      properties: itemToProperties(rest)
    });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '更新商品失敗' });
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.body || {};
    if (!id) {
      res.status(400).json({ error: '缺少 id' });
      return;
    }
    // Notion API 沒有真正的刪除，這裡用 archive 達到「移除」效果
    await notion.pages.update({ page_id: id, archived: true });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '刪除商品失敗' });
  }
}
