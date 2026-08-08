import { notion, getTitle, getRichText, getSelect } from '../_lib/notionClient.js';
import { requireAuth } from '../_lib/session.js';
import { sendError } from '../_lib/errors.js';

const VISIBLE_STATUS = ['未拆封', '使用中', '快用完了'];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!requireAuth(req, res)) return;

  try {
    const dbId = process.env.NOTION_DB_SKINCARE;
    if (!dbId) {
      res.status(500).json({ error: '環境變數 NOTION_DB_SKINCARE 未設定，請檢查 Vercel 的 Environment Variables' });
      return;
    }

    const response = await notion.databases.query({
      database_id: dbId,
      filter: {
        or: VISIBLE_STATUS.map((status) => ({
          property: '狀態',
          select: { equals: status }
        }))
      }
    });

    const items = response.results.map((page) => {
      const p = page.properties;
      return {
        id: page.id,
        品牌: getRichText(p['品牌']) || getSelect(p['品牌']) || getTitle(p['品牌']),
        產品: getTitle(p['產品']) || getRichText(p['產品']),
        用途: getRichText(p['用途']) || getSelect(p['用途']),
        容量: getRichText(p['容量']),
        特性: getRichText(p['特性']),
        狀態: getSelect(p['狀態'])
      };
    });

    res.status(200).json({ items });
  } catch (err) {
    sendError(res, 500, err, '讀取保養品資料失敗');
  }
}
