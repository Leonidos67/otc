import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import WalletConnectButton from '../WalletConnectButton';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [activeItem, setActiveItem] = useState(location.pathname);

  const menuItems = [
    { path: '/', label: 'Главная' },
    { path: '/deals', label: 'Сделки' },
    { path: '/profile', label: 'Мой профиль' }
  ];

  const handleNavigation = (path) => {
    setActiveItem(path);
    navigate(path);
  };

  

  const handleSettings = () => {
    console.log('Открыть настройки');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <nav className="sidebar-nav">
        {/* Верхнее меню */}
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            className={`nav-item ${activeItem === item.path ? 'active' : ''}`}
          >
            {item.label}
          </button>
        ))}

        {/* Пункт "Мой профиль" уже добавлен в верхнее меню */}

        {/* Нижняя часть: кнопка подключения кошелька */}
        <div className="sidebar-bottom">
          <WalletConnectButton />
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
