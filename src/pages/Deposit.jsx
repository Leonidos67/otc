import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './PageStyles.css';
import { getOrCreateUserId } from '../utils/dealUtils';

// Берём промокод из env (CRA: REACT_APP_PROMO). Фоллбэк — захардкоженный код из запроса
const DEFAULT_PROMO = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
const PROMO_CODE = process.env.REACT_APP_PROMO || DEFAULT_PROMO;

const Deposit = () => {
  return (
    <div className="p-6 profile-page create-deal-page">
      <h1 className="profile-page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link to="/" className="back-link" aria-label="Назад">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        Пополнение
      </h1>
      <hr className="divider" style={{ marginTop: '8px' }} />

      <DepositForm />
    </div>
  );
};

export default Deposit;

const DepositForm = () => {
  const [method, setMethod] = useState('На карту');
  const [amount, setAmount] = useState('');
  const [promo, setPromo] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const currentUserId = getOrCreateUserId();

  const isValid = () => {
    const value = parseFloat((amount || '0').toString().replace(',', '.'));
    return method === 'На карту' && !Number.isNaN(value) && value > 0;
  };

  const readBalance = () => {
    const keyUser = `balance_rub_${currentUserId}`;
    const raw = (localStorage.getItem(keyUser) ?? localStorage.getItem('balance_rub') ?? '0')
      .toString()
      .replace(',', '.');
    const val = parseFloat(raw);
    return Number.isNaN(val) ? 0 : val;
  };

  const writeBalance = (newValue) => {
    const fixed = Number(newValue).toFixed(2);
    const keyUser = `balance_rub_${currentUserId}`;
    localStorage.setItem(keyUser, fixed);
  };

  const appendTransaction = (type, amountValue) => {
    try {
      const key = `transactions_${currentUserId}`;
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      const tx = {
        id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        type, // 'deposit' | 'withdraw'
        amount: Number(amountValue),
        status: type === 'deposit' ? 'Зачислено' : 'Создан',
        createdAt: new Date().toISOString()
      };
      list.unshift(tx);
      localStorage.setItem(key, JSON.stringify(list));
    } catch (_e) {
      // ignore
    }
  };

  const handleDeposit = () => {
    setError('');
    if (!isValid()) {
      setError('Укажите сумму пополнения.');
      return;
    }

    const value = parseFloat((amount || '0').toString().replace(',', '.'));
    if (PROMO_CODE && promo.trim() === PROMO_CODE) {
      const current = readBalance();
      writeBalance(current + value);
      appendTransaction('deposit', value);
      alert(`Баланс пополнен на ${value.toFixed(2)} RUB по промокоду.`);
      // Сбрасываем поля и остаёмся на странице без редиректа
      setAmount('');
      setPromo('');
      return;
    }

    // Если промокод пуст или не совпадает — тут можно инициировать реальную оплату.
    // Временно просто сообщим, что промокод неверный, без редиректа.
    alert('Неверный промокод. Попробуйте снова.');
  };

  return (
    <>
      <div className="deal-content">
        <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
          <div style={{ margin: 0 }}>
            <div className="input-group" style={{ marginTop: 0 }}>
              <label>Способ пополнения: <span style={{color: '#ff4d4f'}}>*</span></label>
              <select value={method} onChange={(e) => setMethod(e.target.value)}>
                <option value="На карту">На карту</option>
              </select>
            </div>

            <div className="input-group" style={{ marginTop: 20 }}>
              <label>Введите сумму пополнения: <span style={{color: '#ff4d4f'}}>*</span></label>
              <input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            <div className="input-group" style={{ marginTop: 12 }}>
              <label>Промокод:</label>
              <input
                type="text"
                placeholder="Введите промокод (необязательно)"
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
              />
            </div>

            {error && <div className="error-text" style={{ marginTop: 8 }}>{error}</div>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button
                type="button"
                className={`arrow-btn next-button ${!isValid() ? 'disabled' : ''}`}
                onClick={handleDeposit}
                aria-label="Пополнить"
                disabled={!isValid()}
              >
                <span className="button-text">Пополнить</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};


