import React, { useState } from 'react';
import './PageStyles.css';

const Deals = () => {
  const [activeTab, setActiveTab] = useState('active');

  return (
    <div id="deals">
      <h1>Сделки</h1>
      
      <div className="content-box">
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            onClick={() => setActiveTab('active')}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: activeTab === 'active' ? '#333' : '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '5px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Активные сделки
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: activeTab === 'history' ? '#333' : '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '5px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            История сделок
          </button>
        </div>

        {activeTab === 'active' ? (
          <div>
            <h2>Активные сделки (3)</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>ID сделки</th>
                  <th>Актив</th>
                  <th>Тип</th>
                  <th>Цена</th>
                  <th>Объем</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>#12345</td>
                  <td>BTC/USD</td>
                  <td>Покупка</td>
                  <td>$42,100</td>
                  <td>1.2 BTC</td>
                  <td>Ожидание</td>
                </tr>
                <tr>
                  <td>#12346</td>
                  <td>ETH/USD</td>
                  <td>Продажа</td>
                  <td>$2,350</td>
                  <td>8.5 ETH</td>
                  <td>Выполняется</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div>
            <h2>История сделок</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>ID сделки</th>
                  <th>Актив</th>
                  <th>Тип</th>
                  <th>Цена</th>
                  <th>Объем</th>
                  <th>Дата</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>#12344</td>
                  <td>USDT/RUB</td>
                  <td>Покупка</td>
                  <td>91.8 ₽</td>
                  <td>25,000 USDT</td>
                  <td>2024-01-15</td>
                </tr>
                <tr>
                  <td>#12343</td>
                  <td>BTC/USD</td>
                  <td>Продажа</td>
                  <td>$41,800</td>
                  <td>0.8 BTC</td>
                  <td>2024-01-14</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Deals;