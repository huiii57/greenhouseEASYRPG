import { useEffect, useState } from 'react';
import ModalShell from './ModalShell.jsx';
import TagMultiSelect from '../common/TagMultiSelect.jsx';
import { journalApi } from '../../services/api.js';

// 這兩份清單先給常見預設值，你可以依自己 Notion 資料庫實際的選項調整。
const DRINK_OPTIONS = ['無糖', '沒喝', '含糖'];
const TAG_OPTIONS = ['心情', '生活', '工作', '興趣', '健康', '價值觀', '想法'];

export default function StarScrollModal({ onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exists, setExists] = useState(false);
  const [id, setId] = useState(null);

  const [聊天, set聊天] = useState(false);
  const [學習, set學習] = useState(false);
  const [運動, set運動] = useState(false);
  const [飲料, set飲料] = useState('無');
  const [tag, setTag] = useState([]);
  const [content, setContent] = useState('');

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    journalApi
      .getToday()
      .then((res) => {
        setExists(res.exists);
        if (res.exists) {
          setId(res.id);
          set聊天(res.聊天);
          set學習(res.學習);
          set運動(res.運動);
          set飲料(res.飲料 || '無');
          setTag(res.TAG || []);
          setContent(res.content || '');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaveMsg('');
    try {
      const payload = { 聊天, 學習, 運動, 飲料, TAG: tag, content };
      if (exists) {
        await journalApi.update({ id, ...payload });
        setSaveMsg('已更新今天的星辰卷軸');
      } else {
        const res = await journalApi.create(payload);
        setExists(true);
        setId(res.id);
        setSaveMsg('已新增今天的星辰卷軸');
      }
    } catch (err) {
      setSaveMsg(`儲存失敗：${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell title="研究桌：星辰卷軸" onClose={onClose} wide>
      {loading && <p className="hint-text">讀取中…</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <div className="journal-form">
          {exists && <p className="hint-text">今天已經寫過日記了，這裡是編輯模式。</p>}

          <div className="checkbox-row">
            <label>
              <input type="checkbox" checked={聊天} onChange={(e) => set聊天(e.target.checked)} /> 聊天
            </label>
            <label>
              <input type="checkbox" checked={學習} onChange={(e) => set學習(e.target.checked)} /> 學習
            </label>
            <label>
              <input type="checkbox" checked={運動} onChange={(e) => set運動(e.target.checked)} /> 運動
            </label>
          </div>

          <div className="field-row">
            <label htmlFor="drink-select">飲料</label>
            <select id="drink-select" value={飲料} onChange={(e) => set飲料(e.target.value)}>
              {DRINK_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="field-row field-row--column">
            <span>TAG</span>
            <TagMultiSelect options={TAG_OPTIONS} selected={tag} onChange={setTag} />
          </div>

          <textarea
            className="content-textarea"
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="今天和人聊了些什麼呢？有做什麼運動與學習嗎？手搖飲很好喝，喝少一點更好"
          />

          <div className="modal-actions">
            <button type="button" onClick={handleSave} disabled={saving}>
              {saving ? '儲存中…' : exists ? '更新今天的日記' : '新增今天的日記'}
            </button>
            {saveMsg && <span className="hint-text">{saveMsg}</span>}
          </div>
        </div>
      )}
    </ModalShell>
  );
}
