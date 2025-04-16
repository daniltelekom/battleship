
// ... (твой основной код выше, размещение, стрельба, socket.io и т.п.)

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
