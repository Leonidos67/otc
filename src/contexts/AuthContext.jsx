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
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || '/api';

  useEffect(() => {
    const savedUser = localStorage.getItem('telegram_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing user data:', e);
        localStorage.removeItem('telegram_user');
      }
    }
    setLoading(false);
  }, []);

  const verifyTelegramAuth = async (userData) => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Пропускаем проверку в режиме разработки
    if (isDevelopment) {
        console.log('Development mode: skipping Telegram auth verification');
        return true;
    }
    
    if (!API_URL) {
        console.log('API check skipped - no API URL configured');
        return true;
    }
    
    try {
        const response = await fetch(`${API_URL}/verify-telegram`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        });
        
        if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error('Auth verification failed:', error);
        return false;
    }
};

  const login = async (userData) => {
    try {
      if (API_URL) {
        const isValid = await verifyTelegramAuth(userData);
        if (!isValid) {
          throw new Error('Telegram authentication failed');
        }
      }
      
      const userToSave = {
        id: userData.id,
        first_name: userData.first_name,
        last_name: userData.last_name || '',
        username: userData.username || '',
        photo_url: userData.photo_url || '',
        auth_date: userData.auth_date,
        hash: userData.hash
      };
      
      setUser(userToSave);
      localStorage.setItem('telegram_user', JSON.stringify(userToSave));
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('telegram_user');
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('telegram_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!user,
    apiUrl: API_URL
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};