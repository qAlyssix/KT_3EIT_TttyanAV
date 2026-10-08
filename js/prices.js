const prices = {
  weekdays: {
    note: "Понедельник — пятница, с 12:00",
    rows: [
      [100, 120, 130, 140, 150],
      [270, 330, 360, 390, 400],
      [420, 520, 560, 600, 600],
      [450, 550, 600, 650, 700],
    ],
  },
  weekend: {
    note: "Суббота, воскресенье и праздники",
    rows: [
      [120, 140, 150, 160, 170],
      [320, 380, 410, 440, 450],
      [500, 600, 640, 680, 680],
      [500, 600, 650, 700, 750],
    ],
  },
  morning: {
    note: "Каждый день с 08:00 до 12:00 — самые низкие цены",
    rows: [
      [70, 80, 90, 100, 110],
      [190, 220, 240, 270, 280],
      [300, 350, 380, 420, 430],
      [0, 0, 0, 0, 0],
    ],
  },
};

const tabNames = ["weekdays", "weekend", "morning"];
let current = 0;

const tabs = document.querySelectorAll(".tab");
const note = document.getElementById("tab-note");
const table = document.getElementById("price-table");
const rows = table.querySelectorAll("tbody tr");

function animateNumber(cell, to) {
  const from = parseInt(cell.textContent) || 0;

  if (to === 0) {
    cell.textContent = "—";
    return;
  }

  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / 500, 1);
    cell.textContent = Math.round(from + (to - from) * progress) + " ₽";
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);

  cell.classList.remove("bump");
  void cell.offsetWidth;
  cell.classList.add("bump");
}

function showTab(index) {
  current = (index + tabNames.length) % tabNames.length;
  const data = prices[tabNames[current]];

  tabs.forEach((tab, i) => {
    tab.classList.toggle("active", i === current);
  });

  note.textContent = data.note;

  rows.forEach((row, r) => {
    row.querySelectorAll("td[data-col]").forEach((cell, c) => {
      animateNumber(cell, data.rows[r][c]);
    });
  });
}

tabs.forEach((tab, i) => {
  tab.addEventListener("click", () => showTab(i));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") showTab(current + 1);
  if (event.key === "ArrowLeft") showTab(current - 1);
});

function highlight(col) {
  table.querySelectorAll("[data-col]").forEach((cell) => {
    cell.classList.toggle("hl", cell.dataset.col === col);
  });
}

table.querySelectorAll("[data-col]").forEach((cell) => {
  cell.addEventListener("mouseover", () => highlight(cell.dataset.col));
  cell.addEventListener("mouseout", () => highlight(null));
});

document.querySelectorAll(".zone").forEach((card) => {
  card.addEventListener("click", () => {
    card.classList.toggle("flipped");
  });

  card.addEventListener("mousemove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `rotateX(${y * -14}deg) rotateY(${x * 14}deg)`;
  });

  card.addEventListener("mouseout", () => {
    card.style.transform = "";
  });
});

showTab(0);