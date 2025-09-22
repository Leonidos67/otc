import React, { useEffect } from 'react';
import WalletConnectButton from '../components/WalletConnectButton';
import TelegramAuth from '../components/TelegramAuth/TelegramAuth';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AnimatedGifts from '../components/AnimatedGifts/AnimatedGifts';
import './PageStyles.css';

const Home = () => {
  const { user, guestMode, login, logout } = useAuth();
  const navigate = useNavigate();

  // Управляем классом body для убирания padding у content
  useEffect(() => {
    document.body.classList.add('home-page-active');
    return () => {
      document.body.classList.remove('home-page-active');
    };
  }, []);

  const handleTelegramAuth = async (userData) => {
    try {
      await login(userData);
    } catch (e) {
      console.error('Ошибка входа через Telegram:', e);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div id="main" className="home-container home-page">
      {/* Top Fade Grid Background */}
      <div
        className="home-grid-background"
        style={{
          backgroundImage: `
            linear-gradient(to right, #222 1px, transparent 1px),
            linear-gradient(to bottom, #222 1px, transparent 1px)
          `,
          backgroundSize: "20px 30px",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)",
        }}
      />

      {/* Блок с анимированными подарками - показывается сверху на мобильных, справа на ПК */}
      <AnimatedGifts />

      {/* Основной контент */}
      <div className="home-main-content">
        <div className="home-header">
          <h1>Привет, {user?.first_name || (guestMode ? 'Гость' : 'Пользователь')}!</h1>
          <p>Добро пожаловать в торговую платформу OTC!</p>
        </div>

        {/* Визуализация счета */}
        <div className="balance-card">
          <div className="balance-header">
            <h3>Баланс</h3>
            <div className="balance-currency">RUB</div>
          </div>
          <div className="balance-amount">0.00</div>
          <div className="balance-usd">≈ $0.00</div>
          <div className="balance-actions">
            <button className="balance-btn deposit-btn">
              Пополнить
            </button>
            <button 
              className="balance-btn withdraw-btn"
              onClick={() => {
                const cardNumber = localStorage.getItem('payment_card_number');
                if (!cardNumber || !cardNumber.trim()) {
                  alert('Для вывода средств необходимо привязать банковскую карту в профиле');
                  return;
                }
                // Здесь будет логика вывода средств
                alert('Функция вывода средств будет реализована');
              }}
            >
              Вывести
            </button>
          </div>
        </div>

        <div className="content-box" style={{ marginBottom: '16px' }}>
          <h2>Подключите кошелек TON</h2>
          <p>Чтобы продолжить, подключите Tonkeeper или другой поддерживаемый кошелек.</p>
          <WalletConnectButton />
        </div>
      </div>
    </div>
  );
};

export default Home;