import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const token = localStorage.getItem('securex_token');
    const userData = localStorage.getItem('securex_user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('securex_token');
        localStorage.removeItem('securex_user');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async ({ username, password }) => {
    try {
      const res = await fetch((process.env.REACT_APP_API_BASE_URL || '/api/v1') + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password })
      });
      if (!res.ok) {
        const t = await res.text();
        return { success: false, error: t || 'Login failed' };
      }
      const data = await res.json();
      const { token, user: userData } = data || {};
      if (!token || !userData) return { success: false, error: 'Invalid login response' };
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('securex_token', token);
      localStorage.setItem('securex_user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('securex_token');
      await fetch((process.env.REACT_APP_API_BASE_URL || '/api/v1') + '/auth/logout', {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    } catch (_) {}
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('securex_token');
    localStorage.removeItem('securex_user');
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};