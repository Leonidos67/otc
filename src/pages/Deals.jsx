import React, { useState, useEffect, useRef } from 'react';
import './PageStyles.css';
import Rocket from '../components/Icons/Rocket';
import { useNavigate, Link } from 'react-router-dom';
import { getActiveDeals, getCompletedDeals, formatDate } from '../utils/dealUtils';

const Deals = () => {
  const [activeTab, setActiveTab] = useState('Активные сделки');
  const navigate = useNavigate();
  const [activeDeals, setActiveDeals] = useState([]);
  const [historyDeals, setHistoryDeals] = useState([]);
  const [draftDeals, setDraftDeals] = useState([]);
  const [isCreateHovering, setIsCreateHovering] = useState(true);
  const menuRef = useRef(null);
  const indicatorRef = useRef(null);

  // Загружаем сделки при монтировании компонента
  useEffect(() => {
    const loadDeals = () => {
      setActiveDeals(getActiveDeals());
      setHistoryDeals(getCompletedDeals());
      // Черновики пока не реализованы
      setDraftDeals([]);
    };

    loadDeals();
    
    // Обновляем сделки каждые 5 секунд
    const interval = setInterval(loadDeals, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    'Активные сделки',
    'Доступные сделки',
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
              <div className="deals-list">
                {activeDeals.map((deal) => (
                  <div key={deal.id} className="deal-card">
                    <div className="deal-card-header">
                      <div className="deal-id">#{deal.id.split('_')[1]}</div>
                      <div className={`deal-status ${deal.status}`}>
                        {deal.status === 'waiting_for_participant' ? 'Ожидает участника' :
                         deal.status === 'waiting_for_confirmation' ? 'Ожидает подтверждения' :
                         deal.status === 'in_progress' ? 'В процессе' :
                         deal.status === 'completed' ? 'Завершена' : 
                         deal.status === 'cancelled' ? 'Отменена' : deal.status}
                      </div>
                    </div>
                    <div className="deal-card-content">
                      <div className="deal-info">
                        <div className="deal-method">{deal.method}</div>
                        <div className="deal-amount">{deal.amount}</div>
                        <div className="deal-gifts-count">{deal.gifts.length} подарков</div>
                      </div>
                      <div className="deal-date">{formatDate(deal.createdAt)}</div>
                    </div>
                    <div className="deal-card-actions">
                      <Link 
                        to={`/deals/${deal.id}`}
                        className="deal-view-button"
                      >
                        Просмотреть
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'Доступные сделки' && (
          <div className="content-box">
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <h3>Просмотр доступных сделок</h3>
              <p>Здесь вы можете найти сделки других пользователей, к которым можно присоединиться.</p>
              <button 
                onClick={() => navigate('/deals/available')}
                className="success-button"
                style={{ marginTop: '20px' }}
              >
                Перейти к доступным сделкам
              </button>
            </div>
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
              <div className="deals-list">
                {historyDeals.map((deal) => (
                  <div key={deal.id} className="deal-card">
                    <div className="deal-card-header">
                      <div className="deal-id">#{deal.id.split('_')[1]}</div>
                      <div className="deal-status completed">Завершена</div>
                    </div>
                    <div className="deal-card-content">
                      <div className="deal-info">
                        <div className="deal-method">{deal.method}</div>
                        <div className="deal-amount">{deal.amount}</div>
                        <div className="deal-gifts-count">{deal.gifts.length} подарков</div>
                      </div>
                      <div className="deal-date">{formatDate(deal.createdAt)}</div>
                    </div>
                    <div className="deal-card-actions">
                      <Link 
                        to={`/deals/${deal.id}`}
                        className="deal-view-button"
                      >
                        Просмотреть
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
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