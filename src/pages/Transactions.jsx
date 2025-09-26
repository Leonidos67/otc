import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './PageStyles.css';
import { getOrCreateUserId } from '../utils/dealUtils';

const Transactions = () => {
  return (
    <div className="p-6 profile-page create-deal-page">
      <h1 className="profile-page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link to="/" className="back-link" aria-label="Назад">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        История транзакций
      </h1>
      <hr className="divider" style={{ marginTop: '8px' }} />

      <TransactionsTabs />
    </div>
  );
};

export default Transactions;

const TransactionsTabs = () => {
  const [activeTab, setActiveTab] = useState('Все транзакции');
  const [version, setVersion] = useState(0);
  const menuRef = useRef(null);
  const indicatorRef = useRef(null);
  const userId = getOrCreateUserId();

  const allItems = useMemo(() => {
    try {
      const key = `transactions_${userId}`;
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      if (!Array.isArray(list)) return [];
      return list.map((tx) => ({
        id: tx.id || `tx_${Math.random().toString(36).slice(2,8)}`,
        type: tx.type === 'withdraw' ? 'withdraw' : 'deposit',
        amount: Number(tx.amount) || 0,
        status: tx.status || (tx.type === 'withdraw' ? 'Создан' : 'Зачислено'),
        refunded: Boolean(tx.refunded),
        createdAt: tx.createdAt || new Date().toISOString()
      }));
    } catch (_e) {
      return [];
    }
  }, [userId, version]);

  const items = useMemo(() => {
    switch (activeTab) {
      case 'Пополнения':
        return allItems.filter((i) => i.type === 'deposit');
      case 'Выводы':
        return allItems.filter((i) => i.type === 'withdraw');
      default:
        return allItems;
    }
  }, [activeTab, allItems, version]);

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
    return () => buttons.forEach((btn) => btn.cleanup());
  }, [activeTab]);

  const menuItems = ['Все транзакции', 'Пополнения', 'Выводы'];
  const handleCancelClick = (tx) => {
    if (tx.status === 'Отменён') return;
    openCancelModal(tx, () => setVersion((v) => v + 1));
  };


  if (!allItems.length) {
    return (
      <>
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
        <div className="deal-content" style={{ marginTop: 20 }}>
          <div className="content-box" style={{ textAlign: 'center' }}>
            <p>Пока нет транзакций.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
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
      <div className="deal-content" style={{ marginTop: 10 }}>
        <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
          <div className="content-box" style={{ margin: 0 }}>
            <div className="transactions-list">
              {items.map((tx) => (
                <div
                  key={tx.id}
                  className="transaction-row"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    margin: '10px 0',
                    borderRadius: 8,
                    background: '#111',
                    border: '1px solid #222'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontWeight: 600, color: tx.type === 'deposit' ? '#3fb950' : '#f05454' }}>
                      {tx.type === 'deposit' ? 'Пополнение' : 'Вывод'}
                    </span>
                    <span style={{ opacity: 0.7, fontSize: 12 }}>
                      {new Date(tx.createdAt).toLocaleString('ru-RU')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontWeight: 600 }}>
                        {tx.type === 'deposit' ? '+' : '-'}{tx.amount.toFixed(2)} RUB
                      </div>
                      {tx.type === 'withdraw' && tx.status !== 'Отменён' && (
                      <button
                          className="create-deal-button"
                          type="button"
                        onClick={() => handleCancelClick(tx)}
                        >
                          Отменить вывод
                        </button>
                      )}
                    </div>
                    <div style={{ width: 1, height: 24, background: '#333' }} />
                    <div>
                      <span
                        className={`status-badge ${
                          tx.status === 'Зачислено' ? 'completed' : tx.status === 'Отменён' ? 'cancelled' : 'active'
                        }`}
                      >
                        {tx.status || 'Создан'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

function openCancelModal(tx, onAfterCancel) {
  try {
    const modalId = 'cancel-withdraw-modal';
    let overlay = document.getElementById(modalId);
    if (overlay) document.body.removeChild(overlay);
    overlay = document.createElement('div');
    overlay.id = modalId;
    overlay.className = 'modal-overlay';
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <h3 class="profile-page-title" style="margin-bottom: 8px;">Отменить вывод средств?</h3>
      <p style="color:#ccc; margin: 0 0 12px 0;">Вы уверены, что хотите отменить вывод на сумму ${Number(tx.amount).toFixed(2)} RUB?</p>
      <div style="display:flex; justify-content:flex-end; gap:10px;">
        <button class="create-deal-button" id="cancel-close-btn" type="button">Закрыть</button>
        <button class="create-deal-button" id="cancel-confirm-btn" type="button">Да, отменить вывод средств</button>
      </div>
    `;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const close = () => {
      try { document.body.removeChild(overlay); } catch(_) {}
    };
    modal.querySelector('#cancel-close-btn')?.addEventListener('click', close);
    modal.querySelector('#cancel-confirm-btn')?.addEventListener('click', () => {
      try {
        const userId = getOrCreateUserId();
        const key = `transactions_${userId}`;
        const list = JSON.parse(localStorage.getItem(key) || '[]');
        const idx = list.findIndex((i) => i.id === tx.id);
        if (idx !== -1) {
          // Если уже отменён и помечен как refunded — не повторяем возврат
          const wasCancelled = list[idx].status === 'Отменён';
          const wasRefunded = Boolean(list[idx].refunded);
          if (!wasCancelled) {
            list[idx].status = 'Отменён';
          }
          if (!wasRefunded) {
            // Возвращаем средства на баланс один раз
            const balKey = `balance_rub_${userId}`;
            const raw = (localStorage.getItem(balKey) ?? localStorage.getItem('balance_rub') ?? '0').toString().replace(',', '.');
            const cur = parseFloat(raw);
            const next = (Number.isFinite(cur) ? cur : 0) + (Number(tx.amount) || 0);
            localStorage.setItem(balKey, Number(next).toFixed(2));
            list[idx].refunded = true;
          }
          localStorage.setItem(key, JSON.stringify(list));
        }
      } catch(_) {}
      close();
      // Перерисуем страницу за счет события
      try { window.dispatchEvent(new Event('storage')); } catch(_) {}
      try { onAfterCancel && onAfterCancel(); } catch(_) {}
    });
  } catch(_) {}
}


