import bcrypt from 'bcryptjs';
import { buildLoginCookie } from '../_lib/session.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { password } = req.body || {};
    if (!password) {
      res.status(400).json({ error: '請輸入密碼' });
      return;
    }

    const hash = process.env.SITE_PASSWORD_HASH;
    if (!hash) {
      res.status(500).json({ error: '伺服器尚未設定密碼，請聯絡管理者' });
      return;
    }

    const ok = await bcrypt.compare(password, hash);
    if (!ok) {
      res.status(401).json({ error: '密碼錯誤' });
      return;
    }

    res.setHeader('Set-Cookie', buildLoginCookie());
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '登入時發生錯誤' });
  }
}
