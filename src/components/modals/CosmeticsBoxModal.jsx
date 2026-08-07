import ModalShell from './ModalShell.jsx';
import { useNotionResource } from '../../hooks/useNotionResource.js';
import { cosmeticsApi } from '../../services/api.js';

export default function CosmeticsBoxModal({ onClose }) {
  const { data, loading, error } = useNotionResource(cosmeticsApi.list);

  return (
    <ModalShell title="化妝品儲物箱" onClose={onClose}>
      {loading && <p className="hint-text">讀取中…</p>}
      {error && <p className="error-text">{error}</p>}
      {data && (
        <div className="card-list">
          {data.items.length === 0 && <p className="hint-text">目前沒有化妝品在使用中。</p>}
          {data.items.map((item) => (
            <div key={item.id} className="item-card">
              <div className="item-card__title">
                {item.品牌} {item.產品}
              </div>
              <div className="item-card__meta">
                {item.用途 && <span>用途：{item.用途}</span>}
                {item.容量 && <span>容量：{item.容量}</span>}
              </div>
              <span className={`status-badge status-badge--${item.狀態}`}>{item.狀態}</span>
            </div>
          ))}
        </div>
      )}
    </ModalShell>
  );
}
