const nav = document.querySelector(".nav");
const burger = document.querySelector(".burger");

window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

setTimeout(() => {
  document.body.classList.add("loaded");
}, 800);

function goTo(url) {
  document.body.classList.add("leaving");
  setTimeout(() => {
    window.location.href = url;
  }, 350);
}

document.querySelectorAll(".nav a").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    goTo(link.getAttribute("href"));
  });
});

burger.addEventListener("click", (event) => {
  event.stopPropagation();
  nav.classList.toggle("open");
});

document.addEventListener("click", (event) => {
  if (!nav.contains(event.target)) {
    nav.classList.remove("open");
  }
});

const pages = {
  1: "index.html",
  2: "prices.html",
  3: "games.html",
  4: "booking.html",
  5: "promo.html",
  6: "contacts.html",
};

function isTyping(event) {
  const tag = event.target.tagName;
  return tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA";
}

document.addEventListener("keydown", (event) => {
  if (isTyping(event)) return;

  if (pages[event.key]) {
    goTo(pages[event.key]);
  }

  if (event.code === "KeyM") {
    nav.classList.toggle("open");
  }

  if (event.key === "Escape") {
    nav.classList.remove("open");
  }
});

const glow = document.createElement("div");
glow.className = "cursor-glow";
document.body.appendChild(glow);

let glowX = 0;
let glowY = 0;
let mouseX = 0;
let mouseY = 0;

document.addEventListener("mousemove", (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
});

function moveGlow() {
  glowX += (mouseX - glowX) * 0.1;
  glowY += (mouseY - glowY) * 0.1;
  glow.style.transform = `translate(${glowX}px, ${glowY}px)`;
  requestAnimationFrame(moveGlow);
}

moveGlow();