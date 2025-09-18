import React from 'react';

const CreditCard = ({
  type = 'brand-light',
  company = 'Untitled.',
  cardHolder = 'OLIVIA RHYE',
  cardExpiration = '06/28',
  cardNumber = '1234 1234 1234 1234',
}) => {
  return (
    <div className={`credit-card ${type}`}>
      <div className="credit-card__company">{company}</div>
      <div className="credit-card__number">{cardNumber}</div>
      <div className="credit-card__footer">
        <div className="credit-card__holder">
          <div className="label">Card holder</div>
          <div className="value">{cardHolder}</div>
        </div>
        <div className="credit-card__expires">
          <div className="label">Expires</div>
          <div className="value">{cardExpiration}</div>
        </div>
      </div>
    </div>
  );
};

export default CreditCard;


