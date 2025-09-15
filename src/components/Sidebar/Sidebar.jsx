import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSettings = () => {
    // Действие для кнопки настроек
    console.log('Открыть настройки');
  };

  return (
    <div className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.slice(0, -1).map((item) => (
          <button
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            className={`nav-item ${activeItem === item.path ? 'active' : ''}`}
          >
            {item.label}
          </button>
        ))}
        
        {/* Нижняя часть с профилем и кнопками */}
        <div className="sidebar-bottom">
          <div className="profile-section">
            <button
              onClick={() => handleNavigation('/profile')}
              className={`nav-item profile-item ${activeItem === '/profile' ? 'active' : ''}`}
            >
              {user?.first_name || 'Мой профиль'}
            </button>
            <button
              onClick={handleSettings}
              className="icon-button"
              aria-label="Настройки"
            >
              ⚙️
            </button>
            <button
              onClick={handleLogout}
              className="icon-button"
              aria-label="Выйти"
            >
              ⎋
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;