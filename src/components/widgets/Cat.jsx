import { useRef, useState } from 'react';

const LINES = [
  '今天過得好嗎?',
  '喵~喵~~',
  '我很可愛對吧',
  '我喜歡安安靜靜的生活',
  '今天也來看我了嗎?我好開心'
];

export default function Cat({ layout }) {
  const [imgError, setImgError] = useState(false);
  const [bubble, setBubble] = useState(null);
  const timerRef = useRef(null);

  function handleClick() {
    if (bubble) return; // 泡泡顯示中，禁止再次觸發
    const line = LINES[Math.floor(Math.random() * LINES.length)];
    setBubble(line);
    timerRef.current = setTimeout(() => setBubble(null), 3000);
  }

  const { label, image, top, left, width } = layout;
  const showPlaceholder = !image || imgError;

  return (
    <div className="cat-widget" style={{ top, left, width }}>
      {bubble && <div className="cat-widget__bubble">{bubble}</div>}
      <button
        type="button"
        className="interactive-object"
        style={{ position: 'static', width }}
        onClick={handleClick}
        aria-label={label}
      >
        {!showPlaceholder ? (
          <img src={image} alt={label} className="interactive-object__img" onError={() => setImgError(true)} draggable={false} />
        ) : (
          <div className="interactive-object__placeholder">{label}</div>
        )}
        <span className="interactive-object__hint">摸摸貓咪</span>
      </button>
    </div>
  );
}
