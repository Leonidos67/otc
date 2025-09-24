import React from 'react';
import { formatDate } from '../../utils/dealUtils';
import './GiftModal.css';

const GiftModal = ({ isOpen, onClose, gift }) => {
  if (!isOpen || !gift) return null;

  // Используем переданные данные о сделке
  const dealId = gift.dealId;
  const createdAt = gift.createdAt;

  const handleCopyDealId = () => {
    navigator.clipboard.writeText(dealId).then(() => {
      alert('ID сделки скопирован в буфер обмена!');
    }).catch(() => {
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea');
      textArea.value = dealId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('ID сделки скопирован в буфер обмена!');
    });
  };


  return (
    <div className="gift-modal-overlay" onClick={onClose}>
      <div className="gift-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Заголовок модального окна */}
        <div className="gift-modal-header">
          <h2>Информация о подарке</h2>
          <button className="gift-modal-close" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Содержимое модального окна */}
        <div className="gift-modal-body">
          {/* Изображение подарка */}
          <div className="gift-image-container">
            <img 
              src={gift.icon} 
              alt={gift.title}
              className="gift-modal-image"
            />
          </div>

          {/* Название подарка */}
          <div className="gift-info-section">
            <h3 className="gift-title">{gift.title}</h3>
          </div>

          {/* ID сделки */}
          <div className="gift-info-section">
            <div className="gift-info-value-container">
              <span className="gift-info-value">#{dealId}</span>
              <button 
                className="copy-button"
                onClick={handleCopyDealId}
                title="Скопировать ID сделки"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Время создания */}
          <div className="gift-info-section">
            <label className="gift-info-label">Время создания:</label>
            <div className="gift-info-value">
              {formatDate(createdAt)}
            </div>
          </div>
        </div>

        {/* Кнопка закрытия */}
        <div className="gift-modal-footer">
          <button 
            className="gift-modal-close-btn"
            onClick={onClose}
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default GiftModal;
