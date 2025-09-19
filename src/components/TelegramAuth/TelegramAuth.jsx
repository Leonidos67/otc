import React, { useEffect, useState } from 'react';
import './TelegramAuth.css';

const TelegramAuth = ({ onAuth }) => {
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const [error, setError] = useState(null);

  const botUsername = process.env.REACT_APP_TELEGRAM_BOT_USERNAME;
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (!botUsername) {
      setError('Bot username not configured');
      return;
    }

    // Для разработки показываем заглушку вместо виджета
    if (isDevelopment) {
      setError('Telegram widget disabled in development mode');
      return;
    }

    const script = document.createElement('script');
    script.src = "https://telegram.org/js/telegram-widget.js?22";
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

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      delete window.onTelegramAuth;
    };
  }, [botUsername, onAuth, isDevelopment]);

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

  // Для разработки показываем только кнопку входа
  if (isDevelopment) {
    return (
      <div className="telegram-auth-container">
        <button 
          onClick={handleDevLogin}
          className="telegram-login-button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.169 1.858-.896 6.728-.896 6.728-.896 6.728-.896 6.728-.896 6.728l-1.404 4.608c-.107.352-.375.576-.675.576-.3 0-.568-.224-.675-.576l-1.404-4.608c-.169-1.858-.896-6.728-.896-6.728-.896-6.728-.896-6.728-.896-6.728l-1.404-4.608c-.107-.352.107-.704.375-.704.3 0 .568.224.675.576l1.404 4.608c.169 1.858.896 6.728.896 6.728.896 6.728.896 6.728.896 6.728l1.404 4.608c.107.352-.107.704-.375.704-.3 0-.568-.224-.675-.576l-1.404-4.608z"/>
          </svg>
          Simulate Telegram Login (Dev)
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="telegram-auth-container">
        <div className="telegram-fallback">
          <h3>⚠️ Configuration Error</h3>
          <p>{error}</p>
          <p>Please check bot domain settings in @BotFather</p>
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
      <div id="telegram-login-container"></div>
    </div>
  );
};

export default TelegramAuth;