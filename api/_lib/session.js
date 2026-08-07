import crypto from 'crypto';

// 這個專案不需要資料庫存 session：
// 我們發一組「日期 + HMAC 簽章」的 cookie，簽章用 SESSION_SECRET 產生。
// 只要簽章對得起來、且日期是今天，就視為已登入。
// 前端完全看不到密碼、也看不到簽署用的 secret。

const COOKIE_NAME = 'gh_session';

function sign(dateStr) {
  const secret = process.env.SESSION_SECRET || 'fallback-secret-please-set-env';
  return crypto.createHmac('sha256', secret).update(dateStr).digest('hex');
}

function todayStr() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 產生今天有效的 cookie 字串（在 login.js 裡設置到 response header）
export function buildLoginCookie() {
  const date = todayStr();
  const sig = sign(date);
  const value = `${date}.${sig}`;
  // httpOnly：JS 讀不到；sameSite=Strict：防止 CSRF 帶入；secure：僅限 https（Vercel 上預設有 https）
  return `${COOKIE_NAME}=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`;
}

// 從 request header 解析 cookie，並驗證日期 + 簽章是否對得上「今天」
export function isLoggedIn(req) {
  const cookieHeader = req.headers.cookie || '';
  const match = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!match) return false;

  const value = match.slice(COOKIE_NAME.length + 1);
  const [date, sig] = value.split('.');
  if (!date || !sig) return false;

  const today = todayStr();
  if (date !== today) return false; // 隔天：日期對不上，視為過期

  const expectedSig = sign(date);
  // 用固定長度比較避免 timing attack
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// 給每支需要保護的 API route 呼叫的守門員
export function requireAuth(req, res) {
  if (!isLoggedIn(req)) {
    res.status(401).json({ error: '尚未登入或登入已過期，請重新登入' });
    return false;
  }
  return true;
}
