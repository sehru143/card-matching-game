'use strict';

const PAIR_COUNT = 8;
const SYMBOLS = ['🌸', '🦋', '🌙', '⭐', '🍓', '🌈', '🧸', '🍀'];
const API = {
  save: 'api/save_score.php',
  leaderboard: 'api/leaderboard.php',
  best: 'api/best_score.php'
};

const startScreen = document.querySelector('#start-screen');
const gameScreen = document.querySelector('#game-screen');
const startForm = document.querySelector('#start-form');
const nameInput = document.querySelector('#player-name');
const nameError = document.querySelector('#name-error');
const grid = document.querySelector('#card-grid');
const panel = document.querySelector('#panel-modal');
const victory = document.querySelector('#victory-modal');
const panelTitle = document.querySelector('#panel-title');
const panelKicker = document.querySelector('#panel-kicker');
const panelContent = document.querySelector('#panel-content');

let playerName = '';
let deck = [];
let selectedCards = [];
let moves = 0;
let matchedPairs = 0;
let elapsedSeconds = 0;
let timerId = null;
let comparisonLocked = false;
let gameCompleted = false;
let saveStarted = false;
let gameToken = '';

const byId = (id) => document.getElementById(id);

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

// The score rewards each match and subtracts a small cost for extra moves and time.
function calculateScore(pairs, moveCount, seconds) {
  return Math.max(0, pairs * 200 - Math.max(0, moveCount - pairs) * 35 - seconds * 2);
}

function updateStats() {
  byId('score-value').textContent = calculateScore(matchedPairs, moves, elapsedSeconds).toString();
  byId('moves-value').textContent = moves.toString();
  byId('pairs-value').textContent = matchedPairs.toString();
  byId('time-value').textContent = formatTime(elapsedSeconds);
}

function startTimer() {
  window.clearInterval(timerId);
  timerId = window.setInterval(() => {
    if (gameCompleted) return;
    elapsedSeconds += 1;
    updateStats();
  }, 1000);
}

function createCard(symbol, index) {
  const card = document.createElement('button');
  card.className = 'memory-card';
  card.type = 'button';
  card.dataset.symbol = symbol;
  card.dataset.index = index.toString();
  card.setAttribute('aria-label', `Face-down card ${index + 1}`);
  card.setAttribute('aria-pressed', 'false');
  card.innerHTML = '<span class="card-inner"><span class="card-face card-back" aria-hidden="true"><span>✿</span></span><span class="card-face card-front" aria-hidden="true"></span></span>';
  card.querySelector('.card-front').textContent = symbol;
  card.addEventListener('click', () => selectCard(card));
  return card;
}

function dealCards() {
  const pairedSymbols = SYMBOLS.flatMap((symbol) => [symbol, symbol]);
  deck = shuffle(pairedSymbols);
  grid.replaceChildren(...deck.map(createCard));
}

function beginGame(name = playerName) {
  playerName = name;
  moves = 0;
  matchedPairs = 0;
  elapsedSeconds = 0;
  selectedCards = [];
  comparisonLocked = false;
  gameCompleted = false;
  saveStarted = false;
  gameToken = crypto.randomUUID();
  byId('hud-player').textContent = playerName;
  byId('game-status').textContent = 'Find all 8 matching pairs.';
  byId('best-score').textContent = 'Your best: loading…';
  updateStats();
  dealCards();
  startScreen.hidden = true;
  gameScreen.hidden = false;
  startTimer();
  fetchBestScore(playerName);
}

