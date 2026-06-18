const COLS = 10;
const ROWS = 20;
const BLOCK = 30;

const COLORS = [
  null,
  '#00f5ff', // I - 청록
  '#ffd700', // O - 황금
  '#bf00ff', // T - 보라
  '#00ff88', // S - 초록
  '#ff4444', // Z - 빨강
  '#ff9500', // J - 주황
  '#0080ff', // L - 파랑
];

const TETROMINOES = [
  null,
  // I
  [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
  // O
  [[2,2],[2,2]],
  // T
  [[0,3,0],[3,3,3],[0,0,0]],
  // S
  [[0,4,4],[4,4,0],[0,0,0]],
  // Z
  [[5,5,0],[0,5,5],[0,0,0]],
  // J
  [[6,0,0],[6,6,6],[0,0,0]],
  // L
  [[0,0,7],[7,7,7],[0,0,0]],
];

const API_BASE = 'http://localhost:8001/api';

const boardCanvas = document.getElementById('board');
const ctx = boardCanvas.getContext('2d');
const nextCanvas = document.getElementById('next');
const nctx = nextCanvas.getContext('2d');

let board, piece, nextPiece, score, level, lines, dropInterval, lastTime, animId, paused, gameOver;
let gameStartTime, levelFlashUntil;
let token = localStorage.getItem('token');
let userEmail = localStorage.getItem('email');

function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function randomPiece() {
  const id = Math.floor(Math.random() * 7) + 1;
  const matrix = TETROMINOES[id].map(r => [...r]);
  return { id, matrix, x: Math.floor(COLS / 2) - Math.ceil(matrix[0].length / 2), y: 0 };
}

function rotate(matrix) {
  const n = matrix.length;
  return matrix[0].map((_, c) => matrix.map((_, r) => matrix[n - 1 - r][c]));
}

function collides(b, p, ox = 0, oy = 0, mat = p.matrix) {
  for (let r = 0; r < mat.length; r++) {
    for (let c = 0; c < mat[r].length; c++) {
      if (!mat[r][c]) continue;
      const nx = p.x + c + ox;
      const ny = p.y + r + oy;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && b[ny][nx]) return true;
    }
  }
  return false;
}

function merge() {
  piece.matrix.forEach((row, r) => {
    row.forEach((val, c) => {
      if (val) board[piece.y + r][piece.x + c] = val;
    });
  });
}

function clearLines() {
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(v => v !== 0)) {
      board.splice(r, 1);
      board.unshift(Array(COLS).fill(0));
      cleared++;
      r++;
    }
  }
  if (cleared === 0) return;

  const points = [0, 100, 300, 500, 800];
  score += (points[cleared] || 800) * level;
  lines += cleared;

  const linesLevel = Math.floor(lines / 10) + 1;
  if (linesLevel > level) {
    level = linesLevel;
    dropInterval = Math.max(100, 1000 - (level - 1) * 90);
    levelFlashUntil = performance.now() + 2000;
    document.getElementById('level').textContent = level;
  }

  document.getElementById('score').textContent = score;
  document.getElementById('lines').textContent = lines;
}

async function spawnPiece() {
  piece = nextPiece || randomPiece();
  nextPiece = randomPiece();
  if (collides(board, piece)) {
    gameOver = true;
    await saveGameRecord();
    await loadTopScore();
    showOverlay('GAME OVER', `최종 점수: ${score}`);
  }
  drawNext();
}

function drawBlock(context, x, y, colorId, size = BLOCK) {
  const color = COLORS[colorId];
  context.fillStyle = color;
  context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
  context.fillStyle = 'rgba(255,255,255,0.18)';
  context.fillRect(x * size + 1, y * size + 1, size - 2, 4);
  context.fillStyle = 'rgba(0,0,0,0.2)';
  context.fillRect(x * size + 1, y * size + size - 5, size - 2, 4);
}

function drawBoard(timestamp = performance.now()) {
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, boardCanvas.width, boardCanvas.height);

  // 격자
  ctx.strokeStyle = '#1a1a2e';
  ctx.lineWidth = 0.5;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      ctx.strokeRect(c * BLOCK, r * BLOCK, BLOCK, BLOCK);
    }
  }

  // 쌓인 블록
  board.forEach((row, r) => {
    row.forEach((val, c) => {
      if (val) drawBlock(ctx, c, r, val);
    });
  });

  // 고스트 (유령 블록)
  let ghostY = piece.y;
  while (!collides(board, piece, 0, ghostY - piece.y + 1)) ghostY++;
  if (ghostY !== piece.y) {
    piece.matrix.forEach((row, r) => {
      row.forEach((val, c) => {
        if (!val) return;
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect((piece.x + c) * BLOCK + 1, (ghostY + r) * BLOCK + 1, BLOCK - 2, BLOCK - 2);
      });
    });
  }

  // 현재 블록
  piece.matrix.forEach((row, r) => {
    row.forEach((val, c) => {
      if (val) drawBlock(ctx, piece.x + c, piece.y + r, val);
    });
  });

  // 레벨업 플래시
  const remaining = levelFlashUntil - timestamp;
  if (remaining > 0) {
    const alpha = Math.min(1, remaining / 400);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, boardCanvas.height / 2 - 50, boardCanvas.width, 100);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 24;
    ctx.fillText(`LEVEL ${level}`, boardCanvas.width / 2, boardCanvas.height / 2 - 6);
    ctx.font = '16px Arial';
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 0;
    ctx.fillText('속도가 빨라집니다!', boardCanvas.width / 2, boardCanvas.height / 2 + 22);
    ctx.restore();
  }
}

