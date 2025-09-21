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
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    try {
      // В режиме разработки используем моковые данные напрямую
      if (isDevelopment) {
        // Имитируем задержку сети
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockGifts = [
          {
            id: 'site_gift_1',
            title: "Welcome Gift",
            img: "https://optim.tildacdn.one/tild3534-6437-4733-a663-653232613962/-/cover/80x80/center/center/-/format/webp/GiftsGiftsGifts_AgAD.png",
            quantity: 1,
            received_date: new Date().toISOString(),
            stars: 5,
            converted: false,
            sender: 'OTC Platform',
            message: 'Добро пожаловать на платформу!'
          },
          {
            id: 'site_gift_2',
            title: "First Deal Gift", 
            img: "https://static.tildacdn.one/tild3735-3535-4230-a535-386234383163/GiftsGiftsGifts_AgAD.png",
            quantity: 1,
            received_date: new Date(Date.now() - 86400000).toISOString(),
            stars: 10,
            converted: false,
            sender: 'OTC Platform',
            message: 'Поздравляем с первой сделкой!'
          }
        ];
        
        setGifts(mockGifts);
        console.info('Gifts API Note: Используются локальные демо-данные для разработки');
        return;
      }

      // В продакшене используем реальный API для получения подарков с сайта
      const response = await fetch(`${apiUrl}/get-site-gifts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userData: user }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Если ошибка авторизации, показываем демо-данные
          console.warn('Auth error, falling back to demo data');
          const fallbackGifts = [
            {
              id: 'site_gift_1',
              title: "Welcome Gift",
              img: "https://optim.tildacdn.one/tild3534-6437-4733-a663-653232613962/-/cover/80x80/center/center/-/format/webp/GiftsGiftsGifts_AgAD.png",
              quantity: 1,
              received_date: new Date().toISOString(),
              stars: 5,
              converted: false,
              sender: 'OTC Platform',
              message: 'Добро пожаловать на платформу!'
            },
            {
              id: 'site_gift_2',
              title: "First Deal Gift", 
              img: "https://static.tildacdn.one/tild3735-3535-4230-a535-386234383163/GiftsGiftsGifts_AgAD.png",
              quantity: 1,
              received_date: new Date(Date.now() - 86400000).toISOString(),
              stars: 10,
              converted: false,
              sender: 'OTC Platform',
              message: 'Поздравляем с первой сделкой!'
            }
          ];
          setGifts(fallbackGifts);
          console.info('Gifts API Note: Используются fallback данные из-за ошибки авторизации');
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
      
      <div className="demo-notice">
        <p>🎁 Демо-режим: отображаются тестовые подарки с платформы OTC</p>
      </div>
      
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
                    {gift.converted ? `Конвертирован в ${gift.stars} ⭐` : `Стоимость: ${gift.stars} ⭐`}
                  </p>
                )}
                {gift.message && (
                  <p className="gift-message">
                    "{gift.message}"
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
