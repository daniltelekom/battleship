
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
