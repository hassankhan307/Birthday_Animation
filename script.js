/* =========================================================
   Happy Birthday  — Enhanced Animation
   ========================================================= */

// ── Canvas & context setup ───────────────────────────────────
const canvas = document.getElementById('c');
const pCanvas = document.getElementById('particles');

let w  = canvas.width  = pCanvas.width  = window.innerWidth;
let h  = canvas.height = pCanvas.height = window.innerHeight;
let hw = w / 2, hh = h / 2;

const ctx  = canvas.getContext('2d');
const pCtx = pCanvas.getContext('2d');

const Tau = Math.PI * 2;
const TauQ = Tau / 4;

// ── Inject flash div ─────────────────────────────────────────
const flash = document.createElement('div');
flash.id = 'flash';
document.body.appendChild(flash);

// ── Config ───────────────────────────────────────────────────
const opts = {
  strings: ['HAPPY', 'BIRTHDAY!', 'MALAIKA'],  // change the name here
  charSize:    clamp(28, window.innerWidth / 20, 44),
  charSpacing: clamp(32, window.innerWidth / 18, 48),
  lineHeight:  clamp(48, window.innerHeight / 12, 60),

  fireworkPrevPoints:       12,
  fireworkBaseLineWidth:    4,
  fireworkAddedLineWidth:   7,
  fireworkSpawnTime:        200,
  fireworkBaseReachTime:    28,
  fireworkAddedReachTime:   28,
  fireworkCircleBaseSize:   22,
  fireworkCircleAddedSize:  12,
  fireworkCircleBaseTime:   28,
  fireworkCircleAddedTime:  28,
  fireworkCircleFadeBase:   10,
  fireworkCircleFadeAdded:  5,
  fireworkBaseShards:       6,
  fireworkAddedShards:      6,
  fireworkShardPrevPoints:  4,
  fireworkShardBaseVel:     4.5,
  fireworkShardAddedVel:    2.5,
  fireworkShardBaseSize:    3,
  fireworkShardAddedSize:   3,
  gravity:        .10,
  upFlow:        -.12,
  contemplateTime: 340,
  balloonSpawnTime: 20,
  balloonBaseInflateTime: 12,
  balloonAddedInflateTime: 10,
  balloonBaseSize: 24,
  balloonAddedSize: 22,
  balloonBaseVel:  .45,
  balloonAddedVel: .40,
  balloonBaseRad: -(Math.PI / 2 - .5),
  balloonAddedRad: -1,
};

function clamp(min, val, max){ return Math.min(max, Math.max(min, val)); }

// ── Palette — vivid jewel tones ───────────────────────────────
const PALETTE = [
  [300, 100, 70], // magenta
  [45,  100, 65], // gold
  [195, 100, 60], // cyan
  [260, 90,  72], // violet
  [340, 100, 68], // rose
  [120, 80,  60], // emerald
];

function pickColor(x){
  const i  = Math.floor(x / opts.charSpacing) % PALETTE.length;
  const [h, s, l] = PALETTE[Math.abs(i)];
  return {
    base:  `hsl(${h},${s}%,${l}%)`,
    alpha: (a) => `hsla(${h},${s}%,${l}%,${a})`,
    light: (lt, a=1) => a < 1
      ? `hsla(${h},${s}%,${lt}%,${a})`
      : `hsl(${h},${s}%,${lt}%)`,
  };
}

// ── Calc ─────────────────────────────────────────────────────
const maxLen = Math.max(...opts.strings.map(s => s.length));
const totalWidth = opts.charSpacing * maxLen;

// ── Letter class ─────────────────────────────────────────────
class Letter {
  constructor(char, x, y){
    this.char = char;
    this.x = x; this.y = y;

    ctx.font = `bold ${opts.charSize}px 'Playfair Display', serif`;
    this.dx  = -ctx.measureText(char).width / 2;
    this.dy  = +opts.charSize / 2;
    this.fireworkDy = y - hh;

    this.col = pickColor(x + totalWidth / 2);
    this.reset();
  }

  reset(){
    this.phase       = 'firework';
    this.tick        = 0;
    this.spawned     = false;
    this.spawningTime = (opts.fireworkSpawnTime * Math.random()) | 0;
    this.reachTime   = (opts.fireworkBaseReachTime + opts.fireworkAddedReachTime * Math.random()) | 0;
    this.lineWidth   = opts.fireworkBaseLineWidth + opts.fireworkAddedLineWidth * Math.random();
    this.prevPoints  = [[0, hh, 0]];
  }

  step(){
    const { phase } = this;
    if(phase === 'firework')   this._stepFirework();
    else if(phase === 'contemplate') this._stepContemplate();
    else if(phase === 'balloon')     this._stepBalloon();
  }

