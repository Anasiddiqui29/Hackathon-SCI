// Simple simulator that posts random sensor events to the backend WebSocket server.
const WebSocket = require('ws');
const BUILDINGS = ['A','B','C'];
const ROOMS = ['A-101','A-102','B-201','B-202','C-301','C-302'];

const ws = new WebSocket('ws://localhost:4000');

ws.on('open', () => {
  console.log('Simulator connected to backend WS.');
  setInterval(() => {
    // energy events
    const b = BUILDINGS[Math.floor(Math.random()*BUILDINGS.length)];
    // base usage by building size + random spike
    const base = (b==='A'?50:(b==='B'?40:30));
    const spike = Math.random()<0.02 ? (Math.random()*100) : 0;
    const kw = Math.round((base + Math.random()*20 + spike) * 10)/10;
    ws.send(JSON.stringify({ type: 'energy', payload: { building: b, kw } }));
  }, 2000);

  setInterval(() => {
    // occupancy events
    const r = ROOMS[Math.floor(Math.random()*ROOMS.length)];
    const occupied = Math.random() < 0.4;
    const count = occupied ? Math.floor(Math.random()*40)+1 : 0;
    ws.send(JSON.stringify({ type: 'occupancy', payload: { roomId: r, occupied, count } }));
  }, 1500);
});

ws.on('close', () => console.log('Simulator disconnected.'));
ws.on('error', (e) => console.error('WS error', e));
