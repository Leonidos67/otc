import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PageStyles.css';
import { 
  getDealFromUrl, 
  formatDate, 
  joinDeal, 
  confirmReadiness, 
  completeDeal,
  updateDealStatus,
  getOrCreateUserId,
  createPublicDealUrl,
  getPublicDeal,
  fetchDealFromApi,
  confirmDealOnApi
} from '../utils/dealUtils';

const PublicDealView = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!dealId) return;
      console.log('Поиск публичной сделки с ID:', dealId);
      const userId = getOrCreateUserId();
      setCurrentUserId(userId);
      
      // Сначала пробуем получить из API, затем fallback
      const apiDeal = await getPublicDeal(dealId);
      console.log('Найденная сделка:', apiDeal);

      if (apiDeal) {
        setDeal(apiDeal);
      } else {
        setError(`Сделка с ID "${dealId}" не найдена. Возможно, ссылка неверная или сделка была удалена.`);
      }
      setLoading(false);
    };
    load();
  }, [dealId]);

  // Перевод средств при смене статуса на completed (страховка, если завершение произошло не через кнопку)
  useEffect(() => {
    try {
      if (!deal || deal.status !== 'completed') return;
      const paidKey = `deal_paid_${dealId}`;
      if (localStorage.getItem(paidKey) === '1') return; // уже переведено

      const creatorId = deal.participants?.creator?.id;
      const takerId = deal.participants?.participant?.id;
      const amountNum = Number(deal.amount) || 0;

      const readUserBalance = (userId) => {
        const raw = (localStorage.getItem(`balance_rub_${userId}`) || '0').toString().replace(',', '.');
        const val = parseFloat(raw);
        return Number.isNaN(val) ? 0 : val;
      };
      const writeUserBalance = (userId, newValue) => {
        const fixed = Number(newValue).toFixed(2);
        localStorage.setItem(`balance_rub_${userId}`, fixed);
      };

      if (creatorId && takerId && amountNum > 0) {
        const creatorBalance = readUserBalance(creatorId);
        const escrowed = localStorage.getItem(`deal_escrowed_${creatorId}`) === '1';
        // Пытаемся списать у создателя только если возможно, но зачисление получателю выполняем всегда
        if (escrowed || creatorBalance >= amountNum) {
          if (!escrowed) {
            writeUserBalance(creatorId, creatorBalance - amountNum);
          }
        }
        const takerBalance = readUserBalance(takerId);
        writeUserBalance(takerId, takerBalance + amountNum);
        localStorage.setItem(paidKey, '1');
        localStorage.removeItem(`deal_escrowed_${creatorId}`);
      }
    } catch (_e) {
      // no-op
    }
  }, [deal?.status, dealId]);

  const copyDealLink = () => {
    const dealUrl = createPublicDealUrl(dealId);
    navigator.clipboard.writeText(dealUrl).then(() => {
      alert('Ссылка на сделку скопирована в буфер обмена!');
    }).catch(() => {
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea');
      textArea.value = dealUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Ссылка на сделку скопирована в буфер обмена!');
    });
  };

  const handleJoinDeal = async () => {
    try {
      const res = await fetch((process.env.REACT_APP_API_URL || '/api') + `/deals/${dealId}/take`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ takerId: currentUserId })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Не удалось присоединиться к сделке');
        return;
      }
      // Обновляем данные сделки из API
      const updated = await fetchDealFromApi(dealId);
      if (updated) setDeal(updated);
      alert('Вы успешно присоединились к сделке!');
    } catch (_e) {
      alert('Не удалось присоединиться к сделке');
    }
  };

  const handleConfirmReadiness = async (ready) => {
    if (!ready) {
      alert('Отмена готовности пока не реализована через бекенд');
      return;
    }
    const updated = await confirmDealOnApi(dealId, currentUserId);
    if (updated) {
      setDeal(updated);
      alert('Готовность подтверждена!');
      // Если оба участника готовы — выполняем однократный перевод
      try {
        const creatorReady = updated?.participants?.creator?.ready;
        const takerReady = updated?.participants?.participant?.ready;
        if (creatorReady && takerReady) {
          const paidKey = `deal_paid_${dealId}`;
          if (localStorage.getItem(paidKey) !== '1') {
            const creatorId = updated.participants?.creator?.id;
            const takerId = updated.participants?.participant?.id;
            const amountNum = Number(updated.amount) || 0;
            const readUserBalance = (userId) => {
              const raw = (localStorage.getItem(`balance_rub_${userId}`) || '0').toString().replace(',', '.');
              const val = parseFloat(raw);
              return Number.isNaN(val) ? 0 : val;
            };
            const writeUserBalance = (userId, newValue) => {
              const fixed = Number(newValue).toFixed(2);
              localStorage.setItem(`balance_rub_${userId}`, fixed);
            };
            if (creatorId && takerId && amountNum > 0) {
              const creatorBalance = readUserBalance(creatorId);
              const escrowed = localStorage.getItem(`deal_escrowed_${creatorId}`) === '1';
              if (escrowed || creatorBalance >= amountNum) {
                if (!escrowed) {
                  writeUserBalance(creatorId, creatorBalance - amountNum);
                }
              }
              const takerBalance = readUserBalance(takerId);
              writeUserBalance(takerId, (takerBalance || 0) + amountNum);
              localStorage.setItem(paidKey, '1');
              localStorage.removeItem(`deal_escrowed_${creatorId}`);
            }
          }
        }
      } catch (_e) {
        // no-op
      }
    } else {
      alert('Не удалось подтвердить готовность');
    }
  };

  const handleCompleteDeal = () => {
    if (window.confirm('Вы уверены, что хотите завершить сделку?')) {
      if (completeDeal(dealId, currentUserId)) {
        // Перевод средств между участниками после успешного завершения
        try {
          const paidKey = `deal_paid_${dealId}`;
          const alreadyPaid = localStorage.getItem(paidKey) === '1';
          const updatedDeal = getDealFromUrl(dealId);
          setDeal(updatedDeal);

          if (!alreadyPaid && updatedDeal && updatedDeal.status === 'completed') {
            const creatorId = updatedDeal.participants?.creator?.id;
            const takerId = updatedDeal.participants?.participant?.id;
            const amountNum = Number(updatedDeal.amount) || 0;

            const readUserBalance = (userId) => {
              const raw = (localStorage.getItem(`balance_rub_${userId}`) || '0').toString().replace(',', '.');
              const val = parseFloat(raw);
              return Number.isNaN(val) ? 0 : val;
            };
            const writeUserBalance = (userId, newValue) => {
              const fixed = Number(newValue).toFixed(2);
              localStorage.setItem(`balance_rub_${userId}`, fixed);
            };

            if (creatorId && takerId && amountNum > 0) {
              const creatorBalance = readUserBalance(creatorId);
              const escrowed = localStorage.getItem(`deal_escrowed_${creatorId}`) === '1';
              if (escrowed || creatorBalance >= amountNum) {
                if (!escrowed) {
                  writeUserBalance(creatorId, creatorBalance - amountNum);
                }
                const takerBalance = readUserBalance(takerId);
                writeUserBalance(takerId, takerBalance + amountNum);
                localStorage.setItem(paidKey, '1');
                localStorage.removeItem(`deal_escrowed_${creatorId}`);
              } else {
                alert('Недостаточно средств у создателя для перевода. Перевод не выполнен.');
              }
            }
          }
        } catch (_e) {
          // no-op, перевод не критичен для завершения сделки
        }
        alert('Сделка успешно завершена!');
      } else {
        alert('Не удалось завершить сделку');
      }
    }
  };
  
  const handleCompleteWithoutParticipant = () => {
    if (!deal || deal.status !== 'waiting_for_participant') return;
    if (!isCreator) {
      alert('Только создатель может завершить такую сделку.');
      return;
    }
    if (!window.confirm('Завершить сделку без участника? Это действие нельзя отменить.')) return;
    try {
      updateDealStatus(dealId, 'completed');
      const updatedDeal = { ...deal, status: 'completed', completedAt: new Date().toISOString(), completedBy: currentUserId };
      sessionStorage.setItem(`deal_${dealId}`, JSON.stringify(updatedDeal));
      setDeal(updatedDeal);
      alert('Сделка завершена.');
    } catch (_e) {
      alert('Не удалось завершить сделку.');
    }
  };
  // Кнопка выхода из сделки удалена

  // Определяем роль пользователя в сделке
  const isCreator = Boolean(deal && deal.creatorId && currentUserId && deal.creatorId === currentUserId);
  const isParticipant = Boolean(deal && deal.participants && deal.participants.participant && deal.participants.participant.id === currentUserId);
  const canJoin = deal && deal.status === 'waiting_for_participant' && !isCreator && !isParticipant;
  const isInDeal = isCreator || isParticipant;
  const bothReady = Boolean(
    deal && deal.participants?.creator?.ready && deal.participants?.participant?.ready
  );

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
        <h1 className="profile-page-title">Сделка не найдена</h1>
        <hr className="divider" style={{ marginTop: '8px' }} />
        <div className="content-box">
          <div className="empty-state">
            <h3>Сделка не найдена</h3>
            <p>{error}</p>
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={() => window.location.href = '/'}
                className="success-button"
              >
                На главную
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const paymentBadge = deal.payment && deal.payment.transferredBy
    ? (
      <span className="status-badge paid" title={`Оплачено пользователем ${deal.payment.transferredBy} на сумму ${deal.payment.amount}`}>
        💸 Деньги перевёл пользователь
      </span>
    ) : null;

  return (
    <div className="p-6 profile-page">
      <div className="profile-page-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Публичная сделка</span>
        <span className="detail-value deal-id">{deal.id}</span>
      </div>
      <hr className="divider" style={{ marginTop: '8px' }} />

      {/* Детали сделки */}
      <div className="deal-actions-card" style={{ marginBottom: '20px', marginTop: '20px' }}>
        <h2>Детали сделки</h2>
          <div className="details-grid">
            <div className="detail-item" style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '10px', padding: '16px 18px' }}>
            <span className="detail-label">Метод оплаты:</span>
            <span className="detail-value">{deal.method}</span>
          </div>
            <div className="detail-item" style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '10px', padding: '16px 18px' }}>
            <span className="detail-label">Сумма:</span>
            <span className="detail-value">{deal.amount}</span>
          </div>
            <div className="detail-item" style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '10px', padding: '16px 18px' }}>
            <span className="detail-label">Количество подарков:</span>
            <span className="detail-value">{deal.gifts.length}</span>
          </div>
            <div className="detail-item" style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '10px', padding: '16px 18px' }}>
            <span className="detail-label">ID сделки:</span>
            <span className="detail-value deal-id">{deal.id}</span>
          </div>
        </div>
      </div>

      {/* Верхний блок без фона: ID сделки, Сумма, Статус и Дата создания */}
      <div className="public-deal-top">
        <div className="top-row">
          <div className="top-left">
            <h2>Сумма</h2>
            <div className="amount-value amount-large">{deal.amount}</div>
          </div>
          <div className="top-right">
            <span className={`status-badge ${deal.status}`}>
              {deal.status === 'waiting_for_participant' ? 'Ожидает участника' :
               deal.status === 'waiting_for_confirmation' ? 'Ожидает подтверждения' :
               deal.status === 'in_progress' ? 'В процессе' :
               deal.status === 'completed' ? 'Завершена' : 
               deal.status === 'cancelled' ? 'Отменена' : deal.status}
            </span>
            <div className="deal-date">Создана: {formatDate(deal.createdAt)}</div>
          </div>
        </div>
      </div>


      {/* Секции ниже: двухколоночная сетка 2/3 слева и 1/3 справа */}
      <div className="public-deal-sections">
        <div className="col-left">
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
          {/* NFT Подарки */}
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
        </div>

        <div className="col-right">
          {/* Действия */}
          <div className="deal-actions-card">
            <h2>Действия</h2>
            {deal.status === 'waiting_for_participant' && (
              <div className="actions-hint" style={{ color: '#aaa', marginBottom: 8 }}>
                Пригласите участника в сделку, чтобы стали доступны все действия.
              </div>
            )}
            <div className="actions-grid">
              <button 
                onClick={copyDealLink}
                className="action-button primary"
              >
                📋 Скопировать ссылку
              </button>
              {canJoin && (
                <button 
                  onClick={handleJoinDeal}
                  className="action-button success"
                >
                  ✅ Присоединиться к сделке
                </button>
              )}
          {isCreator && deal.status === 'waiting_for_participant' && (
            <button 
              onClick={handleCompleteWithoutParticipant}
              className="action-button danger"
            >
              ⏹️ Завершить без участника
            </button>
          )}
              {isInDeal && (deal.status === 'waiting_for_confirmation' || deal.status === 'in_progress') && (
                <>
                  <button 
                    onClick={() => handleConfirmReadiness(true)}
                    className="action-button"
                    disabled={isCreator ? deal.participants.creator.ready : deal.participants.participant?.ready}
                  >
                    ✅ Подтвердить готовность
                  </button>
                  <button 
                    onClick={() => handleConfirmReadiness(false)}
                    className="action-button"
                    disabled={isCreator ? !deal.participants.creator.ready : !deal.participants.participant?.ready}
                  >
                    ❌ Отменить готовность
                  </button>
              {/* Кнопка выхода удалена по требованию */}
                </>
              )}
              {isInDeal && deal.status === 'in_progress' && (
                <button 
                  onClick={handleCompleteDeal}
                  className="action-button danger"
                >
                  🎉 Завершить сделку
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default PublicDealView;
