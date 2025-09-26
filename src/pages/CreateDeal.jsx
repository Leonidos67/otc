import React, { useState } from 'react';
import { tonConnect } from '../utils/ton/tonConnect';
import { Link, useNavigate } from 'react-router-dom';
import './PageStyles.css';
import { useTonWallet } from '@tonconnect/ui-react';
import { gifts as giftsCatalog } from "../data/gifts";
import { createPublicDealUrl } from '../utils/dealUtils';

const CreateDeal = () => {
  return (
    <div className="p-6 profile-page create-deal-page">
      <h1 className="profile-page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link to="/deals" className="back-link" aria-label="Назад к сделкам">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        Создание новой сделки
      </h1>
      <hr className="divider" style={{ marginTop: '8px' }} />

      <DealSteps />
    </div>
  );
};

export default CreateDeal;

// Основные шаги с навигацией
// В файле CreateDeal.jsx замените компонент DealSteps на этот код:

const DealSteps = () => {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState(null);
  const [gifts, setGifts] = useState([]); // Массив выбранных подарков (IDs)
  const [amount, setAmount] = useState(''); // Сумма сделки
  const [amountError, setAmountError] = useState('');
  const [terms, setTerms] = useState(''); // Условия сделки (необязательно)
  const [createdDealId, setCreatedDealId] = useState(null); // ID созданной сделки
  const uiWallet = useTonWallet();
  const navigate = useNavigate();

  const getCreatorId = () => (localStorage.getItem('user_id') || 'anonymous');
  const readUserBalance = (userId) => {
    const keyUser = `balance_rub_${userId}`;
    const rawUser = (localStorage.getItem(keyUser) ?? localStorage.getItem('balance_rub') ?? '0').toString().replace(',', '.');
    const val = parseFloat(rawUser);
    return Number.isNaN(val) ? 0 : val;
  };

  // Функция валидации для каждого шага
  const isStepValid = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        {
          const value = parseFloat((amount || '0').toString().replace(',', '.'));
          const balance = readUserBalance(getCreatorId());
          return method !== null && amount.trim() !== '' && value > 0 && value <= balance;
        }
      case 2:
        return gifts.length > 0;
      case 3:
        return true; // Шаг 3 - финальный экран успеха, всегда валиден
      default:
        return false;
    }
  };

  // Функция создания сделки
  const createDeal = async () => {
    const creator = localStorage.getItem('user_id') || 'anonymous';
    // Эскроу: сразу блокируем сумму на балансе создателя
    try {
      const keyUser = `balance_rub_${creator}`;
      const rawUser = (localStorage.getItem(keyUser) ?? localStorage.getItem('balance_rub') ?? '0').toString().replace(',', '.');
      const currentBalance = parseFloat(rawUser);
      const dealAmount = parseFloat(amount);
      if (!Number.isFinite(dealAmount) || dealAmount <= 0) throw new Error('invalid amount');
      if (Number.isFinite(currentBalance) && currentBalance >= dealAmount) {
        const newBalance = (currentBalance - dealAmount).toFixed(2);
        localStorage.setItem(keyUser, newBalance);
        localStorage.setItem(`deal_escrow_${creator}_${Date.now()}`, String(dealAmount)); // отметка для дебага
        localStorage.setItem(`deal_escrowed_${creator}`, '1');
      } else {
        alert('Недостаточно средств для блокировки суммы на балансе.');
        return null;
      }
    } catch (_e) {
      alert('Не удалось зарезервировать средства для сделки.');
      return null;
    }
    const payload = {
      creatorId: creator,
      asset: method,
      amount: parseFloat(amount),
      terms: terms || '',
      gifts: gifts.map(giftId => {
        const gift = giftsCatalog.find(g => g.id === giftId) || null;
        return gift ? { id: gift.id, title: gift.title, img: gift.img } : null;
      }).filter(Boolean)
    };

    try {
      const res = await fetch((process.env.REACT_APP_API_URL || '/api') + '/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        throw new Error('API error ' + res.status);
      }
      const data = await res.json(); // { id, creatorId, ... }
      setCreatedDealId(data.id);
      return data.id;
    } catch (e) {
      console.error('Не удалось создать сделку через API, ошибка:', e);
      alert('Не удалось создать сделку. Попробуйте ещё раз.');
      return null;
    }
  };

  return (
    <>
      <div className="deal-content">
        <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
          {step === 1 && (
            <div style={{ margin: 0 }}>
              <MethodSelection
                method={method}
                onChange={(value) => setMethod(value)}
              />
              <div className="input-group" style={{ marginTop: 20 }}>
                <label>Введите сумму сделки: <span style={{color: '#ff4d4f'}}>*</span></label>
                <input 
                  type="number" 
                  placeholder="0" 
                  value={amount}
              onChange={(e) => {
                const val = e.target.value;
                setAmount(val);
                const num = parseFloat((val || '0').toString().replace(',', '.'));
                const balance = readUserBalance(getCreatorId());
                if (!Number.isNaN(num) && num > balance) {
                  setAmountError('Сумма превышает доступный баланс.');
                } else {
                  setAmountError('');
                }
              }}
                  min="0"
                  step="0.01"
                />
            {amountError && <div className="error-text" style={{ marginTop: 6 }}>{amountError}</div>}
              </div>
              <div className="input-group" style={{ marginTop: 12 }}>
                <label>Условия сделки <span style={{ color: '#777' }}>(необязательно)</span></label>
                <input
                  placeholder="Опишите условия сделки"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  rows={4}
                  style={{ resize: 'vertical' }}
                />
                <div style={{ marginTop: 6, fontSize: 12, color: '#888' }}>
                  Если оставить пустым, на странице сделки покажем: «Условия не прописаны, продолжая, вы соглашаетесь с <a href="/policy" style={{ color: 'inherit', textDecoration: 'underline' }}>Политикой конфиденциальности</a>.»
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <GiftSelection selectedGifts={gifts} onChange={(value) => setGifts(value)} />
          )}

          {step === 3 && (
            <div style={{ margin: 0, padding: '20px 0 0 0' }}>
              <div className="success-blocks-container">

                {/* Первый блок - Успех (во всю ширину) */}
                <div className="success-block">
                  <div className="success-icon green">
                    ✓
                  </div>
                  <h3 className="success-title">
                    Сделка успешно создана!
                  </h3>
                </div>

                {/* Второй ряд - два блока в ряд */}
                <div className="success-blocks-row">
                  {/* Второй блок - Детали сделки */}
                  <div className="success-block">
                    <div>
                      <div className="success-icon blue">
                        📋
                      </div>
                      <h3 className="success-title">
                        Детали сделки
                      </h3>
                    </div>
                    <div className="details-container">
                      <div className="details-item">
                        <span className="details-label">Метод оплаты:</span>
                        <span className="details-value">{method}</span>
                      </div>
                      <div className="details-item">
                        <span className="details-label">Сумма:</span>
                        <span className="details-value">{amount}</span>
                      </div>
                      <div className="details-item">
                        <span className="details-label">Подарков:</span>
                        <span className="details-value">{gifts.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Третий блок - Страница сделки */}
                  <div className="success-block">
                    <div>
                      <div className="success-icon purple">
                        🔗
                      </div>
                      <h3 className="success-title">
                        Страница сделки
                      </h3>
                    </div>
                    <p className="success-description">
                      Перейдите к списку всех сделок, чтобы управлять своими предложениями и просматривать активные обмены.
                    </p>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <button
                        onClick={() => {
                          if (createdDealId) {
                            const dealUrl = createPublicDealUrl(createdDealId);
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
                          } else {
                            window.location.href = '/deals';
                          }
                        }}
                        className="success-button"
                      >
                        {createdDealId ? '📤 Поделиться сделкой' : 'Перейти к сделкам'}
                      </button>
                      <button
                        onClick={() => {
                          if (createdDealId) {
                            window.location.href = `/deal/${createdDealId}`;
                          } else {
                            window.location.href = '/deals';
                          }
                        }}
                        className="success-button"
                      >
                        {createdDealId ? '🔎 Открыть сделку' : 'Перейти к сделкам'}
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>

      {/* Фиксированная панель навигации внизу */}
      <div className="deal-navigation">
        {/* Кнопка назад слева */}
        {step < 3 && (
          <button
            type="button"
            className={`arrow-btn back-button ${step === 1 ? 'disabled' : ''}`}
            onClick={step > 1 ? () => setStep((s) => Math.max(1, s - 1)) : undefined}
            aria-label="Назад"
            disabled={step === 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span className="button-text">Назад</span>
          </button>
        )}

        {/* Прогресс по центру */}
        <div className="step-info">
          {step < 3 && (
            <div className="step-title">{`Шаг #${step}/3`}</div>
          )}
          <div className="progress">
            <div className="progress-track">
              <div className="progress-fill" style={{ 
                width: `${(step / 3) * 100}%`,
                background: step === 3 ? '#4ade80' : '#ffffff',
                transition: step === 3 ? 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.8s ease-in-out' : 'width 0.8s ease-in-out, background-color 0.5s ease-in-out',
                transform: step === 3 ? 'scaleY(1.2)' : 'scaleY(1)',
                transformOrigin: 'center'
              }} />
            </div>
          </div>
        </div>
        
        {/* Кнопка дальше справа */}
        {step < 3 && (
          <div className="navigation-buttons">
            <button
              type="button"
              className={`arrow-btn next-button ${!isStepValid(step) ? 'disabled' : ''}`}
              onClick={async () => {
                // Проверяем валидность текущего шага
                if (!isStepValid(step)) {
                  return;
                }
                
                // Дополнительные проверки для шага 1
                if (step === 1) {
                  // Проверка баланса против суммы сделки
                  const num = parseFloat((amount || '0').toString().replace(',', '.'));
                  const balance = readUserBalance(getCreatorId());
                  if (Number.isFinite(num) && num > balance) {
                    setAmountError('Сумма превышает доступный баланс.');
                    return;
                  }
                  const card = localStorage.getItem('payment_card_number') || '';
                  const walletAddr = (localStorage.getItem('wallet_address') || '').trim();
                  const uiConnected = Boolean(uiWallet && uiWallet.account && uiWallet.account.address);
                  const sdkConnected = Boolean(tonConnect && tonConnect.account && tonConnect.account.address);
                  const wallet = Boolean(walletAddr) || uiConnected || sdkConnected;
                  if (method === 'На карту' && !card.trim()) {
                    const go = window.confirm('Для приёма на карту необходимо привязать карту. Перейти в профиль для добавления реквизитов?');
                    if (go) window.location.href = '/profile?tab=payments';
                    return;
                  }
                  if (method === 'TON-кошелек' && !wallet) {
                    const go = window.confirm('Для приёма на TON-кошелёк необходимо подключить кошелёк. Перейти в профиль для подключения?');
                    if (go) window.location.href = '/profile?tab=payments';
                    return;
                  }
                }
                
                // Если переходим к шагу 3, создаем сделку через API
                if (step === 2) {
                  const newId = await createDeal();
                  if (!newId) return; // останемся на шаге 2 при ошибке
                }
                
                setStep((s) => Math.min(3, s + 1));
              }}
              aria-label="Дальше"
              disabled={!isStepValid(step)}
            >
              <span className="button-text">Дальше</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </>
  );
};

const MethodSelection = ({ method, onChange }) => {
  const [error, setError] = useState("");
  const uiWallet = useTonWallet();
  const options = [
    { key: 'TON-кошелек', label: 'TON-кошелек' },
    { key: 'На карту', label: 'На карту' },
    { key: 'Звезды', label: 'Звезды' },
  ];

  return (
    <div style={{ margin: 0 }}>
      <h3 className="profile-page-title" style={{ marginBottom: 8 }}>Метод получения оплаты: <span style={{color: '#ff4d4f'}}>*</span></h3>
      <div className="method-cards">
        {options.map((opt) => (
          <button
            key={opt.key}
            type="button"
            className={`method-card ${method === opt.key ? 'selected' : ''}`}
            onClick={() => {
              if (opt.key === 'На карту') {
                const card = localStorage.getItem('payment_card_number') || '';
                if (!card.trim()) {
                  setError(
                    <>
                      Для приёма на карту необходимо <a href="/profile?tab=payments" style={{ color: 'inherit', textDecoration: 'underline' }}>привязать карту</a> в профиле.
                    </>
                  );
                  return;
                }
              }
              if (opt.key === 'TON-кошелек') {
                const walletAddr = (localStorage.getItem('wallet_address') || '').trim();
                const uiConnected = Boolean(uiWallet && uiWallet.account && uiWallet.account.address);
                const sdkConnected = Boolean(tonConnect && tonConnect.account && tonConnect.account.address);
                const wallet = Boolean(walletAddr) || uiConnected || sdkConnected;
                if (!wallet) {
                  setError(
                    <>
                      <a href="/profile?tab=payments" style={{ color: 'inherit', textDecoration: 'underline' }}>Подключите</a>
                      {" "}TON-кошелёк в профиле через кнопку Connect Wallet.
                    </>
                  );
                  return;
                }
              }
              setError('');
              onChange(opt.key);
            }}
          >
            <span className="method-title">{opt.label}</span>
          </button>
        ))}
      </div>
      {error && <div className="error-text" style={{ marginTop: 8 }}>{error}</div>}
    </div>
  );
};

const GiftSelection = ({ selectedGifts, onChange }) => {
  const [search, setSearch] = useState("");

  const filteredGifts = giftsCatalog.filter((g) =>
    g.title.toLowerCase().includes(search.toLowerCase())
  );

  const toggleGift = (giftId) => {
    const isSelected = selectedGifts.includes(giftId);
    if (isSelected) {
      // Убираем подарок из выбранных
      onChange(selectedGifts.filter(id => id !== giftId));
    } else {
      // Добавляем подарок к выбранным
      onChange([...selectedGifts, giftId]);
    }
  };

  return (
    <div>
      {/* Мобильная версия - выбранные подарки сверху */}
      <div className="mobile-selected-gifts">
        <h3 className="profile-page-title" style={{ marginBottom: 12 }}>
          Выбранные подарки ({selectedGifts.length}): <span style={{color: '#ff4d4f'}}>*</span>
        </h3>
        <div className="mobile-selected-gifts-list">
          {selectedGifts.length > 0 ? (
            selectedGifts.map((giftId) => {
              const gift = giftsCatalog.find(g => g.id === giftId);
              if (!gift) return null;
              
              return (
                <div key={giftId} className="mobile-selected-gift-item">
                  <img
                    src={gift.img}
                    alt={gift.title}
                    className="mobile-selected-gift-image"
                  />
                  <div className="mobile-selected-gift-info">
                    <div className="mobile-selected-gift-title">{gift.title}</div>
                  </div>
                  <button
                    className="mobile-remove-gift-btn"
                    onClick={() => toggleGift(giftId)}
                    aria-label="Удалить подарок"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  </button>
                </div>
              );
            })
          ) : (
            <div className="mobile-empty-selection">
              <div style={{ color: "#666", textAlign: "center", padding: "20px" }}>
                Выберите хотя бы один подарок
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Поиск - на всю ширину */}
      <input
        type="text"
        placeholder="Поиск по подаркам..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          marginBottom: 15,
          marginTop: 15,
          padding: "12px 14px",
          borderRadius: 8,
          border: "1px solid #333",
          background: "#000",
          fontSize: 16,
          color: "#fff"
        }}
      />

      <div className="gift-selection-container" style={{ display: "flex", gap: "20px", alignItems: "stretch" }}>
        {/* Левая панель - все подарки */}
        <div className="all-gifts-panel" style={{ flex: 1 }}>
          <h3 className="profile-page-title" style={{ marginBottom: 12 }}>
            Выберите NFT подарки:
          </h3>

          {/* Сетка подарков */}
          <div className="gift-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 16, height: "calc(100% - 40px)", overflowY: "auto" }}>
            {filteredGifts.map((g) => {
              const isSelected = selectedGifts.includes(g.id);
              return (
                <div
                  key={g.id}
                  className="gift-card"
                  style={{
                    position: "relative",
                    background: "#000",
                    borderRadius: 12,
                    padding: 12,
                    textAlign: "center",
                    cursor: "pointer",
                    boxShadow: isSelected ? "0 0 0 2px #333 inset" : "0 0 0 1px #000 inset"
                  }}
                  onClick={() => toggleGift(g.id)}
                >
                  {/* Картинка */}
                  <img
                    src={g.img}
                    alt={g.title}
                    style={{ width: 80, height: 80, borderRadius: 8, marginBottom: 8 }}
                  />
                  {/* Название */}
                  <div>{g.title}</div>

                  {/* Галочка при выборе */}
                  {isSelected && (
                    <div className="gift-checkbox">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" viewBox="0 0 24 24">
                        <path d="M20.285 6.709l-11.285 11.291-5.285-5.291 1.414-1.414 3.871 3.877 9.871-9.877z"/>
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Правая панель - выбранные подарки (только для десктопа) */}
        <div className="desktop-selected-gifts-panel" style={{ minWidth: "300px", maxWidth: "350px", height: "100%" }}>
          <h3 className="profile-page-title" style={{ marginBottom: 12 }}>
            Выбранные подарки ({selectedGifts.length}): <span style={{color: '#ff4d4f'}}>*</span>
          </h3>
          <div className="selected-gifts-list" style={{ height: "calc(100% - 40px)" }}>
            {selectedGifts.length > 0 ? (
              selectedGifts.map((giftId) => {
                const gift = giftsCatalog.find(g => g.id === giftId);
                if (!gift) return null;
                
                return (
                  <div key={giftId} className="selected-gift-item">
                    <img
                      src={gift.img}
                      alt={gift.title}
                      className="selected-gift-image"
                    />
                    <div className="selected-gift-info">
                      <div className="selected-gift-title">{gift.title}</div>
                    </div>
                    <button
                      className="remove-gift-btn"
                      onClick={() => toggleGift(giftId)}
                      aria-label="Удалить подарок"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="empty-selection">
                <div style={{ color: "#666", textAlign: "center", padding: "20px" }}>
                  Выберите хотя бы один подарок
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
