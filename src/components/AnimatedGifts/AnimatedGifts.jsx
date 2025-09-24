import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { featuresData } from '../../data/features';
import GiftModal from '../GiftModal/GiftModal';
import './AnimatedGifts.css';

const AnimatedGifts = () => {
  const [displayedGifts, setDisplayedGifts] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [selectedGift, setSelectedGift] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [giftDealIds, setGiftDealIds] = useState({}); // Кэш ID сделок для подарков
  const navigate = useNavigate();

  // Инициализация подарков с восстановлением из localStorage
  useEffect(() => {
    const getRandomGifts = () => {
      const shuffled = [...featuresData].sort(() => 0.5 - Math.random());
      const uniqueGifts = [];
      const usedIds = new Set();
      
      for (const gift of shuffled) {
        const giftId = `${gift.title}_${gift.icon}`;
        if (!usedIds.has(giftId)) {
          uniqueGifts.push(gift);
          usedIds.add(giftId);
          if (uniqueGifts.length >= 5) break;
        }
      }
      
      return uniqueGifts;
    };
    
    // Пытаемся восстановить подарки из localStorage
    const savedGifts = localStorage.getItem('animatedGifts');
    if (savedGifts) {
      try {
        const parsedGifts = JSON.parse(savedGifts);
        if (Array.isArray(parsedGifts) && parsedGifts.length === 5) {
          setDisplayedGifts(parsedGifts);
          return; // Восстановили из localStorage
        }
      } catch (error) {
        console.log('Ошибка при восстановлении подарков из localStorage:', error);
      }
    }
    
    // Если не удалось восстановить, создаем новые
    const initialGifts = getRandomGifts();
    setDisplayedGifts(initialGifts);
    localStorage.setItem('animatedGifts', JSON.stringify(initialGifts));
  }, []);


  // Функция для получения или генерации ID сделки для подарка
  const getOrCreateDealId = (gift) => {
    const giftKey = `${gift.title}_${gift.icon}`; // Уникальный ключ для подарка
    
    if (!giftDealIds[giftKey]) {
      // Генерируем новый ID сделки и сохраняем его
      const newDealId = `deal_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
      setGiftDealIds(prev => ({
        ...prev,
        [giftKey]: newDealId
      }));
      return newDealId;
    }
    
    return giftDealIds[giftKey];
  };

  // Функция смены подарков
  const shiftGifts = () => {
    if (isAnimating) return; // Предотвращаем множественные вызовы

    setIsAnimating(true);
    
    // Используем функциональное обновление состояния для получения актуальных данных
    setDisplayedGifts(currentGifts => {
      // Получаем новый случайный подарок, исключая уже отображаемые
      const displayedGiftIds = currentGifts.map(gift => `${gift.title}_${gift.icon}`);
      const availableGifts = featuresData.filter(gift => {
        const giftId = `${gift.title}_${gift.icon}`;
        return !displayedGiftIds.includes(giftId);
      });
      
      let newGift;
      if (availableGifts.length === 0) {
        // Если все подарки уже отображаются, берем случайный из всех
        const randomIndex = Math.floor(Math.random() * featuresData.length);
        newGift = featuresData[randomIndex];
      } else {
        // Берем случайный из доступных
        const randomIndex = Math.floor(Math.random() * availableGifts.length);
        newGift = availableGifts[randomIndex];
      }
      
      // Создаем новый массив: новый подарок + первые 4 из текущих
      const newDisplayedGifts = [
        newGift, // Новый подарок на первую позицию
        ...currentGifts.slice(0, 4) // Остальные 4 сдвигаются, последний исчезает
      ];
      
      // Сохраняем новое состояние в localStorage
      localStorage.setItem('animatedGifts', JSON.stringify(newDisplayedGifts));
      
      return newDisplayedGifts;
    });
    
    setAnimationKey(prev => prev + 1); // Обновляем ключ анимации
    
    // Сбрасываем флаг анимации через время анимации
    setTimeout(() => {
      setIsAnimating(false);
    }, 500); // Время анимации
  };

  // Запускаем смену подарков с случайным интервалом
  useEffect(() => {
    let timeoutId;
    
    const scheduleNext = () => {
      // Генерируем случайное время от 1 до 10 секунд
      const randomDelay = Math.random() * 9000 + 1000; // 1000ms - 10000ms
      
      timeoutId = setTimeout(() => {
        if (!isAnimating) {
          shiftGifts();
          scheduleNext(); // Планируем следующую смену
        }
      }, randomDelay);
    };

    // Запускаем первую смену через случайное время
    scheduleNext();
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isAnimating]);

  const handleCreateDeal = () => {
    navigate('/deals/create');
  };

  const handleGiftClick = (gift) => {
    const dealId = getOrCreateDealId(gift);
    setSelectedGift({
      ...gift,
      dealId: dealId,
      createdAt: new Date().toISOString()
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGift(null);
  };

  return (
    <div className="home-features">
      {/* Кнопка "Создать сделку" - всегда первая */}
      <div 
        className="feature-item create-deal-item"
        onClick={handleCreateDeal}
      >
        <div className="feature-icon">
          <div className="plus-icon">
            <span className="plus-symbol">+</span>
            <span className="plus-text">
              <span className="desktop-text">Создать сделку</span>
              <span className="mobile-text">Создать</span>
            </span>
          </div>
        </div>
      </div>

      {/* Анимированные подарки */}
      {displayedGifts.map((feature, index) => (
        <div 
          key={`${feature.title}-${index}-${animationKey}`} // Уникальный ключ для анимации
          className={`feature-item ${feature.desktopOnly ? 'desktop-only' : ''} ${
            index === 0 ? 'new-gift' : ''
          } gift-clickable`}
          onClick={() => handleGiftClick(feature)}
        >
          <div className="feature-icon">
            <img src={feature.icon} alt={feature.title} />
          </div>
          <div className="feature-content">
            <h3>{feature.title}</h3>
          </div>
        </div>
      ))}

      {/* Модальное окно для подарка */}
      <GiftModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        gift={selectedGift}
      />
    </div>
  );
};

export default AnimatedGifts;
