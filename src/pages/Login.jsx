import React from 'react';
import TelegramAuth from '../components/TelegramAuth/TelegramAuth';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './PageStyles.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleTelegramAuth = async (userData) => {
    try {
      await login(userData);
      navigate('/profile'); // перенаправление на страницу профиля
    } catch (e) {
      console.error('Ошибка входа через Telegram:', e);
    }
  };

  return (
    <div className="login-container">
      <div className="content-box">
        <h1>Вход через Telegram</h1>
        <p>Для продолжения войдите через свой Telegram аккаунт</p>
        <TelegramAuth onAuth={handleTelegramAuth} />
      </div>
    </div>
  );
};

export default Login;
