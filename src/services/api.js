// 統一封裝所有 /api 呼叫，處理 JSON 序列化、錯誤格式化。
// credentials: 'include' 確保登入 cookie 會一起送出。

async function request(path, options = {}) {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // 沒有 JSON body（例如某些 204）也沒關係
  }

  if (!res.ok) {
    const message = (data && data.error) || `發生錯誤（${res.status}）`;
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  return data;
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path, body) => request(path, { method: 'DELETE', body })
};

// --- Auth ---
export const authApi = {
  login: (password) => api.post('/api/auth/login', { password }),
  check: () => api.get('/api/auth/check')
};

// --- 保養品 / 化妝品 ---
export const skincareApi = { list: () => api.get('/api/notion/skincare') };
export const cosmeticsApi = { list: () => api.get('/api/notion/cosmetics') };

// --- 布告欄 ---
export const tasksApi = {
  list: () => api.get('/api/notion/tasks'),
  setDone: (pageId, done) => api.patch('/api/notion/tasks', { pageId, done })
};

// --- 書櫃 ---
export const bookshelfApi = {
  list: () => api.get('/api/notion/bookshelf'),
  getContent: (pageId) => api.get(`/api/notion/task-blocks?pageId=${encodeURIComponent(pageId)}`),
  saveContent: (pageId, content) => api.patch('/api/notion/task-blocks', { pageId, content })
};

// --- 星辰卷軸 ---
export const journalApi = {
  getToday: () => api.get('/api/notion/journal'),
  create: (payload) => api.post('/api/notion/journal', payload),
  update: (payload) => api.patch('/api/notion/journal', payload)
};

// --- 交易市場 ---
export const trademarketApi = {
  list: () => api.get('/api/notion/trademarket'),
  create: (payload) => api.post('/api/notion/trademarket', payload),
  update: (payload) => api.patch('/api/notion/trademarket', payload),
  remove: (id) => api.delete('/api/notion/trademarket', { id })
};

// --- 盆栽 ---
export const potApi = {
  status: () => api.get('/api/notion/pot'),
  water: () => api.post('/api/notion/pot')
};
