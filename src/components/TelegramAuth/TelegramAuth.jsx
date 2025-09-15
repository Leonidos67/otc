import React, { useEffect, useState } from 'react';
import './TelegramAuth.css';

const TelegramAuth = ({ onAuth }) => {
  const [widgetLoaded, setWidgetLoaded] = useState(false);
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
      setWidgetLoaded(false);
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      delete window.onTelegramAuth;
    };
  }, [onAuth, botUsername]);

  if (!botUsername) {
    return (
      <div className="telegram-auth-container">
        <div className="telegram-fallback">
          <p>Ошибка конфигурации Telegram</p>
        </div>
      </div>
    );
  }

  if (!widgetLoaded) {
    return (
      <div className="telegram-auth-container">
        <div className="telegram-fallback">
          <p>Загрузка виджета Telegram...</p>
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