import { useState } from 'react';
import ModalShell from './ModalShell.jsx';
import Tabs from '../common/Tabs.jsx';
import { useNotionResource } from '../../hooks/useNotionResource.js';
import { tasksApi } from '../../services/api.js';

export default function NoticeBoardModal({ onClose }) {
  const { data, setData, loading, error } = useNotionResource(tasksApi.list);
  const [activeTab, setActiveTab] = useState('today');
  const [pendingIds, setPendingIds] = useState(new Set());

  async function handleToggleDone(item) {
    // 樂觀更新：先讓畫面立刻反應，失敗再復原
    setPendingIds((prev) => new Set(prev).add(item.id));
    setData((prev) => ({
      todayOrOverdue: prev.todayOrOverdue.filter((t) => t.id !== item.id),
      noDate: prev.noDate.filter((t) => t.id !== item.id)
    }));

    try {
      await tasksApi.setDone(item.id, true);
    } catch (err) {
      // 失敗就把任務加回去，並提示錯誤
      setData((prev) => {
        const key = item.date ? 'todayOrOverdue' : 'noDate';
        return { ...prev, [key]: [...prev[key], item] };
      });
      alert(`更新失敗：${err.message}`);
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  }

  const list = data ? (activeTab === 'today' ? data.todayOrOverdue : data.noDate) : [];

  return (
    <ModalShell title="公會布告欄" onClose={onClose}>
      <Tabs
        tabs={[
          { key: 'today', label: '今日與延宕任務' },
          { key: 'noDate', label: '無時效任務' }
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      {loading && <p className="hint-text">讀取中…</p>}
      {error && <p className="error-text">{error}</p>}

      {data && (
        <div className="task-list">
          {list.length === 0 && <p className="hint-text">這裡目前沒有任務，休息一下吧。</p>}
          {list.map((item) => (
            <label key={item.id} className="task-row">
              <input
                type="checkbox"
                checked={item.Done}
                disabled={pendingIds.has(item.id)}
                onChange={() => handleToggleDone(item)}
              />
              <span className="task-row__name">{item.Name}</span>
              {typeof item.EXP === 'number' && <span className="task-row__exp">+{item.EXP} EXP</span>}
              {item.date && <span className="task-row__date">{item.date}</span>}
            </label>
          ))}
        </div>
      )}
    </ModalShell>
  );
}
