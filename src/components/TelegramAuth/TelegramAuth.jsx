import React, { useEffect, useRef, useState } from 'react';
import './TelegramAuth.css';

const TelegramAuth = ({ onAuth }) => {
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  const botUsername = process.env.REACT_APP_TELEGRAM_BOT_USERNAME;
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (!botUsername) {
      setError('Bot username not configured');
      return;
    }

    // Check if we're on localhost - Telegram widget won't work there
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname === '0.0.0.0';

    if (isLocalhost || isDevelopment) {
      setError('Telegram widget not available on localhost - using fallback');
      return;
    }

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

    // Mount the widget inside our container for proper placement on the login page
    const mountTarget = containerRef.current || document.body;
    mountTarget.appendChild(script);

    return () => {
      try {
        mountTarget.removeChild(script);
      } catch (_) {
        // ignore if already removed
      }
      delete window.onTelegramAuth;
    };
  }, [botUsername, onAuth, isDevelopment]);

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

  // Single-button fallback: if the widget fails to load (e.g. localhost),
  // show our own Telegram login button that simulates auth in development.
  if (error) {
    return (
      <div className="telegram-auth-container">
        <button className="telegram-dev-button" onClick={handleDevLogin}>
          Подключить Telegram
        </button>
      </div>
    );
  }

  if (!widgetLoaded) {
    return (
      <div className="telegram-auth-container">
        <div id="telegram-login-container" ref={containerRef}></div>
      </div>
    );
  }

  return (
    <div className="telegram-auth-container">
      <div id="telegram-login-container" ref={containerRef}></div>
    </div>
  );
};

export default TelegramAuth;


