import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { featuresData } from '../../data/features';
import './AnimatedGifts.css';

const AnimatedGifts = () => {
  const [displayedGifts, setDisplayedGifts] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const navigate = useNavigate();

  // Инициализация случайных 5 подарков
  useEffect(() => {
    const getRandomGifts = () => {
      const shuffled = [...featuresData].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 5);
    };
    
    const initialGifts = getRandomGifts();
    setDisplayedGifts(initialGifts);
  }, []);

  // Функция для получения случайного подарка
  const getRandomGift = () => {
    const randomIndex = Math.floor(Math.random() * featuresData.length);
    return featuresData[randomIndex];
  };

  // Функция смены подарков
  const shiftGifts = () => {
    if (isAnimating) return; // Предотвращаем множественные вызовы

    setIsAnimating(true);
    
    // Получаем новый случайный подарок
    const newGift = getRandomGift();
    
    // Определяем направление смены в зависимости от размера экрана
    const isDesktop = window.innerWidth >= 1028;
    
    let newDisplayedGifts;
    if (isDesktop) {
      // На ПК: новый подарок сверху, остальные сдвигаются вниз
      newDisplayedGifts = [
        newGift, // Новый подарок сверху
        ...displayedGifts.slice(0, 4) // Берем первые 4, последний исчезает
      ];
    } else {
      // На мобильных: новый подарок слева, остальные сдвигаются вправо
      newDisplayedGifts = [
        newGift, // Новый подарок слева
        ...displayedGifts.slice(0, 4) // Берем первые 4, последний исчезает
      ];
    }
    
    setDisplayedGifts(newDisplayedGifts);
    setAnimationKey(prev => prev + 1); // Обновляем ключ анимации
    
    // Сбрасываем флаг анимации через время анимации
    setTimeout(() => {
      setIsAnimating(false);
    }, 500); // Время анимации
  };

  // Запускаем смену подарков каждые 3 секунды
  useEffect(() => {
    const interval = setInterval(shiftGifts, 3000);
    return () => clearInterval(interval);
  }, [displayedGifts, isAnimating]);

  const handleCreateDeal = () => {
    navigate('/deals/create');
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
          }`}
        >
          <div className="feature-icon">
            <img src={feature.icon} alt={feature.title} />
          </div>
          <div className="feature-content">
            <h3>{feature.title}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnimatedGifts;
