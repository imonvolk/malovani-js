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
const users   = new Map();
const history = [];
let nextId = 1;

function broadcast(data, exclude = null) {
  const msg = JSON.stringify(data);
  wss.clients.forEach(c => {
    if (c !== exclude && c.readyState === WebSocket.OPEN) c.send(msg);
  });
}

function validColor(c) { return typeof c === 'string' && /^#[0-9a-fA-F]{6}$/.test(c); }

wss.on('connection', (ws) => {
  const id = nextId++;
  const color = USER_COLORS[colorIndex++ % USER_COLORS.length];
  users.set(ws, { id, username: null, color });

  ws.send(JSON.stringify({
    type: 'init', id, color, history,
    users: [...users.values()].filter(u => u.username)
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
      return;
    }

    if (!user.username) return;

    if (msg.type === 'cursor') {
      const x = +msg.x, y = +msg.y;
      if (!isFinite(x) || !isFinite(y)) return;
      broadcast({ type: 'cursor', id: user.id, x, y }, ws);
    }

    if (msg.type === 'stroke') {
      const pts = msg.points;
      if (!Array.isArray(pts) || pts.length < 2) return;
      const color = validColor(msg.color) ? msg.color : user.color;
      const size  = Math.max(1, Math.min(60, +msg.size || 4));
      const op = { type: 'stroke', color, size,
        alpha: Math.min(1, Math.max(0.05, +msg.alpha || 1)),
        points: pts.map(p => ({ x: +p.x, y: +p.y })) };
      pushHistory(op);
      broadcast({ type: 'op', op }, ws);
    }

    if (msg.type === 'shape') {
      const { kind } = msg;
      if (!['line','rect','rect-fill','ellipse','ellipse-fill'].includes(kind)) return;
      const color = validColor(msg.color) ? msg.color : user.color;
      const size  = Math.max(1, Math.min(60, +msg.size || 4));
      const op = { type: 'shape', kind, color, size,
        alpha: Math.min(1, Math.max(0.05, +msg.alpha || 1)),
        x1: +msg.x1, y1: +msg.y1, x2: +msg.x2, y2: +msg.y2 };
      pushHistory(op);
      broadcast({ type: 'op', op }, ws);
    }

    if (msg.type === 'fill') {
      const color = validColor(msg.color) ? msg.color : user.color;
      const op = { type: 'fill', color, x: +msg.x, y: +msg.y };
      pushHistory(op);
      broadcast({ type: 'op', op }, ws);
    }

    if (msg.type === 'text') {
      const color = validColor(msg.color) ? msg.color : user.color;
      const text  = String(msg.text || '').slice(0, 200);
      if (!text) return;
      const size = Math.max(8, Math.min(120, +msg.size || 20));
      const op = { type: 'text', color, size, text, x: +msg.x, y: +msg.y,
        font: msg.font || 'sans-serif' };
      pushHistory(op);
      broadcast({ type: 'op', op }, ws);
    }

    if (msg.type === 'spray') {
      const pts = msg.points;
      if (!Array.isArray(pts) || pts.length === 0) return;
      const color = validColor(msg.color) ? msg.color : user.color;
      const size  = Math.max(1, Math.min(60, +msg.size || 20));
      const op = { type: 'spray', color, size, points: pts.map(p => ({ x: +p.x, y: +p.y })) };
      pushHistory(op);
      broadcast({ type: 'op', op }, ws);
    }

    if (msg.type === 'chat') {
      const text = String(msg.text || '').trim().slice(0, 300);
      if (!text) return;
      broadcast({ type: 'chat', username: user.username, color: user.color, text });
    }

    if (msg.type === 'clear_all') {
      history.length = 0;
      broadcast({ type: 'clear_all' });
    }
  });

  ws.on('close', () => {
    const user = users.get(ws);
    if (user) broadcast({ type: 'user_leave', id: user.id });
    users.delete(ws);
  });
});

function pushHistory(op) {
  history.push(op);
  if (history.length > 20000) history.splice(0, history.length - 20000);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`http://localhost:${PORT}`));