function selectCard(card) {
  if (comparisonLocked || gameCompleted || card.classList.contains('is-flipped') || card.classList.contains('is-matched')) return;
  card.classList.add('is-flipped');
  card.setAttribute('aria-pressed', 'true');
  card.setAttribute('aria-label', `Revealed ${card.dataset.symbol}`);
  selectedCards.push(card);
  if (selectedCards.length < 2) return;

  moves += 1;
  comparisonLocked = true;
  updateStats();
  const [first, second] = selectedCards;
  if (first.dataset.symbol === second.dataset.symbol) {
    first.classList.add('is-matched');
    second.classList.add('is-matched');
    first.setAttribute('aria-label', `Matched ${first.dataset.symbol}`);
    second.setAttribute('aria-label', `Matched ${second.dataset.symbol}`);
    matchedPairs += 1;
    selectedCards = [];
    comparisonLocked = false;
    updateStats();
    byId('game-status').textContent = matchedPairs === PAIR_COUNT ? 'Every pair found. Lovely work!' : 'A lovely match! Keep going.';
    if (matchedPairs === PAIR_COUNT) completeGame();
    return;
  }

  byId('game-status').textContent = 'Not quite. Take another look…';
  window.setTimeout(() => {
    for (const selected of selectedCards) {
      selected.classList.remove('is-flipped');
      selected.setAttribute('aria-pressed', 'false');
      selected.setAttribute('aria-label', `Face-down card ${Number(selected.dataset.index) + 1}`);
    }
    selectedCards = [];
    comparisonLocked = false;
    byId('game-status').textContent = 'Find all 8 matching pairs.';
  }, 850);
}

function completeGame() {
  gameCompleted = true;
  window.clearInterval(timerId);
  for (const card of grid.querySelectorAll('.memory-card')) card.disabled = true;
  const finalScore = calculateScore(matchedPairs, moves, elapsedSeconds);
  byId('victory-player').textContent = playerName;
  byId('final-score').textContent = finalScore.toString();
  byId('final-time').textContent = formatTime(elapsedSeconds);
  byId('final-moves').textContent = moves.toString();
  byId('final-pairs').textContent = `${matchedPairs} / ${PAIR_COUNT}`;
  byId('save-message').classList.remove('is-error');
  byId('save-message').textContent = 'Saving your score…';
  victory.showModal();
  saveCompletedGame(finalScore, gameToken);
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, { headers: { Accept: 'application/json', ...(options.headers || {}) }, ...options });
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('The server returned an unreadable response. Please try again later.');
  }
  if (!response.ok || data.success !== true) throw new Error(data.message || 'The request could not be completed.');
  return data;
}

async function fetchBestScore(name) {
  const currentName = name;
  try {
    const data = await requestJson(`${API.best}?name=${encodeURIComponent(name)}`);
    if (playerName === currentName && !gameCompleted) {
      byId('best-score').textContent = data.best_score === null ? 'Your best: —' : `Your best: ${Number(data.best_score).toLocaleString()}`;
    }
  } catch {
    if (playerName === currentName && !gameCompleted) byId('best-score').textContent = 'Your best: unavailable';
  }
}

async function saveCompletedGame(score, token) {
  if (saveStarted) return;
  saveStarted = true;
  const message = byId('save-message');
  try {
    const data = await requestJson(API.save, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game_id: token, player_name: playerName, score, moves, time_seconds: elapsedSeconds, pairs: matchedPairs })
    });
    message.classList.remove('is-error');
    message.textContent = data.duplicate ? 'Your score was already saved.' : 'Score saved to the leaderboard.';
    if (!data.duplicate && data.best_score !== undefined) byId('best-score').textContent = `Your best: ${Number(data.best_score).toLocaleString()}`;
  } catch (error) {
    message.classList.add('is-error');
    message.textContent = `${error.message} Your completed game is still shown here.`;
  }
}

