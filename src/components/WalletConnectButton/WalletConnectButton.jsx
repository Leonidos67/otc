// src/components/WalletConnectButton/WalletConnectButton.jsx
import React from "react";
import { TonConnectButton } from "@tonconnect/ui-react";

const WalletConnectButton = () => {
  return (
    <div style={{ width: '100%' }}>
      <TonConnectButton style={{ width: '100%' }} />
    </div>
  );
};

export default WalletConnectButton;
