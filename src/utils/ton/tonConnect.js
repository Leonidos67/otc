// src/utils/ton/tonConnect.js
import { TonConnect } from "@tonconnect/sdk";

// создаём TonConnect
export const tonConnect = new TonConnect({
  manifestUrl: 'https://otcgamp.vercel.app/tonconnect-manifest.json'
});
