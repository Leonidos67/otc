import React, { useState, useEffect, useRef } from "react";
import WalletConnectButton from "../components/WalletConnectButton";
import CreditCard from "../components/CreditCard/CreditCard";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "react-router-dom";
import "./PageStyles.css";
import { tonConnect } from "../utils/ton/tonConnect";

const Profile = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("Общие");
  const [cardNumber, setCardNumber] = useState(() => localStorage.getItem('payment_card_number') || "");
  const [walletConnected, setWalletConnected] = useState(() => localStorage.getItem('wallet_connected') === 'true');
  const [walletName, setWalletName] = useState(() => localStorage.getItem('wallet_name') || "");

  const menuRef = useRef(null);
  const indicatorRef = useRef(null);

  const menuItems = [
    "Общие",
    "Способы оплаты/приема платежей",
    "Подключенные аккаунты",
    "Безопасность и конфиденциальность",
    "История выставления счетов",
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Общие":
        return (
          <>
            <div className="input-group">
              <label>Имя</label>
              <input type="text" value={user?.first_name || ""} readOnly />
            </div>
            <div className="input-group">
              <label>Username</label>
              <input type="text" value={user?.username || ""} readOnly />
            </div>
            <div className="input-group">
              <label>ID</label>
              <input type="text" value={user?.id || ""} readOnly />
            </div>
          </>
        );
      case "Способы оплаты/приема платежей":
        return (
          <>
            <div className="content-box" style={{ margin: 0 }}>
              <h3 className="profile-page-title" style={{ marginBottom: 8 }}>Банковская карта</h3>
              <div style={{ marginBottom: 12 }}>
                <CreditCard type="brand-light" />
              </div>
              <div className="input-group">
                <label>Номер карты</label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  className="create-deal-button"
                  type="button"
                  onClick={() => { localStorage.setItem('payment_card_number', cardNumber); }}
                >
                  Сохранить
                </button>
              </div>
            </div>

            <div className="content-box" style={{ margin: 12 }}>
              <h3 className="profile-page-title" style={{ marginBottom: 8 }}>TON-кошелёк</h3>
              <p style={{ color: '#bbb', marginTop: 0, marginBottom: 8 }}>
                Статус: {walletConnected ? 'подключён' : 'не подключён'}{walletConnected && walletName ? ` · ${walletName}` : ''}
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <WalletConnectButton />
              </div>
            </div>
          </>
        );
      case "Подключенные аккаунты":
        return <p>Здесь будут ваши подключенные аккаунты Telegram и TON Wallet.</p>;
      case "Безопасность и конфиденциальность":
        return <p>Настройки пароля, двухфакторной аутентификации и видимости профиля.</p>;
      case "История выставления счетов":
        return <p>Просмотрите историю выставленных вам счетов.</p>;
      default:
        return null;
    }
  };

  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'payments') {
      setActiveTab('Способы оплаты/приема платежей');
    }
  }, [location.search]);

  // Подписка на обновление статуса TON-кошелька (TonConnect)
  useEffect(() => {
    const unsubscribe = tonConnect.onStatusChange((walletInfo) => {
      try {
        if (walletInfo && walletInfo.account) {
          const name = (walletInfo.device && walletInfo.device.appName)
            ? walletInfo.device.appName
            : (walletInfo.account.address || "TON Wallet");
          setWalletConnected(true);
          setWalletName(name);
          localStorage.setItem('wallet_connected', 'true');
          localStorage.setItem('wallet_name', name);
        } else {
          setWalletConnected(false);
          setWalletName("");
          localStorage.setItem('wallet_connected', 'false');
          localStorage.removeItem('wallet_name');
        }
      } catch (_) {}
    });
    return () => {
      try { unsubscribe && unsubscribe(); } catch (_) {}
    };
  }, []);

  useEffect(() => {
    const buttons = menuRef.current.querySelectorAll(".profile-tab-button");

    const moveIndicator = (el) => {
      if (indicatorRef.current && el) {
        indicatorRef.current.style.width = `${el.offsetWidth}px`;
        indicatorRef.current.style.left = `${el.offsetLeft}px`;
      }
    };

    const activeEl = menuRef.current.querySelector(".active-tab");
    moveIndicator(activeEl);

    buttons.forEach((btn) => {
      const handleMouseEnter = () => moveIndicator(btn);
      const handleMouseLeave = () => moveIndicator(menuRef.current.querySelector(".active-tab"));

      btn.addEventListener("mouseenter", handleMouseEnter);
      btn.addEventListener("mouseleave", handleMouseLeave);

      btn.cleanup = () => {
        btn.removeEventListener("mouseenter", handleMouseEnter);
        btn.removeEventListener("mouseleave", handleMouseLeave);
      };
    });

    return () => buttons.forEach((btn) => btn.cleanup());
  }, [activeTab]);

  return (
    <div className="p-6 profile-page">
      <h1 className="profile-page-title">Мой профиль</h1>
      <hr className="divider" style={{ marginTop: "8px" }} />

      <div className="flex items-center mb- profile-header" style={{ marginTop: "20px"}}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src={user?.photo_url || "https://via.placeholder.com/96"}
            alt="Profile"
            className="profile-photo"
          />
          <div className="profile-info">
            <p className="profile-name">{user?.first_name || "Имя"}</p>
            <p className="profile-username">@{user?.username || "username"}</p>
          </div>
        </div>
        <div className="profile-actions">
          <WalletConnectButton />
        </div>
      </div>

      <hr className="divider-nav" />
      <div className="menu-container mb-6 relative" ref={menuRef}>
        {menuItems.map((item) => (
          <button
            key={item}
            className={`profile-tab-button ${activeTab === item ? "active-tab" : ""}`}
            onClick={() => setActiveTab(item)}
          >
            {item}
          </button>
        ))}
        <div className="hover-indicator" ref={indicatorRef} />
      </div>
      <hr className="divider" />

      <div className="tab-content">{renderTabContent()}</div>
      <button className="logout-button" onClick={logout}>
        Выйти
      </button>
    </div>
  );
};

export default Profile;
