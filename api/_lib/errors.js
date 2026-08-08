// 統一的錯誤回應工具。
// 目的：Notion API 出錯時，把 Notion 實際回傳的錯誤訊息也一起送回前端，
// 這樣才能在畫面上直接看到「到底是哪個 property 找不到 / 哪個 filter type 不對」，
// 不用再靠猜的。

export function sendError(res, status, err, fallbackMessage) {
  // Notion SDK 的錯誤物件通常會有 err.message（例如：
  // "Could not find property with name or id: 狀態." 或
  // "body.filter.or[0].select.equals should be defined, instead was undefined."）
  const detail = err && err.message ? err.message : null;
  console.error(fallbackMessage, err);
  res.status(status).json({
    error: detail ? `${fallbackMessage}：${detail}` : fallbackMessage
  });
}
