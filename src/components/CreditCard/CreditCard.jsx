import React from 'react';
import './CreditCard.css';

const CreditCard = ({
  type = 'brand-light',
  company = 'Untitled.',
  cardHolder = 'YOUR NAME',
  cardExpiration = '00/00',
  cardNumber = '',
  onAddClick,
}) => {
  const formatCardNumber = (value) => {
    const digits = String(value || '').replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const displayNumber = (cardNumber && cardNumber.trim()) ? formatCardNumber(cardNumber) : '0000 0000 0000 0000';

  return (
    <div className={`credit-card ${type}`}>
      <div className="credit-card__company">{company}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div className="credit-card__number">{displayNumber}</div>
        <button type="button" aria-label="Редактировать реквизиты" onClick={onAddClick} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 16 }}>
          ✏️
        </button>
      </div>
      <div className="credit-card__footer">
        <div className="credit-card__holder">
          <div className="label">Card holder</div>
          <div className="value">{cardHolder}</div>
        </div>
        <div className="credit-card__expires">
          <div className="label">Expires</div>
          <div className="value">{cardExpiration || '00/00'}</div>
        </div>
      </div>
    </div>
  );
};

export default CreditCard;


