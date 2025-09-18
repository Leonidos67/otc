import React, { useState, useEffect, useRef } from 'react';
import './PageStyles.css';
import Rocket from '../components/Icons/Rocket';
import { useNavigate } from 'react-router-dom';

const Deals = () => {
  const [activeTab, setActiveTab] = useState('Активные сделки');
  const navigate = useNavigate();
  const [activeDeals, setActiveDeals] = useState([]);
  const [historyDeals, setHistoryDeals] = useState([]);
  const [draftDeals, setDraftDeals] = useState([]);
  const [isCreateHovering, setIsCreateHovering] = useState(true);
  const menuRef = useRef(null);
  const indicatorRef = useRef(null);

  const menuItems = [
    'Активные сделки',
    'История сделок',
    'Черновики',
  ];

  useEffect(() => {
    if (!menuRef.current) return;
    const buttons = menuRef.current.querySelectorAll('.profile-tab-button');

    const moveIndicator = (el) => {
      if (indicatorRef.current && el) {
        indicatorRef.current.style.width = `${el.offsetWidth}px`;
        indicatorRef.current.style.left = `${el.offsetLeft}px`;
      }
    };

    const activeEl = menuRef.current.querySelector('.active-tab');
    moveIndicator(activeEl);

    buttons.forEach((btn) => {
      const handleMouseEnter = () => moveIndicator(btn);
      const handleMouseLeave = () => moveIndicator(menuRef.current.querySelector('.active-tab'));

      btn.addEventListener('mouseenter', handleMouseEnter);
      btn.addEventListener('mouseleave', handleMouseLeave);

      btn.cleanup = () => {
        btn.removeEventListener('mouseenter', handleMouseEnter);
        btn.removeEventListener('mouseleave', handleMouseLeave);
      };
    });

    return () => buttons.forEach((btn) => btn.cleanup && btn.cleanup());
  }, [activeTab]);

  return (
    <div id="deals" className="p-6 profile-page">
      <div className="page-header">
        <h1 className="profile-page-title">Сделки</h1>
      </div>

      {/* Вынесенный баннер под заголовком */}
      <a
        className="create-deal-banner"
        href="/deals/create"
        onClick={(e) => { e.preventDefault(); navigate('/deals/create'); }}
        onMouseEnter={() => setIsCreateHovering(true)}
        onMouseLeave={() => setIsCreateHovering(true)}
      >
        <div className="banner-bg" />
        <div className="banner-content">
          <Rocket width={28} height={28} stroke="#fff" isHovering={isCreateHovering} />
          <span>Создать сделку</span>
        </div>
      </a>

      <div className="menu-container mb-6 relative" ref={menuRef}>
        {menuItems.map((item) => (
          <button
            key={item}
            className={`profile-tab-button ${activeTab === item ? 'active-tab' : ''}`}
            onClick={() => setActiveTab(item)}
          >
            {item}
          </button>
        ))}
        <div className="hover-indicator" ref={indicatorRef} />
      </div>
      <hr className="divider" />

      <div className="tab-content">
        {activeTab === 'Активные сделки' && (
          <div className="content-box">
            {activeDeals.length === 0 ? (
              <div className="empty-state">
                <h3>У вас нет активных сделок</h3>
                <p>Создайте первую сделку, чтобы увидеть её здесь.</p>
              </div>
            ) : (
              <div />
            )}
          </div>
        )}

        {activeTab === 'История сделок' && (
          <div className="content-box">
            {historyDeals.length === 0 ? (
              <div className="empty-state">
                <h3>История сделок пуста</h3>
                <p>Здесь появятся завершённые сделки.</p>
              </div>
            ) : (
              <div />
            )}
          </div>
        )}

        {activeTab === 'Черновики' && (
          <div className="content-box">
            {draftDeals.length === 0 ? (
              <div className="empty-state">
                <h3>Черновиков пока нет</h3>
                <p>Сохранённые черновики будут отображаться здесь.</p>
              </div>
            ) : (
              <div />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Deals;