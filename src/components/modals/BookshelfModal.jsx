import { useState } from 'react';
import ModalShell from './ModalShell.jsx';
import { useNotionResource } from '../../hooks/useNotionResource.js';
import { bookshelfApi } from '../../services/api.js';

export default function BookshelfModal({ onClose }) {
  const { data, loading, error } = useNotionResource(bookshelfApi.list);
  const [selected, setSelected] = useState(null); // 選中的書籍 item
  const [content, setContent] = useState('');
  const [hasUnsupported, setHasUnsupported] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  async function openBook(item) {
    setSelected(item);
    setSaveMsg('');
    setContentLoading(true);
    try {
      const res = await bookshelfApi.getContent(item.id);
      setContent(res.content || '');
      setHasUnsupported(!!res.hasUnsupported);
    } catch (err) {
      setSaveMsg(`讀取內文失敗：${err.message}`);
    } finally {
      setContentLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveMsg('');
    try {
      await bookshelfApi.saveContent(selected.id, content);
      setSaveMsg('已儲存');
    } catch (err) {
      setSaveMsg(`儲存失敗：${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  if (selected) {
    return (
      <ModalShell title={selected.Name || '書櫃內文'} onClose={onClose} wide>
        <button type="button" className="link-button" onClick={() => setSelected(null)}>
          ← 回到書櫃列表
        </button>
        {contentLoading ? (
          <p className="hint-text">讀取內文中…</p>
        ) : (
          <>
            {hasUnsupported && (
              <p className="warning-text">
                這個頁面裡含有資料庫、表格等無法安全線上編輯的內容，為了避免不小心刪掉這些內容，這裡改成唯讀顯示。
                如果要修改，請直接到 Notion 開啟這個頁面編輯。
              </p>
            )}
            <textarea
              className="content-textarea"
              value={content}
              onChange={(e) => !hasUnsupported && setContent(e.target.value)}
              readOnly={hasUnsupported}
              rows={16}
            />
            {!hasUnsupported && (
              <div className="modal-actions">
                <button type="button" onClick={handleSave} disabled={saving}>
                  {saving ? '儲存中…' : '儲存內文'}
                </button>
                {saveMsg && <span className="hint-text">{saveMsg}</span>}
              </div>
            )}
          </>
        )}
      </ModalShell>
    );
  }

  return (
    <ModalShell title="書櫃" onClose={onClose}>
      {loading && <p className="hint-text">讀取中…</p>}
      {error && <p className="error-text">{error}</p>}
      {data && (
        <div className="card-list">
          {data.items.length === 0 && <p className="hint-text">書櫃目前是空的。</p>}
          {data.items.map((item) => (
            <button key={item.id} type="button" className="item-card item-card--clickable" onClick={() => openBook(item)}>
              <div className="item-card__title">{item.Name}</div>
              <div className="item-card__meta">
                {item.State && <span>狀態：{item.State}</span>}
                {item.date && <span>日期：{item.date}</span>}
              </div>
            </button>
          ))}
        </div>
      )}
    </ModalShell>
  );
}
