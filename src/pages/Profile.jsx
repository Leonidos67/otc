import React, { useState, useEffect, useRef } from "react";
import WalletConnectButton from "../components/WalletConnectButton";
import { useAuth } from "../contexts/AuthContext";
import "./PageStyles.css";

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Общие");

  const menuRef = useRef(null);
  const indicatorRef = useRef(null);

  const menuItems = [
    "Общие",
    "Подключенные аккаунты",
    "Безопасность и конфиденциальность",
    "Способы оплаты",
    "История выставления счетов",
    "Членства",
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Общие":
        return (
          <div className="content-box">
            <h2>Основная информация</h2>
            <p>Имя: {user?.first_name} {user?.last_name}</p>
            <p>Username: @{user?.username}</p>
            <p>ID: {user?.id}</p>
          </div>
        );
      case "Подключенные аккаунты":
        return (
          <div className="content-box">
            <h2>Подключенные аккаунты</h2>
            <p>Здесь будут ваши подключенные аккаунты Telegram и TON Wallet.</p>
          </div>
        );
      case "Безопасность и конфиденциальность":
        return (
          <div className="content-box">
            <h2>Безопасность и конфиденциальность</h2>
            <p>Настройки пароля, двухфакторной аутентификации и видимости профиля.</p>
          </div>
        );
      case "Способы оплаты":
        return (
          <div className="content-box">
            <h2>Способы оплаты</h2>
            <p>Добавьте или удалите ваши способы оплаты для услуг.</p>
          </div>
        );
      case "История выставления счетов":
        return (
          <div className="content-box">
            <h2>История счетов</h2>
            <p>Просмотрите историю выставленных вам счетов.</p>
          </div>
        );
      case "Членства":
        return (
          <div className="content-box">
            <h2>Членства</h2>
            <p>Ваши активные подписки и членства.</p>
          </div>
        );
      default:
        return null;
    }
  };

  // Эффект движения фона
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
    <div className="p-6">
      <h1 className="profile-page-title">Мой профиль</h1>
      <hr style={{ borderColor: "#000", marginBottom: "20px" }} />

      <div className="flex items-center mb-6 profile-header">
        <img
          src={user?.photo_url || "https://via.placeholder.com/96"} // стоковая картинка для теста
          alt="Profile"
          className="profile-photo"
        />
        <div className="profile-info">
          <p className="profile-name">
            {user?.first_name || "Имя"} {user?.last_name || "Фамилия"}
          </p>
          <p className="profile-username">@{user?.username || "username"}</p>
        </div>
      </div>


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

      {renderTabContent()}

      <WalletConnectButton />
    </div>
  );
};

export default Profile;
