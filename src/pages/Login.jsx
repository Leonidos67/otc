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
  const [lsUser, setLsUser] = useState({ username: '', password: '' });
  const [lsError, setLsError] = useState('');
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [reg, setReg] = useState({ username: '', password: '', confirm: '' });
  const [regError, setRegError] = useState('');

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

  const handleLocalAuth = async (e) => {
    e.preventDefault();
    setLsError('');
    const username = (lsUser.username || '').trim();
    const password = (lsUser.password || '').trim();
    if (!username || !password) {
      setLsError('Введите логин и пароль.');
      return;
    }
    // Простая локальная авторизация в localStorage
    const key = `user_${username}`;
    const existing = localStorage.getItem(key);
    if (!existing) {
      setLsError('Пользователь не найден. Зарегистрируйтесь.');
      return;
    }
    try {
      const { password: saved } = JSON.parse(existing);
      if (saved !== password) {
        setLsError('Неверный пароль.');
        return;
      }
      const uid = localStorage.getItem('user_id') || `local_${Math.random().toString(36).slice(2, 10)}`;
      const userData = { id: uid, first_name: username, username, method: 'local' };
      try { await login(userData); } catch (_) {}
      navigate('/');
    } catch (_) {
      setLsError('Ошибка авторизации.');
    }
  };

  const handleLocalRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    const username = (reg.username || '').trim();
    const password = (reg.password || '').trim();
    const confirm = (reg.confirm || '').trim();
    if (!username || !password || !confirm) {
      setRegError('Заполните все поля.');
      return;
    }
    if (password !== confirm) {
      setRegError('Пароли не совпадают.');
      return;
    }
    const key = `user_${username}`;
    const existing = localStorage.getItem(key);
    if (existing) {
      setRegError('Пользователь уже существует.');
      return;
    }
    const uid = `local_${Math.random().toString(36).slice(2, 10)}`;
    const userData = { id: uid, first_name: username, username, method: 'local' };
    localStorage.setItem(key, JSON.stringify({ username, password }));
    // используем общий login(), чтобы корректно установить сессию, затем редирект произойдёт здесь
    try {
      await login(userData);
    } catch (_) {}
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
      {/* Переключатель Вход/Регистрация */}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button type="button" className={`success-button`} style={{ opacity: mode === 'login' ? 1 : 0.6 }} onClick={() => setMode('login')}>Вход</button>
        <button type="button" className={`success-button`} style={{ opacity: mode === 'register' ? 1 : 0.6 }} onClick={() => setMode('register')}>Регистрация</button>
      </div>

      {mode === 'login' && (
        <form onSubmit={handleLocalAuth} style={{ width: '100%', marginTop: 8 }}>
          <div className="input-group" style={{ marginTop: 12 }}>
            <label>Локальный логин</label>
            <input
              type="text"
              value={lsUser.username}
              onChange={(e) => setLsUser({ ...lsUser, username: e.target.value })}
              placeholder="Введите логин"
            />
          </div>
          <div className="input-group" style={{ marginTop: 12 }}>
            <label>Пароль</label>
            <input
              type="password"
              value={lsUser.password}
              onChange={(e) => setLsUser({ ...lsUser, password: e.target.value })}
              placeholder="Введите пароль"
            />
          </div>
          {lsError && <div className="error-text" style={{ marginTop: 8 }}>{lsError}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <button type="submit" className="success-button">Войти</button>
          </div>
        </form>
      )}

      {mode === 'register' && (
        <form onSubmit={handleLocalRegister} style={{ width: '100%', marginTop: 8 }}>
          <div className="input-group" style={{ marginTop: 12 }}>
            <label>Логин</label>
            <input
              type="text"
              value={reg.username}
              onChange={(e) => setReg({ ...reg, username: e.target.value })}
              placeholder="Придумайте логин"
            />
          </div>
          <div className="input-group" style={{ marginTop: 12 }}>
            <label>Пароль</label>
            <input
              type="password"
              value={reg.password}
              onChange={(e) => setReg({ ...reg, password: e.target.value })}
              placeholder="Придумайте пароль"
            />
          </div>
          <div className="input-group" style={{ marginTop: 12 }}>
            <label>Подтверждение пароля</label>
            <input
              type="password"
              value={reg.confirm}
              onChange={(e) => setReg({ ...reg, confirm: e.target.value })}
              placeholder="Повторите пароль"
            />
          </div>
          {regError && <div className="error-text" style={{ marginTop: 8 }}>{regError}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <button type="submit" className="success-button">Зарегистрироваться</button>
          </div>
        </form>
      )}
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
