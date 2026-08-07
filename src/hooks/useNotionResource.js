import { useCallback, useEffect, useState } from 'react';

// 共用 hook：給任何「打開 Modal 時要抓一次資料」的功能用。
// enabled=false 時不會發請求（例如 Modal 還沒打開時）。
export function useNotionResource(fetchFn, { enabled = true, deps = [] } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err.message || '讀取失敗');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (enabled) reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, reload]);

  return { data, setData, loading, error, reload };
}
