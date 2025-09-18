import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './PageStyles.css';

const CreateDeal = () => {
  return (
    <div className="p-6 profile-page">
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
const DealSteps = () => {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState(null);

  return (
    <>
      <div className="step-banner">
        <div className="step-header">
          <div className="step-title">{`Шаг #${step}`}</div>
          <div className="progress">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${(step / 3) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
        {step === 1 && (
          <MethodSelection
            method={method}
            onChange={(value) => { setMethod(value); setStep(2); }}
          />
        )}

        {step === 2 && (
          <div style={{ margin: 0 }}>
            <h3 className="profile-page-title" style={{ marginBottom: 8 }}>Способ оплаты</h3>
            <div className="input-group">
              <label>Введите сумму сделки:</label>
              <input type="number" placeholder="0" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ margin: 0 }}>
            <h3 className="profile-page-title" style={{ marginBottom: 8 }}>Условия</h3>
            <div className="input-group">
              <label>Мин. сумма</label>
              <input type="number" placeholder="0" />
            </div>
            <div className="input-group">
              <label>Макс. сумма</label>
              <input type="number" placeholder="0" />
            </div>
            <div className="input-group">
              <label>Время оплаты</label>
              <input type="number" placeholder="15 мин" />
            </div>
          </div>
        )}
      </div>

      {step > 1 && (
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            className="arrow-btn"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            aria-label="Назад"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Назад
          </button>

          <button
            type="button"
            className="arrow-btn"
            onClick={() => {
              // Валидация: если метод не настроен
              if (step === 2) {
                const card = localStorage.getItem('payment_card_number') || '';
                const wallet = localStorage.getItem('wallet_connected') === 'true';
                if (method === 'На карту' && !card.trim()) {
                  const go = window.confirm('Для приёма на карту необходимо привязать карту. Перейти в профиль для добавления реквизитов?');
                  if (go) window.location.href = '/profile?tab=payments';
                  return;
                }
                if (method === 'TON-Кошелек' && !wallet) {
                  const go = window.confirm('Для приёма на TON-кошелёк необходимо подключить кошелёк. Перейти в профиль для подключения?');
                  if (go) window.location.href = '/profile?tab=payments';
                  return;
                }
              }
              setStep((s) => Math.min(3, s + 1));
            }}
            aria-label="Дальше"
            disabled={step === 3}
          >
            Дальше
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      )}

      {/* Навигационные кнопки убраны по требованию */}
    </>
  );
};

const MethodSelection = ({ method, onChange }) => {
  const [error, setError] = useState("");
  const options = [
    { key: 'TON-Кошелек', label: 'TON-Кошелек' },
    { key: 'На карту', label: 'На карту' },
    { key: 'Звезды', label: 'Звезды' },
  ];

  return (
    <div style={{ margin: 0 }}>
      <h3 className="profile-page-title" style={{ marginBottom: 8 }}>Метод получения оплаты:</h3>
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
                  setError('Для приёма на карту необходимо привязать карту в профиле.');
                  return;
                }
              }
              if (opt.key === 'TON-Кошелек') {
                const wallet = localStorage.getItem('wallet_connected') === 'true';
                if (!wallet) {
                  // Открыть TonConnect UI через кнопку на странице профиля невозможно отсюда,
                  // поэтому просто перенаправим пользователя в профиль.
                  setError('Подключите TON-кошелёк в профиле через кнопку Connect Wallet.');
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