function openInstructions() {
  panelKicker.textContent = 'A little guide';
  panelTitle.textContent = 'How to play';
  panelContent.innerHTML = `<ol class="instruction-list">
    <li><span>1</span><div>Enter your name so your results can appear on the leaderboard.</div></li>
    <li><span>2</span><div>Start a game and take a moment to notice where each symbol lives.</div></li>
    <li><span>3</span><div>Flip any two cards. Each pair you turn over counts as one move.</div></li>
    <li><span>4</span><div>Find all eight matching pairs. Mismatched cards turn back over shortly.</div></li>
    <li><span>5</span><div>Matches earn points; extra moves and time gently lower your score.</div></li>
    <li><span>6</span><div>Finish quickly with fewer moves, then see how you did on the leaderboard.</div></li>
  </ol>`;
  panel.showModal();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function renderLeaderboard(rows) {
  if (!Array.isArray(rows)) throw new Error('The server returned invalid leaderboard data.');
  if (rows.length === 0) {
    panelContent.innerHTML = '<p class="empty-state">No scores yet. Be the first to enter the leaderboard!</p>';
    return;
  }
  const table = document.createElement('table');
  table.className = 'leaderboard-table';
  table.innerHTML = '<thead><tr><th scope="col">Rank</th><th scope="col">Player</th><th scope="col">Score</th><th scope="col">Moves</th><th scope="col">Time</th><th scope="col">Date</th></tr></thead>';
  const body = document.createElement('tbody');
  rows.forEach((row, index) => {
    const rowElement = document.createElement('tr');
    rowElement.className = index < 3 ? `rank-${index + 1}` : '';
    const seconds = Number(row.time_seconds);
    const minutesText = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secondsText = (seconds % 60).toString().padStart(2, '0');
    rowElement.innerHTML = `<td>#${index + 1}</td><td>${escapeHtml(row.player_name)}</td><td>${Number(row.score).toLocaleString()}</td><td>${Number(row.moves)} moves</td><td>${minutesText}:${secondsText}</td><td>${escapeHtml(row.date)}</td>`;
    body.append(rowElement);
  });
  table.append(body);
  const wrapper = document.createElement('div');
  wrapper.className = 'leaderboard-wrap';
  wrapper.append(table);
  panelContent.replaceChildren(wrapper);
}

async function openLeaderboard() {
  panelKicker.textContent = 'A little friendly rivalry';
  panelTitle.textContent = 'Leaderboard';
  panelContent.innerHTML = '<p class="loading-state"><span class="loading-dot" aria-hidden="true"></span>Gathering the best scores…</p>';
  if (!panel.open) panel.showModal();
  try {
    const data = await requestJson(API.leaderboard);
    renderLeaderboard(data.scores);
  } catch (error) {
    panelContent.innerHTML = `<p class="error-state">${escapeHtml(error.message)}</p>`;
  }
}

function showHome() {
  window.clearInterval(timerId);
  gameCompleted = true;
  if (victory.open) victory.close();
  gameScreen.hidden = true;
  startScreen.hidden = false;
  nameInput.value = playerName;
  nameInput.focus();
}

startForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = nameInput.value.trim();
  if (!name || name.length > 24 || !/^[\p{L}\p{M}\p{N} .'-]+$/u.test(name)) {
    nameError.textContent = !name ? 'Please enter your name to start.' : 'Use up to 24 letters, numbers, spaces, apostrophes, periods, or hyphens.';
    nameError.hidden = false;
    nameInput.setAttribute('aria-invalid', 'true');
    nameInput.focus();
    return;
  }
  nameError.hidden = true;
  nameInput.removeAttribute('aria-invalid');
  beginGame(name);
});

nameInput.addEventListener('input', () => {
  if (nameInput.value.trim()) {
    nameError.hidden = true;
    nameInput.removeAttribute('aria-invalid');
  }
});

document.querySelectorAll('[data-open-panel="leaderboard"]').forEach((button) => button.addEventListener('click', openLeaderboard));
document.querySelector('[data-open-panel="instructions"]').addEventListener('click', openInstructions);
document.querySelector('[data-close-panel]').addEventListener('click', () => panel.close());
panel.addEventListener('click', (event) => {
  if (event.target === panel) panel.close();
});

byId('restart-button').addEventListener('click', () => {
  if (!gameCompleted && !window.confirm('Restart this game? Your current progress will be lost.')) return;
  beginGame(playerName);
});

byId('home-button').addEventListener('click', () => {
  if (!gameCompleted && !window.confirm('Are you sure you want to leave? Your current progress will be lost.')) return;
  showHome();
});

byId('play-again-button').addEventListener('click', () => {
  victory.close();
  beginGame(playerName);
});

byId('victory-home-button').addEventListener('click', showHome);