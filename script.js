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

// =======================
// 🎨 CORE VISUAL SYSTEM
// =======================

const palette = ["#00e5ff", "#8b5cf6", "#ff2bd6", "#00ff85", "#ffffff"];

let time = 0;
let scene = 0;
let shake = 0;

// 🌌 STARFIELD (depth layers)
const stars = Array.from({ length: 300 }, () => ({
  x: Math.random() * w,
  y: Math.random() * h,
  z: Math.random(),
  r: Math.random() * 1.5,
}));

// =======================
// 🎬 SCENE DIRECTOR
// =======================
// 0 = build-up
// 1 = glitch
// 2 = explosion
// 3 = formation
// 4 = climax hold
// =======================

// =======================
// 💥 PARTICLE SYSTEM
// =======================
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 6;
    this.vy = (Math.random() - 0.5) * 6;
    this.life = 100 + Math.random() * 50;
    this.color = color;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.05;
    this.life--;

    ctx.shadowBlur = 20;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;

    ctx.globalAlpha = this.life / 150;

    ctx.beginPath();
    ctx.arc(this.x, this.y, 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
  }
}

let particles = [];

// =======================
// ✨ LETTER SYSTEM
// =======================
function Letter(char, x, y) {
  this.char = char;
  this.x = x;
  this.y = y;

  this.baseX = x;
  this.baseY = y;

  this.color = palette[(Math.random() * palette.length) | 0];
}

Letter.prototype.update = function () {

  const shakeX = (Math.random() - 0.5) * shake;
  const shakeY = (Math.random() - 0.5) * shake;

  ctx.shadowBlur = 25;
  ctx.shadowColor = this.color;

  // =========================
  // 🎬 SCENE 0: BUILD-UP
  // =========================
  if (scene === 0) {
    let offset = Math.sin(time * 0.02) * 10;

    ctx.fillStyle = this.color;
    ctx.globalAlpha = 0.6;

    ctx.fillText(
      this.char,
      this.x + shakeX,
      this.y + shakeY + offset
    );
  }

  // =========================
  // 🎬 SCENE 1: GLITCH ENTRY
  // =========================
  else if (scene === 1) {
    let glitch = (Math.random() - 0.5) * 6;

    ctx.fillStyle = this.color;

    ctx.fillText(
      this.char,
      this.x + glitch + shakeX,
      this.y + shakeY
    );
  }

  // =========================
  // 🎬 SCENE 2: EXPLOSION PHASE
  // =========================
  else if (scene === 2) {

    ctx.fillStyle = this.color;

    // spawn particles once
    if (Math.random() < 0.15) {
      particles.push(
        new Particle(this.x + hw, this.y + hh, this.color)
      );
    }
  }

  // =========================
  // 🎬 SCENE 3: FORMATION
  // =========================
  else if (scene === 3) {
    ctx.fillStyle = this.color;

    ctx.fillText(
      this.char,
      this.x + shakeX,
      this.y + shakeY
    );
  }

  // =========================
  // 🎬 SCENE 4: CLIMAX
  // =========================
  else if (scene === 4) {
    ctx.fillStyle = "#ffffff";

    ctx.shadowBlur = 60;

    ctx.fillText(
      this.char,
      this.x,
      this.y
    );
  }
};

// =======================
// 🧠 TEXT SETUP
// =======================
const opts = {
  strings: ["HAPPY", "BIRTHDAY!", "MALAIKA"],
  charSize: 36,
  charSpacing: 44,
  lineHeight: 52,
};

ctx.font = opts.charSize + "px Verdana";

let letters = [];

for (let i = 0; i < opts.strings.length; i++) {
  for (let j = 0; j < opts.strings[i].length; j++) {
    letters.push(
      new Letter(
        opts.strings[i][j],
        j * opts.charSpacing -
          (opts.strings[i].length * opts.charSpacing) / 2,
        i * opts.lineHeight -
          (opts.strings.length * opts.lineHeight) / 2
      )
    );
  }
}

// =======================
// 🎥 ANIMATION LOOP
// =======================
function animate() {
  requestAnimationFrame(animate);

  time++;

  // 🌌 cinematic fade (motion blur)
  ctx.fillStyle = "rgba(5, 8, 22, 0.22)";
  ctx.fillRect(0, 0, w, h);

  // 🌠 STAR DEPTH
  for (let s of stars) {
    s.y += 0.3 + s.z * 2;

    if (s.y > h) s.y = 0;

    ctx.fillStyle = "white";
    ctx.globalAlpha = 0.2 + s.z;

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;

  // 🎬 scene transitions
  if (time > 200) scene = 1;
  if (time > 350) scene = 2;
  if (time > 550) scene = 3;
  if (time > 750) scene = 4;
  if (time > 1000) {
    scene = 0;
    time = 0;
    particles = [];
  }

  // 🎥 camera shake in explosion
  shake = scene === 2 ? 6 : 0;

  ctx.save();
  ctx.translate(hw, hh);

  // letters
  for (let l of letters) {
    l.update();
  }

  ctx.restore();

  // 💥 particles (additive bloom)
  ctx.globalCompositeOperation = "lighter";
  for (let p of particles) {
    p.update();
  }
  ctx.globalCompositeOperation = "source-over";

  // 🔥 fake bloom pass
  ctx.globalAlpha = 0.06;
  ctx.drawImage(c, 0, 0, w, h);
  ctx.globalAlpha = 1;
}

animate();
