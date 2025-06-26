(() => {
// ----- Kolibri & Qualle Game mit robustem Button-Handling -----
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const modeSelect = document.getElementById("game-mode-select");
const kolibriBtn = document.getElementById("kolibri-btn");
const qualleBtn = document.getElementById("qualle-btn");
const restartBtn = document.getElementById("restart-btn");
const gameUI = document.getElementById("game-ui");
const gameTip = document.getElementById("game-tip");
const gameScoreTimerBar = document.getElementById("game-score-timer");
const gameScoreBar = document.getElementById("game-score");
const gameTimerBar = document.getElementById("timer-value");

let gameMode = null;
let running = false;
let player, obstacles, bubbles, score, gravity, jumpStrength, swimStrength, obstacleSpeed, frame, backgroundAnim;
let gameOver = false;
let kolibriStarted = false;
let timer = 60;
let timerInterval = null;

function setGameModeButtons() {
  kolibriBtn.onclick = () => startGame("kolibri");
  qualleBtn.onclick = () => startGame("qualle");
}
setGameModeButtons();

function startGame(mode) {
  gameMode = mode;
  running = true;
  modeSelect.style.display = "none";
  canvas.style.display = "block";
  gameUI.style.display = "block";
  gameScoreTimerBar.style.display = "flex";
  resetGame();
  if (mode === "kolibri") {
    kolibriStarted = false;
    drawKolibriStart();
    gameTip.textContent = "Klicke oder tippe um zu starten!";
    canvas.onclick = () => {
      if (!kolibriStarted && !gameOver) {
        kolibriStarted = true;
        canvas.onclick = null;
        startTimer();
        requestAnimationFrame(gameLoop);
        gameTip.textContent = "Tippe/Drücke zum Flattern! Weiche den Hindernissen aus!";
      }
    };
    canvas.ontouchstart = (e) => {
      e.preventDefault();
      if (!kolibriStarted && !gameOver) {
        kolibriStarted = true;
        canvas.ontouchstart = null;
        startTimer();
        requestAnimationFrame(gameLoop);
        gameTip.textContent = "Tippe/Drücke zum Flattern! Weiche den Hindernissen aus!";
      }
    };
  } else {
    startTimer();
    requestAnimationFrame(gameLoop);
    gameTip.textContent = "Sammle die Blasen! Hindernisse vermeiden!";
  }
}

function resetGame() {
  if (gameMode === "kolibri") {
    player = {
      x: 38,
      y: canvas.height / 2,
      r: 22,
      vy: 0,
      anim: 0,
      flap: 0,
    };
    gravity = 0.23;
    jumpStrength = -6.3;
    obstacleSpeed = 3.5;
    backgroundAnim = 0;
    obstacles = [];
    score = 0;
    frame = 0;
    gameOver = false;
    gameScoreBar.textContent = "Punkte: 0";
    timer = 60;
    if (timerInterval) clearInterval(timerInterval);
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
    obstacles = [];
    bubbles = [];
    score = 0;
    frame = 0;
    gameOver = false;
    timer = 60;
    if (timerInterval) clearInterval(timerInterval);
    gameScoreBar.textContent = "Punkte: 0";
  }
  gameTimerBar.textContent = timer;
}

function startTimer() {
  timerInterval = setInterval(() => {
    timer--;
    gameTimerBar.textContent = timer;
    if (timer <= 0) {
      clearInterval(timerInterval);
      gameOverScreen("time");
    }
  }, 1000);
}

function addKolibriObstacle() {
  let gap = 170, minH = 60,
    topH = Math.random() * (canvas.height - gap - minH * 2) + minH;
  obstacles.push({
    x: canvas.width + 20,
    top: topH,
    bottom: topH + gap,
    width: 56,
    passed: false,
    topType: "ast",
    bottomType: "gras",
    leafOffset: Math.random() * Math.PI * 2,
  });
}

function addQualleBubble() {
  bubbles.push({
    x: canvas.width + 10,
    y: Math.random() * (canvas.height - 80) + 40,
    r: 20 + Math.random() * 18,
    scored: false
  });
}
function addQualleObstacle() {
  if (Math.random() < 0.5) {
    obstacles.push({
      type: "pflanze",
      x: canvas.width + 20,
      baseY: canvas.height - 6,
      w: 22 + Math.random() * 16,
      h: 55 + Math.random() * 70,
      sway: Math.random() * Math.PI * 2,
    });
  } else {
    obstacles.push({
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
  backgroundAnim += (gameMode === "kolibri") ? 0.3 : 0.12;
  drawBackground();

  if (gameMode === "kolibri") {
    if (kolibriStarted) {
      if (frame % 88 === 0) addKolibriObstacle();
      for (let i = obstacles.length - 1; i >= 0; i--) {
        let ob = obstacles[i];
        ob.x -= obstacleSpeed;
        drawAstMitBlaettern(ob.x, ob.top, ob.width, ob.leafOffset);
        drawGras(ob.x, ob.bottom, ob.width);
        if (
          player.x + player.r > ob.x && player.x - player.r < ob.x + ob.width &&
          (player.y - player.r < ob.top || player.y + player.r > ob.bottom)
        ) {
          gameOverScreen();
          return;
        }
        if (!ob.passed && ob.x + ob.width < player.x) {
          score++;
          gameScoreBar.textContent = "Punkte: " + score;
          ob.passed = true;
        }
        if (ob.x + ob.width < 0) obstacles.splice(i, 1);
      }
      player.vy += gravity;
      player.y += player.vy;
      player.anim += Math.abs(player.vy) * 0.12 + 0.06;
      drawKolibri(player.x, player.y, player.anim, player.vy, kolibriStarted);
      if (player.y - player.r < 0 || player.y + player.r > canvas.height) {
        gameOverScreen();
        return;
      }
      frame++;
      if (!gameOver && timer > 0) requestAnimationFrame(gameLoop);
    } else {
      player.anim += 0.035;
      drawKolibri(player.x, player.y, player.anim, 0, false);
      if (!gameOver) requestAnimationFrame(gameLoop);
    }
  } else {
    if (frame % 80 === 0) addQualleBubble();
    if (frame % 160 === 0 && Math.random() < 0.47 && obstacles.length < 3) addQualleObstacle();
    for (let i = obstacles.length - 1; i >= 0; i--) {
      let ob = obstacles[i];
      ob.x -= obstacleSpeed;
      if (ob.type === "pflanze") {
        drawPflanze(ob.x, ob.baseY, ob.w, ob.h, ob.sway + frame * 0.045);
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
        let dx = player.x - ob.x, dy = player.y - ob.y;
        if (Math.sqrt(dx * dx + dy * dy) < ob.r + player.r - 4) {
          gameOverScreen();
          return;
        }
      }
      if (ob.x + (ob.w || ob.r) < 0) obstacles.splice(i, 1);
    }
    for (let i = bubbles.length - 1; i >= 0; i--) {
      let ob = bubbles[i];
      ob.x -= obstacleSpeed;
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
      let dx = player.x - ob.x, dy = player.y - ob.y;
      if (!ob.scored && Math.sqrt(dx * dx + dy * dy) < ob.r + player.r - 4) {
        score++;
        gameScoreBar.textContent = "Punkte: " + score;
        ob.scored = true;
        bubbles.splice(i, 1);
        continue;
      }
      if (ob.x + ob.r < 0) bubbles.splice(i, 1);
    }
    player.vy += gravity;
    player.y += player.vy;
    player.anim += 0.1 + Math.abs(player.vy) * 0.07;
    drawQualle(player.x, player.y, player.anim);
    if (player.y - player.r < 0) {
      player.y = player.r;
      player.vy = 0;
    }
    if (player.y + player.r > canvas.height) {
      player.y = canvas.height - player.r;
      player.vy = 0;
    }
    frame++;
    if (!gameOver && timer > 0) requestAnimationFrame(gameLoop);
  }
}

function drawKolibri(x, y, anim, vy, isFlap) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.max(-0.45, Math.min(0.4, vy * 0.07)));
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
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, -19, 13, 0, Math.PI * 2);
  ctx.fillStyle = "#53c6e8";
  ctx.shadowColor = "#5fd8c7";
  ctx.shadowBlur = 4;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(5, -22, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = "#263246";
  ctx.fill();
  ctx.restore();
  ctx.beginPath();
  ctx.ellipse(0, 2, 18, 32, Math.PI / 22, 0, 2 * Math.PI);
  ctx.fillStyle = "#6be87d";
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-2, 8, 9, 14, Math.PI / 10, 0, 2 * Math.PI);
  ctx.fillStyle = "#f7f8be";
  ctx.globalAlpha = 0.5;
  ctx.fill();
  ctx.globalAlpha = 1;
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
  ctx.beginPath();
  ctx.ellipse(0, 0, 28, 22 + Math.sin(anim) * 2, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#b8e0fa";
  ctx.shadowColor = "#74b1dc";
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.ellipse(0, 10, 19, 11 + Math.cos(anim) * 1.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.globalAlpha = 0.48;
  ctx.fill();
  ctx.globalAlpha = 1;
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
function drawBackground() {
  if (gameMode === "kolibri") {
    ctx.fillStyle = "#bfeaff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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
    let grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#78d3fb");
    grad.addColorStop(1, "#d2f6ff");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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
function gameOverScreen(reason) {
  gameOver = true;
  running = false;
  if (timerInterval) clearInterval(timerInterval);
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
  if (reason === "time") {
    ctx.font = "16px Arial";
    ctx.fillText("Zeit abgelaufen!", canvas.width / 2, canvas.height / 2 + 48);
  } else {
    ctx.font = "16px Arial";
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
    canvas.onclick = () => {
      if (!kolibriStarted && !gameOver) {
        kolibriStarted = true;
        canvas.onclick = null;
        startTimer();
        requestAnimationFrame(gameLoop);
        gameTip.textContent = "Tippe/Drücke zum Flattern! Weiche den Hindernissen aus!";
      }
    };
    canvas.ontouchstart = (e) => {
      e.preventDefault();
      if (!kolibriStarted && !gameOver) {
        kolibriStarted = true;
        canvas.ontouchstart = null;
        startTimer();
        requestAnimationFrame(gameLoop);
        gameTip.textContent = "Tippe/Drücke zum Flattern! Weiche den Hindernissen aus!";
      }
    };
  } else {
    startTimer();
    requestAnimationFrame(gameLoop);
    gameTip.textContent = "Sammle die Blasen! Hindernisse vermeiden!";
  }
};

document.getElementById("game-tab-btn").onclick = () => {
  running = false;
  if (timerInterval) clearInterval(timerInterval);
  canvas.style.display = "none";
  gameUI.style.display = "none";
  modeSelect.style.display = "block";
  gameScoreTimerBar.style.display = "none";
  setGameModeButtons();
};
})();