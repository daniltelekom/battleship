const playerBoard = document.getElementById("player-board");
const opponentBoard = document.getElementById("opponent-board");
const rotateBtn = document.getElementById("rotate-btn");
const readyBtn = document.getElementById("ready-btn");
let direction = "horizontal";
let shipsPlaced = 0;
let playerShips = [];
const shipList = [4,3,3,2,2,2,1,1,1,1];
const socket = io();

rotateBtn.onclick = () => {
  direction = direction === "horizontal" ? "vertical" : "horizontal";
};

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

playerBoard.addEventListener("click", (e) => {
  const index = parseInt(e.target.dataset.index);
  const length = shipList[shipsPlaced];
  if (!length) return;
  const coords = getShipCoords(index, direction, length);
  if (coords && isValid(coords)) {
    coords.forEach(i => {
      const cell = playerBoard.querySelector(`[data-index='${i}']`);
      cell.style.backgroundImage = `url('/assets/ships/ship-${length}-${direction[0]}.png')`;
      cell.classList.add("ship");
    });
    playerShips.push(coords);
    shipsPlaced++;
  }
});

function getShipCoords(start, dir, length) {
  const coords = [];
  for (let i = 0; i < length; i++) {
    const index = dir === "horizontal" ? start + i : start + i * 10;
    if (index >= 100) return null;
    if (dir === "horizontal" && Math.floor(index / 10) !== Math.floor(start / 10)) return null;
    coords.push(index);
  }
  return coords;
}

function isValid(coords) {
  return coords.every(i => {
    const cell = playerBoard.querySelector(`[data-index='${i}']`);
    return cell && !cell.classList.contains("ship");
  });
}

opponentBoard.addEventListener("click", (e) => {
  const index = parseInt(e.target.dataset.index);
  socket.emit("fire", index);
});

socket.on("fire-result", ({ index, result }) => {
  const cell = opponentBoard.querySelector(`[data-index='${index}']`);
  if (result === "hit") cell.classList.add("hit");
});