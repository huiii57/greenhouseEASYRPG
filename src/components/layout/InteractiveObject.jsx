import { useState } from 'react';

// 所有家具共用同一個互動外框：
// - hover 時發光 + 微放大 + 顯示提示文字
// - 點擊時觸發 onActivate
// - image 為 null（檔案還沒放進資料夾）或載入失敗時，用色塊 + 標籤頂替
export default function InteractiveObject({ layout, onActivate, children }) {
  const [imgError, setImgError] = useState(false);
  const { label, image, top, left, width } = layout;
  const showPlaceholder = !image || imgError;

  return (
    <button
      type="button"
      className="interactive-object"
      style={{ top, left, width }}
      onClick={() => onActivate(layout)}
      aria-label={label}
    >
      {!showPlaceholder ? (
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
