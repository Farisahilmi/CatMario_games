const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Responsive canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight * 0.8;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const gravity = 0.6;
const jumpPower = -12;
const speed = 5;

let level = 1;

// Player
let player = {
  x: 50,
  y: 300,
  width: 30,
  height: 30,
  color: "red",
  dx: 0,
  dy: 0,
  grounded: false
};

// Level data
const levels = [
  { // Level 1 - gampang
    platforms: [
      { x: 0, y: canvas.height - 50, width: canvas.width, height: 50, color: "green" },
      { x: 200, y: canvas.height - 120, width: 100, height: 20, color: "brown" },
      { x: 400, y: canvas.height - 180, width: 100, height: 20, color: "brown" }
    ],
    traps: [
      { x: 300, y: canvas.height - 70, width: 40, height: 20, color: "red" }
    ],
    goal: { x: canvas.width - 100, y: canvas.height - 80, width: 40, height: 40, color: "gold" }
  },
  { // Level 2 - nyebelin
    platforms: [
      { x: 0, y: canvas.height - 50, width: canvas.width, height: 50, color: "green" },
      { x: 200, y: canvas.height - 120, width: 100, height: 20, color: "brown" },
      { x: 400, y: canvas.height - 200, width: 100, height: 20, color: "brown" },
    ],
    traps: [
      { x: 500, y: canvas.height - 70, width: 40, height: 20, color: "brown" }
    ],
    fakePlatforms: [
      { x: 300, y: canvas.height - 200, width: 100, height: 20, color: "gray", active: true }
    ],
    fakeGoal: { x: canvas.width - 80, y: canvas.height - 260, width: 30, height: 30, color: "gold" },
    goal: { x: canvas.width - 200, y: canvas.height - 350, width: 30, height: 30, color: "gold" }
  }
];

let platforms = [];
let traps = [];
let fakePlatforms = [];
let goal = null;
let fakeGoal = null;

// Background awan
let clouds = [];
for (let i = 0; i < 10; i++) {
  clouds.push({
    x: Math.random() * canvas.width,
    y: Math.random() * (canvas.height / 2),
    width: 60 + Math.random() * 40,
    height: 30 + Math.random() * 20,
    speed: 0.2 + Math.random() * 0.3
  });
}

// Keyboard input
let keys = {};
document.addEventListener("keydown", (e) => keys[e.code] = true);
document.addEventListener("keyup", (e) => keys[e.code] = false);

// Mobile input
const btnLeft = document.getElementById("left");
const btnRight = document.getElementById("right");
const btnJump = document.getElementById("jump");

btnLeft.addEventListener("touchstart", () => keys["ArrowLeft"] = true);
btnLeft.addEventListener("touchend", () => keys["ArrowLeft"] = false);

btnRight.addEventListener("touchstart", () => keys["ArrowRight"] = true);
btnRight.addEventListener("touchend", () => keys["ArrowRight"] = false);

btnJump.addEventListener("touchstart", () => keys["Space"] = true);
btnJump.addEventListener("touchend", () => keys["Space"] = false);

// Load level
function loadLevel(lvl) {
  platforms = levels[lvl-1].platforms || [];
  traps = levels[lvl-1].traps || [];
  fakePlatforms = levels[lvl-1].fakePlatforms || [];
  goal = levels[lvl-1].goal || null;
  fakeGoal = levels[lvl-1].fakeGoal || null;
  resetGame();
}

// Update loop
function update() {
  // Gerak horizontal
  if (keys["ArrowLeft"] || keys["KeyA"]) player.dx = -speed;
  else if (keys["ArrowRight"] || keys["KeyD"]) player.dx = speed;
  else player.dx = 0;

  // Loncat
  if ((keys["Space"] || keys["KeyW"]) && player.grounded) {
    player.dy = jumpPower;
    player.grounded = false;
  }

  // Gravity
  player.dy += gravity;
  player.x += player.dx;
  player.y += player.dy;

  // Platform collision
  player.grounded = false;
  for (let p of platforms) {
    if (player.x < p.x + p.width && player.x + player.width > p.x &&
        player.y < p.y + p.height && player.y + player.height > p.y) {
      if (player.dy > 0) {
        player.y = p.y - player.height;
        player.dy = 0;
        player.grounded = true;
      }
    }
  }

  // Fake platforms
  for (let f of fakePlatforms) {
    if (f.active && player.x < f.x + f.width && player.x + player.width > f.x &&
        player.y < f.y + f.height && player.y + player.height > f.y) {
      f.active = false;
      setTimeout(() => { alert("HAHA! Platform palsu 🤡"); resetGame(); }, 100);
    }
  }

  // Traps
  for (let t of traps) {
    if (player.x < t.x + t.width && player.x + player.width > t.x &&
        player.y < t.y + t.height && player.y + player.height > t.y) {
      alert("HAHA kena troll 🤡");
      resetGame();
    }
  }

  // Goal palsu
  if (fakeGoal && player.x < fakeGoal.x + fakeGoal.width &&
      player.x + player.width > fakeGoal.x &&
      player.y < fakeGoal.y + fakeGoal.height &&
      player.y + player.height > fakeGoal.y) {
    alert("WOI itu goal PALSU wkwkwk 🤣");
    resetGame();
  }

  // Goal asli
  if (goal && player.x < goal.x + goal.width &&
      player.x + player.width > goal.x &&
      player.y < goal.y + goal.height &&
      player.y + player.height > goal.y) {
    if (level === 1) {
      alert("Alah, baru level satu jangan bangga!!! 🤣");
      level = 2;
      loadLevel(level);
    } else {
      alert("WHAT!? Kamu beneran tamat level 2? 🤯");
      level = 1;
      loadLevel(level);
    }
  }

  // Boundary check
  if (player.y > canvas.height || player.x < 0 || player.x > canvas.width) {
    alert("HAHA! Jatoh / keluar layar 🤣");
    resetGame();
  }

  draw();
  requestAnimationFrame(update);
}

// Draw
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Clouds
  for (let c of clouds) {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, c.width/2, c.height/2, 0, 0, Math.PI*2);
    ctx.fill();
    c.x += c.speed;
    if (c.x - c.width/2 > canvas.width) c.x = -c.width/2;
  }

  // Platforms
  for (let p of platforms) {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.width, p.height);
  }

  // Fake platforms
  for (let f of fakePlatforms) {
    if (f.active) {
      ctx.fillStyle = f.color;
      ctx.fillRect(f.x, f.y, f.width, f.height);
    }
  }

  // Traps
  for (let t of traps) {
    ctx.fillStyle = t.color;
    ctx.fillRect(t.x, t.y, t.width, t.height);
  }

  // Goals
  if (fakeGoal) {
    ctx.fillStyle = fakeGoal.color;
    ctx.fillRect(fakeGoal.x, fakeGoal.y, fakeGoal.width, fakeGoal.height);
  }
  if (goal) {
    ctx.fillStyle = goal.color;
    ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
  }

  // Player
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Reset player
function resetGame() {
  player.x = 50;
  player.y = canvas.height - 100;
  player.dx = 0;
  player.dy = 0;
}

loadLevel(level);
update();
