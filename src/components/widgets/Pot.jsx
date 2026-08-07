import { useEffect, useState } from 'react';
import { potApi } from '../../services/api.js';

export default function Pot({ layout }) {
  const [imgError, setImgError] = useState(false);
  const [count, setCount] = useState(0);
  const [wateredToday, setWateredToday] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    potApi
      .status()
      .then((res) => {
        setCount(res.count);
        setWateredToday(res.wateredToday);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleWater() {
    if (wateredToday || loading) return;
    setLoading(true);
    try {
      const res = await potApi.water();
      setCount(res.count);
      setWateredToday(res.wateredToday);
    } catch (err) {
      alert(`澆水失敗：${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  const { label, image, top, left, width } = layout;

  return (
    <div className="pot-widget" style={{ top, left, width }}>
      <button
        type="button"
        className="interactive-object interactive-object--pot"
        style={{ position: 'static', width }}
        onClick={handleWater}
        aria-label={label}
        disabled={wateredToday || loading}
      >
        {!imgError ? (
          <img src={image} alt={label} className="interactive-object__img" onError={() => setImgError(true)} draggable={false} />
        ) : (
          <div className="interactive-object__placeholder">{label}</div>
        )}
        <span className="interactive-object__hint">
          {wateredToday ? '今天已經澆過水了' : '點擊澆水'}
        </span>
      </button>
      <div className="pot-widget__stats">
        <span className="pot-widget__drop">💧</span>
        <span>累計澆水 {count} 次</span>
      </div>
    </div>
  );
}
