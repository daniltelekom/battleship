
// placeholder for full game logic
document.addEventListener("DOMContentLoaded", () => {
  const playerBoard = document.getElementById("player-board");
  const opponentBoard = document.getElementById("opponent-board");
  for (let i = 0; i < 100; i++) {
    const cell1 = document.createElement("div");
    const cell2 = document.createElement("div");
    cell1.classList.add("cell");
    cell2.classList.add("cell");
    cell1.dataset.index = i;
    cell2.dataset.index = i;
    playerBoard.appendChild(cell1);
    opponentBoard.appendChild(cell2);
  }
  console.log("Поля созданы");
});

// Авторасстановка и пригласить друга
// оригинальная авторасстановка заменена
  alert("Авторасстановка пока не реализована");
};
window.inviteFriend = function () {
  const tg = window.Telegram.WebApp;
  const userId = window.battleshipApp?.userId || "guest";
  const link = `https://t.me/battlesea_ship_bot?startapp=${userId}`;
  Telegram.WebApp.openTelegramLink(
    `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent("Присоединяйся в морской бой!")}`
  );
};



// оригинальная авторасстановка заменена
  const boardSize = 10;
  const shipCounts = { 4: 1, 3: 2, 2: 3, 1: 4 };
  const playerBoard = document.getElementById("player-board");

  function isValid(coords) {
    return coords.every(i => {
      const cell = playerBoard.querySelector(`[data-index='${i}']`);
      return cell && !cell.classList.contains("ship");
    });
  }

  function getCoords(start, dir, len) {
    const coords = [];
    for (let i = 0; i < len; i++) {
      const idx = dir === "h" ? start + i : start + i * boardSize;
      if (idx >= 100) return null;
      if (dir === "h" && Math.floor(idx / boardSize) !== Math.floor(start / boardSize)) return null;
      coords.push(idx);
    }
    return coords;
  }

  document.querySelectorAll(".cell.ship").forEach(c => c.classList.remove("ship"));

  const placed = [];

  for (const len of [4, 3, 3, 2, 2, 2, 1, 1, 1, 1]) {
    let placedOne = false;
    for (let tries = 0; tries < 100 && !placedOne; tries++) {
      const dir = Math.random() > 0.5 ? "h" : "v";
      const start = Math.floor(Math.random() * 100);
      const coords = getCoords(start, dir, len);
      if (coords && isValid(coords)) {
        coords.forEach(i => {
          const cell = playerBoard.querySelector(`[data-index='${i}']`);
          cell.classList.add("ship");
        });
        placed.push(coords);
        placedOne = true;
      }
    }
  }
  console.log("Авторасстановка завершена");
};



function isCellNearShip(index) {
  const around = [
    index - 11, index - 10, index - 9,
    index - 1,  index,      index + 1,
    index + 9,  index + 10, index + 11
  ];
  return around.some(i => {
    const c = document.querySelector(`#player-board [data-index='${i}']`);
    return c && c.classList.contains("ship");
  });
}

let currentShipLength = 4;
let direction = "horizontal";
let placedShips = [];
const shipLimits = { 4: 1, 3: 2, 2: 3, 1: 4 };
const placedMap = {};

document.getElementById("toggle-direction").onclick = () => {
  direction = direction === "horizontal" ? "vertical" : "horizontal";
};

document.querySelectorAll(".ship-option").forEach(opt => {
  opt.addEventListener("click", () => {
    currentShipLength = parseInt(opt.dataset.length);
    document.querySelectorAll(".ship-option").forEach(o => o.classList.remove("selected"));
    opt.classList.add("selected");
  });
});

function getCoords(index, dir, len) {
  const coords = [];
  for (let i = 0; i < len; i++) {
    let idx = dir === "horizontal" ? index + i : index + i * 10;
    if (idx >= 100) return null;
    if (dir === "horizontal" && Math.floor(idx / 10) !== Math.floor(index / 10)) return null;
    coords.push(idx);
  }
  return coords;
}

function valid(coords) {
  return coords.every(i => {
    const cell = document.querySelector(`#player-board [data-index='${i}']`);
    return cell && !cell.classList.contains("ship");
  });
}

