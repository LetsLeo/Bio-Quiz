// --- GAME: Kolibri & Qualle ---
// 2D-Arcade Game für Handy + Desktop, Touch & Tastensteuerung

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const modeSelect = document.getElementById("game-mode-select");
const kolibriBtn = document.getElementById("kolibri-btn");
const qualleBtn = document.getElementById("qualle-btn");
const restartBtn = document.getElementById("restart-btn");
const gameUI = document.getElementById("game-ui");
const scoreDisplay = document.getElementById("score-display");
const gameTip = document.getElementById("game-tip");

let gameMode = null; // "kolibri" oder "qualle"
let running = false;
let player, obstacles, score, gravity, jumpStrength, swimStrength, obstacleSpeed, frame, backgroundAnim;
let gameOver = false;

function startGame(mode) {
  gameMode = mode;
  running = true;
  modeSelect.style.display = "none";
  canvas.style.display = "block";
  gameUI.style.display = "block";
  resetGame();
  requestAnimationFrame(gameLoop);
}

function resetGame() {
  player = {
    x: 60,
    y: canvas.height / 2,
    r: 22,
    vy: 0,
    spriteFrame: 0,
    anim: 0
  };
  if (gameMode === "kolibri") {
    gravity = 0.45;
    jumpStrength = -7.7;
    obstacleSpeed = 3.8;
    gameTip.textContent = "Tippe/Drücke zum Flattern! Weiche den Hindernissen aus!";
  } else {
    gravity = 0.13;
    swimStrength = -4.2;
    obstacleSpeed = 2.5;
    gameTip.textContent = "Tippe/Drücke zum Pulsieren! Sammle die Blasen!";
  }
  backgroundAnim = 0;
  obstacles = [];
  score = 0;
  frame = 0;
  gameOver = false;
  scoreDisplay.textContent = "Punkte: 0";
}

function addObstacle() {
  if (gameMode === "kolibri") {
    // Flappy Bird Style - Lücken in den "Röhren"
    let gap = 120, minH = 60,
      topH = Math.random() * (canvas.height - gap - minH * 2) + minH;
    obstacles.push({
      x: canvas.width + 20,
      top: topH,
      bottom: topH + gap,
      width: 56
    });
  } else {
    // Luftblasen, die eingesammelt werden können
    obstacles.push({
      x: canvas.width + 10,
      y: Math.random() * (canvas.height - 80) + 40,
      r: 20 + Math.random() * 18,
      scored: false
    });
  }
}

