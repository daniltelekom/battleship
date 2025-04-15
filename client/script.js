
const playerBoard = document.getElementById("player-board");
const opponentBoard = document.getElementById("opponent-board");
const toggleBtn = document.getElementById("toggle-direction");
const readyBtn = document.getElementById("ready-button");

let direction = 'horizontal';
let playerShips = [];
let currentShipLength = 4;

function createBoard(board) {
  for (let i = 0; i < 100; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = i;
    board.appendChild(cell);
  }
}

createBoard(playerBoard);
createBoard(opponentBoard);

function isValidPlacement(startIndex, direction, length) {
  const indexes = [];
  for (let i = 0; i < length; i++) {
    let index = direction === 'horizontal' ? startIndex + i : startIndex + i * 10;
    if (index >= 100 || (direction === 'horizontal' && Math.floor(index / 10) !== Math.floor(startIndex / 10))) return null;
    const cell = playerBoard.querySelector(`[data-index='${index}']`);
    if (!cell || cell.classList.contains('ship')) return null;
    indexes.push(index);
  }
  return indexes;
}

function placeShip(startIndex, length) {
  const indexes = isValidPlacement(startIndex, direction, length);
  if (indexes) {
    indexes.forEach(i => {
      const cell = playerBoard.querySelector(`[data-index='${i}']`);
      cell.classList.add('ship');
      cell.style.backgroundImage = `url('assets/ships/ship-${length}-${direction[0]}.png')`;
    });
    playerShips.push(indexes);
  } else {
    alert('Нельзя ставить сюда корабль!');
  }
}

playerBoard.addEventListener('click', e => {
  if (playerShips.length >= 10) return;
  const index = parseInt(e.target.dataset.index);
  if (playerShips.length === 0) currentShipLength = 4;
  else if (playerShips.length < 3) currentShipLength = 3;
  else if (playerShips.length < 6) currentShipLength = 2;
  else currentShipLength = 1;
  placeShip(index, currentShipLength);
});

toggleBtn.onclick = () => {
  direction = direction === 'horizontal' ? 'vertical' : 'horizontal';
};

const socket = io();
readyBtn.onclick = () => {
  if (playerShips.length === 10) {
    socket.emit('player-ready');
  } else {
    alert('Поставь все корабли!');
  }
};

opponentBoard.addEventListener('click', (e) => {
  const index = parseInt(e.target.dataset.index);
  socket.emit('shoot', index);
});

socket.on('shoot-result', ({ index, result }) => {
  const cell = opponentBoard.querySelector(`[data-index='${index}']`);
  if (result === 'hit') {
    cell.classList.add('hit');
  } else {
    cell.classList.add('miss');
  }
});
