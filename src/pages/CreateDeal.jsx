import React, { useState } from 'react';
import { tonConnect } from '../utils/ton/tonConnect';
import { Link } from 'react-router-dom';
import './PageStyles.css';
import { useTonWallet } from '@tonconnect/ui-react';
import { gifts } from "../data/gifts";

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
  const [gift, setGift] = useState(null);
  const uiWallet = useTonWallet();

  return (
    <>
      <div className="step-banner">
        <div className="step-header">
          <div className="step-title">{`Шаг #${step}`}</div>
          <div className="progress">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${(step / 4) * 100}%` }} />
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
          <GiftSelection gift={gift} onChange={(value) => setGift(value)} />
        )}

        {step === 4 && (
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
              // Проверки
              if (step === 2) {
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
              setStep((s) => Math.min(4, s + 1));
            }}
            aria-label="Дальше"
            disabled={step === 4}
          >
            Дальше
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      )}
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

const GiftSelection = ({ gift, onChange }) => {
  const [search, setSearch] = useState("");

  const filteredGifts = gifts.filter((g) =>
    g.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h3 className="profile-page-title" style={{ marginBottom: 8 }}>
        Выберите NFT подарок:
      </h3>

      {/* Поиск */}
      <input
        type="text"
        placeholder="Поиск по подаркам..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          marginBottom: 12,
          padding: "12px 14px", // 👈 выше за счёт увеличенного паддинга
          borderRadius: 8,
          border: "1px solid #333",
          background: "#000",
          fontSize: 16, // 👈 текст немного больше
          color: "#fff" // 👈 чтобы текст был читаемым на чёрном фоне
        }}
      />

      
      {/* Сетка подарков */}
      <div className="gift-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 16 }}>
        {filteredGifts.map((g) => (
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
              boxShadow: gift === g.id ? "0 0 0 2px #333 inset" : "0 0 0 1px #000 inset"
            }}
            onClick={() => onChange(g.id)}
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
            {gift === g.id && (
              <div style={{ position: "absolute", top: 8, right: 8, background: "#fff", borderRadius: "50%" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="black" viewBox="0 0 24 24">
                  <path d="M20.285 6.709l-11.285 11.291-5.285-5.291 1.414-1.414 3.871 3.877 9.871-9.877z"/>
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