function gameLoop() {
  if (!running) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Hintergrund animieren
  backgroundAnim += (gameMode === "kolibri") ? 0.3 : 0.12;
  drawBackground();

  // Hindernisse bewegen/darstellen
  if (gameMode === "kolibri") {
    if (frame % 88 === 0) addObstacle();
    for (let i = obstacles.length - 1; i >= 0; i--) {
      let ob = obstacles[i];
      ob.x -= obstacleSpeed;
      // Top pipe
      ctx.fillStyle = "#7fc864";
      ctx.fillRect(ob.x, 0, ob.width, ob.top);
      ctx.fillStyle = "#5b8e38";
      ctx.fillRect(ob.x, ob.top - 22, ob.width, 22);
      // Bottom pipe
      ctx.fillStyle = "#7fc864";
      ctx.fillRect(ob.x, ob.bottom, ob.width, canvas.height - ob.bottom);
      ctx.fillStyle = "#5b8e38";
      ctx.fillRect(ob.x, ob.bottom, ob.width, 22);

      // Collision
      if (
        player.x + player.r > ob.x && player.x - player.r < ob.x + ob.width &&
        (player.y - player.r < ob.top || player.y + player.r > ob.bottom)
      ) {
        gameOverScreen();
        return;
      }
      // Score
      if (!ob.passed && ob.x + ob.width < player.x) {
        score++;
        scoreDisplay.textContent = "Punkte: " + score;
        ob.passed = true;
      }
      if (ob.x + ob.width < 0) obstacles.splice(i, 1);
    }
  } else {
    // Qualle: Blasen einsammeln
    if (frame % 80 === 0) addObstacle();
    for (let i = obstacles.length - 1; i >= 0; i--) {
      let ob = obstacles[i];
      ob.x -= obstacleSpeed;
      // Draw bubble
      ctx.save();
      ctx.globalAlpha = 0.82;
      ctx.beginPath();
      ctx.arc(ob.x, ob.y, ob.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(120,200,255,0.62)";
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#e7f7ff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      // Collision (circle)
      let dx = player.x - ob.x, dy = player.y - ob.y;
      if (!ob.scored && Math.sqrt(dx * dx + dy * dy) < ob.r + player.r - 4) {
        score++;
        scoreDisplay.textContent = "Punkte: " + score;
        ob.scored = true;
      }
      if (ob.x + ob.r < 0) obstacles.splice(i, 1);
    }
  }

  // Spieler-Physik
  if (gameMode === "kolibri") {
    player.vy += gravity;
    player.y += player.vy;
    // Kolibri-Flatteranimation
    player.anim += Math.abs(player.vy) * 0.16 + 0.08;
    drawKolibri(player.x, player.y, player.anim);
    // Out of bounds
    if (player.y - player.r < 0 || player.y + player.r > canvas.height) {
      gameOverScreen();
      return;
    }
  } else {
    // Qualle bewegt sich weicher
    player.vy += gravity;
    player.y += player.vy;
    player.anim += 0.1 + Math.abs(player.vy) * 0.07;
    drawQualle(player.x, player.y, player.anim);
    // Bildschirmrand
    if (player.y - player.r < 0) {
      player.y = player.r;
      player.vy = 0;
    }
    if (player.y + player.r > canvas.height) {
      player.y = canvas.height - player.r;
      player.vy = 0;
    }
  }

  frame++;
  if (!gameOver) requestAnimationFrame(gameLoop);
}

// Grafische Objekte
function drawKolibri(x, y, anim) {
  // Körper
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.max(-0.5, Math.min(0.5, player.vy * 0.07)));
  // Flügel
  for (let i = 0; i < 2; i++) {
    ctx.save();
    ctx.rotate((i === 0 ? -1 : 1) * (Math.sin(anim * 2) * 0.85 + 0.7));
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 32, Math.PI / 5 * (i === 0 ? 1 : -1), 0, 2 * Math.PI);
    ctx.fillStyle = "#e8fae9";
    ctx.globalAlpha = 0.75;
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  // Kopf
  ctx.beginPath();
  ctx.arc(0, -18, 14, 0, Math.PI * 2);
  ctx.fillStyle = "#42caef";
  ctx.fill();
  // Auge
  ctx.beginPath();
  ctx.arc(5, -22, 2.7, 0, Math.PI * 2);
  ctx.fillStyle = "#263246";
  ctx.fill();
  // Körper
  ctx.beginPath();
  ctx.ellipse(0, 2, 16, 28, Math.PI / 24, 0, 2 * Math.PI);
  ctx.fillStyle = "#6be87d";
  ctx.fill();
  // Schnabel
  ctx.save();
  ctx.rotate(-0.19);
  ctx.beginPath();
  ctx.moveTo(14, -18);
  ctx.lineTo(34, -23);
  ctx.lineTo(14, -16);
  ctx.closePath();
  ctx.fillStyle = "#222";
  ctx.fill();
  ctx.restore();
  ctx.restore();
}

