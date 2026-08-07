import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 本地開發時，將 /api 請求轉發到 `vercel dev` 開的 serverless function port（預設 3000）
// 若你用 `npm run vercel-dev` 啟動，Vercel CLI 會直接處理 /api，不需要這個 proxy。
// 若你用 `npm run dev`（純 vite），/api 會打到下面這個 proxy port。
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});
