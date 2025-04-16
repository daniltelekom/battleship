
document.addEventListener("DOMContentLoaded", () => {
  const playerBoard = document.getElementById("player-board");

  function createBoard(board) {
    for (let i = 0; i < 100; i++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.index = i;
      board.appendChild(cell);
    }
  }

  createBoard(playerBoard);

  let currentShipLength = 4;
  let direction = "horizontal";
  const placedShips = [];

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

  function getCoords(start, dir, len) {
    const coords = [];
    for (let i = 0; i < len; i++) {
      let idx = dir === "horizontal" ? start + i : start + i * 10;
      if (idx >= 100 || (dir === "horizontal" && Math.floor(idx / 10) !== Math.floor(start / 10))) return null;
      coords.push(idx);
    }
    return coords;
  }

  
  function getBufferZone(coords) {
    const buffer = new Set();
    coords.forEach(i => {
      const r = Math.floor(i / 10);
      const c = i % 10;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < 10 && nc >= 0 && nc < 10) {
            buffer.add(nr * 10 + nc);
          }
        }
      }
    });
    return Array.from(buffer);
  }

  function valid(coords) {
    const buffer = getBufferZone(coords);
    return buffer.every(i => {
      const cell = document.querySelector(`#player-board [data-index='${i}']`);
      return cell && !cell.classList.contains("ship");
    });
  }

    return coords.every(i => {
      const cell = document.querySelector(`#player-board [data-index='${i}']`);
      return cell && !cell.classList.contains("ship");
    });
  }

  const shipLimits = { 4: 1, 3: 2, 2: 3, 1: 4 };
  const placedMap = { 4: 0, 3: 0, 2: 0, 1: 0 };

  playerBoard.addEventListener("click", (e) => {
    const cell = e.target;
    if (!cell.classList.contains("cell")) return;

    const index = parseInt(cell.dataset.index);
    const coords = getCoords(index, direction, currentShipLength);
    if (!coords || !valid(coords)) return;

    if (placedMap[currentShipLength] >= shipLimits[currentShipLength]) {
      alert(`Максимум кораблей длины ${currentShipLength} уже установлен`);
      return;
    }

    coords.forEach(i => {
      const c = document.querySelector(`#player-board [data-index='${i}']`);
      c.classList.add("ship");
    });

    placedMap[currentShipLength]++;
    placedShips.push(coords);
  });
  });

  // заменено авторазмещение
    document.querySelectorAll(".cell.ship").forEach(c => c.classList.remove("ship"));
    const shipList = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
    const placed = [];

    function isValid(coords) {
      return coords && coords.every(i => {
        const cell = playerBoard.querySelector(`[data-index='${i}']`);
        return cell && !cell.classList.contains("ship");
      });
    }

    for (const len of shipList) {
      let placedOne = false;
      for (let attempt = 0; attempt < 100 && !placedOne; attempt++) {
        const dir = Math.random() < 0.5 ? "horizontal" : "vertical";
        const start = Math.floor(Math.random() * 100);
        const coords = getCoords(start, dir, len);
        if (isValid(coords)) {
          coords.forEach(i => {
            const c = playerBoard.querySelector(`[data-index='${i}']`);
            c.classList.add("ship");
          });
          placed.push(coords);
          placedOne = true;
        }
      }
    }
  };
});



  window.autoPlaceShips = function () {
    document.querySelectorAll(".cell.ship").forEach(c => c.classList.remove("ship"));
    const shipLimits = { 4: 1, 3: 2, 2: 3, 1: 4 };
    const shipList = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
    const placed = [];

    function getCoords(start, dir, len) {
      const coords = [];
      for (let i = 0; i < len; i++) {
        const idx = dir === "horizontal" ? start + i : start + i * 10;
        if (idx >= 100 || (dir === "horizontal" && Math.floor(idx / 10) !== Math.floor(start / 10))) return null;
        coords.push(idx);
      }
      return coords;
    }

    function getBufferZone(coords) {
      const buffer = new Set();
      coords.forEach(i => {
        const r = Math.floor(i / 10);
        const c = i % 10;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < 10 && nc >= 0 && nc < 10) {
              buffer.add(nr * 10 + nc);
            }
          }
        }
      });
      return Array.from(buffer);
    }

    function isValid(coords) {
      const buffer = getBufferZone(coords);
      return buffer.every(i => {
        const cell = document.querySelector(`#player-board [data-index='${i}']`);
        return cell && !cell.classList.contains("ship");
      });
    }

    for (const len of shipList) {
      let placedOne = false;
      for (let attempt = 0; attempt < 100 && !placedOne; attempt++) {
        const dir = Math.random() < 0.5 ? "horizontal" : "vertical";
        const start = Math.floor(Math.random() * 100);
        const coords = getCoords(start, dir, len);
        if (coords && isValid(coords)) {
          coords.forEach(i => {
            const c = document.querySelector(`#player-board [data-index='${i}']`);
            c.classList.add("ship");
          });
          placed.push(coords);
          placedOne = true;
        }
      }
    }

    if (placed.length !== 10) {
      alert("Не удалось расставить все корабли. Попробуй снова.");
    } else {
      console.log("Корабли расставлены корректно.");
    }
  };
