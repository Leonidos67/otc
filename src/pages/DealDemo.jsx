import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PageStyles.css';
import { createPublicDealUrl } from '../utils/dealUtils';

const DealDemo = () => {
  const navigate = useNavigate();
  const [demoDealId, setDemoDealId] = useState('');

  const createDemoDeal = () => {
    // Создаем демо-сделку
    const demoDeal = {
      method: 'TON-кошелек',
      amount: 100,
      gifts: [
        { id: 'demo1', title: 'Демо подарок 1', img: 'https://via.placeholder.com/100' },
        { id: 'demo2', title: 'Демо подарок 2', img: 'https://via.placeholder.com/100' }
      ],
      userId: 'demo_user',
      creatorId: 'demo_user',
      status: 'waiting_for_participant',
      participants: {
        creator: {
          id: 'demo_user',
          confirmed: false,
          ready: false
        },
        participant: null
      }
    };

    // Сохраняем в localStorage
    const existingDeals = JSON.parse(localStorage.getItem('deals') || '[]');
    const dealId = `deal_${Date.now().toString(36)}_demo`;
    const deal = {
      id: dealId,
      ...demoDeal,
      createdAt: new Date().toISOString(),
      publicUrl: createPublicDealUrl(dealId),
      isPublic: true
    };

    existingDeals.push(deal);
    localStorage.setItem('deals', JSON.stringify(existingDeals));
    sessionStorage.setItem(`deal_${dealId}`, JSON.stringify(deal));

    setDemoDealId(dealId);
    return dealId;
  };

  const openDemoDeal = () => {
    const dealId = createDemoDeal();
    const publicUrl = createPublicDealUrl(dealId);
    window.open(publicUrl, '_blank');
  };

  return (
    <div className="p-6 profile-page">
      <h1 className="profile-page-title">Демонстрация публичных сделок</h1>
      <hr className="divider" style={{ marginTop: '8px' }} />

      <div className="content-box">
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Как работает система публичных сделок</h2>
          <p style={{ marginBottom: '20px', color: '#ccc' }}>
            Теперь вы можете создавать сделки и делиться ими с любыми пользователями. 
            Они смогут присоединиться к сделке на любом устройстве, просто перейдя по ссылке.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px', margin: '0 auto' }}>
            <button 
              onClick={openDemoDeal}
              className="success-button"
            >
              🚀 Создать демо-сделку и открыть в новой вкладке
            </button>

            <button 
              onClick={() => navigate('/deals/create')}
              className="action-button primary"
            >
              📝 Создать реальную сделку
            </button>

            <button 
              onClick={() => navigate('/deals')}
              className="action-button secondary"
            >
              📋 Мои сделки
            </button>
          </div>

          {demoDealId && (
            <div style={{ marginTop: '20px', padding: '16px', background: '#1a1a1a', borderRadius: '8px', border: '1px solid #333' }}>
              <h3>Демо-сделка создана!</h3>
              <p>ID сделки: <code>{demoDealId}</code></p>
              <p>Публичная ссылка: <code>{createPublicDealUrl(demoDealId)}</code></p>
              <p style={{ fontSize: '14px', color: '#ccc' }}>
                Теперь вы можете скопировать эту ссылку и открыть её на другом устройстве или в другом браузере.
              </p>
            </div>
          )}

          <div style={{ marginTop: '30px', textAlign: 'left', maxWidth: '600px', margin: '30px auto 0' }}>
            <h3>Как это работает:</h3>
            <ol style={{ color: '#ccc', lineHeight: '1.6' }}>
              <li>Создайте сделку с методом оплаты, суммой и подарками</li>
              <li>Получите публичную ссылку на сделку</li>
              <li>Поделитесь ссылкой с другим пользователем</li>
              <li>Пользователь переходит по ссылке на любом устройстве</li>
              <li>Система автоматически создает для него гостевой ID</li>
              <li>Пользователь может присоединиться к сделке</li>
              <li>Оба участника подтверждают готовность</li>
              <li>Сделка выполняется</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealDemo;
