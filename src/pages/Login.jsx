import React, { useEffect, useState } from 'react';
import TelegramAuth from '../components/TelegramAuth/TelegramAuth';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './PageStyles.css';
import './Login.css';

const Login = () => {
  const { login, continueAsGuest } = useAuth();
  const navigate = useNavigate();
  const [autoAuthInProgress, setAutoAuthInProgress] = useState(true);

  const handleTelegramAuth = async (userData) => {
    try {
      await login(userData);
      navigate('/'); // перенаправление на страницу профиля
    } catch (e) {
      console.error('Ошибка входа через Telegram:', e);
    }
  };

  const handleContinueAsGuest = () => {
    continueAsGuest();
    navigate('/');
  };

  // Автовход в Telegram Mini App: если открыто внутри Telegram, не показываем форму
  useEffect(() => {
    const webApp = window?.Telegram?.WebApp;
    const initDataUnsafe = webApp?.initDataUnsafe;
    const initDataString = webApp?.initData;

    const isInsideTelegram = Boolean(webApp && initDataUnsafe && initDataUnsafe.user);

    if (!isInsideTelegram) {
      setAutoAuthInProgress(false);
      return;
    }

    try {
      // Парсим hash и auth_date из initData (querystring)
      const params = new URLSearchParams(initDataString || '');
      const hash = params.get('hash') || '';
      const auth_date = Number(params.get('auth_date')) || Math.floor(Date.now() / 1000);

      const tgUser = initDataUnsafe.user || {};
      const userData = {
        id: tgUser.id,
        first_name: tgUser.first_name,
        last_name: tgUser.last_name || '',
        username: tgUser.username || '',
        photo_url: tgUser.photo_url || '',
        auth_date,
        hash
      };

      (async () => {
        await handleTelegramAuth(userData);
      })();
    } catch (err) {
      console.error('Auto auth failed:', err);
      setAutoAuthInProgress(false);
    }
  }, []);

  // Внутри Telegram Mini App форму не показываем
  if (autoAuthInProgress) {
    return null;
  }

  return (
    <div className="login-container">
      <div className="content-box">
        <h1>GAMP OTC</h1>
        <TelegramAuth onAuth={handleTelegramAuth} />
        <div className="login-divider">
          <span>или</span>
        </div>
        <button 
          className="continue-guest-button" 
          onClick={handleContinueAsGuest}
        >
          Продолжить без входа
        </button>
      </div>
    </div>
  );
};

export default Login;
