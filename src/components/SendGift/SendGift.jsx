import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './SendGift.css';

const SendGift = ({ onGiftSent, onClose }) => {
  const { user, apiUrl } = useAuth();
  const [selectedGift, setSelectedGift] = useState(null);
  const [receiverId, setReceiverId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Доступные подарки для отправки
  const availableGifts = [
    {
      id: 'gift_1',
      title: 'Heart Locket',
      img: 'https://optim.tildacdn.one/tild3534-6437-4733-a663-653232613962/-/cover/80x80/center/center/-/format/webp/GiftsGiftsGifts_AgAD.png',
      stars: 10,
      description: 'Символ любви и дружбы'
    },
    {
      id: 'gift_2',
      title: 'Plush Pepe',
      img: 'https://static.tildacdn.one/tild3735-3535-4230-a535-386234383163/GiftsGiftsGifts_AgAD.png',
      stars: 15,
      description: 'Мягкий и милый пепе'
    },
    {
      id: 'gift_3',
      title: 'Diamond Ring',
      img: 'https://static.tildacdn.one/tild3864-3763-4234-b964-373932633839/GiftsGiftsGifts_AgAD.png',
      stars: 50,
      description: 'Роскошное кольцо с бриллиантом'
    },
    {
      id: 'gift_4',
      title: 'Magic Potion',
      img: 'https://static.tildacdn.one/tild3639-6433-4963-b863-616462666138/GiftsGiftsGifts_AgAD.png',
      stars: 25,
      description: 'Волшебное зелье удачи'
    }
  ];

  const handleSendGift = async () => {
    if (!selectedGift || !receiverId.trim()) {
      setError('Выберите подарок и введите ID получателя');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      if (isDevelopment) {
        // В режиме разработки имитируем отправку
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Gift sent in development mode:', {
          gift: selectedGift,
          receiverId,
          message
        });
        
        if (onGiftSent) {
          onGiftSent({
            gift: selectedGift,
            receiverId,
            message,
            success: true
          });
        }
        
        if (onClose) {
          onClose();
        }
        return;
      }

      // В продакшене используем реальный API
      const response = await fetch(`${apiUrl}/send-gift`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userData: user,
          receiverId: receiverId.trim(),
          giftId: selectedGift.id,
          message: message.trim()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        if (onGiftSent) {
          onGiftSent({
            gift: selectedGift,
            receiverId,
            message,
            success: true,
            apiResult: result
          });
        }
        
        if (onClose) {
          onClose();
        }
      } else {
        setError(result.error || 'Ошибка отправки подарка');
      }
    } catch (err) {
      console.error('Error sending gift:', err);
      setError('Не удалось отправить подарок');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="send-gift-modal">
      <div className="send-gift-content">
        <div className="send-gift-header">
          <h3>Отправить подарок</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="send-gift-body">
          <div className="gift-selection">
            <h4>Выберите подарок:</h4>
            <div className="gifts-grid">
              {availableGifts.map((gift) => (
                <div
                  key={gift.id}
                  className={`gift-option ${selectedGift?.id === gift.id ? 'selected' : ''}`}
                  onClick={() => setSelectedGift(gift)}
                >
                  <img src={gift.img} alt={gift.title} />
                  <div className="gift-option-info">
                    <h5>{gift.title}</h5>
                    <p className="gift-stars">{gift.stars} ⭐</p>
                    <p className="gift-description">{gift.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="receiver-input">
            <label htmlFor="receiverId">ID получателя:</label>
            <input
              id="receiverId"
              type="text"
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
              placeholder="Введите Telegram ID пользователя"
            />
          </div>

          <div className="message-input">
            <label htmlFor="message">Сообщение (необязательно):</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Добавьте сообщение к подарку..."
              rows={3}
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="send-gift-actions">
            <button
              className="send-button"
              onClick={handleSendGift}
              disabled={loading || !selectedGift || !receiverId.trim()}
            >
              {loading ? 'Отправка...' : 'Отправить подарок'}
            </button>
            <button className="cancel-button" onClick={onClose}>
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendGift;
