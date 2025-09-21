import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './UserGifts.css';

const UserGifts = () => {
  const { user, apiUrl } = useAuth();
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserGifts = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${apiUrl}/get-user-gifts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userData: user }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setGifts(result.gifts || []);
      } else {
        setError(result.error || 'Ошибка загрузки подарков');
      }
    } catch (err) {
      console.error('Error fetching user gifts:', err);
      setError('Не удалось загрузить подарки');
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
        <button onClick={fetchUserGifts} className="refresh-button" title="Обновить">
          ↻
        </button>
      </div>
      
      {gifts.length === 0 ? (
        <div className="no-gifts">
          <p>У вас пока нет подарков</p>
        </div>
      ) : (
        <div className="gifts-grid">
          {gifts.map((gift) => (
            <div key={gift.id} className="gift-item">
              <div className="gift-image">
                <img src={gift.img} alt={gift.title} />
                {gift.quantity > 1 && (
                  <div className="gift-quantity">{gift.quantity}</div>
                )}
              </div>
              <div className="gift-info">
                <h4 className="gift-title">{gift.title}</h4>
                <p className="gift-date">
                  Получен: {formatDate(gift.received_date)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserGifts;
