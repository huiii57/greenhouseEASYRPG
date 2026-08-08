import { backgroundImage, objectsLayout, SCENE_WIDTH, SCENE_HEIGHT } from '../../config/objectsLayout.js';
import InteractiveObject from './InteractiveObject.jsx';
import Pot from '../widgets/Pot.jsx';
import Cat from '../widgets/Cat.jsx';

// 場景層只負責「畫面配置」，完全不知道任何業務邏輯。
// modal 類物件點擊後交給 onOpenModal 處理；widget 類物件（盆栽/貓）自帶邏輯。
export default function GreenhouseScene({ onOpenModal }) {
  return (
    <div
      className="scene"
      style={{ '--scene-width': `${SCENE_WIDTH}px`, '--scene-height': `${SCENE_HEIGHT}px` }}
    >
      <div className="scene-canvas" style={{ aspectRatio: `${SCENE_WIDTH} / ${SCENE_HEIGHT}` }}>
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
  );
}
