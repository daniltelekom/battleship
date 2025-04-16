
// подключение полей, socket, autoPlaceShips и прочее...

window.autoPlaceShips = autoPlaceShips;

window.inviteFriend = function () {
  const tg = window.Telegram.WebApp;
  const userId = window.battleshipApp?.userId || "guest";
  const botName = "battlesea_ship_bot";

  const link = `https://t.me/${botName}?startapp=${userId}`;
  Telegram.WebApp.openTelegramLink(
    `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent("Присоединяйся в морской бой!")}`
  );
};


let currentShipLength = 4;

document.querySelectorAll(".ship-option").forEach(opt => {
  opt.addEventListener("click", () => {
    currentShipLength = parseInt(opt.dataset.length);
    document.querySelectorAll(".ship-option").forEach(o => o.classList.remove("selected"));
    opt.classList.add("selected");
  });
});

const placedShipsMap = {};
const shipLimits = { 4: 1, 3: 2, 2: 3, 1: 4 };

function canPlaceShip(length) {
  return (placedShipsMap[length] || 0) < shipLimits[length];
}

playerBoard.addEventListener("click", e => {
  if (isPlayerReady || !currentShipLength) return;
  const index = parseInt(e.target.dataset.index);
  const coords = getCoords(index, direction, currentShipLength);
  if (coords && valid(coords) && canPlaceShip(currentShipLength)) {
    coords.forEach(i => {
      const cell = playerBoard.querySelector(`[data-index='${i}']`);
      cell.classList.remove("preview");
      cell.classList.add("ship");
    });
    playerShips.push(coords);
    placedShipsMap[currentShipLength] = (placedShipsMap[currentShipLength] || 0) + 1;
  }
});

readyBtn.onclick = () => {
  const totalPlaced = Object.values(placedShipsMap).reduce((sum, v) => sum + v, 0);
  if (totalPlaced === 10) {
    socket.emit("ready", { userId });
  } else {
    alert("Поставь все корабли!");
  }
};


playerBoard.addEventListener("click", e => {
  if (isPlayerReady) return;
  const index = parseInt(e.target.dataset.index);
  const cell = playerBoard.querySelector(`[data-index='${index}']`);
  if (cell && cell.classList.contains("ship")) {
    // Найдём весь корабль по координате
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
        if (parseInt(o.dataset.length) === len) {
          o.classList.add("selected");
        } else {
          o.classList.remove("selected");
        }
      });
    }
    return;
  }

  // Иначе попытка разместить новый корабль
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
