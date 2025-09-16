// src/utils/ton/tonConnect.js
import { TonConnect } from "@tonconnect/sdk";

// создаём TonConnect
export const tonConnect = new TonConnect({
  manifestUrl: "https://YOUR_DOMAIN/tonconnect-manifest.json"
});
