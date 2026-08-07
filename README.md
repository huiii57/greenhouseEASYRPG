# 溫室公會大廳 PWA

日式溫室風格的生活管理儀表板：固定背景圖 + 透明 PNG 家具物件 + Notion 資料串接。
不是遊戲，沒有地圖移動、沒有 Canvas，只是一個「有氣氛的儀表板」。

---

## 一、你需要先準備的東西

1. 一個 Notion 帳號，以及底下這些 Database（可以先用你原本的資料庫，只要欄位名稱對得上）：
   - **保養品們**：品牌、產品、用途、容量、特性、狀態（select：未拆封 / 使用中 / 快用完了 / 其他）
   - **化妝品們**：品牌、產品、用途、容量、狀態（同上）
   - **全部任務**：Name（title）、EXP（number）、Done（checkbox）、Tag（multi-select，需包含「檢討探查」「Workout」等標籤）、日期（date）
   - **星辰卷軸**：日期（date）、聊天（checkbox）、學習（checkbox）、運動（checkbox）、飲料（select）、TAG（multi-select）
   - **TradeMarket**：商品（title）、tag（multi-select：宅錄/日本旅遊/日常）、分類（select：非必需品/送禮/一般）、價格類型（select：高價/一般）、價格範圍（text）、交易狀態（select：待交易/進行中/成交）、交易日期（date）、商品類型（select：生活用品/3C/服飾/藥妝）、link（url）
   - **GreenhouseLog**（新建一個空白 database 即可）：Name（title）、累計次數（number）、最後澆水日期（date） —— 這個給盆栽功能用，程式會自動建立第一筆資料，你不用手動填。

   > 欄位名稱請完全比照上面（含全形/半形），因為程式是用中文欄位名稱去讀取的。如果你的欄位名稱不同，之後可以直接跟我說，我幫你改對應的程式碼。

2. 一組 **Notion Integration Token**：
   - 前往 https://www.notion.so/my-integrations
   - 建立一個新的 internal integration，複製它的 Token（長得像 `secret_xxxx...`）
   - 回到上面每一個 Database 頁面，右上角「⋯」→「連結」→把剛剛建立的 integration 加進去（每個資料庫都要加，不然 API 會查不到資料）

3. 每個 Database 的 **Database ID**：
   - 打開 Database 的完整頁面（不是 in-page 的小 view），網址會長這樣：
     `https://www.notion.so/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx?v=...`
   - `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` 那 32 碼就是 Database ID

4. 一個 Vercel 帳號（https://vercel.com），用來部署網站與跑後端 API。

---

## 二、專案結構（做好了什麼）

```
greenhouse-guild-hall/
├── api/                      # 後端 Serverless Functions（Notion Token 只存在這裡）
│   ├── auth/login.js         # 登入驗證
│   ├── auth/check.js         # 檢查是否已登入
│   └── notion/*.js           # 各功能對應的 Notion API 
├── src/
│   ├── config/objectsLayout.js   # ⭐ 之後你放圖片、調座標，只需要改這個檔案
│   ├── assets/background/        # 放背景圖的地方
│   ├── assets/objects/           # 放透明 PNG 家具素材的地方
│   ├── components/               # React 元件（場景、Modal、widget）
│   └── styles/global.css         # 整體視覺樣式
├── .env.example               # 環境變數範例
└── vercel.json
```

---

## 三、放入你的素材圖片

打開 `src/config/objectsLayout.js`，裡面每一個物件都有 `image` 欄位，例如：

```js
image: '/src/assets/objects/skincare-box.png',
```

你只要把對應檔名的 PNG 放到 `src/assets/objects/` 資料夾（背景圖放到 `src/assets/background/greenhouse-bg.png`），畫面就會自動顯示圖片。

**在你放圖片之前**：畫面會顯示一個標了文字的暫用色塊，方便你先確認排版位置對不對。等你有素材了，把檔案丟進對應資料夾就好，不用改任何程式碼。

如果你想調整物件在畫面上的位置或大小，也是改這個檔案裡的 `top` / `left` / `width`（單位：像素，畫布固定 1600×900）。

---

## 四、設定環境變數

1. 複製 `.env.example` 為 `.env.local`：
   ```bash
   cp .env.example .env.local
   ```

2. 產生密碼的 bcrypt 雜湊值（不要把明碼密碼寫進程式或環境變數）：
   ```bash
   node -e "console.log(require('bcryptjs').hashSync('你想要的密碼', 10))"
   ```
   會印出一串像 `$2a$10$xxxxxxxxxxxxxxxxxxxxxx` 的字串，複製它。

