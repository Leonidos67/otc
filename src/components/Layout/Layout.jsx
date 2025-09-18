import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import './Layout.css';
import UserIcon from '../Icons/User';
import AlbumIcon from '../Icons/Album';
import BlocksIcon from '../Icons/Blocks';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login';

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen((v) => !v);

  const go = (path) => navigate(path);
  const isActive = (path) => location.pathname === path;

  return (
    <div className={`layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'} ${isAuthPage ? 'auth-page' : ''}`}>
      {!isMobile && !isAuthPage && (
        <>
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
        </>
      )}
      <main className="content">
        {children}
      </main>
      {!isAuthPage && (
      <div className="mobile-bottom-nav">
        <button className={`mobile-bottom-nav-item ${isActive('/') ? 'active' : ''}`} onClick={() => go('/')} aria-current={isActive('/') ? 'page' : undefined}>
          <BlocksIcon />
          <span className="mobile-bottom-nav-label">Главная</span>
        </button>
        <button className={`mobile-bottom-nav-item ${isActive('/deals') ? 'active' : ''}`} onClick={() => go('/deals')} aria-current={isActive('/deals') ? 'page' : undefined}>
          <AlbumIcon />
          <span className="mobile-bottom-nav-label">Сделки</span>
        </button>
        <button className={`mobile-bottom-nav-item ${isActive('/profile') ? 'active' : ''}`} onClick={() => go('/profile')} aria-current={isActive('/profile') ? 'page' : undefined}>
          <UserIcon animate={false} />
          <span className="mobile-bottom-nav-label">Профиль</span>
        </button>
      </div>
      )}
    </div>
  );
};

export default Layout;