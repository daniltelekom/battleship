
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
window.autoPlaceShips = function () {
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



window.autoPlaceShips = function () {
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
