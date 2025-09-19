import React, { useEffect, useRef, useState } from 'react';
import './TelegramAuth.css';

const TelegramAuth = ({ onAuth }) => {
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const [error, setError] = useState(null);

  const botUsername = process.env.REACT_APP_TELEGRAM_BOT_USERNAME;
  const isDevelopment = process.env.NODE_ENV === 'development';

  const containerRef = useRef(null);
  const [mountAttempt, setMountAttempt] = useState(0);

  useEffect(() => {
    if (!botUsername) {
      setError('Bot username not configured');
      setWidgetLoaded(false);
      return;
    }

    const container = containerRef.current;
    if (!container) {
      // Ждём появления контейнера с экспоненциальной задержкой, без ошибки пользователю
      const timeout = setTimeout(() => setMountAttempt((n) => n + 1), Math.min(500, 50 * (mountAttempt + 1)));
      return () => clearTimeout(timeout);
    }

    // Очищаем контейнер перед вставкой виджета
    container.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '10');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');

    window.onTelegramAuth = (user) => {
      onAuth(user);
    };

    script.onload = () => setWidgetLoaded(true);
    script.onerror = () => {
      setError('Failed to load Telegram widget. Check bot domain settings.');
      setWidgetLoaded(false);
    };

    container.appendChild(script);

    return () => {
      try {
        container.innerHTML = '';
      } catch (_) {}
      delete window.onTelegramAuth;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botUsername, onAuth, mountAttempt]);

  // Для разработки - кнопка для имитации входа
  const handleDevLogin = () => {
    const mockUser = {
      id: 123456789,
      first_name: 'Test',
      last_name: 'User',
      username: 'testuser',
      photo_url: '',
      auth_date: Math.floor(Date.now() / 1000),
      hash: 'mock_hash_for_development'
    };
    onAuth(mockUser);
  };

  // В разработке показываем и виджет, и кнопку симуляции

  if (error) {
    return (
      <div className="telegram-auth-container">
        <div className="telegram-fallback">
          <h3>⚠️ Configuration Error</h3>
          <p>{error}</p>
          <p>Please check bot domain settings in @BotFather</p>
          {isDevelopment && (
            <button onClick={handleDevLogin} className="telegram-login-button" style={{ marginTop: 12 }}>
              Simulate Telegram Login (Dev)
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!widgetLoaded) {
    return (
      <div className="telegram-auth-container">
        <div className="telegram-fallback">
          <p>Loading Telegram authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="telegram-auth-container">
      <div id="telegram-login-container" ref={containerRef}></div>
      {isDevelopment && (
        <button onClick={handleDevLogin} className="telegram-login-button" style={{ marginTop: 12 }}>
          Simulate Telegram Login (Dev)
        </button>
      )}
    </div>
  );
};

export default TelegramAuth;