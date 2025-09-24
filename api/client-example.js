// Simple WS client example
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3001/ws');
ws.on('open', () => console.log('connected'));
ws.on('message', (data) => console.log('message', data.toString()));


