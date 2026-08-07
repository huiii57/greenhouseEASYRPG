import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('checking'); // 'checking' | 'loggedIn' | 'loggedOut'

  useEffect(() => {
    authApi
      .check()
      .then((res) => setStatus(res.loggedIn ? 'loggedIn' : 'loggedOut'))
      .catch(() => setStatus('loggedOut'));
  }, []);

  async function login(password) {
    await authApi.login(password); // 失敗會丟出 error，交給呼叫端處理顯示
    setStatus('loggedIn');
  }

  return (
    <AuthContext.Provider value={{ status, login }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
