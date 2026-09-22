// ==========================================
// 🌌 CIELO NOCTURNO, LUNA LLENA Y LUCIÉRNAGAS
// ==========================================
const canvas = document.getElementById('night-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let stars = [];
let fireflies = [];
let shootingStars = [];
let mouse = { x: null, y: null };

function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  initStars();
}

window.addEventListener('resize', resizeCanvas);

// Estrellas
function initStars() {
  stars = [];
  const numStars = Math.floor((width * height) / 4500);
  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.4 + 0.3,
      alpha: Math.random(),
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      direction: Math.random() > 0.5 ? 1 : -1
    });
  }
}

// Luciérnagas continuas
class Firefly {
  constructor(x, y, isTemporary = false) {
    this.x = x ?? Math.random() * width;
    this.y = y ?? Math.random() * height;
    this.radius = Math.random() * 2.2 + 1.2;
    this.baseAlpha = Math.random() * 0.5 + 0.5;
    this.alpha = this.baseAlpha;
    this.pulseSpeed = Math.random() * 0.03 + 0.015;
    this.pulseDir = Math.random() > 0.5 ? 1 : -1;
    this.vx = (Math.random() - 0.5) * 0.8;
    this.vy = (Math.random() - 0.5) * 0.8;
    this.color = Math.random() > 0.3 ? '#ffe853' : '#b8ff66';
    this.glowSize = Math.random() * 14 + 10;
    this.isTemporary = isTemporary;
    this.life = isTemporary ? 1 : null;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    this.vx += (Math.random() - 0.5) * 0.1;
    this.vy += (Math.random() - 0.5) * 0.1;
    this.vx = Math.max(-1.2, Math.min(1.2, this.vx));
    this.vy = Math.max(-1.2, Math.min(1.2, this.vy));

    if (mouse.x !== null && mouse.y !== null) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const force = (120 - dist) / 120;
        this.vx += (dx / dist) * force * 0.5;
        this.vy += (dy / dist) * force * 0.5;
      }
    }

    this.alpha += this.pulseSpeed * this.pulseDir;
    if (this.alpha > 0.95) {
      this.alpha = 0.95;
      this.pulseDir = -1;
    } else if (this.alpha < 0.15) {
      this.alpha = 0.15;
      this.pulseDir = 1;
    }

    if (this.isTemporary) {
      this.life -= 0.008;
      return this.life > 0;
    } else {
      if (this.x < -20) this.x = width + 20;
      if (this.x > width + 20) this.x = -20;
      if (this.y < -20) this.y = height + 20;
      if (this.y > height + 20) this.y = -20;
      return true;
    }
  }

  draw() {
    const curAlpha = this.isTemporary ? this.alpha * this.life : this.alpha;
    if (curAlpha <= 0) return;

    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.glowSize
    );
    gradient.addColorStop(0, this.color === '#ffe853' ? `rgba(255, 235, 90, ${curAlpha * 0.9})` : `rgba(184, 255, 102, ${curAlpha * 0.9})`);
    gradient.addColorStop(0.35, this.color === '#ffe853' ? `rgba(255, 215, 0, ${curAlpha * 0.4})` : `rgba(140, 240, 80, ${curAlpha * 0.4})`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.glowSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 255, 255, ${curAlpha})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }
}

function initFireflies() {
  fireflies = [];
  const count = Math.min(50, Math.floor(width / 25));
  for (let i = 0; i < count; i++) {
    fireflies.push(new Firefly());
  }
}

// Estrella Fugaz
class ShootingStar {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * width * 0.8;
    this.y = Math.random() * (height * 0.35);
    this.length = Math.random() * 80 + 50;
    this.speed = Math.random() * 7 + 9;
    this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.2;
    this.opacity = 1;
    this.active = true;
  }

  update() {
    if (!this.active) return;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.opacity -= 0.015;
    if (this.opacity <= 0) {
      this.active = false;
    }
  }

  draw() {
    if (!this.active || this.opacity <= 0) return;
    const tailX = this.x - Math.cos(this.angle) * this.length;
    const tailY = this.y - Math.sin(this.angle) * this.length;

    const grad = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
    grad.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
    grad.addColorStop(0.3, `rgba(255, 235, 120, ${this.opacity * 0.8})`);
    grad.addColorStop(1, `rgba(255, 215, 0, 0)`);

    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(tailX, tailY);
    ctx.stroke();
  }
}

