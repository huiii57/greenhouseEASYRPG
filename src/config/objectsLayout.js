// 這是整個場景的「單一資料來源」。
// 之後你拿到實際的 PNG 素材與想要的座標，只需要修改這個檔案，
// 不需要動任何元件邏輯。
//
// 座標系統：畫布固定尺寸 1600 x 900（見 GreenhouseScene.jsx 的 SCENE_WIDTH/HEIGHT）。
// top / left / width 都是相對於這個畫布的像素值。
// image 路徑先指向 /src/assets/objects/ 底下的檔名，等你把素材放進去就會自動顯示；
// 在放入素材之前，畫面會顯示一個標示名稱的暫用色塊，方便你先確認位置對不對。

export const SCENE_WIDTH = 1600;
export const SCENE_HEIGHT = 900;

export const backgroundImage = '/src/assets/background/greenhouse-bg.png';

export const objectsLayout = [
  {
    id: 'skincareBox',
    label: '保養品儲物箱',
    image: '/src/assets/objects/skincare-box.png',
    top: 480,
    left: 160,
    width: 170,
    kind: 'modal',
    modal: 'skincare'
  },
  {
    id: 'cosmeticsBox',
    label: '化妝品儲物箱',
    image: '/src/assets/objects/cosmetics-box.png',
    top: 480,
    left: 360,
    width: 170,
    kind: 'modal',
    modal: 'cosmetics'
  },
  {
    id: 'noticeBoard',
    label: '公會布告欄',
    image: '/src/assets/objects/notice-board.png',
    top: 120,
    left: 680,
    width: 220,
    kind: 'modal',
    modal: 'notice'
  },
  {
    id: 'bookshelf',
    label: '書櫃',
    image: '/src/assets/objects/bookshelf.png',
    top: 100,
    left: 980,
    width: 200,
    kind: 'modal',
    modal: 'bookshelf'
  },
  {
    id: 'studyDesk',
    label: '研究桌：星辰卷軸',
    image: '/src/assets/objects/study-desk.png',
    top: 520,
    left: 880,
    width: 240,
    kind: 'modal',
    modal: 'starScroll'
  },
  {
    id: 'glassCabinet',
    label: '烘焙玻璃櫥櫃：交易市場',
    image: '/src/assets/objects/glass-cabinet.png',
    top: 460,
    left: 1180,
    width: 230,
    kind: 'modal',
    modal: 'trademarket'
  },
  {
    id: 'pot',
    label: '白色小盆栽',
    image: '/src/assets/objects/pot.png',
    top: 700,
    left: 90,
    width: 110,
    kind: 'widget',
    widget: 'pot'
  },
  {
    id: 'cat',
    label: '黑白賓士貓',
    image: '/src/assets/objects/cat.png',
    top: 640,
    left: 1350,
    width: 150,
    kind: 'widget',
    widget: 'cat'
  }
];
