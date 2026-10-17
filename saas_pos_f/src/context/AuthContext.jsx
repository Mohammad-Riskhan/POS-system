import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const activeToken = token || localStorage.getItem('token');
      if (activeToken) {
        try {
          // Explicitly ensure Authorization header is attached
          api.defaults.headers.common['Authorization'] = `Bearer ${activeToken}`;
          const res = await api.get('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${activeToken}`,
            },
          });
          setUser((prev) => ({
            ...prev,
            ...res.data,
          }));
        } catch (err) {
          console.warn('Session verification failed, signing out', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifySession();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    const data = res.data;

    // 1. Store JWT token & user in localStorage BEFORE firing any verification
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));

    // 2. Explicitly attach the Authorization header on Axios defaults
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

    setToken(data.token);
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const isSuperAdmin = user?.role === 'ROLE_SUPER_ADMIN' || user?.role === 'SUPER_ADMIN';

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
    role: user?.role,
    businessId: user?.bId,
    businessName: user?.bName,
    isSuperAdmin,
    isOwner: isSuperAdmin || user?.role === 'ROLE_OWNER',
    isBusinessOwner: user?.role === 'ROLE_BUSINESS_OWNER',
    isCashier: user?.role === 'ROLE_CASHIER',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
