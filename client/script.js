
const playerBoard = document.getElementById("player-board");
const opponentBoard = document.getElementById("opponent-board");
const statsDiv = document.getElementById("stats");
const toggleBtn = document.getElementById("toggle-direction");
const readyBtn = document.getElementById("ready-button");

let direction = "horizontal";
let shipsPlaced = 0;
let playerShips = [];
const shipList = [4,3,3,2,2,2,1,1,1,1];
const { userId, room } = window.battleshipApp || { userId: "guest", room: "room1" };

function createBoard(board) {
  for (let i = 0; i < 100; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    board.appendChild(cell);
  }
}
createBoard(playerBoard);
createBoard(opponentBoard);

toggleBtn.onclick = () => {
  direction = direction === "horizontal" ? "vertical" : "horizontal";
};

playerBoard.addEventListener("click", e => {
  if (shipsPlaced >= shipList.length) return;
  const index = parseInt(e.target.dataset.index);
  const length = shipList[shipsPlaced];
  const coords = getCoords(index, direction, length);
  if (coords && valid(coords)) {
    coords.forEach(i => {
      const cell = playerBoard.querySelector(`[data-index='${i}']`);
      cell.classList.remove("preview");
      cell.classList.add("ship");
    });
    playerShips.push(coords);
    shipsPlaced++;
  }
});

playerBoard.addEventListener("mouseover", e => {
  clearPreview();
  const index = parseInt(e.target.dataset.index);
  if (shipsPlaced >= shipList.length) return;
  const length = shipList[shipsPlaced];
  const coords = getCoords(index, direction, length);
  if (coords && valid(coords)) {
    coords.forEach(i => {
      const cell = playerBoard.querySelector(`[data-index='${i}']`);
      if (cell && !cell.classList.contains("ship")) cell.classList.add("preview");
    });
  }
});

playerBoard.addEventListener("mouseout", () => clearPreview());

function clearPreview() {
  document.querySelectorAll(".cell.preview").forEach(cell => cell.classList.remove("preview"));
}

function getCoords(start, dir, len) {
  const coords = [];
  for (let i = 0; i < len; i++) {
    let idx = dir === "horizontal" ? start + i : start + i * 10;
    if (idx >= 100 || (dir === "horizontal" && Math.floor(idx / 10) !== Math.floor(start / 10))) return null;
    coords.push(idx);
  }
  return coords;
}

function valid(coords) {
  const taken = new Set();
  for (let i = 0; i < 100; i++) {
    const cell = playerBoard.querySelector(`[data-index='${i}']`);
    if (cell && cell.classList.contains("ship")) {
      taken.add(i);
      // соседние клетки (в том числе диагонали)
      const adj = [
        i - 11, i - 10, i - 9,
        i - 1,  i,     i + 1,
        i + 9,  i + 10, i + 11
      ];
      adj.forEach(j => {
        if (j >= 0 && j < 100) taken.add(j);
      });
    }
  }
  return coords.every(i => {
    const cell = playerBoard.querySelector(`[data-index='${i}']`);
    return cell && !taken.has(i);
  });
}

const socket = io();
socket.emit("join-room", { room, userId });

readyBtn.onclick = () => {
  if (playerShips.length === 10) {
    socket.emit("ready", { userId });
  } else {
    alert("Поставь все корабли!");
  }
};

opponentBoard.addEventListener("click", e => {
  const index = e.target.dataset.index;
  socket.emit("fire", { room, index });
});

socket.on("fire-result", ({ index, result }) => {
  const cell = opponentBoard.querySelector(`[data-index='${index}']`);
  cell.classList.add(result === "hit" ? "hit" : "miss");
});

socket.on("stats-update", ({ wins, losses }) => {
  statsDiv.textContent = `Побед: ${wins} | Поражений: ${losses}`;
});


document.addEventListener("DOMContentLoaded", () => {
  const autoBtn = document.createElement("button");
  autoBtn.textContent = "Авторасстановка";
  autoBtn.onclick = autoPlaceShips;
  document.querySelector(".controls")?.appendChild(autoBtn);
});

function autoPlaceShips() {
  clearAll();
  shipsPlaced = 0;
  playerShips = [];
  const attempts = 1000;
  for (let a = 0; a < attempts && shipsPlaced < shipList.length; a++) {
    const len = shipList[shipsPlaced];
    const dir = Math.random() < 0.5 ? "horizontal" : "vertical";
    const index = Math.floor(Math.random() * 100);
    const coords = getCoords(index, dir, len);
    if (coords && valid(coords)) {
      coords.forEach(i => {
        const cell = playerBoard.querySelector(`[data-index='${i}']`);
        cell.classList.add("ship");
      });
      playerShips.push(coords);
      shipsPlaced++;
    }
  }
}

function clearAll() {
  document.querySelectorAll(".cell").forEach(cell => {
    cell.classList.remove("ship", "preview");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const inviteBtn = document.createElement("button");
  inviteBtn.textContent = "Пригласить друга";
  inviteBtn.onclick = () => {
    const link = `https://t.me/${tg.initDataUnsafe?.bot?.username}?startapp=${userId}`;
    Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=Присоединяйся в морской бой!`);
  };
  document.querySelector(".controls")?.appendChild(inviteBtn);
});


let isPlayerTurn = false;

socket.on("start-turn", ({ yourTurn }) => {
  isPlayerTurn = yourTurn;
  if (isPlayerTurn) {
    console.log("Твой ход");
  } else {
    console.log("Ход противника");
  }
});

opponentBoard.addEventListener("click", e => {
  if (!isPlayerTurn) return;
  const index = e.target.dataset.index;
  if (!index) return;
  isPlayerTurn = false;
  socket.emit("fire", { room, index });
});

socket.on("fire-result", ({ index, result, nextTurn }) => {
  const cell = opponentBoard.querySelector(`[data-index='${index}']`);
  if (cell) {
    if (result === "hit") {
      cell.classList.add("hit");
    } else {
      cell.classList.add("miss");
      cell.style.backgroundImage = "url('assets/miss.png')";
      cell.style.backgroundSize = "cover";
      cell.style.backgroundPosition = "center";
    }
  }
  isPlayerTurn = nextTurn;
});


window.autoPlaceShips = autoPlaceShips;


window.inviteFriend = function() {
  const tg = window.Telegram.WebApp;
  const userId = window.battleshipApp?.userId || 'guest';
  const botName = "battlesea_ship_bot";
  const link = `https://t.me/${botName}?startapp=${userId}`;
  Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=Присоединяйся в морской бой!`);
};
