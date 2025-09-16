import React from "react";
import WalletConnectButton from "../../components/WalletConnectButton";

const Profile = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Профиль</h1>
      {/* Твоя инфа профиля */}
      
      {/* Кнопка для подключения TON Wallet */}
      <WalletConnectButton />
    </div>
  );
};

export default Profile;