document.getElementById("player-board").addEventListener("click", (e) => {
  const cell = e.target;
  if (!cell.classList.contains("cell")) return;

  const index = parseInt(cell.dataset.index);
  const coords = getCoords(index, direction, currentShipLength);
  if (!coords || !valid(coords) || coords.some(isCellNearShip)) return;

  if ((placedMap[currentShipLength] || 0) >= shipLimits[currentShipLength]) {
    alert("Все такие корабли уже размещены");
    return;
  }

  coords.forEach(i => {
    const c = document.querySelector(`#player-board [data-index='${i}']`);
    c.classList.add("ship");
  });
  placedMap[currentShipLength] = (placedMap[currentShipLength] || 0) + 1;
  placedShips.push(coords);
});

function totalShipsPlaced() {
  return Object.values(placedMap).reduce((sum, v) => sum + v, 0);
}

document.getElementById("ready-button").addEventListener("click", () => {
  if (totalShipsPlaced() === 10) {
    alert("Ты готов! Ждём соперника...");
    // Можно отправить socket.emit('ready'), если нужно
  } else {
    alert("Поставь все 10 кораблей (1x4, 2x3, 3x2, 4x1)");
  }
});



const socket = io();
socket.emit("join-room", { room, userId });

let isReady = false;
let isOpponentReady = false;
let isPlayerTurn = false;

// Когда оба игрока готовы — старт
socket.on("start-game", (data) => {
  alert("Игра началась!");
  isPlayerTurn = data.firstTurn === userId;
});

// Игрок нажал "Готово"
document.getElementById("ready-button").addEventListener("click", () => {
  if (totalShipsPlaced() === 10) {
    isReady = true;
    socket.emit("ready", { room, userId });
    alert("Ты готов! Ждём соперника...");
  } else {
    alert("Поставь все 10 кораблей");
  }
});

document.getElementById("opponent-board").addEventListener("click", (e) => {
  if (!isPlayerTurn || !isReady) return;
  const cell = e.target;
  const index = cell.dataset.index;
  socket.emit("fire", { room, index });
});

socket.on("fire-result", ({ index, result }) => {
  const cell = document.querySelector(`#opponent-board [data-index='${index}']`);
  if (cell) {
    cell.classList.add(result === "hit" ? "hit" : "miss");
    if (result === "miss") {
      isPlayerTurn = false;
    }
  }
});

socket.on("incoming-fire", ({ index }) => {
  const cell = document.querySelector(`#player-board [data-index='${index}']`);
  const isHit = cell && cell.classList.contains("ship");
  if (cell) {
    cell.classList.add(isHit ? "hit" : "miss");
  }
  socket.emit("return-fire", { room, index, result: isHit ? "hit" : "miss" });
  if (!isHit) isPlayerTurn = true;
});



window.autoPlaceShips = function () {
  const boardSize = 10;
  const shipList = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
  const playerBoard = document.getElementById("player-board");

  function getCoords(start, dir, len) {
    const coords = [];
    for (let i = 0; i < len; i++) {
      const idx = dir === "h" ? start + i : start + i * boardSize;
      if (idx >= 100) return null;
      if (dir === "h" && Math.floor(idx / 10) !== Math.floor(start / 10)) return null;
      coords.push(idx);
    }
    return coords;
  }

  function getBufferZone(coords) {
    const buffer = new Set();
    coords.forEach(i => {
      const row = Math.floor(i / 10);
      const col = i % 10;
      for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
          if (r >= 0 && r < 10 && c >= 0 && c < 10) {
            buffer.add(r * 10 + c);
          }
        }
      }
    });
    return Array.from(buffer);
  }

  function validWithBuffer(coords) {
    const buffer = getBufferZone(coords);
    return buffer.every(i => {
      const cell = playerBoard.querySelector(`[data-index='${i}']`);
      return cell && !cell.classList.contains("ship");
    });
  }

  document.querySelectorAll(".cell.ship").forEach(c => c.classList.remove("ship"));

  const placed = [];
  let tries = 0;

  for (const len of shipList) {
    let placedOne = false;
    for (; tries < 5000 && !placedOne; tries++) {
      const dir = Math.random() > 0.5 ? "h" : "v";
      const start = Math.floor(Math.random() * 100);
      const coords = getCoords(start, dir, len);
      if (coords && validWithBuffer(coords)) {
        coords.forEach(i => {
          const cell = playerBoard.querySelector(`[data-index='${i}']`);
          cell.classList.add("ship");
        });
        placed.push(coords);
        placedOne = true;
      }
    }
  }

  if (placed.length !== 10) {
    alert("Не удалось расставить все корабли автоматически. Попробуй ещё раз.");
  } else {
    console.log("Авторасстановка завершена");
  }
};
