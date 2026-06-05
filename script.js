const c = document.getElementById("c");
const ctx = c.getContext("2d");

let w, h, hw, hh;

function resize() {
  w = c.width = window.innerWidth;
  h = c.height = window.innerHeight;
  hw = w / 2;
  hh = h / 2;
}
window.addEventListener("resize", resize);
resize();

// =========================
// 🎮 GAME STATE SYSTEM
// =========================
let state = "idle"; 
// idle → reveal → explosion → message → loop

let time = 0;
let particles = [];

// =========================
// 🌌 STARS
// =========================
const stars = Array.from({ length: 180 }, () => ({
  x: Math.random() * w,
  y: Math.random() * h,
  s: Math.random() * 1.5
}));

// =========================
// 🎨 COLORS
// =========================
const colors = ["#00e5ff", "#8b5cf6", "#ff2bd6", "#00ff85"];

// =========================
// 💥 PARTICLE
// =========================
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 8;
    this.vy = (Math.random() - 0.5) * 8;
    this.life = 120;
    this.color = color;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.05;
    this.life--;

    ctx.shadowBlur = 20;
    ctx.shadowColor = this.color;

    ctx.globalAlpha = this.life / 120;
    ctx.fillStyle = this.color;

    ctx.beginPath();
    ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
  }
}

// =========================
// 🎯 LETTERS
// =========================
function Letter(char, x, y) {
  this.char = char;
  this.x = x;
  this.y = y;
  this.color = colors[Math.random() * colors.length | 0];
}

Letter.prototype.draw = function () {

  ctx.shadowBlur = 25;
  ctx.shadowColor = this.color;

  if (state === "idle") {
    ctx.fillStyle = "#444";
  }

  if (state === "reveal") {
    ctx.fillStyle = this.color;
  }

  if (state === "explosion" && Math.random() < 0.2) {
  particles.push(new Particle(this.x + hw, this.y + hh, this.color));
  }

  if (state === "message") {
    ctx.fillStyle = "#ffffff";
  }

  ctx.fillText(this.char, this.x, this.y);
};

// =========================
// 🎬 TEXT SETUP
// =========================
const opts = {
  strings: ["HAPPY", "BIRTHDAY!", "MALAIKA"],
  size: 40,
  spacing: 45,
  line: 55
};

ctx.font = opts.size + "px Arial";

let letters = [];

for (let i = 0; i < opts.strings.length; i++) {
  for (let j = 0; j < opts.strings[i].length; j++) {
    letters.push(
      new Letter(
        opts.strings[i][j],
        j * opts.spacing - 120,
        i * opts.line - 50
      )
    );
  }
}

// =========================
// 🔘 BUTTON CONTROL
// =========================
document.getElementById("revealBtn").addEventListener("click", () => {

  // 🛑 prevent multiple triggers
  if (state !== "idle") return;

  state = "reveal";

  // 🎮 lock UI immediately (important)
  const btn = document.getElementById("revealBtn");
  const title = document.getElementById("title");

  btn.style.opacity = "0";
  btn.style.pointerEvents = "none";
  btn.style.transform = "scale(0.8)";

  title.innerText = "Initializing surprise...";

  // 🎬 cinematic sequence control
  setTimeout(() => {
    state = "explosion";
    title.innerText = "🎆";
  }, 2000);

  setTimeout(() => {
    state = "message";
    title.innerText = "Happy Birthday!";
  }, 4500);

  setTimeout(() => {
    state = "idle";

    // ♻️ restore UI for replay
    btn.style.opacity = "1";
    btn.style.pointerEvents = "auto";
    btn.style.transform = "scale(1)";

    title.innerText = "Ready for your surprise?";
  }, 8000);
});

// =========================
// 🎥 MAIN LOOP
// =========================
function animate() {
  requestAnimationFrame(animate);

  time++;

  // 🌌 background
  ctx.fillStyle = "rgba(5, 8, 22, 0.25)";
  ctx.fillRect(0, 0, w, h);

  // 🌠 stars
  for (let s of stars) {
    s.y += 0.3;
    if (s.y > h) s.y = 0;

    ctx.fillStyle = "white";
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.s, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;

  ctx.save();
  ctx.translate(hw, hh);

  for (let l of letters) {
    l.draw();
  }

  ctx.restore();

  // 💥 particles
  ctx.globalCompositeOperation = "lighter";
  for (let p of particles) p.update();
  ctx.globalCompositeOperation = "source-over";
}
particles = particles.filter(p => p.life > 0);
animate();
