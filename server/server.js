
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, '../client')));

let players = {};

io.on('connection', socket => {
  console.log('New connection', socket.id);
  if (Object.keys(players).length < 2) {
    players[socket.id] = { ready: false };
  } else {
    socket.disconnect();
    return;
  }

  socket.on('player-ready', () => {
    players[socket.id].ready = true;
    const allReady = Object.values(players).every(p => p.ready);
    if (allReady) {
      io.emit('start-game');
    }
  });

  socket.on('shoot', index => {
    io.emit('shoot-result', { index, result: 'hit' }); // Заменить на логику попадания
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
