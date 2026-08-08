import { notion, getNumber, getDate, todayStr } from '../_lib/notionClient.js';
import { requireAuth } from '../_lib/session.js';
import { sendError } from '../_lib/errors.js';

// 設計說明：盆栽只需要「累計次數」與「今天是否已澆過」兩個資訊。
// 為了簡單可靠，我們用一個獨立的 Notion database（NOTION_DB_GREENHOUSE_LOG），
// 裡面永遠只會有一列資料（第一次使用時自動建立）。
//
// 注意：Notion 每個 database 都一定會有一個「title」類型的欄位（就是資料庫最左邊那欄），
// 但它的實際顯示名稱不一定是英文的「Name」——如果你的 Notion 介面是中文，
// 新建資料庫時那欄有可能自動叫做別的名稱。下面的程式會先自動偵測這個 database
// 真正的 title 欄位叫什麼名字，不會寫死「Name」，這樣就不會因為欄位名稱對不上而建立失敗。

async function getTitlePropertyName(dbId) {
  const db = await notion.databases.retrieve({ database_id: dbId });
  const entry = Object.entries(db.properties).find(([, prop]) => prop.type === 'title');
  if (!entry) {
    throw new Error(`資料庫缺少 title 欄位（不應該發生，請確認 NOTION_DB_GREENHOUSE_LOG 指向正確的資料庫）`);
  }
  return entry[0]; // 欄位名稱
}

async function getOrCreateLogPage(dbId) {
  const response = await notion.databases.query({ database_id: dbId, page_size: 1 });
  if (response.results.length > 0) return response.results[0];

  const titleProp = await getTitlePropertyName(dbId);

  return notion.pages.create({
    parent: { database_id: dbId },
    properties: {
      [titleProp]: { title: [{ text: { content: '盆栽澆水紀錄' } }] },
      '累計次數': { number: 0 },
      '最後澆水日期': { date: null }
    }
  });
}

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  const dbId = process.env.NOTION_DB_GREENHOUSE_LOG;
  if (!dbId) {
    res.status(500).json({ error: '環境變數 NOTION_DB_GREENHOUSE_LOG 未設定，請檢查 Vercel 的 Environment Variables' });
    return;
  }

  if (req.method === 'GET') {
    try {
      const page = await getOrCreateLogPage(dbId);
      const p = page.properties;
      const count = getNumber(p['累計次數']) || 0;
      const lastDate = getDate(p['最後澆水日期']);
      const wateredToday = lastDate === todayStr();
      res.status(200).json({ count, wateredToday });
    } catch (err) {
      sendError(res, 500, err, '讀取盆栽資料失敗');
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
      sendError(res, 500, err, '澆水失敗');
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
