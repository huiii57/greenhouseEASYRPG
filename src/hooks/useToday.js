import { useEffect, useState } from 'react';

function computeTodayStr() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 提供「今天」字串，並且每分鐘檢查一次是否跨了午夜（讓長時間開著頁面的人也能自動更新）
export function useToday() {
  const [today, setToday] = useState(computeTodayStr());

  useEffect(() => {
    const timer = setInterval(() => {
      const next = computeTodayStr();
      setToday((prev) => (prev === next ? prev : next));
    }, 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  return today;
}
