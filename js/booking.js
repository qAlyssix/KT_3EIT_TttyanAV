const zones = {
  C: { name: "Comfort", color: "#ff7a00", prices: [100, 270, 420, 450] },
  V: { name: "VIP", color: "#ffc23d", prices: [120, 330, 520, 550] },
  B: { name: "Bootcamp", color: "#ff4d3d", prices: [130, 360, 560, 600] },
  S: { name: "Squad", color: "#b56bff", prices: [140, 390, 600, 650] },
  P: { name: "PS5", color: "#3d8bff", prices: [150, 400, 600, 700] },
};

const layout = [
  "CCCCCC..PP",
  "CCCCCC....",
  "..........",
  "VVVV.BBBBB",
  "VVVV.SSSSS",
];

const busy = ["C3", "C8", "V2", "B4", "S1", "P2"];

const hall = document.getElementById("hall");
const chips = document.getElementById("chips");
const totalEl = document.getElementById("total");
const packageSelect = document.getElementById("package");
const info = document.getElementById("seat-info");
const modal = document.getElementById("modal");

const seats = [];
const counters = {};
let cursor = null;
let dragging = false;
let dragMode = true;

layout.forEach((line, row) => {
  if (!line.replaceAll(".", "")) {
    const gap = document.createElement("div");
    gap.className = "aisle-row";
    hall.appendChild(gap);
    return;
  }

  [...line].forEach((letter, col) => {
    if (letter === ".") {
      hall.appendChild(document.createElement("div"));
      return;
    }

    counters[letter] = (counters[letter] || 0) + 1;
    const zone = zones[letter];
    const el = document.createElement("div");
    el.className = "seat";
    el.textContent = letter + counters[letter];
    el.style.setProperty("--c", zone.color);

    const seat = { id: el.textContent, row, col, zone, el };
    if (busy.includes(seat.id)) el.classList.add("busy");

    el.addEventListener("mousedown", (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      moveCursor(seat);

      if (isBusy(seat)) {
        shake(seat);
        return;
      }

      dragging = true;
      dragMode = !el.classList.contains("selected");
      setSeat(seat, dragMode);
    });

    el.addEventListener("mouseover", () => {
      if (dragging) setSeat(seat, dragMode);
    });

    el.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      showInfo(seat, event.clientX, event.clientY);
    });

    seats.push(seat);
    hall.appendChild(el);
  });
});

document.addEventListener("mouseup", () => {
  dragging = false;
});

document.getElementById("legend").innerHTML =
  Object.values(zones)
    .map((z) => `<span><i style="--c: ${z.color}"></i>${z.name}</span>`)
    .join("") + `<span><i class="legend-busy"></i>Занято</span>`;

function isBusy(seat) {
  return seat.el.classList.contains("busy");
}

function setSeat(seat, on) {
  if (isBusy(seat)) return;
  seat.el.classList.toggle("selected", on);
  updateForm();
}

function shake(seat) {
  seat.el.classList.remove("shake");
  void seat.el.offsetWidth;
  seat.el.classList.add("shake");
}

function selectedSeats() {
  return seats.filter((s) => s.el.classList.contains("selected"));
}

function clearAll() {
  seats.forEach((s) => s.el.classList.remove("selected"));
  updateForm();
}

function showInfo(seat, x, y) {
  info.innerHTML = `<b>${seat.id}</b> · ${seat.zone.name}<br>` +
    (isBusy(seat) ? "Сейчас занято" : `от ${seat.zone.prices[0]} ₽/час`);
  info.style.left = x + 14 + "px";
  info.style.top = y + 14 + "px";
  info.classList.add("show");
  clearTimeout(info.timer);
  info.timer = setTimeout(() => info.classList.remove("show"), 2500);
}

function moveCursor(seat) {
  if (cursor) cursor.el.classList.remove("cursor");
  cursor = seat;
  cursor.el.classList.add("cursor");
}

function findNext(dRow, dCol) {
  if (!cursor) return seats[0];

  if (dCol !== 0) {
    const sameRow = seats.filter(
      (s) => s.row === cursor.row && Math.sign(s.col - cursor.col) === dCol
    );
    sameRow.sort((a, b) => Math.abs(a.col - cursor.col) - Math.abs(b.col - cursor.col));
    return sameRow[0] || cursor;
  }

  const others = seats.filter((s) => Math.sign(s.row - cursor.row) === dRow);
  if (others.length === 0) return cursor;

  const nearestRow = others.reduce((best, s) =>
    Math.abs(s.row - cursor.row) < Math.abs(best.row - cursor.row) ? s : best
  ).row;

  const candidates = seats.filter((s) => s.row === nearestRow);
  candidates.sort((a, b) => Math.abs(a.col - cursor.col) - Math.abs(b.col - cursor.col));
  return candidates[0];
}

