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
  const [guestMode, setGuestMode] = useState(false);

  // Default to local serverless path; in development verification is skipped anyway
  const API_URL = process.env.REACT_APP_API_URL || '/api';

  useEffect(() => {
    const savedUser = localStorage.getItem('telegram_user');
    const savedGuestMode = localStorage.getItem('guest_mode');
    
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing user data:', e);
        localStorage.removeItem('telegram_user');
      }
    }
    
    if (savedGuestMode === 'true') {
      setGuestMode(true);
    }
    
    setLoading(false);
  }, []);

  const verifyTelegramAuth = async (userData) => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment) return true;

    if (!API_URL) return true;

    try {
      const response = await fetch(`${API_URL}/verify-telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Auth verification failed:', error);
      return false;
    }
  };

  const login = async (userData) => {
    try {
      const isValid = API_URL ? await verifyTelegramAuth(userData) : true;
      if (!isValid) throw new Error('Telegram authentication failed');

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
    setGuestMode(false);
    localStorage.removeItem('telegram_user');
    localStorage.removeItem('guest_mode');
  };

  const continueAsGuest = () => {
    setGuestMode(true);
    localStorage.setItem('guest_mode', 'true');
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('telegram_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        loading,
        isAuthenticated: !!user,
        guestMode,
        continueAsGuest,
        apiUrl: API_URL
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
