import React, { useState, useEffect, useRef } from "react";
import WalletConnectButton from "../components/WalletConnectButton";
import { useAuth } from "../contexts/AuthContext";
import "./PageStyles.css";

const Profile = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("Общие");

  const menuRef = useRef(null);
  const indicatorRef = useRef(null);

  const menuItems = [
    "Общие",
    "Подключенные аккаунты",
    "Безопасность и конфиденциальность",
    "История выставления счетов",
    "Членства",
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
      case "Подключенные аккаунты":
        return <p>Здесь будут ваши подключенные аккаунты Telegram и TON Wallet.</p>;
      case "Безопасность и конфиденциальность":
        return <p>Настройки пароля, двухфакторной аутентификации и видимости профиля.</p>;
      case "История выставления счетов":
        return <p>Просмотрите историю выставленных вам счетов.</p>;
      case "Членства":
        return <p>Ваши активные подписки и членства.</p>;
      default:
        return null;
    }
  };

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

      <div className="flex items-center mb-6 profile-header">
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
