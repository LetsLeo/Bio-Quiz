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
let player, obstacles, bubbles, score, gravity, jumpStrength, swimStrength, obstacleSpeed, frame, backgroundAnim;
let gameOver = false;
let kolibriStarted = false;
let qualleTime = 60;
let qualleTimer = 0;
let qualleInterval = null;
let qualleObstacles = [];
let qualleBubbles = [];
let qualleStartTime = null;

function startGame(mode) {
  gameMode = mode;
  running = true;
  modeSelect.style.display = "none";
  canvas.style.display = "block";
  gameUI.style.display = "block";
  resetGame();
  if (mode === "kolibri") {
    kolibriStarted = false;
    drawKolibriStart();
    gameTip.textContent = "Klicke oder tippe um zu starten!";
    // Warte auf Klick/Touch zum Start
    canvas.onclick = () => {
      if (!kolibriStarted && !gameOver) {
        kolibriStarted = true;
        canvas.onclick = null;
        requestAnimationFrame(gameLoop);
        gameTip.textContent = "Tippe/Drücke zum Flattern! Weiche den Hindernissen aus!";
      }
    };
    canvas.ontouchstart = (e) => {
      e.preventDefault();
      if (!kolibriStarted && !gameOver) {
        kolibriStarted = true;
        canvas.ontouchstart = null;
        requestAnimationFrame(gameLoop);
        gameTip.textContent = "Tippe/Drücke zum Flattern! Weiche den Hindernissen aus!";
      }
    };
  } else {
    qualleStartTime = Date.now();
    qualleTimer = 60;
    scoreDisplay.textContent = "Punkte: 0 | Zeit: 60s";
    gameTip.textContent = "Sammle die Blasen! Hindernisse vermeiden!";
    if (qualleInterval) clearInterval(qualleInterval);
    qualleInterval = setInterval(updateQualleTime, 1000);
    requestAnimationFrame(gameLoop);
  }
}

function resetGame() {
  if (gameMode === "kolibri") {
    player = {
      x: 38, // weiter hinten für mehr Reaktionszeit
      y: canvas.height / 2,
      r: 22,
      vy: 0,
      anim: 0,
      flap: 0,
    };
    gravity = 0.34; // etwas weniger Gravitation -> mehr gleiten
    jumpStrength = -7.0;
    obstacleSpeed = 3.8;
    backgroundAnim = 0;
    obstacles = [];
    score = 0;
    frame = 0;
    gameOver = false;
    scoreDisplay.textContent = "Punkte: 0";
  } else {
    player = {
      x: 65,
      y: canvas.height / 2,
      r: 22,
      vy: 0,
      anim: 0,
    };
    gravity = 0.13;
    swimStrength = -4.2;
    obstacleSpeed = 2.5;
    backgroundAnim = 0;
    qualleObstacles = [];
    qualleBubbles = [];
    score = 0;
    frame = 0;
    gameOver = false;
    qualleTimer = 60;
    qualleStartTime = Date.now();
    scoreDisplay.textContent = "Punkte: 0 | Zeit: 60s";
  }
}

function updateQualleTime() {
  if (!running || !gameMode === "qualle") return;
  qualleTimer = 60 - Math.floor((Date.now() - qualleStartTime) / 1000);
  if (qualleTimer < 0) qualleTimer = 0;
  scoreDisplay.textContent = `Punkte: ${score} | Zeit: ${qualleTimer}s`;
  if (qualleTimer <= 0 && !gameOver) {
    gameOverScreen();
  }
}

function addKolibriObstacle() {
  // Flappy Bird Style - Lücken in "Röhren".
  let gap = 120, minH = 60,
    topH = Math.random() * (canvas.height - gap - minH * 2) + minH;
  obstacles.push({
    x: canvas.width + 20,
    top: topH,
    bottom: topH + gap,
    width: 56,
    passed: false,
    // Für Grafik von Ästen/Blatt/Gras
    topType: "ast",
    bottomType: "gras",
    leafOffset: Math.random() * Math.PI * 2,
  });
}

function addQualleBubble() {
  qualleBubbles.push({
    x: canvas.width + 10,
    y: Math.random() * (canvas.height - 80) + 40,
    r: 20 + Math.random() * 18,
    scored: false
  });
}

