
document.addEventListener("DOMContentLoaded", () => {
  const playerBoard = document.getElementById("player-board");
  const opponentBoard = document.getElementById("opponent-board");

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

  let currentShipLength = 4;
  let direction = "horizontal";
  const placedShips = [];
  const shipLimits = { 4: 1, 3: 2, 2: 3, 1: 4 };
  const placedMap = { 4: 0, 3: 0, 2: 0, 1: 0 };

  document.getElementById("toggle-direction").onclick = () => {
    direction = direction === "horizontal" ? "vertical" : "horizontal";
    for (let i = 1; i <= 4; i++) {
      const icon = document.getElementById("icon-" + i);
      if (icon) icon.src = "assets/icons/ship-" + i + "-" + direction[0] + ".png";
    }
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

  function valid(coords) {
    const buffer = getBufferZone(coords);
    return buffer.every(i => {
      const cell = document.querySelector(`#player-board [data-index='${i}']`);
      return cell && !cell.classList.contains("ship");
    });
  }

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

    coords.forEach((i, idx) => {
      const c = document.querySelector(`#player-board [data-index='${i}']`);
      c.classList.add("ship");
      c.classList.add(`ship-${currentShipLength}-${direction[0]}-${idx}`);
    });

    placedMap[currentShipLength]++;
    placedShips.push(coords);
  });

  window.autoPlaceShips = function () {
    document.querySelectorAll(".cell.ship").forEach(c => c.className = "cell");
    Object.keys(placedMap).forEach(k => placedMap[k] = 0);
    const shipList = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];

    for (const len of shipList) {
      let placedOne = false;
      for (let attempt = 0; attempt < 100 && !placedOne; attempt++) {
        const dir = Math.random() < 0.5 ? "horizontal" : "vertical";
        const start = Math.floor(Math.random() * 100);
        const coords = getCoords(start, dir, len);
        if (coords && valid(coords)) {
          coords.forEach((i, idx) => {
            const c = document.querySelector(`#player-board [data-index='${i}']`);
            c.classList.add("ship");
            c.classList.add(`ship-${len}-${dir[0]}-${idx}`);
          });
          placedMap[len]++;
          placedShips.push(coords);
          placedOne = true;
        }
      }
    }

    if (placedShips.length !== 10) {
      alert("Не удалось расставить все корабли. Попробуй снова.");
    }
  };

  let previewCoords = [];
  playerBoard.addEventListener("mousemove", (e) => {
    if (!e.target.classList.contains("cell")) return;
    previewCoords.forEach(i => {
      const c = document.querySelector(`#player-board [data-index='${i}']`);
      if (c && !c.classList.contains("ship")) c.classList.remove("preview");
    });
    const index = parseInt(e.target.dataset.index);
    const coords = getCoords(index, direction, currentShipLength);
    if (!coords) return;
    previewCoords = coords;
    coords.forEach(i => {
      const c = document.querySelector(`#player-board [data-index='${i}']`);
      if (c && !c.classList.contains("ship")) c.classList.add("preview");
    });
  });

  playerBoard.addEventListener("mouseleave", () => {
    previewCoords.forEach(i => {
      const c = document.querySelector(`#player-board [data-index='${i}']`);
      if (c && !c.classList.contains("ship")) c.classList.remove("preview");
    });
  });

  const inviteBtn = document.getElementById("invite-button");
  if (inviteBtn) {
    inviteBtn.addEventListener("click", () => {
      const tg = window.Telegram?.WebApp;
      const userId = tg?.initDataUnsafe?.user?.id || "guest" + Math.floor(Math.random() * 10000);
      const botName = "battlesea_ship_bot";
      const link = `https://t.me/${botName}?startapp=${userId}`;
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent("Присоединяйся в морской бой!")}`;

      if (tg?.openTelegramLink) {
        tg.openTelegramLink(shareUrl);
      } else {
        window.open(shareUrl, "_blank");
      }
    });
  }
});



document.getElementById("invite-button").addEventListener("click", () => {
  const tg = window.Telegram?.WebApp;
  const botName = "battlesea_ship_bot";

  let userId = "guest" + Math.floor(Math.random() * 10000);
  if (tg?.initDataUnsafe?.user?.id) {
    userId = tg.initDataUnsafe.user.id;
    console.log("Telegram user ID:", userId);
  } else {
    console.warn("Telegram user ID не найден, используется guest ID");
  }

  const link = `https://t.me/${botName}?startapp=${userId}`;
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent("Играй со мной в Морской Бой!")}`;

  if (tg?.openTelegramLink) {
    try {
      tg.openTelegramLink(shareUrl);
    } catch (err) {
      console.error("Ошибка при openTelegramLink:", err);
      window.open(shareUrl, "_blank");
    }
  } else {
    console.warn("tg.openTelegramLink недоступен, fallback на window.open");
    window.open(shareUrl, "_blank");
  }
});
