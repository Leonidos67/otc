import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <TonConnectUIProvider
      manifestUrl={`https://otcgamp.vercel.app/tonconnect-manifest.json`}
      uiPreferences={{ theme: 'DARK' }}
    >
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>
);