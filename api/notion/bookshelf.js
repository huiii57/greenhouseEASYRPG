import { notion, getTitle, getSelect, getDate , normalizeDatabaseId } from '../_lib/notionClient.js';
import { requireAuth } from '../_lib/session.js';
import { sendError } from '../_lib/errors.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!requireAuth(req, res)) return;

  try {
    const dbId = normalizeDatabaseId(process.env.NOTION_DB_TASKS);
    if (!dbId) {
      res.status(500).json({ error: '環境變數 NOTION_DB_TASKS 未設定，請檢查 Vercel 的 Environment Variables' });
      return;
    }

    const response = await notion.databases.query({
      database_id: dbId,
      filter: {
        property: 'Tag',
        multi_select: { contains: '檢討探查' }
      },
      sorts: [{ property: '日期', direction: 'descending' }]
    });

    const items = response.results.map((page) => {
      const p = page.properties;
      return {
        id: page.id,
        Name: getTitle(p['Name']),
        State: getSelect(p['State']),
        date: getDate(p['日期'] ?? p['Date'])
      };
    });

    res.status(200).json({ items });
  } catch (err) {
    sendError(res, 500, err, '讀取書櫃資料失敗');
  }
}
