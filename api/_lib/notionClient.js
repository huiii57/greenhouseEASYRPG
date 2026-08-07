import { Client } from '@notionhq/client';

// 集中管理 Notion Client，Token 只存在於後端環境變數，前端永遠拿不到。
export const notion = new Client({ auth: process.env.NOTION_TOKEN });

// --- 共用小工具：把 Notion 的 property 物件轉成好用的簡單值 ---

export function getTitle(prop) {
  if (!prop || prop.type !== 'title') return '';
  return prop.title.map((t) => t.plain_text).join('');
}

export function getRichText(prop) {
  if (!prop || prop.type !== 'rich_text') return '';
  return prop.rich_text.map((t) => t.plain_text).join('');
}

export function getSelect(prop) {
  if (!prop || prop.type !== 'select') return null;
  return prop.select ? prop.select.name : null;
}

export function getMultiSelect(prop) {
  if (!prop || prop.type !== 'multi_select') return [];
  return prop.multi_select.map((t) => t.name);
}

export function getCheckbox(prop) {
  if (!prop || prop.type !== 'checkbox') return false;
  return !!prop.checkbox;
}

export function getDate(prop) {
  if (!prop || prop.type !== 'date') return null;
  return prop.date ? prop.date.start : null;
}

export function getNumber(prop) {
  if (!prop || prop.type !== 'number') return null;
  return prop.number;
}

export function getUrl(prop) {
  if (!prop || prop.type !== 'url') return null;
  return prop.url;
}

// 取得今天日期字串 YYYY-MM-DD（以伺服器時區為準）
export function todayStr() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
