
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
  return coords.every(i => {
    const cell = playerBoard.querySelector(`[data-index='${i}']`);
    return cell && !cell.classList.contains("ship");
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
