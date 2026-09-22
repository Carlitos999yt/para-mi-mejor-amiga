// ==========================================
// 🌌 CIELO NOCTURNO, LUNA LLENA Y LUCIÉRNAGAS CONTINUAS
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
  const numStars = Math.floor((width * height) / 4000);
  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.4,
      alpha: Math.random(),
      twinkleSpeed: Math.random() * 0.02 + 0.006,
      direction: Math.random() > 0.5 ? 1 : -1
    });
  }
}

// Luciérnagas continuas (nunca se detienen)
class Firefly {
  constructor(x, y, isTemporary = false) {
    this.x = x ?? Math.random() * width;
    this.y = y ?? Math.random() * height;
    this.radius = Math.random() * 2.4 + 1.4;
    this.baseAlpha = Math.random() * 0.5 + 0.5;
    this.alpha = this.baseAlpha;
    this.pulseSpeed = Math.random() * 0.03 + 0.015;
    this.pulseDir = Math.random() > 0.5 ? 1 : -1;
    this.vx = (Math.random() - 0.5) * 0.9;
    this.vy = (Math.random() - 0.5) * 0.9;
    this.color = Math.random() > 0.25 ? '#ffe853' : '#b8ff66';
    this.glowSize = Math.random() * 16 + 12;
    this.isTemporary = isTemporary;
    this.life = isTemporary ? 1 : null;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Movimiento orgánico
    this.vx += (Math.random() - 0.5) * 0.12;
    this.vy += (Math.random() - 0.5) * 0.12;
    this.vx = Math.max(-1.4, Math.min(1.4, this.vx));
    this.vy = Math.max(-1.4, Math.min(1.4, this.vy));

    // Reacción suave al tacto/mouse
    if (mouse.x !== null && mouse.y !== null) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 130) {
        const force = (130 - dist) / 130;
        this.vx += (dx / dist) * force * 0.6;
        this.vy += (dy / dist) * force * 0.6;
      }
    }

    // Parpadeo suave
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
    gradient.addColorStop(0, this.color === '#ffe853' ? `rgba(255, 235, 90, ${curAlpha * 0.95})` : `rgba(184, 255, 102, ${curAlpha * 0.95})`);
    gradient.addColorStop(0.35, this.color === '#ffe853' ? `rgba(255, 215, 0, ${curAlpha * 0.45})` : `rgba(140, 240, 80, ${curAlpha * 0.45})`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.glowSize, 0, Math.PI * 2);
    ctx.fill();

    // Núcleo brillante
    ctx.fillStyle = `rgba(255, 255, 255, ${curAlpha})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }
}

function initFireflies() {
  fireflies = [];
  const count = Math.min(65, Math.floor(width / 20));
  for (let i = 0; i < count; i++) {
    fireflies.push(new Firefly());
  }
}

// Estrellas Fugaces
class ShootingStar {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * width * 0.8;
    this.y = Math.random() * (height * 0.35);
    this.length = Math.random() * 90 + 60;
    this.speed = Math.random() * 8 + 10;
    this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.2;
    this.opacity = 1;
    this.active = true;
  }

  update() {
    if (!this.active) return;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.opacity -= 0.016;
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
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(tailX, tailY);
    ctx.stroke();
  }
}

// Dibujar Luna Llena
function drawMoon() {
  const moonX = width > 768 ? width * 0.84 : width * 0.5;
  const moonY = width > 768 ? 120 : 75;
  const moonRadius = width > 768 ? 58 : 44;

  // Gran halo exterior
  const outerHalo = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.8, moonX, moonY, moonRadius * 4.8);
  outerHalo.addColorStop(0, 'rgba(230, 242, 255, 0.24)');
  outerHalo.addColorStop(0.4, 'rgba(195, 225, 255, 0.09)');
  outerHalo.addColorStop(1, 'rgba(15, 25, 50, 0)');
  ctx.fillStyle = outerHalo;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonRadius * 4.8, 0, Math.PI * 2);
  ctx.fill();

  // Halo cercano
  const innerHalo = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.8, moonX, moonY, moonRadius * 1.6);
  innerHalo.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
  innerHalo.addColorStop(0.5, 'rgba(235, 245, 255, 0.35)');
  innerHalo.addColorStop(1, 'rgba(200, 225, 255, 0)');
  ctx.fillStyle = innerHalo;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonRadius * 1.6, 0, Math.PI * 2);
  ctx.fill();

  // Disco lunar
  const moonGrad = ctx.createRadialGradient(moonX - moonRadius * 0.25, moonY - moonRadius * 0.25, 0, moonX, moonY, moonRadius);
  moonGrad.addColorStop(0, '#ffffff');
  moonGrad.addColorStop(0.65, '#f5f7fa');
  moonGrad.addColorStop(0.9, '#e4eaf0');
  moonGrad.addColorStop(1, '#c8d4df');

  ctx.fillStyle = moonGrad;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
  ctx.fill();

  // Cráteres suaves
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

// Bucle de animación continuo
function animateCanvas() {
  ctx.clearRect(0, 0, width, height);

  drawMoon();

  // Estrellas
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

  // Estrellas fugaces
  if (Math.random() < 0.009 && shootingStars.length < 2) {
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

  // Luciérnagas continuas
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

// Interacción táctil / cursor
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
// 🌼 LLUVIA AUTOMÁTICA Y CONTINUA DE PÉTALOS AMARILLOS (NUNCA SE DETIENE)
// ==========================================
const petalsContainer = document.getElementById('petals-container');

function spawnPetal() {
  const petal = document.createElement('div');
  petal.classList.add('petal');

  const size = Math.random() * 18 + 14;
  const startX = Math.random() * width;
  const duration = Math.random() * 5 + 6; // 6s - 11s

  petal.style.width = `${size}px`;
  petal.style.height = `${size * 1.5}px`;
  petal.style.left = `${startX}px`;
  petal.style.animationDuration = `${duration}s`;

  petalsContainer.appendChild(petal);

  setTimeout(() => {
    petal.remove();
  }, duration * 1000);
}

// Generación continua e ininterrumpida de pétalos (cada 380ms)
setInterval(() => {
  if (document.visibilityState === 'visible') {
    spawnPetal();
  }
}, 380);


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
// 🚀 EVENTO DE INICIO: BOTÓN PARA ABRIR Y CASCADA DE LLUVIA
// ==========================================
const startBtn = document.getElementById('start-btn');
const introScreen = document.getElementById('intro-screen');
const mainContent = document.getElementById('main-content');

startBtn.addEventListener('click', () => {
  // 1. Ocultar pantalla inicial
  introScreen.classList.add('fade-out');

  // 2. Iniciar música automáticamente
  if (!isPlaying) {
    startMelody();
    isPlaying = true;
    musicBtn.classList.add('playing');
    musicText.textContent = 'Pausar';
  }

  // 3. Revelar contenido principal abierto
  setTimeout(() => {
    introScreen.style.display = 'none';
    mainContent.classList.remove('hidden');
    void mainContent.offsetWidth; // Forzar reflow
    mainContent.classList.add('visible');

    // Cascada inicial de pétalos
    for (let i = 0; i < 25; i++) {
      spawnPetal();
    }
  }, 400);
});


// Inicialización
resizeCanvas();
initFireflies();
animateCanvas();

// Primeros pétalos
for (let i = 0; i < 10; i++) {
  spawnPetal();
}
