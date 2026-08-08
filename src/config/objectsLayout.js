// 這是整個場景的「單一資料來源」。
// 之後你拿到實際的 PNG 素材與想要的座標，只需要修改這個檔案，
// 不需要動任何元件邏輯。
//
// 座標系統：畫布固定尺寸 1600 x 900（見 GreenhouseScene.jsx 的 SCENE_WIDTH/HEIGHT）。
// top / left / width 都是相對於這個畫布的像素值。
//
// 重要：圖片路徑不能用純字串寫死（例如 '/src/assets/objects/xxx.png'），
// 因為正式 build 之後 dist/ 裡不會有 src/ 資料夾，字串路徑在正式站會 404。
// 這裡改用 Vite 的 import.meta.glob，讓 Vite 在 build 時真正把這些圖片
// 打包進 dist/assets/ 並算出正確的最終網址，開發環境與正式環境都能正常顯示。
// 如果檔案還沒放進資料夾，resolveObjectImage 會回傳 null，
// 元件會自動顯示暫用色塊，行為跟之前一樣。

const objectImageModules = import.meta.glob('/src/assets/objects/*.{png,PNG}', {
  eager: true,
  import: 'default'
});

const backgroundImageModules = import.meta.glob('/src/assets/background/*.{png,PNG}', {
  eager: true,
  import: 'default'
});

function resolveObjectImage(filename) {
  const path = `/src/assets/objects/${filename}`;
  return objectImageModules[path] || null;
}

function resolveBackgroundImage(filename) {
  const path = `/src/assets/background/${filename}`;
  return backgroundImageModules[path] || null;
}

export const SCENE_WIDTH = 1600;
export const SCENE_HEIGHT = 900;

// 背景圖檔名請放在 src/assets/background/greenhouse-bg.png
export const backgroundImage = resolveBackgroundImage('greenhouse-bg.png');

export const objectsLayout = [
  {
    id: 'skincareBox',
    label: '保養品儲物箱',
    image: resolveObjectImage('skincare-box.png'),
    top: 480,
    left: 160,
    width: 170,
    kind: 'modal',
    modal: 'skincare'
  },
  {
    id: 'cosmeticsBox',
    label: '化妝品儲物箱',
    image: resolveObjectImage('cosmetics-box.png'),
    top: 480,
    left: 360,
    width: 170,
    kind: 'modal',
    modal: 'cosmetics'
  },
  {
    id: 'noticeBoard',
    label: '公會布告欄',
    image: resolveObjectImage('notice-board.png'),
    top: 120,
    left: 680,
    width: 220,
    kind: 'modal',
    modal: 'notice'
  },
  {
    id: 'bookshelf',
    label: '書櫃',
    image: resolveObjectImage('bookshelf.png'),
    top: 100,
    left: 980,
    width: 200,
    kind: 'modal',
    modal: 'bookshelf'
  },
  {
    id: 'studyDesk',
    label: '研究桌：星辰卷軸',
    image: resolveObjectImage('study-desk.png'),
    top: 520,
    left: 880,
    width: 240,
    kind: 'modal',
    modal: 'starScroll'
  },
  {
    id: 'glassCabinet',
    label: '烘焙玻璃櫥櫃：交易市場',
    image: resolveObjectImage('glass-cabinet.png'),
    top: 460,
    left: 1180,
    width: 230,
    kind: 'modal',
    modal: 'trademarket'
  },
  {
    id: 'pot',
    label: '白色小盆栽',
    image: resolveObjectImage('pot.png'),
    top: 700,
    left: 90,
    width: 110,
    kind: 'widget',
    widget: 'pot'
  },
  {
    id: 'cat',
    label: '黑白賓士貓',
    image: resolveObjectImage('cat.png'),
    top: 640,
    left: 1350,
    width: 150,
    kind: 'widget',
    widget: 'cat'
  }
];
