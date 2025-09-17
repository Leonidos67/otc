import React from 'react';
import WalletConnectButton from '../components/WalletConnectButton';
import './PageStyles.css';

const Home = () => {
  return (
    <div id="main">
      <h1>Главная страница</h1>
      <p>Добро пожаловать в торговую платформу OTC!</p>
      <div className="content-box" style={{ marginBottom: '16px' }}>
        <h2>Подключите кошелек TON</h2>
        <p>Чтобы продолжить, подключите Tonkeeper или другой поддерживаемый кошелек.</p>
        <WalletConnectButton />
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Общий объем торгов</h3>
          <div className="stat-value">$1,245,789</div>
        </div>
        <div className="stat-card">
          <h3>Активных сделок</h3>
          <div className="stat-value">47</div>
        </div>
        <div className="stat-card">
          <h3>Новых заявок</h3>
          <div className="stat-value">12</div>
        </div>
      </div>

      <div className="content-box">
        <h2>Последние сделки</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Актив</th>
              <th>Тип</th>
              <th>Цена</th>
              <th>Объем</th>
              <th>Время</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>BTC/USD</td>
              <td>Покупка</td>
              <td>$42,150</td>
              <td>2.5 BTC</td>
              <td>10:45:23</td>
            </tr>
            <tr>
              <td>ETH/USD</td>
              <td>Продажа</td>
              <td>$2,340</td>
              <td>15.8 ETH</td>
              <td>10:42:11</td>
            </tr>
            <tr>
              <td>USDT/RUB</td>
              <td>Покупка</td>
              <td>92.5 ₽</td>
              <td>50,000 USDT</td>
              <td>10:38:05</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;