  _stepFirework(){
    if(!this.spawned){
      if(++this.tick >= this.spawningTime){ this.tick = 0; this.spawned = true; }
      return;
    }
    ++this.tick;
    const lp = this.tick / this.reachTime;
    const ap = Math.sin(lp * TauQ);
    const x  = lp * this.x;
    const y  = hh + ap * this.fireworkDy;

    if(this.prevPoints.length > opts.fireworkPrevPoints) this.prevPoints.shift();
    this.prevPoints.push([x, y, lp * this.lineWidth]);

    const lwp = 1 / (this.prevPoints.length - 1);
    for(let i = 1; i < this.prevPoints.length; i++){
      const [x1, y1, lw1] = this.prevPoints[i];
      const [x0, y0]      = this.prevPoints[i-1];
      const alpha = (i / this.prevPoints.length) * .9;

      ctx.strokeStyle = this.col.alpha(alpha);
      ctx.lineWidth   = lw1 * lwp * i * 1.2;
      ctx.lineCap     = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x0, y0);
      ctx.stroke();
    }

    // glowing head dot
    const head = this.prevPoints[this.prevPoints.length - 1];
    ctx.beginPath();
    ctx.arc(head[0], head[1], head[2] * .5, 0, Tau);
    ctx.fillStyle = this.col.alpha(.9);
    ctx.fill();

    if(this.tick >= this.reachTime){
      this.phase = 'contemplate';
      this.circleFinalSize  = opts.fireworkCircleBaseSize + opts.fireworkCircleAddedSize * Math.random();
      this.circleCompleteT  = (opts.fireworkCircleBaseTime + opts.fireworkCircleAddedTime * Math.random()) | 0;
      this.circleFadeT      = (opts.fireworkCircleFadeBase + opts.fireworkCircleFadeAdded * Math.random()) | 0;
      this.circleCreating   = true;
      this.circleFading     = false;
      this.tick = 0; this.tick2 = 0;

      // spawn shards
      const count = (opts.fireworkBaseShards + opts.fireworkAddedShards * Math.random()) | 0;
      const angle = Tau / count;
      const cos = Math.cos(angle), sin = Math.sin(angle);
      let sx = 1, sy = 0;
      this.shards = [];
      for(let i = 0; i < count; i++){
        const x1 = sx;
        sx = sx * cos - sy * sin;
        sy = sy * cos + x1 * sin;
        this.shards.push(new Shard(this.x, this.y, sx, sy, this.col));
      }
    }
  }

  _stepContemplate(){
    ++this.tick;

    if(this.circleCreating){
      ++this.tick2;
      const p = this.tick2 / this.circleCompleteT;
      const arm = -Math.cos(p * Math.PI) / 2 + .5;
      ctx.beginPath();
      ctx.fillStyle = this.col.light(50 + 50 * p, p);
      ctx.arc(this.x, this.y, arm * this.circleFinalSize, 0, Tau);
      ctx.fill();
      if(this.tick2 >= this.circleCompleteT){ this.tick2 = 0; this.circleCreating = false; this.circleFading = true; }

    } else if(this.circleFading){
      this._drawChar(70);
      ++this.tick2;
      const p = this.tick2 / this.circleFadeT;
      const arm = -Math.cos(p * Math.PI) / 2 + .5;
      ctx.beginPath();
      ctx.fillStyle = this.col.light(100, 1 - arm);
      ctx.arc(this.x, this.y, this.circleFinalSize, 0, Tau);
      ctx.fill();
      if(this.tick2 >= this.circleFadeT) this.circleFading = false;

    } else {
      this._drawChar(80);
    }

    // step shards
    for(let i = this.shards.length - 1; i >= 0; i--){
      this.shards[i].step();
      if(!this.shards[i].alive) this.shards.splice(i, 1);
    }

    if(this.tick > opts.contemplateTime){
      this.phase     = 'balloon';
      this.tick      = 0;
      this.spawning  = true;
      this.spawnTime = (opts.balloonSpawnTime * Math.random()) | 0;
      this.inflating = false;
      this.inflateTime = (opts.balloonBaseInflateTime + opts.balloonAddedInflateTime * Math.random()) | 0;
      this.size      = opts.balloonBaseSize + opts.balloonAddedSize * Math.random();
      const rad = opts.balloonBaseRad + opts.balloonAddedRad * Math.random();
      const vel = opts.balloonBaseVel + opts.balloonAddedVel * Math.random();
      this.vx = Math.cos(rad) * vel;
      this.vy = Math.sin(rad) * vel;
    }
  }

  _stepBalloon(){
    ctx.strokeStyle = this.col.light(85);

    if(this.spawning){
      ++this.tick;
      this._drawChar(75);
      if(this.tick >= this.spawnTime){ this.tick = 0; this.spawning = false; this.inflating = true; }

    } else if(this.inflating){
      ++this.tick;
      const p = this.tick / this.inflateTime;
      this.cx = this.x;
      this.cy = this.y - this.size * p;

      ctx.fillStyle = this.col.alpha(p);
      ctx.beginPath();
      balloonPath(ctx, this.cx, this.cy, this.size * p);
      ctx.fill();

      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(this.cx, this.cy);
      ctx.lineTo(this.cx, this.y);
      ctx.stroke();

      this._drawChar(75);
      if(this.tick >= this.inflateTime){ this.tick = 0; this.inflating = false; }

    } else {
      this.cx += this.vx;
      this.cy += (this.vy += opts.upFlow);

      // shadow/glow under balloon
      ctx.save();
      ctx.shadowColor = this.col.alpha(.5);
      ctx.shadowBlur  = 18;
      ctx.fillStyle   = this.col.base;
      ctx.beginPath();
      balloonPath(ctx, this.cx, this.cy, this.size);
      ctx.fill();
      ctx.restore();

      // sheen
      const grad = ctx.createRadialGradient(
        this.cx - this.size * .25, this.cy - this.size * .6, this.size * .05,
        this.cx, this.cy - this.size * .4, this.size * .7
      );
      grad.addColorStop(0, 'rgba(255,255,255,.35)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      balloonPath(ctx, this.cx, this.cy, this.size);
      ctx.fill();

      // string
      ctx.lineWidth   = 1;
      ctx.strokeStyle = this.col.light(80, .6);
      ctx.beginPath();
      ctx.moveTo(this.cx, this.cy);
      ctx.quadraticCurveTo(this.cx + 4, this.cy + this.size * .5, this.cx, this.cy + this.size);
      ctx.stroke();

      // char inside
      ctx.fillStyle = 'rgba(255,255,255,.9)';
      ctx.font = `bold ${opts.charSize * .75}px 'Playfair Display', serif`;
      ctx.fillText(this.char, this.cx + this.dx * .75, this.cy + this.dy * .4);
      ctx.font = `bold ${opts.charSize}px 'Playfair Display', serif`;

      if(this.cy + this.size < -hh || this.cx < -hw || this.cx > hw)
        this.phase = 'done';
    }
  }

  _drawChar(lightness){
    ctx.fillStyle = this.col.light(lightness);
    ctx.shadowColor = this.col.alpha(.5);
    ctx.shadowBlur  = 10;
    ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
    ctx.shadowBlur  = 0;
  }
}

