import React, { useState } from 'react';
import './PageStyles.css';

const Profile = () => {
  const [userData, setUserData] = useState({
    name: 'Иван Иванов',
    email: 'ivan@example.com',
    phone: '+7 (999) 123-45-67'
  });

  return (
    <div id="profile">
      <h1>Мой профиль</h1>
      
      <div className="content-box">
        <h2>Личная информация</h2>
        <div style={{ display: 'grid', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Имя:</label>
            <input
              type="text"
              value={userData.name}
              onChange={(e) => setUserData({...userData, name: e.target.value})}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '5px',
                color: 'white'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Email:</label>
            <input
              type="email"
              value={userData.email}
              onChange={(e) => setUserData({...userData, email: e.target.value})}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '5px',
                color: 'white'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Телефон:</label>
            <input
              type="tel"
              value={userData.phone}
              onChange={(e) => setUserData({...userData, phone: e.target.value})}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '5px',
                color: 'white'
              }}
            />
          </div>
        </div>
      </div>

      <div className="content-box">
        <h2>Балансы</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>USDT</h3>
            <div className="stat-value">25,000.00</div>
          </div>
          <div className="stat-card">
            <h3>BTC</h3>
            <div className="stat-value">1.2547</div>
          </div>
          <div className="stat-card">
            <h3>ETH</h3>
            <div className="stat-value">8.9231</div>
          </div>
        </div>
      </div>

      <div className="content-box">
        <h2>Настройки безопасности</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button style={{
            padding: '10px 20px',
            backgroundColor: '#2d2d2d',
            border: '1px solid #333',
            borderRadius: '5px',
            color: 'white',
            cursor: 'pointer'
          }}>
            Сменить пароль
          </button>
          <button style={{
            padding: '10px 20px',
            backgroundColor: '#2d2d2d',
            border: '1px solid #333',
            borderRadius: '5px',
            color: 'white',
            cursor: 'pointer'
          }}>
            Включить 2FA
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;