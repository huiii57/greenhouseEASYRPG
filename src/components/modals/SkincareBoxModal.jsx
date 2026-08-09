import ModalShell from './ModalShell.jsx';
import { useNotionResource } from '../../hooks/useNotionResource.js';
import { skincareApi } from '../../services/api.js';

export default function SkincareBoxModal({ onClose }) {
  const { data, loading, error } = useNotionResource(skincareApi.list);

  return (
    <ModalShell title="保養品儲物箱" onClose={onClose}>
      {loading && <p className="hint-text">讀取中…</p>}
      {error && <p className="error-text">{error}</p>}
      {data && (
        <div className="card-list">
          {data.items.length === 0 && <p className="hint-text">目前沒有保養品在使用中。</p>}
          // 1. 在 map 之前，先把資料依「用途」分組
const grouped = data.items.reduce((acc, item) => {
  const key = item.用途 || '其他';
  if (!acc[key]) acc[key] = [];
  acc[key].push(item);
  return acc;
}, {});

// 2. 渲染時改成先跑分組的 key，再跑該組底下的 items
{Object.entries(grouped).map(([用途, items]) => (
  <div key={用途}>
    <h3 className="group-title">【{用途}】</h3>
    {items.map((item) => (
      <div key={item.id} className="item-card">
        {/* 原本卡片內容不用動 */}
      </div>
    ))}
  </div>
))}
        </div>
      )}
    </ModalShell>
  );
}