function addQualleObstacle() {
  // Hindernisse: einfache Wasserpflanze oder Stein
  if (Math.random() < 0.5) {
    // Pflanze von unten
    qualleObstacles.push({
      type: "pflanze",
      x: canvas.width + 20,
      baseY: canvas.height - 6,
      w: 22 + Math.random() * 16,
      h: 55 + Math.random() * 70,
      sway: Math.random() * Math.PI * 2,
    });
  } else {
    // Stein
    qualleObstacles.push({
      type: "stein",
      x: canvas.width + 20,
      y: canvas.height - (16 + Math.random() * 38),
      r: 22 + Math.random() * 22,
    });
  }
}

function gameLoop() {
  if (!running) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Hintergrund animieren
  backgroundAnim += (gameMode === "kolibri") ? 0.3 : 0.12;
  drawBackground();

  if (gameMode === "kolibri") {
    if (kolibriStarted) {
      // Hindernisse
      if (frame % 88 === 0) addKolibriObstacle();
      for (let i = obstacles.length - 1; i >= 0; i--) {
        let ob = obstacles[i];
        ob.x -= obstacleSpeed;

        // TOP: Ast mit Blättern
        drawAstMitBlaettern(ob.x, ob.top, ob.width, ob.leafOffset);

        // BOTTOM: Grasbüschel
        drawGras(ob.x, ob.bottom, ob.width);

        // Kollision
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
      // Spieler-Physik
      player.vy += gravity;
      player.y += player.vy;
      player.anim += Math.abs(player.vy) * 0.12 + 0.06;
      drawKolibri(player.x, player.y, player.anim, player.vy, kolibriStarted);
      // Out of bounds
      if (player.y - player.r < 0 || player.y + player.r > canvas.height) {
        gameOverScreen();
        return;
      }
      frame++;
      if (!gameOver) requestAnimationFrame(gameLoop);
    } else {
      // Idle-Animation (vor Start)
      player.anim += 0.035;
      drawKolibri(player.x, player.y, player.anim, 0, false);
      if (!gameOver) requestAnimationFrame(gameLoop);
    }
  } else {
    // Qualle: Blasen und Hindernisse
    if (frame % 80 === 0) addQualleBubble();
    if (frame % 160 === 0 && Math.random() < 0.47 && qualleObstacles.length < 3) addQualleObstacle();

    // Hindernisse
    for (let i = qualleObstacles.length - 1; i >= 0; i--) {
      let ob = qualleObstacles[i];
      ob.x -= obstacleSpeed;
      if (ob.type === "pflanze") {
        drawPflanze(ob.x, ob.baseY, ob.w, ob.h, ob.sway + frame * 0.045);
        // Kollisionszone: schmaler, mittig
        if (player.x + player.r > ob.x && player.x - player.r < ob.x + ob.w
          && player.y + player.r > ob.baseY - ob.h) {
          if (
            player.y + player.r > ob.baseY - ob.h + 10 &&
            player.x > ob.x + 5 &&
            player.x < ob.x + ob.w - 5
          ) {
            gameOverScreen();
            return;
          }
        }
      } else if (ob.type === "stein") {
        drawStein(ob.x, ob.y, ob.r);
        // Kollision
        let dx = player.x - ob.x, dy = player.y - ob.y;
        if (Math.sqrt(dx * dx + dy * dy) < ob.r + player.r - 4) {
          gameOverScreen();
          return;
        }
      }
      if (ob.x + (ob.w || ob.r) < 0) qualleObstacles.splice(i, 1);
    }

    // Blasen
    for (let i = qualleBubbles.length - 1; i >= 0; i--) {
      let ob = qualleBubbles[i];
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
        scoreDisplay.textContent = `Punkte: ${score} | Zeit: ${qualleTimer}s`;
        ob.scored = true;
      }
      if (ob.x + ob.r < 0) qualleBubbles.splice(i, 1);
    }
    // Spieler-Physik
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
    frame++;
    if (!gameOver && qualleTimer > 0) requestAnimationFrame(gameLoop);
  }
}

