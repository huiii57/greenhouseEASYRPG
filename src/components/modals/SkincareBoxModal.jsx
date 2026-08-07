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
          {data.items.map((item) => (
            <div key={item.id} className="item-card">
              <div className="item-card__title">
                {item.品牌} {item.產品}
              </div>
              <div className="item-card__meta">
                {item.用途 && <span>用途：{item.用途}</span>}
                {item.容量 && <span>容量：{item.容量}</span>}
                {item.特性 && <span>特性：{item.特性}</span>}
              </div>
              <span className={`status-badge status-badge--${item.狀態}`}>{item.狀態}</span>
            </div>
          ))}
        </div>
      )}
    </ModalShell>
  );
}
