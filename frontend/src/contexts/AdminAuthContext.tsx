import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

interface AdminAuthContextValue {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue>({ token: null, login: () => {}, logout: () => {} });

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));

  useEffect(() => {
    axios.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : '';
  }, [token]);

  const login = (t: string) => { setToken(t); localStorage.setItem('admin_token', t); };
  const logout = () => { setToken(null); localStorage.removeItem('admin_token'); };

  return <AdminAuthContext.Provider value={{ token, login, logout }}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => useContext(AdminAuthContext);
