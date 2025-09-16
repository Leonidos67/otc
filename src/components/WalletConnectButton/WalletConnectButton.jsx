// src/components/WalletConnectButton/WalletConnectButton.jsx
import React, { useEffect, useState } from "react";
import { tonConnect } from "../../utils/ton/tonConnect";

const WalletConnectButton = () => {
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    const unsub = tonConnect.onStatusChange((walletInfo) => {
      setWallet(walletInfo);
    });

    return () => unsub();
  }, []);

  const connectWallet = async () => {
    try {
      await tonConnect.connectWallet();
    } catch (err) {
      console.error("Ошибка при подключении:", err);
    }
  };

  const disconnectWallet = async () => {
    try {
      await tonConnect.disconnect();
    } catch (err) {
      console.error("Ошибка при отключении:", err);
    }
  };

  if (wallet) {
    return (
      <div className="flex flex-col items-center gap-2">
        <p className="text-green-600 font-bold">Подключен: {wallet.account.address}</p>
        <button
          onClick={disconnectWallet}
          className="px-4 py-2 bg-red-500 text-white rounded-lg"
        >
          Отключить
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg"
    >
      Подключить Ton Wallet / Tonkeeper
    </button>
  );
};

export default WalletConnectButton;
