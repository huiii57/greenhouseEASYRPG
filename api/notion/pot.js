import { notion, getNumber, getDate, todayStr } from '../_lib/notionClient.js';
import { requireAuth } from '../_lib/session.js';

// 設計說明：盆栽只需要「累計次數」與「今天是否已澆過」兩個資訊。
// 為了簡單可靠，我們用一個獨立的 Notion database（NOTION_DB_GREENHOUSE_LOG），
// 裡面永遠只會有一列資料（第一次使用時自動建立），
// 欄位：Name（隨意title）、累計次數（number）、最後澆水日期（date）。
// 不需要每天新增一列，避免資料庫無限增長。

async function getOrCreateLogPage(dbId) {
  const response = await notion.databases.query({ database_id: dbId, page_size: 1 });
  if (response.results.length > 0) return response.results[0];

  return notion.pages.create({
    parent: { database_id: dbId },
    properties: {
      'Name': { title: [{ text: { content: '盆栽澆水紀錄' } }] },
      '累計次數': { number: 0 },
      '最後澆水日期': { date: null }
    }
  });
}

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  const dbId = process.env.NOTION_DB_GREENHOUSE_LOG;

  if (req.method === 'GET') {
    try {
      const page = await getOrCreateLogPage(dbId);
      const p = page.properties;
      const count = getNumber(p['累計次數']) || 0;
      const lastDate = getDate(p['最後澆水日期']);
      const wateredToday = lastDate === todayStr();
      res.status(200).json({ count, wateredToday });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: '讀取盆栽資料失敗' });
    }
    return;
  }

  if (req.method === 'POST') {
    try {
      const page = await getOrCreateLogPage(dbId);
      const p = page.properties;
      const count = getNumber(p['累計次數']) || 0;
      const lastDate = getDate(p['最後澆水日期']);
      const today = todayStr();

      if (lastDate === today) {
        res.status(200).json({ count, wateredToday: true, alreadyDone: true });
        return;
      }

      const newCount = count + 1;
      await notion.pages.update({
        page_id: page.id,
        properties: {
          '累計次數': { number: newCount },
          '最後澆水日期': { date: { start: today } }
        }
      });

      res.status(200).json({ count: newCount, wateredToday: true, alreadyDone: false });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: '澆水失敗' });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