3. 打開 `.env.local`，填入：
   ```
   NOTION_TOKEN=secret_xxxx...
   NOTION_DB_SKINCARE=你的DatabaseID
   NOTION_DB_COSMETICS=你的DatabaseID
   NOTION_DB_TASKS=你的DatabaseID
   NOTION_DB_JOURNAL=你的DatabaseID
   NOTION_DB_TRADEMARKET=你的DatabaseID
   NOTION_DB_GREENHOUSE_LOG=你的DatabaseID
   SITE_PASSWORD_HASH=剛剛產生的雜湊值
   SESSION_SECRET=隨便一串夠長的亂數字串
   ```

---

## 五、本機開發測試

因為後端是 Vercel Serverless Function，本機測試建議直接用 Vercel CLI（最貼近正式環境）：

```bash
npm install -g vercel     # 只需安裝一次
npm install                # 安裝專案依賴
vercel dev                 # 啟動本機開發伺服器（前後端一起跑，預設 http://localhost:3000）
```

第一次執行 `vercel dev` 會問你要不要連結 Vercel 專案，照指示操作即可，它會自動讀取 `.env.local`。

打開瀏覽器進入 `http://localhost:3000`，應該會先看到登入畫面。

---

## 六、部署到 Vercel（正式上線）

1. 把專案推到一個 GitHub repository（私有 repo 即可，因為 `.env.local` 已經被 `.gitignore` 排除，不會外流）。
2. 到 https://vercel.com/new，選擇這個 repo 匯入。
3. Vercel 會自動偵測是 Vite 專案。在「Environment Variables」畫面，把 `.env.local` 裡的每一項都貼進去（NOTION_TOKEN、各個 NOTION_DB_*、SITE_PASSWORD_HASH、SESSION_SECRET）。
4. 按下 Deploy，等建置完成後就會拿到一個 `xxx.vercel.app` 網址，這就是正式站台。
5. 之後每次 `git push`，Vercel 會自動重新部署。

---

## 七、PWA（加到桌面 / 全螢幕開啟）

已經內建 `public/manifest.json`。你只需要準備兩張圖示放到 `public/icons/`：
- `icon-192.png`（192×192）
- `icon-512.png`（512×512）

之後在手機或桌面瀏覽器選單裡選「加到主畫面 / 安裝應用程式」，就會以獨立視窗開啟，不會有瀏覽器網址列。

---

## 八、各功能運作邏輯備忘

| 功能 | 說明 |
|---|---|
| 登入 | 密碼雜湊比對成功後，發一組簽章 cookie，效期到當天午夜。前端完全拿不到密碼或 Notion Token。 |
| 保養品／化妝品箱 | 唯讀，後端直接用 Notion filter 排除掉不是「未拆封/使用中/快用完了」的項目。 |
| 布告欄 | 後端排除 Tag 含「檢討探查」「Workout」的任務，並依日期分成「今日與延宕」「無時效」兩組。勾選 Done 是樂觀更新（畫面先變、失敗才復原）。 |
| 書櫃 | 列表篩選 Tag=檢討探查。內文用「純文字段落」簡化處理：讀取時把所有 paragraph 接成一個字串，儲存時整批刪除重建，簡單可靠，之後要支援更複雜格式（標題、清單）可以再擴充 `api/_lib/blocks.js`。 |
| 星辰卷軸 | 開啟時查詢今天日期是否已有資料；沒有就顯示新增表單，有就直接進入編輯模式，欄位與內文都會預先帶入。 |
| 交易市場 | 完整 CRUD。刪除是用 Notion 的 `archived: true`（Notion API 沒有真正硬刪除，這是官方建議的做法）。 |
| 白色小盆栽 | 用一個獨立、只會存在一列資料的 Notion database 記錄「累計次數」與「最後澆水日期」，避免資料庫無限增長，也不用額外資料庫服務。 |
| 黑白賓士貓 | 純前端邏輯，點擊隨機顯示 5 句話之一，3 秒後消失，消失前無法再次觸發。 |

---

## 九、如果之後要調整

- **改物件位置/大小**：只改 `src/config/objectsLayout.js`
- **改欄位篩選邏輯**：對應的 `api/notion/*.js`
- **改視覺風格（顏色/字體）**：`src/styles/global.css` 最上面的 CSS 變數（`--color-*`）
- **Notion 欄位名稱跟你實際的不一樣**：把對應 API 檔案裡讀取欄位名稱的字串改掉即可（例如 `p['品牌']` 改成你實際的欄位名）
