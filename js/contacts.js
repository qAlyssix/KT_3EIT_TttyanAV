const club = { address: "ул. Ленина, 15", x: 620, y: 360 };
const you = { x: 300, y: 780 };
const city = { w: 1200, h: 900 };

const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d");
const card = document.getElementById("branch-card");

let hovered = false;
let drag = null;
const cam = { x: 600, y: 450, scale: 0.6 };
const target = { x: 600, y: 450, scale: 0.6 };

function resize() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

let seed = 7;
function random() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

const blocks = [];
for (let x = 0; x < city.w; x += 100) {
  for (let y = 0; y < city.h; y += 100) {
    blocks.push({ x: x + 12, y: y + 12, park: random() < 0.08, shade: 18 + Math.floor(random() * 10) });
  }
}

function toCity(screenX, screenY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (screenX - rect.left - rect.width / 2) / cam.scale + cam.x,
    y: (screenY - rect.top - rect.height / 2) / cam.scale + cam.y,
  };
}

function drawLabel(text, x, y, color) {
  ctx.font = "800 18px Montserrat, Arial";
  const width = ctx.measureText(text).width + 20;
  ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
  ctx.beginPath();
  ctx.roundRect(x - width / 2, y - 15, width, 30, 8);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y + 1);
}

function draw(time) {
  const rect = canvas.getBoundingClientRect();

  cam.x += (target.x - cam.x) * 0.08;
  cam.y += (target.y - cam.y) * 0.08;
  cam.scale += (target.scale - cam.scale) * 0.08;

  ctx.save();
  ctx.fillStyle = "#0b0b0b";
  ctx.fillRect(0, 0, rect.width, rect.height);
  ctx.translate(rect.width / 2, rect.height / 2);
  ctx.scale(cam.scale, cam.scale);
  ctx.translate(-cam.x, -cam.y);

  blocks.forEach((b) => {
    ctx.fillStyle = b.park ? "#14200f" : `rgb(${b.shade}, ${b.shade}, ${b.shade})`;
    ctx.beginPath();
    ctx.roundRect(b.x, b.y, 76, 76, 8);
    ctx.fill();
  });

  ctx.strokeStyle = "#10202e";
  ctx.lineWidth = 46;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-50, 520);
  ctx.bezierCurveTo(300, 420, 500, 640, 750, 470);
  ctx.bezierCurveTo(950, 340, 1100, 420, 1260, 360);
  ctx.stroke();

  ctx.strokeStyle = "#2a2a2a";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(0, 300);
  ctx.lineTo(city.w, 300);
  ctx.moveTo(600, 0);
  ctx.lineTo(600, city.h);
  ctx.moveTo(0, 0);
  ctx.lineTo(city.w, city.h);
  ctx.stroke();

  ctx.strokeStyle = "#ff7a00";
  ctx.lineWidth = 5;
  ctx.setLineDash([14, 10]);
  ctx.lineDashOffset = -time / 30;
  ctx.beginPath();
  ctx.moveTo(you.x, you.y);
  ctx.lineTo(you.x, club.y);
  ctx.lineTo(club.x, club.y);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#3d8bff";
  ctx.beginPath();
  ctx.arc(you.x, you.y, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 3;
  ctx.stroke();
  drawLabel("Вы здесь", you.x, you.y + 34, "#3d8bff");

  const size = hovered ? 1.7 : 1.4;

  for (let k = 0; k < 2; k++) {
    const phase = (time / 1400 + k / 2) % 1;
    ctx.strokeStyle = `rgba(255, 122, 0, ${(1 - phase) * 0.8})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(club.x, club.y, 16 + phase * 50 * size, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.save();
  ctx.translate(club.x, club.y);
  ctx.scale(size, size);
  ctx.fillStyle = "#ff7a00";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-22, -26, -22, -52, 0, -52);
  ctx.bezierCurveTo(22, -52, 22, -26, 0, 0);
  ctx.fill();
  ctx.fillStyle = "#111";
  ctx.font = "italic 900 16px Montserrat, Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("P", 0, -34);
  ctx.restore();

  drawLabel(club.address, club.x, club.y + 30, "#ff7a00");

  ctx.restore();
  requestAnimationFrame(draw);
}

function showRoute() {
  const rect = canvas.getBoundingClientRect();

  target.x = (club.x + you.x) / 2;
  target.y = (club.y + you.y) / 2 - 20;
  target.scale = Math.min(
    rect.width / (Math.abs(club.x - you.x) + 260),
    rect.height / (Math.abs(club.y - you.y) + 260),
    1.4
  );

  card.classList.remove("swap");
  void card.offsetWidth;
  card.classList.add("swap");
}

function zoom(factor) {
  target.scale = Math.min(2.5, Math.max(0.35, target.scale * factor));
}

function move(dx, dy) {
  target.x += dx / target.scale;
  target.y += dy / target.scale;
}

function isOverClub(screenX, screenY) {
  const p = toCity(screenX, screenY);
  return Math.hypot(p.x - club.x, p.y - (club.y - 30)) < 45;
}

canvas.addEventListener("mousedown", (event) => {
  drag = { x: event.clientX, y: event.clientY, moved: false };
  canvas.classList.add("dragging");
});

canvas.addEventListener("mousemove", (event) => {
  hovered = isOverClub(event.clientX, event.clientY);
  canvas.style.cursor = hovered ? "pointer" : "";
});

document.addEventListener("mousemove", (event) => {
  if (!drag) return;

  const dx = event.clientX - drag.x;
  const dy = event.clientY - drag.y;
  if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;

  target.x -= dx / cam.scale;
  target.y -= dy / cam.scale;
  cam.x = target.x;
  cam.y = target.y;
  drag.x = event.clientX;
  drag.y = event.clientY;
});

document.addEventListener("mouseup", (event) => {
  if (!drag) return;
  canvas.classList.remove("dragging");

  if (!drag.moved && isOverClub(event.clientX, event.clientY)) showRoute();
  drag = null;
});

canvas.addEventListener("wheel", (event) => {
  event.preventDefault();
  zoom(event.deltaY < 0 ? 1.15 : 0.87);
}, { passive: false });

document.addEventListener("keydown", (event) => {
  if (isTyping(event)) return;

  if (event.key === "ArrowLeft") { event.preventDefault(); move(-80, 0); }
  if (event.key === "ArrowRight") { event.preventDefault(); move(80, 0); }
  if (event.key === "ArrowUp") { event.preventDefault(); move(0, -80); }
  if (event.key === "ArrowDown") { event.preventDefault(); move(0, 80); }
  if (event.key === "+" || event.key === "=") zoom(1.2);
  if (event.key === "-" || event.key === "_") zoom(0.83);
  if (event.key === "Enter") showRoute();
  if (event.key === "0") {
    target.x = city.w / 2;
    target.y = city.h / 2;
    target.scale = 0.5;
  }
});

window.addEventListener("resize", resize);
resize();
showRoute();
requestAnimationFrame(draw);