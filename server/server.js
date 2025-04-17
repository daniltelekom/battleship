import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

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

io.on("connection", (socket) => {
  console.log("Подключился:", socket.id);

  socket.on("join", ({ roomId, userId }) => {
    socket.join(roomId);
    socket.data.userId = userId;
    socket.data.room = roomId;

    if (!players[roomId]) players[roomId] = [];
    players[roomId].push(socket.id);

    console.log(`Игрок ${userId} присоединился к комнате ${roomId}`);

    if (players[roomId].length === 2) {
      io.to(roomId).emit("start-game");
    }
  });

  socket.on("place-ready", () => {
    const room = socket.data.room;
    socket.data.ready = true;

    const readySockets = (players[room] || [])
      .map((id) => io.sockets.sockets.get(id))
      .filter((s) => s?.data?.ready);

    if (readySockets.length === 2) {
      const turn = Math.floor(Math.random() * 2);
      readySockets.forEach((s, i) =>
        s.emit("start-turn", { yourTurn: i === turn })
      );
    }

    const userId = socket.data.userId;
    if (!stats[userId]) stats[userId] = { wins: 0, losses: 0 };
    socket.emit("stats-update", stats[userId]);
  });

  socket.on("shoot", ({ index }) => {
    const room = socket.data.room;
    socket.to(room).emit("opponent-shot", { index });
  });

  socket.on("shoot-result", ({ index, result }) => {
    const room = socket.data.room;
    socket.to(room).emit("shoot-result", { index, result });
  });

  socket.on("disconnect", () => {
    const { room, userId } = socket.data || {};
    if (room && players[room]) {
      players[room] = players[room].filter((id) => id !== socket.id);
      if (players[room].length === 1) {
        const winnerSocket = io.sockets.sockets.get(players[room][0]);
        const winnerId = winnerSocket?.data?.userId;
        if (winnerId) {
          recordWin(winnerId);
          winnerSocket.emit("stats-update", stats[winnerId]);
          winnerSocket.emit("opponent-disconnected");
        }
        if (userId) {
          recordLoss(userId);
        }
      }
    }

    console.log("Отключился:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Сервер запущен на порту", PORT);
});
