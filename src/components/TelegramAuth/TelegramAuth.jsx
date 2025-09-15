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