// ── Shard class ───────────────────────────────────────────────
class Shard {
  constructor(x, y, vx, vy, col){
    const vel = opts.fireworkShardBaseVel + opts.fireworkShardAddedVel * Math.random();
    this.vx  = vx * vel; this.vy = vy * vel;
    this.x   = x;  this.y  = y;
    this.col = col;
    this.prevPoints = [[x, y]];
    this.alive = true;
    this.size  = opts.fireworkShardBaseSize + opts.fireworkShardAddedSize * Math.random();
  }
  step(){
    this.x += this.vx;
    this.y += (this.vy += opts.gravity);
    if(this.prevPoints.length > opts.fireworkShardPrevPoints) this.prevPoints.shift();
    this.prevPoints.push([this.x, this.y]);

    const lwp = this.size / this.prevPoints.length;
    for(let k = 0; k < this.prevPoints.length - 1; k++){
      const [x0, y0] = this.prevPoints[k];
      const [x1, y1] = this.prevPoints[k+1];
      ctx.strokeStyle = this.col.alpha(k / this.prevPoints.length);
      ctx.lineWidth   = k * lwp;
      ctx.lineCap     = 'round';
      ctx.beginPath();
      ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
      ctx.stroke();
    }
    if(this.prevPoints[0][1] > hh) this.alive = false;
  }
}

// ── Balloon path helper ───────────────────────────────────────
function balloonPath(c, x, y, size){
  c.moveTo(x, y);
  c.bezierCurveTo(x - size*.55, y - size*.5,  x - size*.3,  y - size*1.1, x, y - size);
  c.bezierCurveTo(x + size*.3,  y - size*1.1, x + size*.55, y - size*.5,  x, y);
}

// ── Ambient particle system ───────────────────────────────────
const numParticles = 60;
const particles = Array.from({length: numParticles}, () => ({
  x: Math.random() * w,
  y: Math.random() * h,
  r: Math.random() * 2 + .5,
  vx: (Math.random() - .5) * .3,
  vy: -(Math.random() * .4 + .1),
  alpha: Math.random() * .5 + .1,
  hue: Math.random() * 360,
}));

