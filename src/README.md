ДЛЯ ДЕПЛОЯ
import React, { useEffect, useState } from 'react';
import './TelegramAuth.css';

const TelegramAuth = ({ onAuth }) => {
  const [widgetLoaded, setWidgetLoaded] = useState(false);

  // Получаем username бота из environment variables
  const botUsername = process.env.REACT_APP_TELEGRAM_BOT_USERNAME;

  useEffect(() => {
    if (!botUsername) {
      console.error('Telegram bot username is not configured');
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
      console.error('Failed to load Telegram Widget');
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      delete window.onTelegramAuth;
    };
  }, [botUsername, onAuth]);

  if (!botUsername) {
    return (
      <div className="telegram-auth-container">
        <div className="telegram-fallback">
          <p>Telegram authentication is not configured</p>
          <p>Please contact administrator</p>
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

для РАЗРАБОТКИ ОБНОВЛЕННЫЙ КОД
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

  if (error) {
    return (
      <div className="telegram-auth-container">
        <div className="telegram-fallback">
          <h3>⚠️ {isDevelopment ? 'Development Mode' : 'Configuration Error'}</h3>
          <p>{error}</p>
          {isDevelopment && (
            <div>
              <p>Telegram widget doesn't work on localhost.</p>
              <button 
                onClick={handleDevLogin}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginTop: '15px'
                }}
              >
                Simulate Telegram Login (Dev)
              </button>
              <p style={{ fontSize: '12px', marginTop: '10px', color: '#666' }}>
                This will create a test user for development
              </p>
            </div>
          )}
          {!isDevelopment && (
            <p>Please check bot domain settings in @BotFather</p>
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
      <div id="telegram-login-container"></div>
    </div>
  );
};

export default TelegramAuth;