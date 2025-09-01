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
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [linkCode, setLinkCode] = useState(localStorage.getItem('linkCode'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Verify token and get user info
      fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => {
        if (!res.ok) {
          throw new Error('Token invalid');
        }
        return res.json();
      })
      .then(data => {
        setUser(data.user);
      })
      .catch(() => {
        // Token invalid, clear it
        logout();
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (username, password, pin) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, pin }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    setToken(data.token);
    setUser(data.user);
    setLinkCode(data.linkCode);
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('linkCode', data.linkCode);
    
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setLinkCode(null);
    localStorage.removeItem('token');
    localStorage.removeItem('linkCode');
  };

  const value = {
    user,
    token,
    linkCode,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};