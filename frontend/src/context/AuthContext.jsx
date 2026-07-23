import { createContext, useContext, useState } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('taskify_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [impersonator, setImpersonator] = useState(() => {
    const stored = sessionStorage.getItem('taskify_impersonator');
    return stored ? JSON.parse(stored) : null;
  });

  function setSession(token, sessionUser) {
    localStorage.setItem('taskify_token', token);
    localStorage.setItem('taskify_user', JSON.stringify(sessionUser));
    setUser(sessionUser);
  }

  async function login(phoneNumber, password) {
    const { data } = await client.post('/auth/login', { phoneNumber, password });
    setSession(data.token, data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('taskify_token');
    localStorage.removeItem('taskify_user');
    sessionStorage.removeItem('taskify_impersonator');
    setImpersonator(null);
    setUser(null);
  }

  // Super Admin viewing the app as an org's admin, without needing their password
  function startImpersonation(token, orgAdminUser) {
    const currentToken = localStorage.getItem('taskify_token');
    const impersonatorData = { token: currentToken, user };
    sessionStorage.setItem('taskify_impersonator', JSON.stringify(impersonatorData));
    setImpersonator(impersonatorData);
    setSession(token, orgAdminUser);
  }

  function stopImpersonation() {
    if (!impersonator) return;
    sessionStorage.removeItem('taskify_impersonator');
    setSession(impersonator.token, impersonator.user);
    setImpersonator(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, impersonator, startImpersonation, stopImpersonation }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
