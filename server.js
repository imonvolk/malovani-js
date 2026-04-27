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
let userCount = 0;
const users = new Map();

io.on('connection', (socket) => {
  userCount++;
  const color = USER_COLORS[colorIndex++ % USER_COLORS.length];
  users.set(socket.id, { username: null, color });

  io.emit('userCount', userCount);

  socket.on('join', (data) => {
    const user = users.get(socket.id);
    if (!user) return;
    user.username = String(data.username || '').trim().slice(0, 24);
    user.member = data.member;

    socket.broadcast.emit('user_join', { id: socket.id, username: user.username, color });

    const userList = [];
    users.forEach((u, id) => {
      if (id !== socket.id && u.username) userList.push({ id, username: u.username, color: u.color });
    });
    socket.emit('users', userList);
  });

  socket.on('draw', (data) => {
    socket.broadcast.emit('draw', data);
  });

  socket.on('clear', () => {
    socket.broadcast.emit('clear');
  });

  socket.on('cursor', (data) => {
    socket.broadcast.emit('cursor', { id: socket.id, x: data.x, y: data.y });
  });

  socket.on('disconnect', () => {
    userCount--;
    const user = users.get(socket.id);
    users.delete(socket.id);
    io.emit('userCount', userCount);
    if (user && user.username) socket.broadcast.emit('user_leave', { id: socket.id });
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
