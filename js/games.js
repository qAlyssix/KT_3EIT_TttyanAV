const games = [
  { name: "Counter-Strike 2", mono: "CS2", genre: "Шутеры", players: "5 на 5", img: "cs2.jpg", colors: ["#f2a900", "#3a2a00"], text: "Командный тактический шутер: закладка бомбы, точная стрельба и экономика раундов." },
  { name: "Dota 2", mono: "D2", genre: "MOBA", players: "5 на 5", img: "dota2.jpg", colors: ["#c23c2a", "#2a0c08"], text: "Две команды героев разрушают базу соперника. Больше сотни персонажей и бесконечные тактики." },
  { name: "Valorant", mono: "VAL", genre: "Шутеры", players: "5 на 5", img: "valorant.jpg", colors: ["#ff4655", "#2b0a0e"], text: "Тактический шутер с агентами и способностями. Важны и меткость, и командная работа." },
  { name: "PUBG: Battlegrounds", mono: "PUBG", genre: "Королевская битва", players: "до 4", img: "pubg.jpg", colors: ["#e8a33b", "#2b1c06"], text: "Сто игроков на острове, сужающаяся зона и только один победитель." },
  { name: "Fortnite", mono: "FN", genre: "Королевская битва", players: "до 4", img: "fortnite.jpg", colors: ["#7b4dff", "#140a33"], text: "Яркая королевская битва со строительством укрытий прямо во время боя." },
  { name: "Apex Legends", mono: "APX", genre: "Королевская битва", players: "до 3", img: "apex.jpg", colors: ["#da292a", "#260707"], text: "Быстрая королевская битва отрядами по три героя с уникальными умениями." },
  { name: "Rust", mono: "RST", genre: "Выживание", players: "команда", img: "rust.jpg", colors: ["#cd412b", "#2a0d08"], text: "Выживание в суровом мире: добывайте ресурсы, стройте базу и защищайте её." },
  { name: "Grand Theft Auto V", mono: "GTA", genre: "Открытый мир", players: "соло / онлайн", img: "gta5.jpg", colors: ["#3fae5a", "#0a2611"], text: "Огромный город, сюжетная кампания и онлайн-режим с друзьями." },
  { name: "Call of Duty: Warzone", mono: "COD", genre: "Королевская битва", players: "до 4", img: "warzone.jpg", colors: ["#7f8c6a", "#181c12"], text: "Масштабная королевская битва с реалистичным оружием и техникой." },
  { name: "Escape from Tarkov", mono: "EFT", genre: "Шутеры", players: "до 5", img: "tarkov.jpg", colors: ["#9b8b6a", "#1f1a10"], text: "Хардкорный шутер: заходите на локацию, собирайте добычу и пытайтесь выбраться живым." },
  { name: "Minecraft", mono: "MC", genre: "Выживание", players: "соло / сервер", img: "minecraft.jpg", colors: ["#5d9e3a", "#16260d"], text: "Мир из кубиков, где можно построить всё что угодно — одному или с друзьями." },
  { name: "Genshin Impact", mono: "GI", genre: "Открытый мир", players: "соло / до 4", img: "genshin.jpg", colors: ["#4fa3e0", "#0b1d33"], text: "Красивый открытый мир, стихийная магия и команда из четырёх героев." },
];

const grid = document.getElementById("games");
const search = document.getElementById("search");
const genresBox = document.getElementById("genres");
const empty = document.getElementById("empty");
const modal = document.getElementById("modal");

let genre = "Все";
let opened = -1;
let clickTimer;

games.forEach((game, i) => {
  const card = document.createElement("div");
  card.className = "game";
  card.style.setProperty("--a", game.colors[0]);
  card.style.setProperty("--b", game.colors[1]);
  card.style.animationDelay = i * 0.05 + "s";
  card.innerHTML = `
    <span class="game-mono">${game.mono}</span>
    <span class="game-star">★</span>
    <div class="game-info">
      <span>${game.genre}</span>
      <h3>${game.name}</h3>
    </div>`;

  const picture = new Image();
  picture.src = "img/games/" + game.img;
  picture.onload = () => {
    card.style.setProperty("--img", `url(${picture.src})`);
    card.classList.add("has-img");
  };

  card.addEventListener("click", () => {
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => showGame(i), 250);
  });

  card.addEventListener("dblclick", () => {
    clearTimeout(clickTimer);
    card.classList.toggle("fav");
    if (genre === "★ Избранное") applyFilter();
  });

  game.card = card;
  grid.appendChild(card);
});

["Все", "★ Избранное", ...new Set(games.map((g) => g.genre))].forEach((name) => {
  const button = document.createElement("button");
  button.className = "tab";
  button.textContent = name;
  if (name === "Все") button.classList.add("active");

  button.addEventListener("click", () => {
    genre = name;
    genresBox.querySelectorAll(".tab").forEach((b) => {
      b.classList.toggle("active", b === button);
    });
    applyFilter();
  });

  genresBox.appendChild(button);
});

function applyFilter() {
  const text = search.value.trim().toLowerCase();
  let shown = 0;

  games.forEach((game) => {
    const okGenre =
      genre === "Все" ||
      game.genre === genre ||
      (genre === "★ Избранное" && game.card.classList.contains("fav"));
    const okText = game.name.toLowerCase().includes(text);
    const visible = okGenre && okText;

    game.card.classList.toggle("hidden", !visible);
    if (visible) shown++;
  });

  empty.style.display = shown ? "none" : "block";
}

search.addEventListener("keyup", applyFilter);

function showGame(i) {
  opened = i;
  const game = games[i];
  const hasImg = game.card.classList.contains("has-img");
  const cover = document.getElementById("modal-cover");

  cover.textContent = hasImg ? "" : game.mono;
  cover.style.background = hasImg
    ? `center / cover url(img/games/${game.img})`
    : `linear-gradient(160deg, ${game.colors[0]}, ${game.colors[1]})`;

  document.getElementById("modal-title").textContent = game.name;
  document.getElementById("modal-tags").innerHTML =
    `<span class="tag">${game.genre}</span><span class="tag">Игроков: ${game.players}</span>`;
  document.getElementById("modal-text").textContent = game.text;

  modal.classList.add("open");
}

function closeModal() {
  modal.classList.remove("open");
  opened = -1;
}

function switchGame(step) {
  const list = games
    .map((game, i) => i)
    .filter((i) => !games[i].card.classList.contains("hidden"));
  const position = list.indexOf(opened);
  showGame(list[(position + step + list.length) % list.length]);
}

document.getElementById("modal-close").addEventListener("click", closeModal);
document.getElementById("prev").addEventListener("click", () => switchGame(-1));
document.getElementById("next").addEventListener("click", () => switchGame(1));

modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});

document.addEventListener("keydown", (event) => {
  if (opened === -1) return;
  if (event.key === "Escape") closeModal();
  if (event.key === "ArrowRight") switchGame(1);
  if (event.key === "ArrowLeft") switchGame(-1);
});