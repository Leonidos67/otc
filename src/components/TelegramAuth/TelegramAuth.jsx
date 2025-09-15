import React, { useEffect, useState } from 'react';
import './TelegramAuth.css';

const TelegramAuth = ({ onAuth }) => {
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const [error, setError] = useState(null);

  const botUsername = process.env.REACT_APP_TELEGRAM_BOT_USERNAME;

  useEffect(() => {
    if (!botUsername) {
      setError('Telegram bot not configured');
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
      setError('Failed to load Telegram widget');
      setWidgetLoaded(false);
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      delete window.onTelegramAuth;
    };
  }, [onAuth, botUsername]);

  if (error) {
    return (
      <div className="telegram-auth-container">
        <div className="telegram-fallback">
          <p>⚠️ {error}</p>
          <p>Please configure Telegram bot username</p>
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