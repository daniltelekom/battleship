
const playerBoard = document.getElementById("player-board");
const opponentBoard = document.getElementById("opponent-board");
const toggleBtn = document.getElementById("toggle-direction");
const readyBtn = document.getElementById("ready-button");
const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();

const userId = tg.initDataUnsafe?.user?.id || "guest" + Math.floor(Math.random() * 10000);
const room = tg.initDataUnsafe?.start_param || userId;
window.battleshipApp = { userId, room };

const socket = io();
socket.emit("join-room", { room, userId });

let direction = "horizontal";
let isPlayerReady = false;
let isOpponentReady = false;
let isPlayerTurn = false;
let playerShips = [];
const shipLimits = { 4: 1, 3: 2, 2: 3, 1: 4 };
const placedShipsMap = {};
let currentShipLength = 4;

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

document.querySelectorAll(".ship-option").forEach(opt => {
  opt.addEventListener("click", () => {
    currentShipLength = parseInt(opt.dataset.length);
    document.querySelectorAll(".ship-option").forEach(o => o.classList.remove("selected"));
    opt.classList.add("selected");
  });
});

function canPlaceShip(length) {
  return (placedShipsMap[length] || 0) < shipLimits[length];
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
  return coords.every(i => !taken.has(i));
}

playerBoard.addEventListener("mouseover", e => {
  const index = parseInt(e.target.dataset.index);
  if (isPlayerReady || !currentShipLength) return;
  const coords = getCoords(index, direction, currentShipLength);
  if (coords && valid(coords)) {
    coords.forEach(i => {
      const c = playerBoard.querySelector(`[data-index='${i}']`);
      if (c && !c.classList.contains("ship")) c.classList.add("preview");
    });
  }
});

playerBoard.addEventListener("mouseout", () => {
  document.querySelectorAll(".cell.preview").forEach(c => c.classList.remove("preview"));
});

playerBoard.addEventListener("click", e => {
  if (isPlayerReady) return;
  const index = parseInt(e.target.dataset.index);
  const cell = playerBoard.querySelector(`[data-index='${index}']`);

  if (cell && cell.classList.contains("ship")) {
    const shipIndex = playerShips.findIndex(ship => ship.includes(index));
    if (shipIndex !== -1) {
      const ship = playerShips.splice(shipIndex, 1)[0];
      ship.forEach(i => {
        const c = playerBoard.querySelector(`[data-index='${i}']`);
        c.classList.remove("ship");
      });
      const len = ship.length;
      placedShipsMap[len] = Math.max(0, (placedShipsMap[len] || 1) - 1);
      currentShipLength = len;
      document.querySelectorAll(".ship-option").forEach(o => {
        if (parseInt(o.dataset.length) === len) o.classList.add("selected");
        else o.classList.remove("selected");
      });
    }
    return;
  }

  if (!currentShipLength) return;
  const coords = getCoords(index, direction, currentShipLength);
  if (coords && valid(coords) && canPlaceShip(currentShipLength)) {
    coords.forEach(i => {
      const c = playerBoard.querySelector(`[data-index='${i}']`);
      c.classList.remove("preview");
      c.classList.add("ship");
    });
    playerShips.push(coords);
    placedShipsMap[currentShipLength] = (placedShipsMap[currentShipLength] || 0) + 1;
  }
});

readyBtn.onclick = () => {
  const totalPlaced = Object.values(placedShipsMap).reduce((sum, v) => sum + v, 0);
  if (totalPlaced === 10) {
    isPlayerReady = true;
    socket.emit("ready", { userId });
  } else {
    alert("Поставь все корабли!");
  }
};

opponentBoard.addEventListener("click", e => {
  if (!isPlayerTurn) return;
  const index = e.target.dataset.index;
  socket.emit("fire", { room, index });
  isPlayerTurn = false;
});

socket.on("start-turn", ({ yourTurn }) => {
  isPlayerTurn = yourTurn;
});

socket.on("fire-result", ({ index, result, nextTurn }) => {
  const cell = opponentBoard.querySelector(`[data-index='${index}']`);
  if (cell) {
    cell.classList.add(result === "hit" ? "hit" : "miss");
    if (result === "miss") {
      cell.style.backgroundImage = "url('assets/miss.png')";
      cell.style.backgroundSize = "cover";
    }
  }
  isPlayerTurn = nextTurn;
});

window.autoPlaceShips = function () {
  const attempts = 1000;
  document.querySelectorAll(".cell.ship").forEach(c => c.classList.remove("ship"));
  playerShips = [];
  for (let k in placedShipsMap) placedShipsMap[k] = 0;
  for (let a = 0; a < attempts; a++) {
    const lengths = [];
    for (let l in shipLimits) {
      for (let i = 0; i < shipLimits[l]; i++) lengths.push(parseInt(l));
    }
    while (lengths.length) {
      const len = lengths.pop();
      const dir = Math.random() < 0.5 ? "horizontal" : "vertical";
      const index = Math.floor(Math.random() * 100);
      const coords = getCoords(index, dir, len);
      if (coords && valid(coords)) {
        coords.forEach(i => {
          const c = playerBoard.querySelector(`[data-index='${i}']`);
          c.classList.add("ship");
        });
        playerShips.push(coords);
        placedShipsMap[len] = (placedShipsMap[len] || 0) + 1;
      }
    }
    const total = Object.values(placedShipsMap).reduce((s, v) => s + v, 0);
    if (total === 10) break;
  }
};

window.inviteFriend = function () {
  const link = `https://t.me/battlesea_ship_bot?startapp=${userId}`;
  Telegram.WebApp.openTelegramLink(
    `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent("Присоединяйся в морской бой!")}`
  );
};
