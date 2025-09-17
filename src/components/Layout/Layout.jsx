import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import './Layout.css';
import UserIcon from '../Icons/User';
import AlbumIcon from '../Icons/Album';
import BlocksIcon from '../Icons/Blocks';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen((v) => !v);

  const go = (path) => navigate(path);

  return (
    <div className={`layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <button
        className="mobile-menu-toggle"
        aria-label="Меню"
        onClick={toggleSidebar}
      >
        <svg fill="none" height="9" viewBox="0 0 21 9" width="21" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L19.6667 1" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6"></path>
          <path d="M1 7.7998L10.3333 7.7998" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6"></path>
        </svg>
      </button>
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      <main className="content">
        {children}
      </main>
      <div className="mobile-bottom-nav">
        <button className="mobile-bottom-nav-item" onClick={() => go('/')}>
          <BlocksIcon />
          Главная
        </button>
        <button className="mobile-bottom-nav-item" onClick={() => go('/deals')}>
          <AlbumIcon />
          Сделки
        </button>
        <button className="mobile-bottom-nav-item" onMouseEnter={() => {}} onClick={() => go('/profile')}>
          <UserIcon animate={false} />
          Профиль
        </button>
      </div>
    </div>
  );
};

export default Layout;