function updateForm() {
  const list = selectedSeats();
  const pack = Number(packageSelect.value);

  chips.innerHTML = list.length
    ? list.map((s) => `<span class="chip" style="--c: ${s.zone.color}">${s.id} · ${s.zone.name}</span>`).join("")
    : `<span class="muted">Пока ничего не выбрано</span>`;

  let total = list.reduce((sum, s) => sum + s.zone.prices[pack], 0);

  const promo = activePromo();
  if (promo && list.length) {
    const percent = parseInt(promo.prize.replace(/\D/g, ""));
    if (promo.prize.includes("%")) total = Math.round(total * (1 - percent / 100));
    if (promo.prize === "1 час") total = Math.max(0, total - 100);
  }

  totalEl.textContent = total + " ₽";
}

const timeInput = document.getElementById("time");

function onPackageChange() {
  const isNight = packageSelect.value === "3";
  if (isNight) timeInput.value = "22:00";
  timeInput.disabled = isNight;
  updateForm();
}

packageSelect.addEventListener("change", onPackageChange);

const phone = document.getElementById("phone");

phone.addEventListener("input", () => {
  let digits = phone.value.replace(/\D/g, "");
  if (digits.startsWith("7") || digits.startsWith("8")) digits = digits.slice(1);
  digits = digits.slice(0, 10);

  let result = "+7";
  if (digits.length > 0) result += " (" + digits.slice(0, 3);
  if (digits.length >= 3) result += ")";
  if (digits.length > 3) result += " " + digits.slice(3, 6);
  if (digits.length > 6) result += "-" + digits.slice(6, 8);
  if (digits.length > 8) result += "-" + digits.slice(8, 10);

  phone.value = digits.length ? result : "";
});

const promoInput = document.getElementById("promo");
const promoStatus = document.getElementById("promo-status");

function activePromo() {
  const savedSpin = JSON.parse(localStorage.getItem("pz-spin"));
  const value = promoInput.value.trim().toUpperCase();
  if (savedSpin && savedSpin.code && value === savedSpin.code) return savedSpin;
  return null;
}

function checkPromo() {
  const promo = activePromo();
  promoStatus.className = "promo-status";

  if (promoInput.value.trim() === "") {
    promoStatus.textContent = "";
  } else if (!promo) {
    promoStatus.textContent = "Такого промокода нет";
    promoStatus.classList.add("bad");
  } else if (promo.prize.includes("%") || promo.prize === "1 час") {
    promoStatus.textContent = "Промокод применён: " + promo.prize;
    promoStatus.classList.add("ok");
  } else {
    promoStatus.textContent = "Подарок «" + promo.prize + "» — получите на ресепшене";
    promoStatus.classList.add("ok");
  }

  updateForm();
}

promoInput.addEventListener("keyup", checkPromo);
promoInput.addEventListener("input", checkPromo);


const dateInput = document.getElementById("date");
const today = new Date();
const iso = new Date(today - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
dateInput.value = iso;
dateInput.min = iso;

function launchConfetti() {
  const colors = ["#ff7a00", "#ffa53d", "#ffc23d", "#ffffff", "#ff4d3d"];

  for (let i = 0; i < 90; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti";
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = 1.5 + Math.random() * 1.5 + "s";
    piece.style.animationDelay = Math.random() * 0.3 + "s";
    piece.style.setProperty("--drift", Math.random() * 200 - 100 + "px");
    document.body.appendChild(piece);
    piece.addEventListener("animationend", () => piece.remove());
  }
}

document.getElementById("form").addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.getElementById("name");
  const list = selectedSeats();
  name.classList.remove("error");
  phone.classList.remove("error");

  if (list.length === 0) {
    seats.forEach((s) => { if (!isBusy(s)) shake(s); });
    return;
  }
  if (name.value.trim().length < 2) {
    name.classList.add("error");
    name.focus();
    return;
  }
  if (phone.value.replace(/\D/g, "").length < 11) {
    phone.classList.add("error");
    phone.focus();
    return;
  }

  const date = new Date(dateInput.value).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  const time = timeInput.value;

  document.getElementById("modal-text").innerHTML =
    `${name.value.trim()}, места <b>${list.map((s) => s.id).join(", ")}</b> ждут вас ${date} в ${time}.<br>Сумма: <b>${totalEl.textContent}</b>`;

  list.forEach((s) => {
    s.el.classList.remove("selected");
    s.el.classList.add("busy");
  });

  modal.classList.add("open");
  launchConfetti();
  event.target.reset();
  dateInput.value = iso;
  promoStatus.textContent = "";
  onPackageChange();
});

function closeModal() {
  modal.classList.remove("open");
}

document.getElementById("modal-ok").addEventListener("click", closeModal);

document.addEventListener("click", () => info.classList.remove("show"));

document.addEventListener("keydown", (event) => {
  if (modal.classList.contains("open")) {
    if (event.key === "Escape" || event.key === "Enter") closeModal();
    return;
  }

  if (isTyping(event)) return;

  const moves = {
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1],
  };

  if (moves[event.key]) {
    event.preventDefault();
    moveCursor(findNext(...moves[event.key]));
  } else if (event.code === "Space" && cursor) {
    event.preventDefault();
    if (isBusy(cursor)) shake(cursor);
    else setSeat(cursor, !cursor.el.classList.contains("selected"));
  } else if (event.key === "Escape") {
    clearAll();
  }
});

updateForm();