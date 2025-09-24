import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './PageStyles.css';
import { useTonWallet } from '@tonconnect/ui-react';
import { tonConnect } from '../utils/ton/tonConnect';

const Withdraw = () => {
  return (
    <div className="p-6 profile-page create-deal-page">
      <h1 className="profile-page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link to="/" className="back-link" aria-label="Назад">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        Вывод средств
      </h1>
      <hr className="divider" style={{ marginTop: '8px' }} />
      <WithdrawForm />
    </div>
  );
};

export default Withdraw;

const WithdrawForm = () => {
  const [method, setMethod] = useState(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const uiWallet = useTonWallet();
  const navigate = useNavigate();

  const validateRequisites = () => {
    if (method === 'На карту') {
      const card = (localStorage.getItem('payment_card_number') || '').trim();
      if (!card) {
        const go = window.confirm('Для вывода на карту необходимо привязать карту. Перейти в профиль для добавления реквизитов?');
        if (go) navigate('/profile?tab=payments');
        return false;
      }
    }
    if (method === 'TON-кошелек') {
      const walletAddr = (localStorage.getItem('wallet_address') || '').trim();
      const uiConnected = Boolean(uiWallet && uiWallet.account && uiWallet.account.address);
      const sdkConnected = Boolean(tonConnect && tonConnect.account && tonConnect.account.address);
      const wallet = Boolean(walletAddr) || uiConnected || sdkConnected;
      if (!wallet) {
        const go = window.confirm('Для вывода на TON-кошелёк необходимо подключить кошелёк. Перейти в профиль для подключения?');
        if (go) navigate('/profile?tab=payments');
        return false;
      }
    }
    return true;
  };

  const isValid = () => {
    if (!method) return false;
    const value = parseFloat(amount);
    return !Number.isNaN(value) && value > 0;
  };

  const getBalanceRub = () => {
    const raw = (localStorage.getItem('balance_rub') || '0').toString().replace(',', '.');
    const val = parseFloat(raw);
    return Number.isNaN(val) ? 0 : val;
  };

  const writeBalanceRub = (newValue) => {
    const fixed = Number(newValue).toFixed(2);
    localStorage.setItem('balance_rub', fixed);
  };

  const handleWithdraw = () => {
    setError('');
    if (!isValid()) {
      setError('Выберите метод и введите корректную сумму.');
      return;
    }
    const balance = getBalanceRub();
    const value = parseFloat((amount || '0').toString().replace(',', '.'));
    if (value > balance) {
      setError('Сумма больше, чем доступный баланс.');
      return;
    }
    if (!validateRequisites()) return;

    // Здесь будет реальная логика вывода. Пока просто уведомление.
    writeBalanceRub(Math.max(0, balance - value));
    alert(`Заявка на вывод создана:\nМетод: ${method}\nСумма: ${amount}`);
    navigate('/');
  };

  return (
    <>
      <div className="deal-content">
        <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
          <div style={{ margin: 0 }}>
            <div className="input-group" style={{ marginTop: 0 }}>
              <label>Куда вывести: <span style={{color: '#ff4d4f'}}>*</span></label>
              <select value={method || ''} onChange={(e) => setMethod(e.target.value)}>
                <option value="" disabled>Выберите метод</option>
                <option value="TON-кошелек">TON-кошелек</option>
                <option value="На карту">На карту</option>
              </select>
            </div>
            <div className="input-group" style={{ marginTop: 20 }}>
              <label>Введите сумму вывода: <span style={{color: '#ff4d4f'}}>*</span></label>
              <input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
            {error && <div className="error-text" style={{ marginTop: 8 }}>{error}</div>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button
                type="button"
                className={`arrow-btn next-button ${!isValid() ? 'disabled' : ''}`}
                onClick={handleWithdraw}
                aria-label="Вывести"
                disabled={!isValid()}
              >
                <span className="button-text">Вывести</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};



