import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ChevronRight from "../components/Icons/ChevronRight";
import WalletConnectButton from "../components/WalletConnectButton";
import CreditCard from "../components/CreditCard/CreditCard";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "react-router-dom";
import "./PageStyles.css";
import { tonConnect } from "../utils/ton/tonConnect";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Общие");
  const [cardNumber, setCardNumber] = useState(() => localStorage.getItem('payment_card_number') || "");
  const [cardExpiry, setCardExpiry] = useState(() => localStorage.getItem('payment_card_expiry') || "");
  const [showCardModal, setShowCardModal] = useState(false);
  const [modalCardNumber, setModalCardNumber] = useState("");
  const [modalCardExpiry, setModalCardExpiry] = useState("");
  const [walletConnected, setWalletConnected] = useState(() => localStorage.getItem('wallet_connected') === 'true');
  const [walletName, setWalletName] = useState(() => localStorage.getItem('wallet_name') || "");
  const [isDraggingSheet, setIsDraggingSheet] = useState(false);
  const [sheetStartY, setSheetStartY] = useState(0);
  const [sheetOffsetY, setSheetOffsetY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);

  const menuRef = useRef(null);
  const indicatorRef = useRef(null);

  const menuItems = [
    "Общие",
    "Способы оплаты/приема платежей",
    "Подключенные аккаунты",
    "Безопасность и конфиденциальность",
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
            <div className="section-box">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                <h3 className="profile-page-title" style={{ marginBottom: 0 }}>Банковская карта</h3>
              </div>
              <CreditCard
                type="brand-light"
                cardNumber={cardNumber}
                cardExpiration={cardExpiry || '00/00'}
                onAddClick={() => { setModalCardNumber(cardNumber); setModalCardExpiry(cardExpiry); setShowCardModal(true); }}
              />
            </div>

            <div className="section-box">
              <h3 className="profile-page-title" style={{ marginBottom: 8 }}>TON-кошелёк</h3>
              <div style={{ display: 'flex', gap: 10 }}>
                <WalletConnectButton />
              </div>
            </div>
          </>
        );
      case "Подключенные аккаунты":
        return <p>Здесь будут ваши подключенные аккаунты Telegram и TON Wallet.</p>;
      case "Безопасность и конфиденциальность":
        return (
          <div className="section-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, cursor: 'pointer' }}
               onClick={() => navigate('/security/passcode')}>
            <div>
              <h3 className="profile-page-title" style={{ marginBottom: 4 }}>Установить код-пароль</h3>
              <p style={{ color: '#bbb', margin: 0 }}>Повышение безопасности аккаунта</p>
            </div>
            <ChevronRight width={24} height={24} stroke="#ffffff" strokeWidth={2} />
          </div>
        );
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

  // Bottom sheet drag handlers
  useEffect(() => {
    if (!showCardModal) return;
    const handleMove = (e) => {
      if (!isDraggingSheet) return;
      const currentY = e.touches && e.touches[0] ? e.touches[0].clientY : e.clientY;
      const delta = currentY - sheetStartY;
      setSheetOffsetY(Math.max(0, delta));
    };
    const handleUp = () => {
      if (!isDraggingSheet) return;
      setIsDraggingSheet(false);
      if (sheetOffsetY > 120) {
        // close if dragged enough
        setShowCardModal(false);
        setSheetOffsetY(0);
        return;
      }
      // snap back
      setSheetOffsetY(0);
    };
    window.addEventListener('mousemove', handleMove, { passive: false });
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [showCardModal, isDraggingSheet, sheetStartY, sheetOffsetY]);

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
          localStorage.setItem('any_wallet_connected', 'true');
          localStorage.setItem('wallet_name', name);
          try {
            const addr = walletInfo.account.address || '';
            if (addr) localStorage.setItem('wallet_address', addr);
          } catch (_) {}
        } else {
          setWalletConnected(false);
          setWalletName("");
          localStorage.setItem('wallet_connected', 'false');
          localStorage.setItem('any_wallet_connected', 'false');
          localStorage.removeItem('wallet_name');
          localStorage.removeItem('wallet_address');
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!menuButtonRef.current) return;
      if (!menuButtonRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      window.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('touchstart', handleClickOutside);
    };
  }, [menuOpen]);

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
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <p className="profile-name" style={{ margin: 0 }}>{user?.first_name || "Имя"}</p>
              
            </div>
            <p className="profile-username">@{user?.username || "username"}</p>
          </div>
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
      {showCardModal && (
        <div className="modal-overlay" onClick={() => setShowCardModal(false)}>
          <div
            className="modal"
            style={{ transform: `translateY(${sheetOffsetY}px)` }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="profile-page-title" style={{ marginBottom: 8 }}>Добавить реквизиты карты</h3>
            <div className="input-group">
              <label>Номер карты</label>
              <input
                type="text"
                placeholder="0000 0000 0000 0000"
                inputMode="numeric"
                value={modalCardNumber}
                onChange={(e) => {
                  const digits = (e.target.value || '').replace(/\D/g, '').slice(0, 16);
                  const grouped = digits.replace(/(.{4})/g, '$1 ').trim();
                  setModalCardNumber(grouped);
                }}
              />
            </div>
            <div className="input-group">
              <label>Срок</label>
              <input
                type="text"
                placeholder="MM/YY"
                inputMode="numeric"
                value={modalCardExpiry}
                onChange={(e) => {
                  const digits = (e.target.value || '').replace(/\D/g, '').slice(0, 4);
                  const mm = digits.slice(0, 2);
                  const yy = digits.slice(2, 4);
                  const formatted = yy ? `${mm}/${yy}` : mm;
                  setModalCardExpiry(formatted);
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button className="create-deal-button" type="button" onClick={() => setShowCardModal(false)}>Отмена</button>
              <button
                className="create-deal-button"
                type="button"
                onClick={() => {
                  const digits = (modalCardNumber || '').replace(/\D/g, '').slice(0, 16);
                  const grouped = digits.replace(/(.{4})/g, '$1 ').trim();
                  setCardNumber(grouped);
                  localStorage.setItem('payment_card_number', grouped);
                  const expDigits = (modalCardExpiry || '').replace(/\D/g, '').slice(0, 4);
                  const mm = expDigits.slice(0, 2);
                  const yy = expDigits.slice(2, 4);
                  const exp = yy ? `${mm}/${yy}` : mm;
                  setCardExpiry(exp);
                  if (exp && exp.length === 5) {
                    localStorage.setItem('payment_card_expiry', exp);
                  } else {
                    localStorage.removeItem('payment_card_expiry');
                  }
                  setShowCardModal(false);
                }}
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
      <button className="logout-button" onClick={logout}>
        Выйти
      </button>
    </div>
  );
};

export default Profile;
