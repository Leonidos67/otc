// src/components/WalletConnectButton/WalletConnectButton.jsx
import React from "react";
import { TonConnectButton, useTonWallet } from "@tonconnect/ui-react";

const WalletConnectButton = () => {
  const wallet = useTonWallet();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <TonConnectButton />
      {wallet && (
        <span style={{ fontSize: 12, color: '#16a34a' }}>
          Подключен
        </span>
      )}
    </div>
  );
};

export default WalletConnectButton;