function drawNext() {
  nctx.fillStyle = '#0a0a1a';
  nctx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
  const size = 24;
  const mat = nextPiece.matrix;
  const offX = Math.floor((5 - mat[0].length) / 2);
  const offY = Math.floor((5 - mat.length) / 2);
  mat.forEach((row, r) => {
    row.forEach((val, c) => {
      if (!val) return;
      const color = COLORS[val];
      nctx.fillStyle = color;
      nctx.fillRect((offX + c) * size + 1, (offY + r) * size + 1, size - 2, size - 2);
      nctx.fillStyle = 'rgba(255,255,255,0.18)';
      nctx.fillRect((offX + c) * size + 1, (offY + r) * size + 1, size - 2, 4);
    });
  });
}

function drop() {
  if (!collides(board, piece, 0, 1)) {
    piece.y++;
  } else {
    merge();
    clearLines();
    spawnPiece();
  }
}

function hardDrop() {
  while (!collides(board, piece, 0, 1)) piece.y++;
  merge();
  clearLines();
  spawnPiece();
}

function moveLeft() {
  if (!collides(board, piece, -1, 0)) piece.x--;
}

function moveRight() {
  if (!collides(board, piece, 1, 0)) piece.x++;
}

function rotatePiece() {
  const rotated = rotate(piece.matrix);
  // 벽 밀기 (wall kick)
  const kicks = [0, 1, -1, 2, -2];
  for (const kick of kicks) {
    if (!collides(board, piece, kick, 0, rotated)) {
      piece.matrix = rotated;
      piece.x += kick;
      return;
    }
  }
}

function gameLoop(timestamp) {
  if (gameOver || paused) return;

  // 시간 기반 레벨업 (30초마다)
  const timeLevel = Math.floor((timestamp - gameStartTime) / 30000) + 1;
  if (timeLevel > level) {
    level = timeLevel;
    dropInterval = Math.max(100, 1000 - (level - 1) * 90);
    levelFlashUntil = timestamp + 2000;
    document.getElementById('level').textContent = level;
  }

  const delta = timestamp - lastTime;
  if (delta >= dropInterval) {
    drop();
    lastTime = timestamp;
  }
  drawBoard(timestamp);
  animId = requestAnimationFrame(gameLoop);
}

function showOverlay(title, subtitle = '') {
  document.getElementById('overlay-title').textContent = title;
  document.getElementById('overlay-score').textContent = subtitle;
  document.getElementById('overlay').classList.remove('hidden');
}

function hideOverlay() {
  document.getElementById('overlay').classList.add('hidden');
}

function startGame() {
  board = createBoard();
  score = 0;
  level = 1;
  lines = 0;
  dropInterval = 1000;
  paused = false;
  gameOver = false;
  lastTime = 0;

  document.getElementById('score').textContent = '0';
  document.getElementById('level').textContent = '1';
  document.getElementById('lines').textContent = '0';

  nextPiece = randomPiece();
  spawnPiece();
  hideOverlay();

  cancelAnimationFrame(animId);
  animId = requestAnimationFrame(ts => {
    gameStartTime = ts;
    lastTime = ts;
    levelFlashUntil = 0;
    gameLoop(ts);
  });
}

document.addEventListener('keydown', e => {
  if (gameOver) return;
  switch (e.code) {
    case 'ArrowLeft':  e.preventDefault(); moveLeft(); break;
    case 'ArrowRight': e.preventDefault(); moveRight(); break;
    case 'ArrowDown':  e.preventDefault(); drop(); lastTime = performance.now(); break;
    case 'ArrowUp':    e.preventDefault(); rotatePiece(); break;
    case 'Space':      e.preventDefault(); hardDrop(); break;
    case 'KeyP':
      if (paused) {
        paused = false;
        hideOverlay();
        lastTime = performance.now();
        animId = requestAnimationFrame(gameLoop);
      } else {
        paused = true;
        showOverlay('PAUSED');
      }
      break;
  }
  if (!paused && !gameOver) drawBoard();
});

// 로그인 체크
if (!token) {
  window.location.href = 'auth.html';
} else {
  loadTopScore();
  displayUserEmail();
  startGame();
}

// 백엔드 연동 함수
async function saveGameRecord() {
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE}/game-records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ score, level, lines })
    });

    if (!response.ok) {
      console.error('Failed to save game record');
    }
  } catch (error) {
    console.error('Error saving game record:', error);
  }
}

async function loadTopScore() {
  try {
    const response = await fetch(`${API_BASE}/top-score`);
    const data = await response.json();

    if (data.score) {
      const topScoreEl = document.getElementById('top-score');
      if (topScoreEl) {
        topScoreEl.textContent = `${data.score} (${data.email})`;
      }
    }
  } catch (error) {
    console.error('Error loading top score:', error);
  }
}

function displayUserEmail() {
  const userEmailEl = document.getElementById('user-email');
  if (userEmailEl && userEmail) {
    userEmailEl.textContent = userEmail;
  }
}

function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('email');
  window.location.href = 'auth.html';
}
