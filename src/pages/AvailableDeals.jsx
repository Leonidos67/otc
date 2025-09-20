import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './PageStyles.css';
import { getAvailableDeals, joinDeal, formatDate } from '../utils/dealUtils';

const AvailableDeals = () => {
  const navigate = useNavigate();
  const [availableDeals, setAvailableDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId] = useState(localStorage.getItem('user_id') || 'anonymous');

  useEffect(() => {
    const loadDeals = () => {
      const deals = getAvailableDeals(currentUserId);
      setAvailableDeals(deals);
      setLoading(false);
    };

    loadDeals();
    
    // Обновляем список каждые 5 секунд
    const interval = setInterval(loadDeals, 5000);
    
    return () => clearInterval(interval);
  }, [currentUserId]);

  const handleJoinDeal = (dealId) => {
    if (joinDeal(dealId, currentUserId)) {
      alert('Вы успешно присоединились к сделке!');
      navigate(`/deals/${dealId}`);
    } else {
      alert('Не удалось присоединиться к сделке');
    }
  };

  if (loading) {
    return (
      <div className="p-6 profile-page">
        <div className="loading">Загрузка доступных сделок...</div>
      </div>
    );
  }

  return (
    <div className="p-6 profile-page">
      <h1 className="profile-page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link to="/deals" className="back-link" aria-label="Назад к сделкам">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        Доступные сделки
      </h1>
      <hr className="divider" style={{ marginTop: '8px' }} />

      <div className="content-box">
        {availableDeals.length === 0 ? (
          <div className="empty-state">
            <h3>Нет доступных сделок</h3>
            <p>В данный момент нет сделок, к которым можно присоединиться.</p>
            <button 
              onClick={() => navigate('/deals/create')}
              className="success-button"
              style={{ marginTop: '20px' }}
            >
              Создать новую сделку
            </button>
          </div>
        ) : (
          <div className="deals-list">
            {availableDeals.map((deal) => (
              <div key={deal.id} className="deal-card">
                <div className="deal-card-header">
                  <div className="deal-id">#{deal.id.split('_')[1]}</div>
                  <div className="deal-status waiting_for_participant">Ожидает участника</div>
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
                  <button 
                    onClick={() => handleJoinDeal(deal.id)}
                    className="deal-view-button"
                  >
                    Присоединиться
                  </button>
                  <Link 
                    to={`/deals/${deal.id}`}
                    className="deal-view-button secondary"
                  >
                    Просмотреть
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableDeals;
