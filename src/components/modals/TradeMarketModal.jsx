import { useState } from 'react';
import ModalShell from './ModalShell.jsx';
import TagMultiSelect from '../common/TagMultiSelect.jsx';
import { useNotionResource } from '../../hooks/useNotionResource.js';
import { trademarketApi } from '../../services/api.js';

const TAG_OPTIONS = ['宅錄', '日本旅遊', '日常'];
const CATEGORY_OPTIONS = ['非必需品', '送禮', '一般'];
const PRICE_TYPE_OPTIONS = ['高價', '一般'];
const TRADE_STATUS_OPTIONS = ['待交易', '進行中', '成交'];
const ITEM_TYPE_OPTIONS = ['生活用品', '3C', '服飾', '藥妝'];

const EMPTY_FORM = {
  商品: '',
  tag: [],
  分類: CATEGORY_OPTIONS[0],
  價格類型: PRICE_TYPE_OPTIONS[0],
  價格範圍: '',
  交易狀態: TRADE_STATUS_OPTIONS[0],
  交易日期: '',
  商品類型: ITEM_TYPE_OPTIONS[0],
  link: ''
};

export default function TradeMarketModal({ onClose }) {
  const { data, setData, loading, error, reload } = useNotionResource(trademarketApi.list);
  const [editing, setEditing] = useState(null); // null = 列表, 'new' = 新增, item = 編輯
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  function startCreate() {
    setForm(EMPTY_FORM);
    setEditing('new');
    setFormError('');
  }

  function startEdit(item) {
    setForm({
      商品: item.商品 || '',
      tag: item.tag || [],
      分類: item.分類 || CATEGORY_OPTIONS[0],
      價格類型: item.價格類型 || PRICE_TYPE_OPTIONS[0],
      價格範圍: item.價格範圍 || '',
      交易狀態: item.交易狀態 || TRADE_STATUS_OPTIONS[0],
      交易日期: item.交易日期 || '',
      商品類型: item.商品類型 || ITEM_TYPE_OPTIONS[0],
      link: item.link || ''
    });
    setEditing(item);
    setFormError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.商品.trim()) {
      setFormError('請輸入商品名稱');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      if (editing === 'new') {
        await trademarketApi.create(form);
      } else {
        await trademarketApi.update({ id: editing.id, ...form });
      }
      setEditing(null);
      await reload();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    if (!confirm(`確定要刪除「${item.商品}」嗎？`)) return;
    try {
      await trademarketApi.remove(item.id);
      setData((prev) => ({ items: prev.items.filter((i) => i.id !== item.id) }));
    } catch (err) {
      alert(`刪除失敗：${err.message}`);
    }
  }

  if (editing) {
    return (
      <ModalShell title={editing === 'new' ? '新增商品' : `編輯：${editing.商品}`} onClose={onClose} wide>
        <button type="button" className="link-button" onClick={() => setEditing(null)}>
          ← 回到交易市場列表
        </button>
        <form className="trade-form" onSubmit={handleSubmit}>
          <div className="field-row">
            <label>商品</label>
            <input
              value={form.商品}
              onChange={(e) => setForm({ ...form, 商品: e.target.value })}
              placeholder="商品名稱"
            />
          </div>

          <div className="field-row field-row--column">
            <span>tag</span>
            <TagMultiSelect options={TAG_OPTIONS} selected={form.tag} onChange={(tag) => setForm({ ...form, tag })} />
          </div>

          <div className="field-grid">
            <div className="field-row">
              <label>分類</label>
              <select value={form.分類} onChange={(e) => setForm({ ...form, 分類: e.target.value })}>
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="field-row">
              <label>價格類型</label>
              <select value={form.價格類型} onChange={(e) => setForm({ ...form, 價格類型: e.target.value })}>
                {PRICE_TYPE_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="field-row">
              <label>交易狀態</label>
              <select value={form.交易狀態} onChange={(e) => setForm({ ...form, 交易狀態: e.target.value })}>
                {TRADE_STATUS_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="field-row">
              <label>商品類型</label>
              <select value={form.商品類型} onChange={(e) => setForm({ ...form, 商品類型: e.target.value })}>
                {ITEM_TYPE_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="field-row">
            <label>價格範圍</label>
            <input
              value={form.價格範圍}
              onChange={(e) => setForm({ ...form, 價格範圍: e.target.value })}
              placeholder="例如：500-800"
            />
          </div>

          <div className="field-row">
            <label>交易日期</label>
            <input
              type="date"
              value={form.交易日期}
              onChange={(e) => setForm({ ...form, 交易日期: e.target.value })}
            />
          </div>

          <div className="field-row">
            <label>連結</label>
            <input
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              placeholder="https://..."
            />
          </div>

          {formError && <p className="error-text">{formError}</p>}

          <div className="modal-actions">
            <button type="submit" disabled={saving}>
              {saving ? '儲存中…' : '儲存'}
            </button>
          </div>
        </form>
      </ModalShell>
    );
  }

  return (
    <ModalShell title="烘焙玻璃櫥櫃：交易市場" onClose={onClose} wide>
      <div className="modal-actions">
        <button type="button" onClick={startCreate}>+ 新增商品</button>
      </div>

      {loading && <p className="hint-text">讀取中…</p>}
      {error && <p className="error-text">{error}</p>}

      {data && (
        <div className="card-list">
          {data.items.length === 0 && <p className="hint-text">交易市場目前是空的。</p>}
          {data.items.map((item) => (
            <div key={item.id} className="item-card item-card--trade">
              <div className="item-card__title">{item.商品}</div>
              <div className="item-card__meta">
                {item.分類 && <span>分類：{item.分類}</span>}
                {item.價格類型 && <span>{item.價格類型}</span>}
                {item.價格範圍 && <span>{item.價格範圍}</span>}
                {item.商品類型 && <span>{item.商品類型}</span>}
                {item.交易日期 && <span>{item.交易日期}</span>}
              </div>
              {item.tag?.length > 0 && (
                <div className="tag-list-readonly">
                  {item.tag.map((t) => <span key={t} className="tag-chip tag-chip--readonly">{t}</span>)}
                </div>
              )}
              <div className="item-card__footer">
                <span className={`status-badge status-badge--${item.交易狀態}`}>{item.交易狀態}</span>
                {item.link && (
                  <a href={item.link} target="_blank" rel="noreferrer" className="link-button">
                    連結
                  </a>
                )}
                <button type="button" className="link-button" onClick={() => startEdit(item)}>編輯</button>
                <button type="button" className="link-button link-button--danger" onClick={() => handleDelete(item)}>刪除</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ModalShell>
  );
}