function drawQualle(x, y, anim) {
  ctx.save();
  ctx.translate(x, y);
  // Schirm
  ctx.beginPath();
  ctx.ellipse(0, 0, 28, 22 + Math.sin(anim) * 2, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#b8e0fa";
  ctx.shadowColor = "#74b1dc";
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.shadowBlur = 0;
  // Unterseite
  ctx.beginPath();
  ctx.ellipse(0, 10, 19, 11 + Math.cos(anim) * 1.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.globalAlpha = 0.48;
  ctx.fill();
  ctx.globalAlpha = 1;
  // Tentakel
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 7, 18);
    for (let j = 1; j <= 9; j++) {
      ctx.lineTo(
        i * 7 + Math.sin(anim * 1.3 + i * 0.6 + j * 0.4) * 5,
        18 + j * 10 + Math.cos(anim + i) * 6
      );
    }
    ctx.strokeStyle = "#7bd2ee";
    ctx.lineWidth = 2.5 - Math.abs(i) * 0.3;
    ctx.globalAlpha = 0.44 + (0.18 - Math.abs(i) * 0.04);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

// Hintergrund
function drawBackground() {
  if (gameMode === "kolibri") {
    // Himmel
    ctx.fillStyle = "#bfeaff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Wolken
    for (let i = 0; i < 5; i++) {
      let x = ((backgroundAnim + i * 120) % (canvas.width + 140)) - 70;
      let y = 60 + Math.sin(backgroundAnim * 0.26 + i) * 24;
      ctx.save();
      ctx.globalAlpha = 0.18 + 0.1 * Math.sin(backgroundAnim * 0.2 + i);
      ctx.beginPath();
      ctx.arc(x, y, 38 + i * 6, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.restore();
    }
  } else {
    // Unterwasser
    let grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#78d3fb");
    grad.addColorStop(1, "#d2f6ff");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Lichtstrahlen
    for (let i = 0; i < 3; i++) {
      let x = ((backgroundAnim * 8 + i * 120) % (canvas.width + 140)) - 70;
      ctx.save();
      ctx.globalAlpha = 0.11;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 44, canvas.height);
      ctx.lineTo(x - 44, canvas.height);
      ctx.closePath();
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.restore();
    }
  }
}

// Eingabe: Touch/Click/Leertaste
function flapOrSwim() {
  if (gameOver || !running) return;
  if (gameMode === "kolibri") {
    player.vy = jumpStrength;
  } else {
    player.vy = swimStrength;
  }
}
canvas.addEventListener("touchstart", e => { e.preventDefault(); flapOrSwim(); }, { passive: false });
canvas.addEventListener("mousedown", flapOrSwim);
window.addEventListener("keydown", e => {
  if (gameMode === "kolibri" && (e.code === "Space" || e.code === "ArrowUp")) { e.preventDefault(); flapOrSwim(); }
  if (gameMode === "qualle" && (e.code === "Space" || e.code === "ArrowUp")) { e.preventDefault(); flapOrSwim(); }
});

function gameOverScreen() {
  gameOver = true;
  ctx.save();
  ctx.globalAlpha = 0.92;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, canvas.height / 2 - 80, canvas.width, 160);
  ctx.globalAlpha = 1;
  ctx.textAlign = "center";
  ctx.fillStyle = "#e74c3c";
  ctx.font = "bold 32px Arial";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 20);
  ctx.fillStyle = "#222";
  ctx.font = "20px Arial";
  ctx.fillText("Punkte: " + score, canvas.width / 2, canvas.height / 2 + 18);
  ctx.font = "16px Arial";
  ctx.fillText("Klicke oder tippe 'Neustarten'", canvas.width / 2, canvas.height / 2 + 48);
  ctx.restore();
}

restartBtn.onclick = () => {
  resetGame();
  requestAnimationFrame(gameLoop);
};

kolibriBtn.onclick = () => startGame("kolibri");
qualleBtn.onclick = () => startGame("qualle");

// Bei Tab-Wechsel zurück zum Modus-Auswahlbildschirm
document.getElementById("game-tab-btn").onclick = () => {
  running = false;
  canvas.style.display = "none";
  gameUI.style.display = "none";
  modeSelect.style.display = "block";
};