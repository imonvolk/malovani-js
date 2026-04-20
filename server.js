const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));

const USER_COLORS = [
  '#e74c3c','#e67e22','#f1c40f','#2ecc71',
  '#1abc9c','#3498db','#9b59b6','#e91e63',
  '#00bcd4','#ff5722','#8bc34a','#673ab7',
];

let colorIndex = 0;
const users = new Map(); // ws → { id, username, color }
const strokes = [];     // persistent canvas history

let nextId = 1;

function broadcast(data, exclude = null) {
  const msg = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

wss.on('connection', (ws) => {
  const id = nextId++;
  const color = USER_COLORS[colorIndex % USER_COLORS.length];
  colorIndex++;

  users.set(ws, { id, username: null, color });

  ws.send(JSON.stringify({
    type: 'init',
    id,
    color,
    strokes,
    users: [...users.values()]
      .filter(u => u.username)
      .map(u => ({ id: u.id, username: u.username, color: u.color })),
  }));

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    const user = users.get(ws);
    if (!user) return;

    if (msg.type === 'join') {
      const username = String(msg.username || '').trim().slice(0, 24);
      if (!username) return;
      user.username = username;
      broadcast({ type: 'user_join', id: user.id, username, color: user.color }, ws);
    }

    if (!user.username) return;

    if (msg.type === 'cursor') {
      const x = Number(msg.x); const y = Number(msg.y);
      if (!isFinite(x) || !isFinite(y)) return;
      broadcast({ type: 'cursor', id: user.id, x, y }, ws);
    }

    if (msg.type === 'stroke') {
      const pts = msg.points;
      if (!Array.isArray(pts) || pts.length < 2) return;
      const color = /^#[0-9a-fA-F]{6}$/.test(msg.color) ? msg.color : user.color;
      const size = Math.max(1, Math.min(40, Number(msg.size) || 4));
      const stroke = { color, size, points: pts.map(p => ({ x: +p.x, y: +p.y })) };
      strokes.push(stroke);
      if (strokes.length > 10000) strokes.splice(0, strokes.length - 10000);
      broadcast({ type: 'stroke', stroke }, ws);
    }

    if (msg.type === 'clear_all') {
      strokes.length = 0;
      broadcast({ type: 'clear_all' });
    }
  });

  ws.on('close', () => {
    const user = users.get(ws);
    if (user) broadcast({ type: 'user_leave', id: user.id });
    users.delete(ws);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`http://localhost:${PORT}`));
