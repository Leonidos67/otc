import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import WalletConnectButton from '../WalletConnectButton';
import './Sidebar.css';
import UserIcon from '../Icons/User';
import AlbumIcon from '../Icons/Album';
import BlocksIcon from '../Icons/Blocks';
import MenuIcon from '../Icons/Menu';

const Sidebar = ({ isOpen = true, onToggle }) => {
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
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <nav className="sidebar-nav">
        {/* Верхнее меню */}
        {menuItems.map((item) => {
          const isActive = activeItem === item.path;
          const animate = isActive;
          return (
            <button
              key={item.path}
              onMouseEnter={() => setActiveItem(item.path)}
              onFocus={() => setActiveItem(item.path)}
              onMouseLeave={() => setActiveItem(location.pathname)}
              onBlur={() => setActiveItem(location.pathname)}
              onClick={() => handleNavigation(item.path)}
              className={`nav-item ${isActive ? 'active' : ''}`}
              style={{ display: 'flex', gap: 10, alignItems: 'center' }}
            >
              {item.path === '/' ? <BlocksIcon animate={isActive} /> : null}
              {item.path === '/deals' ? <AlbumIcon animate={isActive} /> : null}
              {item.path === '/profile' ? (
                user?.photo_url ? (
                  <img src={user.photo_url} alt="avatar" className="nav-avatar" />
                ) : (
                  <UserIcon animate={isActive} />
                )
              ) : null}
              <span className="nav-text">{item.label}</span>
            </button>
          );
        })}

        {/* Пункт "Мой профиль" уже добавлен в верхнее меню */}

        {/* Нижняя часть: кнопка сворачивания меню */}
        <div className="sidebar-bottom">
          <button
            className="nav-item profile-item"
            onMouseEnter={() => setActiveItem('menu')}
            onFocus={() => setActiveItem('menu')}
            onMouseLeave={() => setActiveItem(location.pathname)}
            onBlur={() => setActiveItem(location.pathname)}
            onClick={onToggle}
            style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
          >
            <MenuIcon animate={activeItem === 'menu'} />
            <span className="nav-text">menu</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
