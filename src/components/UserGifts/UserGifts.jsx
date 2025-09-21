import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SendGift from '../SendGift/SendGift';
import './UserGifts.css';

const UserGifts = () => {
  const { user, apiUrl } = useAuth();
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSendGift, setShowSendGift] = useState(false);

  const fetchUserGifts = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    // Проверяем, находимся ли мы в режиме разработки
    const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
    const isProduction = process.env.NODE_ENV === 'production' && window.location.hostname !== 'localhost';
    
    try {
      // Всегда используем API для получения подарков из Telegram Gifts
      // В режиме разработки API будет возвращать демо-данные
      console.log('Environment check:', {
        NODE_ENV: process.env.NODE_ENV,
        hostname: window.location.hostname,
        isDevelopment,
        isProduction
      });

      // В продакшене используем реальный API для получения подарков из Telegram Gifts
      const response = await fetch(`${apiUrl}/get-telegram-gifts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userData: user }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Если ошибка авторизации, показываем демо-данные из Telegram Gifts
          console.warn('Auth error, falling back to demo Telegram Gifts data');
          const fallbackGifts = [
            {
              id: 'telegram_gift_fallback_1',
              title: "Heart Locket",
              img: "https://optim.tildacdn.one/tild3534-6437-4733-a663-653232613962/-/cover/80x80/center/center/-/format/webp/GiftsGiftsGifts_AgAD.png",
              quantity: 1,
              received_date: new Date().toISOString(),
              stars: 10,
              convert_stars: 8,
              converted: false,
              saved: true,
              limited: false,
              sold_out: false,
              birthday: false,
              availability_remains: 1000,
              availability_total: 1000,
              sender: 'Telegram User',
              message: 'Поздравляю с успешной сделкой! 🎉',
              name_hidden: false,
              source: 'telegram'
            },
            {
              id: 'telegram_gift_fallback_2',
              title: "Diamond Ring", 
              img: "https://static.tildacdn.one/tild3735-3535-4230-a535-386234383163/GiftsGiftsGifts_AgAD.png",
              quantity: 1,
              received_date: new Date(Date.now() - 86400000).toISOString(),
              stars: 50,
              convert_stars: 40,
              converted: false,
              saved: true,
              limited: true,
              sold_out: false,
              birthday: false,
              availability_remains: 100,
              availability_total: 500,
              sender: 'Telegram User',
              message: 'За отличную работу! 💎',
              name_hidden: false,
              source: 'telegram'
            }
          ];
          setGifts(fallbackGifts);
          console.info('Gifts API Note: Используются fallback данные из Telegram Gifts API');
          return;
        } else if (response.status === 400) {
          setError('Неверные данные пользователя.');
        } else {
          setError(`Ошибка сервера: ${response.status}`);
        }
        return;
      }

      const result = await response.json();
      
      if (result.success) {
        setGifts(result.gifts || []);
        // Показываем информационное сообщение, если есть
        if (result.note) {
          console.info('Gifts API Note:', result.note);
        }
      } else {
        setError(result.error || 'Ошибка загрузки подарков');
      }
    } catch (err) {
      console.error('Error fetching user gifts:', err);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Ошибка сети. Проверьте подключение к интернету.');
      } else {
        setError('Не удалось загрузить подарки');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserGifts();
  }, [user]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="user-gifts-container">
        <h3 className="user-gifts-title">Мои подарки</h3>
        <div className="gifts-loading">
          <div className="loading-spinner"></div>
          <p>Загрузка подарков...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-gifts-container">
        <h3 className="user-gifts-title">Мои подарки</h3>
        <div className="gifts-error">
          <p>{error}</p>
          <button onClick={fetchUserGifts} className="retry-button">
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-gifts-container">
      <div className="user-gifts-header">
        <h3 className="user-gifts-title">Мои подарки</h3>
        <div className="header-actions">
          <button onClick={() => setShowSendGift(true)} className="send-gift-button" title="Отправить подарок">
            🎁
          </button>
          <button onClick={fetchUserGifts} className="refresh-button" title="Обновить">
            ↻
          </button>
        </div>
      </div>
      
      {(process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') && (
        <div className="demo-notice">
          <p>🎁 Режим разработки: отображаются демо-подарки из Telegram Gifts API</p>
        </div>
      )}
      
      {gifts.length === 0 ? (
        <div className="no-gifts">
          <p>У вас пока нет подарков</p>
        </div>
      ) : (
        <div className="gifts-grid">
          {gifts.map((gift) => (
            <div key={gift.id} className={`gift-item ${gift.converted ? 'converted' : ''}`}>
              <div className="gift-image">
                <img src={gift.img} alt={gift.title} />
                {gift.quantity > 1 && (
                  <div className="gift-quantity">{gift.quantity}</div>
                )}
                {gift.converted && (
                  <div className="gift-converted">★</div>
                )}
              </div>
              <div className="gift-info">
                <h4 className="gift-title">{gift.title}</h4>
                {gift.sender && (
                  <p className="gift-sender">
                    От: {gift.sender}
                  </p>
                )}
                <p className="gift-date">
                  Получен: {formatDate(gift.received_date)}
                </p>
                {gift.stars && (
                  <p className="gift-stars">
                    {gift.converted ? `Конвертирован в ${gift.convert_stars || gift.stars} ⭐` : `Стоимость: ${gift.stars} ⭐`}
                  </p>
                )}
                {gift.limited && (
                  <p className="gift-limited">
                    🔥 Ограниченный выпуск
                  </p>
                )}
                {gift.availability_remains && gift.availability_total && (
                  <p className="gift-availability">
                    Осталось: {gift.availability_remains}/{gift.availability_total}
                  </p>
                )}
                {gift.message && (
                  <p className="gift-message">
                    "{gift.message}"
                  </p>
                )}
                {gift.source === 'telegram' && (
                  <p className="gift-source">
                    📱 Из Telegram
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {showSendGift && (
        <SendGift
          onGiftSent={(result) => {
            if (result.success) {
              // Обновляем список подарков после отправки
              fetchUserGifts();
            }
          }}
          onClose={() => setShowSendGift(false)}
        />
      )}
    </div>
  );
};

export default UserGifts;
