const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Handle socket connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listen for drawing events from clients
  socket.on('draw', (data) => {
    // Broadcast the drawing data to all other connected clients
    socket.broadcast.emit('draw', data);
  });

  // Listen for clear canvas events
  socket.on('clear', () => {
    // Broadcast clear event to all other clients
    socket.broadcast.emit('clear');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});