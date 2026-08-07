import { useState } from 'react';

// 所有家具共用同一個互動外框：
// - hover 時發光 + 微放大 + 顯示提示文字
// - 點擊時觸發 onActivate
// - 圖片還沒準備好時，用色塊 + 標籤頂替，方便先確認排版位置
export default function InteractiveObject({ layout, onActivate, children }) {
  const [imgError, setImgError] = useState(false);
  const { label, image, top, left, width } = layout;

  return (
    <button
      type="button"
      className="interactive-object"
      style={{ top, left, width }}
      onClick={() => onActivate(layout)}
      aria-label={label}
    >
      {!imgError ? (
        <img
          src={image}
          alt={label}
          className="interactive-object__img"
          onError={() => setImgError(true)}
          draggable={false}
        />
      ) : (
        <div className="interactive-object__placeholder">{label}</div>
      )}
      <span className="interactive-object__hint">{label}</span>
      {children}
    </button>
  );
}