// Grafische Objekte
function drawKolibri(x, y, anim, vy, isFlap) {
  // Realistischer Kolibri: kleiner Kopf, langer Schnabel, bunter Flügel, Schwanzfeder
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.max(-0.45, Math.min(0.4, vy * 0.07)));
  // Schwanzfedern
  ctx.save();
  ctx.rotate(-0.12 + Math.sin(anim * 1.4) * 0.25);
  ctx.beginPath();
  ctx.moveTo(-10, 33);
  ctx.lineTo(0, 54 + Math.sin(anim * 2) * 3);
  ctx.lineTo(10, 33);
  ctx.closePath();
  ctx.fillStyle = "#1e7c2a";
  ctx.globalAlpha = 0.6;
  ctx.fill();
  ctx.restore();
  // Flügel, zwei Ebenen, transparent, bunt
  for (let i = 0; i < 2; i++) {
    ctx.save();
    ctx.rotate((i === 0 ? -1 : 1) * (Math.sin(anim * 2) * 1.3 + 0.9));
    ctx.beginPath();
    ctx.ellipse(0, 0, 13, 44, Math.PI / 6 * (i === 0 ? 1 : -1), 0, 2 * Math.PI);
    ctx.fillStyle = i === 0 ? "#b2e8df" : "#e8fae9";
    ctx.globalAlpha = i === 0 ? 0.63 : 0.41;
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  // Kopf
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, -19, 13, 0, Math.PI * 2);
  ctx.fillStyle = "#53c6e8";
  ctx.shadowColor = "#5fd8c7";
  ctx.shadowBlur = 4;
  ctx.fill();
  ctx.shadowBlur = 0;
  // Auge
  ctx.beginPath();
  ctx.arc(5, -22, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = "#263246";
  ctx.fill();
  ctx.restore();
  // Körper
  ctx.beginPath();
  ctx.ellipse(0, 2, 18, 32, Math.PI / 22, 0, 2 * Math.PI);
  ctx.fillStyle = "#6be87d";
  ctx.fill();
  // Brust
  ctx.beginPath();
  ctx.ellipse(-2, 8, 9, 14, Math.PI / 10, 0, 2 * Math.PI);
  ctx.fillStyle = "#f7f8be";
  ctx.globalAlpha = 0.5;
  ctx.fill();
  ctx.globalAlpha = 1;
  // Schnabel
  ctx.save();
  ctx.rotate(-0.19);
  ctx.beginPath();
  ctx.moveTo(14, -18);
  ctx.lineTo(38, -24);
  ctx.lineTo(14, -16);
  ctx.closePath();
  ctx.fillStyle = "#1a1a1a";
  ctx.fill();
  ctx.restore();
  ctx.restore();
}

function drawKolibriStart() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  player.anim += 0.035;
  drawKolibri(player.x, player.y, player.anim, 0, false);
}

