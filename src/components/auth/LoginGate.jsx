import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';

export default function LoginGate() {
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(password);
    } catch (err) {
      setError(err.message || '登入失敗');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-gate">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>溫室公會大廳</h1>
        <p className="login-subtitle">請輸入密碼以進入你的空間</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="密碼"
          autoFocus
        />
        {error && <p className="login-error">{error}</p>}
        <button type="submit" disabled={submitting || !password}>
          {submitting ? '進入中…' : '進入公會'}
        </button>
      </form>
    </div>
  );
}
