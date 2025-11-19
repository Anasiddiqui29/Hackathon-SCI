// Lightweight backend with Express and WebSocket server.
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(cors());

// In-memory state (for prototype)
const state = {
  buildings: {
    'A': { energy_kw: 0, last_updated: null },
    'B': { energy_kw: 0, last_updated: null },
    'C': { energy_kw: 0, last_updated: null }
  },
  rooms: {}, // roomId -> {occupied: bool, last_seen, occupancy_count}
  maintenance: [] // tickets
};

// REST endpoint: current status
app.get('/api/status', (req, res) => {
  res.json({ ok: true, state });
});

// REST endpoint: maintenance tickets
app.get('/api/maintenance', (req, res) => {
  res.json({ ok: true, tickets: state.maintenance });
});

// Create server + websocket
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Broadcast helper
function broadcast(obj) {
  const msg = JSON.stringify(obj);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) client.send(msg);
  });
}

// Simple anomaly detection rule: if building energy > threshold -> alert + ticket
const ENERGY_THRESHOLD_KW = 80; // prototype threshold

function processSensorEvent(evt) {
  // evt: { type: 'energy'|'occupancy', payload: {...} }
  if (evt.type === 'energy') {
    const { building, kw } = evt.payload;
    state.buildings[building].energy_kw = kw;
    state.buildings[building].last_updated = Date.now();
    if (kw > ENERGY_THRESHOLD_KW) {
      const ticket = {
        id: uuidv4(),
        type: 'energy_anomaly',
        building,
        kw,
        created_at: new Date().toISOString(),
        status: 'open',
        note: 'Auto-generated: high energy usage detected'
      };
      state.maintenance.push(ticket);
      broadcast({ event: 'alert', ticket });
    }
    broadcast({ event: 'energy_update', building, kw, ts: Date.now() });
  } else if (evt.type === 'occupancy') {
    const { roomId, occupied, count } = evt.payload;
    state.rooms[roomId] = { occupied, occupancy_count: count, last_seen: Date.now() };
    // heuristic: if room unused for long time and equipment ON -> maintenance ticket
    if (!occupied && count === 0 && Math.random() < 0.0005) {
      const ticket = {
        id: uuidv4(),
        type: 'maintenance_suggest',
        roomId,
        created_at: new Date().toISOString(),
        status: 'open',
        note: 'Auto-suggested maintenance check due to irregular sensor reading'
      };
      state.maintenance.push(ticket);
      broadcast({ event: 'alert', ticket });
    }
    broadcast({ event: 'occupancy_update', roomId, occupied, count, ts: Date.now() });
  }
}

// Accept WebSocket sensor inputs (also used by simulator)
wss.on('connection', (ws) => {
  console.log('WS client connected');
  ws.on('message', (msg) => {
    try {
      const obj = JSON.parse(msg);
      if (obj && obj.type) {
        processSensorEvent(obj);
      }
    } catch (err) {
      console.error('Invalid WS message', err);
    }
  });
  // send initial state
  ws.send(JSON.stringify({ event: 'initial_state', state }));
});

// Also accept HTTP POST for simulated sensors (optional)
app.post('/api/sensor', (req, res) => {
  const evt = req.body;
  processSensorEvent(evt);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Smart Campus backend running on port ${PORT}`));