function drawParticles(){
  pCtx.clearRect(0, 0, w, h);
  for(const p of particles){
    p.x += p.vx;
    p.y += p.vy;
    if(p.y < -10) p.y = h + 10;
    if(p.x < 0)   p.x = w;
    if(p.x > w)   p.x = 0;

    pCtx.beginPath();
    pCtx.arc(p.x, p.y, p.r, 0, Tau);
    pCtx.fillStyle = `hsla(${p.hue},80%,80%,${p.alpha})`;
    pCtx.fill();
  }
}

// ── Build letters ─────────────────────────────────────────────
ctx.font = `bold ${opts.charSize}px 'Playfair Display', serif`;

const letters = [];
for(let i = 0; i < opts.strings.length; i++){
  const str = opts.strings[i];
  for(let j = 0; j < str.length; j++){
    letters.push(new Letter(
      str[j],
      j * opts.charSpacing + opts.charSpacing / 2 - str.length * opts.charSize / 2,
      i * opts.lineHeight + opts.lineHeight / 2 - opts.strings.length * opts.lineHeight / 2
    ));
  }
}

// ── Burst confetti ────────────────────────────────────────────
function burstConfetti(){
  // flash
  flash.classList.add('pop');
  setTimeout(() => flash.classList.remove('pop'), 80);

  // spawn extra shards from random points
  const tmpShards = [];
  for(let i = 0; i < 60; i++){
    const angle = Math.random() * Tau;
    const col   = pickColor(Math.random() * totalWidth);
    const s     = new Shard(
      (Math.random() - .5) * w * .8,
      (Math.random() - .5) * h * .4,
      Math.cos(angle), Math.sin(angle),
      col
    );
    s.vx *= 2; s.vy -= 4;
    tmpShards.push(s);
  }
  // animate them
  function drawExtra(){
    if(!tmpShards.length) return;
    ctx.save();
    ctx.translate(hw, hh);
    for(let i = tmpShards.length - 1; i >= 0; i--){
      tmpShards[i].step();
      if(!tmpShards[i].alive) tmpShards.splice(i, 1);
    }
    ctx.restore();
    requestAnimationFrame(drawExtra);
  }
  drawExtra();
}

// ── Main animation loop ───────────────────────────────────────
function anim(){
  requestAnimationFrame(anim);

  // dark trailing background with slight vignette
  ctx.fillStyle = 'rgba(8,6,18,.82)';
  ctx.fillRect(0, 0, w, h);

  // vignette overlay
  const vig = ctx.createRadialGradient(hw, hh, hh * .4, hw, hh, hw * 1.3);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,.55)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.translate(hw, hh);
  ctx.font = `bold ${opts.charSize}px 'Playfair Display', serif`;

  let done = true;
  for(const l of letters){
    l.step();
    if(l.phase !== 'done') done = false;
  }
  ctx.restore();

  if(done) letters.forEach(l => l.reset());

  drawParticles();
}

anim();

// ── Controls ──────────────────────────────────────────────────
document.getElementById('btn-restart').addEventListener('click', () => {
  letters.forEach(l => l.reset());
});

document.getElementById('btn-confetti').addEventListener('click', burstConfetti);

// simple chime synth using Web Audio
let audioCtx = null;
let musicOn  = true;
let musicInterval = null;

function getAudioCtx(){
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playChime(){
  if(!musicOn) return;
  const ac  = getAudioCtx();
  const osc = ac.createOscillator();
  const g   = ac.createGain();
  osc.connect(g); g.connect(ac.destination);

  const notes = [261.6, 293.7, 329.6, 349.2, 392.0, 440.0, 493.9, 523.3];
  osc.frequency.value = notes[Math.floor(Math.random() * notes.length)];
  osc.type = 'sine';
  g.gain.setValueAtTime(.08, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(.001, ac.currentTime + .8);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + .9);
}

function startMusic(){
  musicInterval = setInterval(playChime, 420);
}
function stopMusic(){
  clearInterval(musicInterval);
}

startMusic();

document.getElementById('btn-music').addEventListener('click', () => {
  musicOn = !musicOn;
  const btn = document.getElementById('btn-music');
  const on  = document.getElementById('icon-music-on');
  const off = document.getElementById('icon-music-off');
  if(musicOn){
    btn.classList.add('active');
    on.style.display  = '';
    off.style.display = 'none';
    startMusic();
  } else {
    btn.classList.remove('active');
    on.style.display  = 'none';
    off.style.display = '';
    stopMusic();
  }
});

// ── Resize ───────────────────────────────────────────────────
window.addEventListener('resize', () => {
  w  = canvas.width  = pCanvas.width  = window.innerWidth;
  h  = canvas.height = pCanvas.height = window.innerHeight;
  hw = w / 2; hh = h / 2;
  ctx.font = `bold ${opts.charSize}px 'Playfair Display', serif`;
});
