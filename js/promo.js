const prizes = [
  "1 час",
  "−10%",
  "Энергетик",
  "−20%",
  "Пусто",
  "+30 мин",
  "−15%",
  "Снеки",
];

const wheel = document.getElementById("wheel");
const prizeBox = document.getElementById("prize");
const spinButton = document.getElementById("spin");
const sector = 360 / prizes.length;
const today = new Date().toDateString();

let rotation = 0;
let spinning = false;
let promoCode = "";
let saved = JSON.parse(localStorage.getItem("pz-spin")) || null;

const stops = prizes.map((prize, i) => {
  const color = i % 2 === 0 ? "#ff7a00" : "#1a1a1a";
  return `${color} ${i * sector}deg ${(i + 1) * sector}deg`;
});
wheel.style.background = `conic-gradient(from ${-sector / 2}deg, ${stops.join(", ")})`;

prizes.forEach((prize, i) => {
  const label = document.createElement("span");
  label.className = "wheel-label";
  label.textContent = prize;
  label.style.color = i % 2 === 0 ? "#111" : "#fff";
  label.style.setProperty("--angle", i * sector + "deg");
  wheel.appendChild(label);
});

function spunToday() {
  return saved !== null && saved.date === today;
}

function lockWheel() {
  spinButton.disabled = true;
  spinButton.textContent = "Следующая попытка завтра";
  wheel.classList.add("locked");
}

function showEmpty() {
  promoCode = "";
  prizeBox.innerHTML = `
    <p class="muted">Сегодня без приза:</p>
    <h3 class="title prize-name">Пусто</h3>
    <p class="muted">Попробуйте завтра — обязательно повезёт!</p>`;
}

function showPrize(prize, code) {
  promoCode = code;
  prizeBox.innerHTML = `
    <p class="muted">Ваш приз на сегодня:</p>
    <h3 class="title prize-name">${prize}</h3>
    <div class="code" id="code" title="Нажмите, чтобы скопировать">${code}</div>`;

  document.getElementById("code").addEventListener("click", copyCode);
}

function spin() {
  if (spinning) return;

  if (spunToday()) {
    prizeBox.classList.remove("shake");
    void prizeBox.offsetWidth;
    prizeBox.classList.add("shake");
    return;
  }

  spinning = true;
  prizeBox.innerHTML = `<p class="muted">Крутим…</p>`;

  rotation += 360 * 5 + Math.random() * 360;
  wheel.style.transform = `rotate(${rotation}deg)`;
}

wheel.addEventListener("transitionend", () => {
  spinning = false;

  const angle = (360 - (rotation % 360)) % 360;
  const index = Math.round(angle / sector) % prizes.length;
  const prize = prizes[index];

  let code = "";
  if (prize !== "Пусто") {
    code = "PZ-" + Math.random().toString(36).slice(2, 7).toUpperCase();
  }

  saved = { date: today, prize: prize, code: code };
  localStorage.setItem("pz-spin", JSON.stringify(saved));

  if (code) showPrize(prize, code);
  else showEmpty();
  lockWheel();
});

function copyCode() {
  if (!promoCode) return;
  navigator.clipboard.writeText(promoCode);

  const code = document.getElementById("code");
  code.textContent = "Скопировано ✓";
  setTimeout(() => {
    code.textContent = promoCode;
  }, 1200);
}

wheel.addEventListener("click", spin);
spinButton.addEventListener("click", spin);

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    spin();
  }
  if (event.code === "KeyC") copyCode();
});

if (spunToday()) {
  const index = prizes.indexOf(saved.prize);
  rotation = 360 - index * sector;
  wheel.style.transition = "none";
  wheel.style.transform = `rotate(${rotation}deg)`;

  if (saved.code) showPrize(saved.prize, saved.code);
  else showEmpty();
  lockWheel();
}