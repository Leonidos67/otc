import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './PageStyles.css';
import { 
  getDealById, 
  formatDate, 
  saveDeal, 
  joinDeal, 
  confirmReadiness, 
  completeDeal,
  createPublicDealUrl
} from '../utils/dealUtils';

const DealView = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId] = useState(localStorage.getItem('user_id') || 'anonymous');

  useEffect(() => {
    if (dealId) {
      console.log('Поиск сделки с ID:', dealId);
      
      // Получаем все сделки для отладки
      const allDeals = JSON.parse(localStorage.getItem('deals') || '[]');
      console.log('Все сделки в localStorage:', allDeals);
      
      const dealData = getDealById(dealId);
      console.log('Найденная сделка:', dealData);
      
      if (dealData) {
        setDeal(dealData);
      } else {
        setError(`Сделка с ID "${dealId}" не найдена. Доступные сделки: ${allDeals.map(d => d.id).join(', ')}`);
      }
      setLoading(false);
    }
  }, [dealId]);

  const copyDealLink = () => {
    const dealUrl = createPublicDealUrl(dealId);
    navigator.clipboard.writeText(dealUrl).then(() => {
      alert('Публичная ссылка на сделку скопирована в буфер обмена!\n\nТеперь вы можете поделиться этой ссылкой с любым пользователем, и он сможет присоединиться к сделке на любом устройстве!');
    }).catch(() => {
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea');
      textArea.value = dealUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Публичная ссылка на сделку скопирована в буфер обмена!\n\nТеперь вы можете поделиться этой ссылкой с любым пользователем, и он сможет присоединиться к сделке на любом устройстве!');
    });
  };

  const handleJoinDeal = () => {
    if (joinDeal(dealId, currentUserId)) {
      alert('Вы успешно присоединились к сделке!');
      // Обновляем данные сделки
      const updatedDeal = getDealById(dealId);
      setDeal(updatedDeal);
    } else {
      alert('Не удалось присоединиться к сделке');
    }
  };

  const handleConfirmReadiness = (ready) => {
    if (confirmReadiness(dealId, currentUserId, ready)) {
      alert(ready ? 'Вы подтвердили готовность!' : 'Вы отменили готовность');
      // Обновляем данные сделки
      const updatedDeal = getDealById(dealId);
      setDeal(updatedDeal);
    } else {
      alert('Не удалось обновить статус готовности');
    }
  };

  const handleCompleteDeal = () => {
    if (window.confirm('Вы уверены, что хотите завершить сделку?')) {
      if (completeDeal(dealId, currentUserId)) {
        alert('Сделка успешно завершена!');
        // Обновляем данные сделки
        const updatedDeal = getDealById(dealId);
        setDeal(updatedDeal);
      } else {
        alert('Не удалось завершить сделку');
      }
    }
  };

  // Определяем роль пользователя в сделке
  const isCreator = deal && deal.creatorId === currentUserId;
  const isParticipant = deal && deal.participants.participant && deal.participants.participant.id === currentUserId;
  const canJoin = deal && deal.status === 'waiting_for_participant' && !isCreator && !isParticipant;
  const isInDeal = isCreator || isParticipant;

  if (loading) {
    return (
      <div className="p-6 profile-page">
        <div className="loading">Загрузка сделки...</div>
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="p-6 profile-page">
        <h1 className="profile-page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to="/deals" className="back-link" aria-label="Назад к сделкам">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          Сделка не найдена
        </h1>
        <hr className="divider" style={{ marginTop: '8px' }} />
        <div className="content-box">
          <div className="empty-state">
            <h3>Сделка не найдена</h3>
            <p>{error}</p>
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={() => navigate('/deals')}
                className="success-button"
              >
                Вернуться к списку сделок
              </button>
              <button 
                onClick={() => navigate('/deals/create')}
                className="action-button primary"
              >
                Создать новую сделку
              </button>
              <button 
                onClick={() => {
                  // Создаем тестовую сделку для отладки
                  const testDeal = {
                    method: 'TON-кошелек',
                    amount: 100,
                    gifts: [
                      { id: 'test1', title: 'Тестовый подарок 1', img: 'https://via.placeholder.com/100' },
                      { id: 'test2', title: 'Тестовый подарок 2', img: 'https://via.placeholder.com/100' }
                    ],
                    userId: 'test_user'
                  };
                  const newDealId = saveDeal(testDeal);
                  console.log('Создана тестовая сделка:', newDealId);
                  alert(`Создана тестовая сделка с ID: ${newDealId}`);
                  navigate(`/deals/${newDealId}`);
                }}
                className="action-button secondary"
              >
                Создать тестовую сделку
              </button>
            </div>
          </div>
        </div>
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
        Сделка #{dealId.split('_')[1]}
      </h1>
      <hr className="divider" style={{ marginTop: '8px' }} />

      <div className="deal-view-container">
        {/* Основная информация о сделке */}
        <div className="deal-info-card">
          <div className="deal-header">
            <div className="deal-status">
              <span className={`status-badge ${deal.status}`}>
                {deal.status === 'waiting_for_participant' ? 'Ожидает участника' :
                 deal.status === 'waiting_for_confirmation' ? 'Ожидает подтверждения' :
                 deal.status === 'in_progress' ? 'В процессе' :
                 deal.status === 'completed' ? 'Завершена' : 
                 deal.status === 'cancelled' ? 'Отменена' : deal.status}
              </span>
            </div>
            <div className="deal-date">
              Создана: {formatDate(deal.createdAt)}
            </div>
          </div>

          <div className="deal-details">
            <h2>Детали сделки</h2>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Метод оплаты:</span>
                <span className="detail-value">{deal.method}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Сумма:</span>
                <span className="detail-value">{deal.amount}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Количество подарков:</span>
                <span className="detail-value">{deal.gifts.length}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">ID сделки:</span>
                <span className="detail-value deal-id">{deal.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Участники сделки */}
        <div className="deal-participants-card">
          <h2>Участники сделки</h2>
          <div className="participants-list">
            <div className="participant-item">
              <div className="participant-info">
                <div className="participant-role">Создатель</div>
                <div className="participant-id">{deal.participants.creator.id}</div>
              </div>
              <div className="participant-status">
                <span className={`readiness-badge ${deal.participants.creator.ready ? 'ready' : 'not-ready'}`}>
                  {deal.participants.creator.ready ? 'Готов' : 'Не готов'}
                </span>
              </div>
            </div>
            
            {deal.participants.participant ? (
              <div className="participant-item">
                <div className="participant-info">
                  <div className="participant-role">Участник</div>
                  <div className="participant-id">{deal.participants.participant.id}</div>
                </div>
                <div className="participant-status">
                  <span className={`readiness-badge ${deal.participants.participant.ready ? 'ready' : 'not-ready'}`}>
                    {deal.participants.participant.ready ? 'Готов' : 'Не готов'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="participant-item">
                <div className="participant-info">
                  <div className="participant-role">Участник</div>
                  <div className="participant-id">Ожидается</div>
                </div>
                <div className="participant-status">
                  <span className="readiness-badge waiting">Ожидается</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Подарки */}
        <div className="deal-gifts-card">
          <h2>NFT Подарки</h2>
          <div className="gifts-grid">
            {deal.gifts.map((gift, index) => (
              <div key={index} className="gift-item">
                <img 
                  src={gift.img} 
                  alt={gift.title}
                  className="gift-image"
                />
                <div className="gift-title">{gift.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Действия */}
        <div className="deal-actions-card">
          <h2>Действия</h2>
          <div className="actions-grid">
            <button 
              onClick={copyDealLink}
              className="action-button primary"
            >
              📤 Поделиться сделкой
            </button>
            <button 
              onClick={() => navigate('/deals')}
              className="action-button secondary"
            >
              📄 Все сделки
            </button>
            
            {/* Кнопка присоединения к сделке */}
            {canJoin && (
              <button 
                onClick={handleJoinDeal}
                className="action-button success"
              >
                ✅ Присоединиться к сделке
              </button>
            )}
            
            {/* Кнопки подтверждения готовности */}
            {isInDeal && (deal.status === 'waiting_for_confirmation' || deal.status === 'in_progress') && (
              <>
                <button 
                  onClick={() => handleConfirmReadiness(true)}
                  className="action-button success"
                  disabled={isCreator ? deal.participants.creator.ready : deal.participants.participant.ready}
                >
                  ✅ Подтвердить готовность
                </button>
                <button 
                  onClick={() => handleConfirmReadiness(false)}
                  className="action-button warning"
                  disabled={isCreator ? !deal.participants.creator.ready : !deal.participants.participant.ready}
                >
                  ❌ Отменить готовность
                </button>
              </>
            )}
            
            {/* Кнопка завершения сделки */}
            {isInDeal && deal.status === 'in_progress' && (
              <button 
                onClick={handleCompleteDeal}
                className="action-button success"
              >
                🎉 Завершить сделку
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealView;
