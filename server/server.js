
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("client"));

const players = {};
const stats = {};

function recordWin(id) {
  if (!stats[id]) stats[id] = { wins: 0, losses: 0 };
  stats[id].wins++;
}
function recordLoss(id) {
  if (!stats[id]) stats[id] = { wins: 0, losses: 0 };
  stats[id].losses++;
}

io.on("connection", socket => {
  socket.on("join-room", ({ room, userId }) => {
    socket.join(room);
    socket.data.userId = userId;
    socket.data.room = room;
    if (!players[room]) players[room] = [];
    players[room].push(socket.id);
  });

  socket.on("ready", ({ userId }) => {
    socket.data.ready = true;
    const room = socket.data.room;
    const playersReady = (players[room] || []).map(id => io.sockets.sockets.get(id)).filter(s => s?.data?.ready);
    if (playersReady.length === 2) {
      const turn = Math.floor(Math.random() * 2);
      playersReady.forEach((s, i) => s.emit("start-turn", { yourTurn: i === turn }));
    }
    if (!stats[userId]) stats[userId] = { wins: 0, losses: 0 };
    socket.emit("stats-update", stats[userId]);
  });

  socket.on("fire", ({ room, index }) => {
    io.to(room).emit("fire-result", { index, result: "hit" });
  });

  socket.on("disconnect", () => {
    const { room, userId } = socket.data || {};
    if (room && players[room]) {
      players[room] = players[room].filter(id => id !== socket.id);
      if (players[room].length === 1) {
        const winnerSocket = io.sockets.sockets.get(players[room][0]);
        const winnerId = winnerSocket?.data?.userId;
        if (winnerId) {
          recordWin(winnerId);
          winnerSocket.emit("stats-update", stats[winnerId]);
        }
        if (userId) {
          recordLoss(userId);
        }
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server on port", PORT));
