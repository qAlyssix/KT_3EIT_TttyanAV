const hero = document.getElementById("hero");
const sally = document.getElementById("sally");
const maps = document.getElementById("maps");
const word = document.querySelector(".hero-word");
const title = document.getElementById("hero-title");

function runCounters() {
  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = Number(el.dataset.count);
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / 1500, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  });
}

function fillBars() {
  hero.classList.remove("ready");
  hero.classList.add("no-anim");
  void hero.offsetWidth;
  hero.classList.remove("no-anim");
  hero.classList.add("ready");
}

document.addEventListener("mousemove", (event) => {
  const x = event.clientX / window.innerWidth - 0.5;
  const y = event.clientY / window.innerHeight - 0.5;

  sally.style.transform = `translate(${x * 30}px, ${y * 15}px) rotate(${x * 4}deg)`;
  maps.style.transform = `translate(${x * -40}px, ${y * -25}px)`;
  word.style.transform = `translate(${x * 60}px, ${y * 20}px)`;
});

hero.addEventListener("click", (event) => {
  if (event.target.closest("a")) return;

  const rect = hero.getBoundingClientRect();
  const shot = document.createElement("div");
  shot.className = "shot";
  shot.style.left = event.clientX - rect.left + "px";
  shot.style.top = event.clientY - rect.top + "px";
  hero.appendChild(shot);

  shot.addEventListener("animationend", () => shot.remove());
});

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    sally.classList.remove("jump");
    title.classList.remove("flash");
    void sally.offsetWidth;
    sally.classList.add("jump");
    title.classList.add("flash");
    fillBars();
    runCounters();
  }
});

window.addEventListener("load", () => {
  fillBars();
  runCounters();
});