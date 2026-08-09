import { useEffect, useRef, useState } from 'react';
import { backgroundImage, objectsLayout, SCENE_WIDTH, SCENE_HEIGHT } from '../../config/objectsLayout.js';
import InteractiveObject from './InteractiveObject.jsx';
import Pot from '../widgets/Pot.jsx';
import Cat from '../widgets/Cat.jsx';

// 場景層只負責「畫面配置」，完全不知道任何業務邏輯。
//
// 縮放策略：畫布內部永遠是固定的 1600x900 設計尺寸（.scene-canvas），
// 物件的 top/left/width 都是相對這個固定尺寸的像素值，彼此之間永遠不會跑掉。
// 外層 .scene-viewport 會依照實際可用空間，用 ResizeObserver 算出縮放比例，
// 再用 CSS transform: scale() 把整個 .scene-canvas（背景 + 所有物件）當成
// 一個剛體整體縮放——這樣不管視窗多大、瀏覽器縮放多少，
// 物件永遠會「黏」在背景上同一個相對位置，不會亂跑。
export default function GreenhouseScene({ onOpenModal }) {
  const viewportRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width === 0 || height === 0) return;
      const nextScale = Math.min(width / SCENE_WIDTH, height / SCENE_HEIGHT);
      setScale(nextScale);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="scene">
      <div className="scene-viewport" ref={viewportRef}>
        <div
          className="scene-canvas"
          style={{
            width: SCENE_WIDTH,
            height: SCENE_HEIGHT,
            transform: `scale(${scale})`
          }}
        >
          {backgroundImage ? (
            <img src={backgroundImage} alt="溫室公會大廳" className="scene-bg" draggable={false} />
          ) : (
            <div className="scene-bg scene-bg--placeholder">
              背景圖尚未放入（請放到 src/assets/background/greenhouse-bg.png）
            </div>
          )}

          {objectsLayout.map((obj) => {
            if (obj.kind === 'modal') {
              return (
                <InteractiveObject
                  key={obj.id}
                  layout={obj}
                  onActivate={() => onOpenModal(obj.modal)}
                />
              );
            }
            if (obj.kind === 'widget' && obj.widget === 'pot') {
              return <Pot key={obj.id} layout={obj} />;
            }
            if (obj.kind === 'widget' && obj.widget === 'cat') {
              return <Cat key={obj.id} layout={obj} />;
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}
