import { notion, getTitle, getNumber, getCheckbox, getDate, getMultiSelect, todayStr } from '../_lib/notionClient.js';
import { requireAuth } from '../_lib/session.js';

const EXCLUDED_TAGS = ['檢討探查', 'Workout'];

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
    const dbId = process.env.NOTION_DB_TASKS;
    const response = await notion.databases.query({
      database_id: dbId,
      filter: {
        and: [
          { property: 'Done', checkbox: { equals: false } },
          { property: 'Tag', multi_select: { does_not_contain: EXCLUDED_TAGS[0] } },
          { property: 'Tag', multi_select: { does_not_contain: EXCLUDED_TAGS[1] } }
        ]
      }
    });

    const today = todayStr();
    const todayOrOverdue = [];
    const noDate = [];

    for (const page of response.results) {
      const p = page.properties;
      const item = {
        id: page.id,
        Name: getTitle(p['Name']),
        EXP: getNumber(p['EXP']),
        Done: getCheckbox(p['Done']),
        date: getDate(p['日期'] ?? p['Date'])
      };

      if (!item.date) {
        noDate.push(item);
      } else if (item.date <= today) {
        todayOrOverdue.push(item);
      }
      // 未來日期的任務兩個 Tab 都不顯示，之後到了那天再撈得到
    }

    res.status(200).json({ todayOrOverdue, noDate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '讀取任務失敗' });
  }
}

async function handlePatch(req, res) {
  try {
    const { pageId, done } = req.body || {};
    if (!pageId || typeof done !== 'boolean') {
      res.status(400).json({ error: '缺少 pageId 或 done' });
      return;
    }

    await notion.pages.update({
      page_id: pageId,
      properties: {
        Done: { checkbox: done }
      }
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '更新任務失敗' });
  }
}
