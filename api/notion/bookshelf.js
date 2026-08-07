import { notion, getTitle, getSelect, getDate } from '../_lib/notionClient.js';
import { requireAuth } from '../_lib/session.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!requireAuth(req, res)) return;

  try {
    const dbId = process.env.NOTION_DB_TASKS;
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
    console.error(err);
    res.status(500).json({ error: '讀取書櫃資料失敗' });
  }
}
