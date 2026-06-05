var c = document.getElementById("c"),
  ctx = c.getContext("2d");

var w, h, hw, hh;

function resize() {
  w = c.width = window.innerWidth;
  h = c.height = window.innerHeight;
  hw = w / 2;
  hh = h / 2;
}
resize();

window.addEventListener("resize", resize);

// 🌌 Neon palette
const palette = ["#00e5ff", "#8b5cf6", "#ff2bd6", "#00ff85", "#ffffff"];

// 🌠 Starfield
const stars = Array.from({ length: 160 }, () => ({
  x: Math.random() * window.innerWidth,
  y: Math.random() * window.innerHeight,
  r: Math.random() * 1.2,
  s: Math.random() * 0.3 + 0.1,
}));

// 🎯 CONFIG
var opts = {
  strings: ["HAPPY", "BIRTHDAY!", "MALAIKA"],
  charSize: 32,
  charSpacing: 38,
  lineHeight: 44,

  fireworkReach: 28,
  fireworkWait: 180,
  gravity: 0.12,
  upFlow: -0.08,

  balloonSize: 22,
};

ctx.font = opts.charSize + "px Verdana";

// 🌟 LETTER SYSTEM
function Letter(char, x, y) {
  this.char = char;
  this.x = x;
  this.y = y;

  this.dx = -ctx.measureText(char).width / 2;
  this.dy = opts.charSize / 2;

  this.color = palette[Math.random() * palette.length | 0];

  this.reset();
}

Letter.prototype.reset = function () {
  this.phase = "firework";
  this.tick = 0;
  this.spawn = Math.random() * 120 | 0;
  this.reach = opts.fireworkReach + Math.random() * 20;

  this.prev = [[0, hh]];
};

Letter.prototype.step = function () {
  ctx.shadowBlur = 18;
  ctx.shadowColor = this.color;

  // ================= FIREWORK =================
  if (this.phase === "firework") {
    if (this.tick++ > this.spawn) {
      var t = (this.tick - this.spawn) / this.reach;
      var ease = Math.sin(t * Math.PI * 0.5);

      var x = ease * this.x;
      var y = hh + Math.sin(t * Math.PI) * (this.y - hh);

      this.prev.push([x, y]);
      if (this.prev.length > 8) this.prev.shift();

      for (var i = 1; i < this.prev.length; i++) {
        ctx.strokeStyle = this.color;
        ctx.globalAlpha = i / this.prev.length;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(this.prev[i - 1][0], this.prev[i - 1][1]);
        ctx.lineTo(this.prev[i][0], this.prev[i][1]);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;

      if (t >= 1) {
        this.phase = "text";
        this.tick = 0;
      }
    }
  }

  // ================= TEXT =================
  else if (this.phase === "text") {
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 25;

    ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

    if (this.tick++ > 220) {
      this.phase = "balloon";
      this.cx = this.x;
      this.cy = this.y;
      this.vx = (Math.random() - 0.5) * 1.2;
      this.vy = -1.5;
    }
  }

  // ================= BALLOON =================
  else if (this.phase === "balloon") {
    this.vy += opts.upFlow;
    this.cx += this.vx;
    this.cy += this.vy;

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, opts.balloonSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.fillText(this.char, this.cx + this.dx, this.cy + this.dy);

    if (this.cy < -100) this.phase = "done";
  }
};

// ================= BUILD LETTERS =================
var letters = [];

for (var i = 0; i < opts.strings.length; i++) {
  for (var j = 0; j < opts.strings[i].length; j++) {
    letters.push(
      new Letter(
        opts.strings[i][j],
        j * opts.charSpacing +
          opts.charSpacing / 2 -
          (opts.strings[i].length * opts.charSize) / 2,
        i * opts.lineHeight +
          opts.lineHeight / 2 -
          (opts.strings.length * opts.lineHeight) / 2
      )
    );
  }
}

// ================= ANIMATION LOOP =================
function animate() {
  requestAnimationFrame(animate);

  // 🌌 motion blur background
  ctx.fillStyle = "rgba(5, 8, 22, 0.25)";
  ctx.fillRect(0, 0, w, h);

  // 🌠 stars
  ctx.fillStyle = "white";
  for (let s of stars) {
    s.y += s.s;
    if (s.y > h) s.y = 0;

    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.translate(hw, hh);

  let done = true;

  for (let l of letters) {
    l.step();
    if (l.phase !== "done") done = false;
  }

  ctx.translate(-hw, -hh);

  if (done) {
    letters.forEach((l) => l.reset());
  }
}

animate();