// Dibujar Luna Llena
function drawMoon() {
  const moonX = width > 700 ? width * 0.82 : width * 0.5;
  const moonY = width > 700 ? 110 : 70;
  const moonRadius = width > 700 ? 55 : 42;

  const outerHalo = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.8, moonX, moonY, moonRadius * 4.5);
  outerHalo.addColorStop(0, 'rgba(230, 242, 255, 0.22)');
  outerHalo.addColorStop(0.4, 'rgba(195, 225, 255, 0.08)');
  outerHalo.addColorStop(1, 'rgba(15, 25, 50, 0)');
  ctx.fillStyle = outerHalo;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonRadius * 4.5, 0, Math.PI * 2);
  ctx.fill();

  const innerHalo = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.8, moonX, moonY, moonRadius * 1.5);
  innerHalo.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
  innerHalo.addColorStop(0.5, 'rgba(235, 245, 255, 0.3)');
  innerHalo.addColorStop(1, 'rgba(200, 225, 255, 0)');
  ctx.fillStyle = innerHalo;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonRadius * 1.5, 0, Math.PI * 2);
  ctx.fill();

  const moonGrad = ctx.createRadialGradient(moonX - moonRadius * 0.25, moonY - moonRadius * 0.25, 0, moonX, moonY, moonRadius);
  moonGrad.addColorStop(0, '#ffffff');
  moonGrad.addColorStop(0.65, '#f5f7fa');
  moonGrad.addColorStop(0.9, '#e4eaf0');
  moonGrad.addColorStop(1, '#c8d4df');

  ctx.fillStyle = moonGrad;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
  ctx.clip();

  ctx.fillStyle = 'rgba(180, 195, 210, 0.25)';
  ctx.beginPath();
  ctx.arc(moonX - moonRadius * 0.3, moonY + moonRadius * 0.2, moonRadius * 0.24, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(moonX + moonRadius * 0.25, moonY - moonRadius * 0.15, moonRadius * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(moonX + moonRadius * 0.1, moonY + moonRadius * 0.35, moonRadius * 0.15, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function animateCanvas() {
  ctx.clearRect(0, 0, width, height);

  drawMoon();

  for (let s of stars) {
    s.alpha += s.twinkleSpeed * s.direction;
    if (s.alpha > 0.95) {
      s.alpha = 0.95;
      s.direction = -1;
    } else if (s.alpha < 0.15) {
      s.alpha = 0.15;
      s.direction = 1;
    }

    ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  if (Math.random() < 0.008 && shootingStars.length < 2) {
    shootingStars.push(new ShootingStar());
  }

  for (let i = shootingStars.length - 1; i >= 0; i--) {
    const star = shootingStars[i];
    star.update();
    star.draw();
    if (!star.active) {
      shootingStars.splice(i, 1);
    }
  }

  for (let i = fireflies.length - 1; i >= 0; i--) {
    const f = fireflies[i];
    const isAlive = f.update();
    if (!isAlive) {
      fireflies.splice(i, 1);
    } else {
      f.draw();
    }
  }

  requestAnimationFrame(animateCanvas);
}

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener('touchmove', (e) => {
  if (e.touches.length > 0) {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
  }
});

window.addEventListener('touchend', () => {
  mouse.x = null;
  mouse.y = null;
});

window.addEventListener('click', (e) => {
  for (let i = 0; i < 4; i++) {
    const tempF = new Firefly(
      e.clientX + (Math.random() - 0.5) * 40,
      e.clientY + (Math.random() - 0.5) * 40,
      true
    );
    tempF.vx = (Math.random() - 0.5) * 2.5;
    tempF.vy = (Math.random() - 0.5) * 2.5;
    fireflies.push(tempF);
  }
});


// ==========================================
// 🌼 LLUVIA AUTOMÁTICA Y CONTINUA DE PÉTALOS AMARILLOS
// ==========================================
const petalsContainer = document.getElementById('petals-container');

function createPetal() {
  const petal = document.createElement('div');
  petal.classList.add('petal');

  const size = Math.random() * 16 + 12;
  const startX = Math.random() * width;
  const duration = Math.random() * 5 + 6;

  petal.style.width = `${size}px`;
  petal.style.height = `${size * 1.4}px`;
  petal.style.left = `${startX}px`;
  petal.style.animationDuration = `${duration}s`;

  petalsContainer.appendChild(petal);

  setTimeout(() => {
    petal.remove();
  }, duration * 1000);
}

// Lluvia automática constante (cada 400ms)
setInterval(() => {
  if (document.visibilityState === 'visible') {
    createPetal();
  }
}, 400);


// ==========================================
// 🎵 SINTETIZADOR DE MÚSICA AMBIENTAL (Web Audio API)
// ==========================================
let audioCtx = null;
let isPlaying = false;
let musicInterval = null;

const musicBtn = document.getElementById('music-btn');
const musicText = musicBtn.querySelector('.music-text');

const notes = [
  261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99
];

const melodySequence = [
  0, 2, 4, 3, 2, 1, 4, 2,
  0, 3, 5, 4, 2, 1, 3, 0,
  2, 4, 6, 5, 4, 3, 5, 2,
  4, 2, 1, 0, 2, 4, 3, 1
];

let noteIndex = 0;

function playNote(freq, time, duration = 1.8) {
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, time);

  const subOsc = audioCtx.createOscillator();
  const subGain = audioCtx.createGain();
  subOsc.type = 'triangle';
  subOsc.frequency.setValueAtTime(freq * 2, time);

  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.08, time + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

  subGain.gain.setValueAtTime(0, time);
  subGain.gain.linearRampToValueAtTime(0.02, time + 0.03);
  subGain.gain.exponentialRampToValueAtTime(0.0001, time + duration * 0.7);

  osc.connect(gain);
  subOsc.connect(subGain);
  gain.connect(audioCtx.destination);
  subGain.connect(audioCtx.destination);

  osc.start(time);
  subOsc.start(time);
  osc.stop(time + duration);
  subOsc.stop(time + duration);
}

function startMelody() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  musicInterval = setInterval(() => {
    const noteIdx = melodySequence[noteIndex % melodySequence.length];
    const freq = notes[noteIdx];
    playNote(freq, audioCtx.currentTime);

    if (noteIndex % 4 === 0) {
      const baseFreq = notes[0] / 2;
      playNote(baseFreq, audioCtx.currentTime, 2.8);
    }

    noteIndex++;
  }, 480);
}

function stopMelody() {
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
}

musicBtn.addEventListener('click', () => {
  if (!isPlaying) {
    startMelody();
    isPlaying = true;
    musicBtn.classList.add('playing');
    musicText.textContent = 'Pausar';
  } else {
    stopMelody();
    isPlaying = false;
    musicBtn.classList.remove('playing');
    musicText.textContent = 'Música';
  }
});


// ==========================================
// 🚀 EVENTO DE INICIO: BOTÓN PARA ABRIR
// ==========================================
const startBtn = document.getElementById('start-btn');
const introScreen = document.getElementById('intro-screen');
const cardBox = document.getElementById('card-box');

startBtn.addEventListener('click', () => {
  // 1. Desvanecer overlay inicial
  introScreen.classList.add('fade-out');
  setTimeout(() => {
    introScreen.style.display = 'none';
  }, 700);

  // 2. Iniciar música ambiental
  if (!isPlaying) {
    startMelody();
    isPlaying = true;
    musicBtn.classList.add('playing');
    musicText.textContent = 'Pausar';
  }

  // 3. Reiniciar animación de la tarjeta y cascada de texto
  cardBox.style.animation = 'none';
  void cardBox.offsetWidth;
  cardBox.style.animation = 'cardFadeUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards';

  // Disparar ráfaga inicial de pétalos
  for (let i = 0; i < 20; i++) {
    createPetal();
  }
});


// Inicialización
resizeCanvas();
initFireflies();
animateCanvas();

for (let i = 0; i < 8; i++) {
  createPetal();
}
