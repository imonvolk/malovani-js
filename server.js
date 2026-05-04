const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

const USER_COLORS = [
  '#e74c3c','#e67e22','#f1c40f','#2ecc71',
  '#1abc9c','#3498db','#9b59b6','#e91e63',
  '#00bcd4','#ff5722','#8bc34a','#673ab7',
];

let colorIndex = 0;
const users = new Map(); // socket.id → { id, username, color, member }
let nextId = 1;

io.on('connection', (socket) => {
  const id = nextId++;
  const color = USER_COLORS[colorIndex % USER_COLORS.length];
  colorIndex++;

  users.set(socket.id, { id, username: null, color, member: null });

  console.log('User connected:', socket.id, 'Total users:', users.size);
  io.emit('userCount', users.size);

  const userList = [...users.values()]
    .filter(u => u.username)
    .map(u => ({ id: u.id, username: u.username, color: u.color }));
  socket.emit('users', userList);

  socket.on('join', (data) => {
    const user = users.get(socket.id);
    if (!user) return;
    const username = String(data.username || '').trim().slice(0, 24);
    if (!username) return;
    user.username = username;
    user.member = data.member || '';
    socket.broadcast.emit('user_join', { id: user.id, username, color: user.color });
  });

  socket.on('draw', (data) => {
    socket.broadcast.emit('draw', data);
  });

  socket.on('cursor', (data) => {
    const user = users.get(socket.id);
    if (!user) return;
    socket.broadcast.emit('cursor', { id: user.id, x: data.x, y: data.y });
  });

  socket.on('clear', () => {
    socket.broadcast.emit('clear');
  });

  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) socket.broadcast.emit('user_leave', { id: user.id });
    users.delete(socket.id);
    console.log('User disconnected:', socket.id, 'Total users:', users.size);
    io.emit('userCount', users.size);
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
