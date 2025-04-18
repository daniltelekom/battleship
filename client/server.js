const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let players = [];

io.on("connection", (socket) => {
  if (players.length >= 2) {
    socket.disconnect();
    return;
  }
  players.push(socket);

  socket.on("fire", (index) => {
    players.forEach(s => {
      if (s !== socket) {
        s.emit("fire-result", { index, result: "hit" });
      }
    });
  });

  socket.on("disconnect", () => {
    players = players.filter(s => s !== socket);
  });
});

server.listen(3000, () => console.log("Server running on http://localhost:3000"));