import React, { useEffect, useState } from 'react';
import WalletConnectButton from '../components/WalletConnectButton';
import TelegramAuth from '../components/TelegramAuth/TelegramAuth';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AnimatedGifts from '../components/AnimatedGifts/AnimatedGifts';
import './PageStyles.css';
import { getOrCreateUserId } from '../utils/dealUtils';
import { Copy } from '../components/Icons/Copy.jsx';
import UserDealsChart from '../components/UserDealsChart.jsx';
import NpmSparkLine from '../components/NpmSparkLine.jsx';

const Home = () => {
  const { user, guestMode, login, logout } = useAuth();
  const navigate = useNavigate();
  const [usdRate, setUsdRate] = useState(() => (parseFloat((localStorage.getItem('usd_rate') || '100').toString().replace(',', '.')) || 100));
  const currentUserId = getOrCreateUserId();
  const balanceRub = (parseFloat((localStorage.getItem(`balance_rub_${currentUserId}`) ?? localStorage.getItem('balance_rub') ?? '0').toString().replace(',', '.')) || 0);
  const balanceUsd = balanceRub / (usdRate > 0 ? usdRate : 100);

  // Управляем классом body для убирания padding у content
  useEffect(() => {
    document.body.classList.add('home-page-active');
    return () => {
      document.body.classList.remove('home-page-active');
    };
  }, []);

  // Fetch USD rate from CBR-XML-Daily on mount
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
        const data = await res.json();
        const nextRate = parseFloat(data?.Valute?.USD?.Value);
        if (!Number.isNaN(nextRate) && nextRate > 0) {
          localStorage.setItem('usd_rate', String(nextRate));
          setUsdRate(nextRate);
        }
      } catch (_) {
        // ignore network errors, keep previous rate
      }
    };
    fetchRate();
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
          <div className="balance-top-row">
            <h3>Баланс</h3>
            <button className="manage-wallet-btn" onClick={() => navigate('/profile?tab=payments')}>
              Управление кошельком
            </button>
          </div>

          <div className="balance-amount">{balanceRub.toFixed(2)}</div>
          <div className="balance-usd">≈ ${balanceUsd.toFixed(2)}</div>

          {/* Номер карты и копирование */}
          <div className="card-row">
            <div className="card-number">
              {localStorage.getItem('payment_card_number') || 'Карта не привязана'}
            </div>
            <button
              className="copy-btn"
              onMouseEnter={(e) => e.currentTarget.setAttribute('data-active', 'true')}
              onMouseLeave={(e) => e.currentTarget.removeAttribute('data-active')}
              onMouseDown={(e) => e.currentTarget.setAttribute('data-active', 'true')}
              onMouseUp={(e) => e.currentTarget.removeAttribute('data-active')}
              onClick={() => {
                const card = localStorage.getItem('payment_card_number') || '';
                if (!card) return;
                navigator.clipboard.writeText(card).then(() => {
                  // ok
                }).catch(() => {
                  const ta = document.createElement('textarea');
                  ta.value = card;
                  document.body.appendChild(ta);
                  ta.select();
                  document.execCommand('copy');
                  document.body.removeChild(ta);
                });
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <Copy width={14} height={14} stroke="#fff" active={Boolean(document?.activeElement && document.activeElement.getAttribute && document.activeElement.getAttribute('data-active'))} />
              </span>
              <span>Скопировать</span>
            </button>
          </div>

          <div className="balance-actions">
            <button className="balance-btn deposit-btn" onClick={() => navigate('/deposit')}>
              Пополнить
            </button>
            <button 
              className="balance-btn withdraw-btn"
              onClick={() => navigate('/withdraw')}
            >
              Вывести
            </button>
            <button
              className="balance-btn transactions-btn"
              onClick={() => navigate('/transactions')}
            >
              История транзакций
            </button>
          </div>
        </div>

        {/* Три горизонтальных блока */}
        {/* <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="content-box" style={{ background: '#0d0d0d', border: '1px solid #222', borderRadius: 12, padding: 12 }}>
            <UserDealsChart />
          </div>
          <div className="content-box" style={{ background: '#0d0d0d', border: '1px solid #222', borderRadius: 12, padding: 12 }}>
            <h3 style={{ color: '#fff', marginTop: 0, marginBottom: 8, fontSize: 16 }}>Weekly downloads</h3>
            <NpmSparkLine />
          </div>
        </div> */}

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