function drawAstMitBlaettern(x, y, width, leafAnim) {
  // Ast
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + width, y - 18);
  ctx.lineWidth = 14;
  ctx.strokeStyle = "#8c713b";
  ctx.shadowColor = "#bda864";
  ctx.shadowBlur = 4;
  ctx.stroke();
  ctx.shadowBlur = 0;
  // Blätter
  for (let i = 0; i < 4; i++) {
    let lx = x + width * (0.2 + i * 0.2), ly = y - 14 - Math.sin(leafAnim + i) * 7;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(lx, ly, 12, 6, leafAnim + i, 0, Math.PI * 2);
    ctx.fillStyle = "#56c43c";
    ctx.globalAlpha = 0.8;
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function drawGras(x, y, width) {
  // Grasbüschel
  ctx.save();
  for (let i = 0; i < 6; i++) {
    let gx = x + width * (i / 5), gy = y + 2;
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.quadraticCurveTo(gx - 5, gy + 21, gx, gy + 26 + Math.sin(backgroundAnim + i) * 5);
    ctx.strokeStyle = "#6bcf45";
    ctx.lineWidth = 3 + Math.sin(backgroundAnim + i) * 1.2;
    ctx.globalAlpha = 0.9;
    ctx.stroke();
  }
  ctx.restore();
}

// --- Quallenspiel Hindernisse ---
function drawPflanze(x, baseY, w, h, swayAnim) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + w / 2, baseY);
  for (let i = 0; i < 7; i++) {
    let px = x + w / 2 + Math.sin(swayAnim + i * 0.5) * 8, py = baseY - h * (i / 6);
    ctx.lineTo(px, py);
  }
  ctx.strokeStyle = "#59b37d";
  ctx.lineWidth = 8;
  ctx.shadowColor = "#aee4c8";
  ctx.shadowBlur = 6;
  ctx.stroke();
  ctx.shadowBlur = 0;
  // Blätter
  for (let i = 2; i < 6; i++) {
    let lx = x + w / 2 + Math.sin(swayAnim + i * 0.6) * 12, ly = baseY - h * (i / 6);
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(lx, ly, 9, 6, swayAnim + i, 0, Math.PI * 2);
    ctx.fillStyle = "#b0e0b0";
    ctx.globalAlpha = 0.6;
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function drawStein(x, y, r) {
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.75, Math.PI / 7, 0, Math.PI * 2);
  ctx.fillStyle = "#b9b9b0";
  ctx.shadowColor = "#a1a1a0";
  ctx.shadowBlur = 7;
  ctx.fill();
  ctx.shadowBlur = 0;
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
    if (!kolibriStarted) return;
    player.vy = jumpStrength;
  } else {
    player.vy = swimStrength;
  }
}
canvas.addEventListener("touchstart", e => { e.preventDefault(); flapOrSwim(); }, { passive: false });
canvas.addEventListener("mousedown", flapOrSwim);
window.addEventListener("keydown", e => {
  if ((gameMode === "kolibri" || gameMode === "qualle") && (e.code === "Space" || e.code === "ArrowUp")) { e.preventDefault(); flapOrSwim(); }
});

function gameOverScreen() {
  gameOver = true;
  running = false;
  if (gameMode === "qualle" && qualleInterval) clearInterval(qualleInterval);
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
  if (gameMode === "qualle") {
    ctx.fillText("Punkte: " + score, canvas.width / 2, canvas.height / 2 + 18);
    ctx.fillText("Zeit abgelaufen oder Hindernis getroffen!", canvas.width / 2, canvas.height / 2 + 48);
  } else {
    ctx.fillText("Punkte: " + score, canvas.width / 2, canvas.height / 2 + 18);
    ctx.fillText("Hindernis berührt!", canvas.width / 2, canvas.height / 2 + 48);
  }
  ctx.restore();
}

restartBtn.onclick = () => {
  resetGame();
  if (gameMode === "kolibri") {
    kolibriStarted = false;
    drawKolibriStart();
    gameTip.textContent = "Klicke oder tippe um zu starten!";
    // Warte auf Klick/Touch zum Start
    canvas.onclick = () => {
      if (!kolibriStarted && !gameOver) {
        kolibriStarted = true;
        canvas.onclick = null;
        requestAnimationFrame(gameLoop);
        gameTip.textContent = "Tippe/Drücke zum Flattern! Weiche den Hindernissen aus!";
      }
    };
    canvas.ontouchstart = (e) => {
      e.preventDefault();
      if (!kolibriStarted && !gameOver) {
        kolibriStarted = true;
        canvas.ontouchstart = null;
        requestAnimationFrame(gameLoop);
        gameTip.textContent = "Tippe/Drücke zum Flattern! Weiche den Hindernissen aus!";
      }
    };
  } else {
    qualleStartTime = Date.now();
    qualleTimer = 60;
    scoreDisplay.textContent = "Punkte: 0 | Zeit: 60s";
    gameTip.textContent = "Sammle die Blasen! Hindernisse vermeiden!";
    if (qualleInterval) clearInterval(qualleInterval);
    qualleInterval = setInterval(updateQualleTime, 1000);
    requestAnimationFrame(gameLoop);
  }
};

kolibriBtn.onclick = () => startGame("kolibri");
qualleBtn.onclick = () => startGame("qualle");

// Bei Tab-Wechsel zurück zum Modus-Auswahlbildschirm
document.getElementById("game-tab-btn").onclick = () => {
  running = false;
  if (gameMode === "qualle" && qualleInterval) clearInterval(qualleInterval);
  canvas.style.display = "none";
  gameUI.style.display = "none";
  modeSelect.style.display = "block";
};