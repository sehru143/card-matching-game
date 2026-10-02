<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#e8f3ff">
  <title>Memory Match | Dreamy Memory</title>
  <link rel="stylesheet" href="css/style.css">
  <script src="js/game.js" defer></script>
</head>
<body>
  <main class="app-shell">
    <header class="topbar">
      <a class="wordmark" href="#home" aria-label="Memory Match home">
        <span class="wordmark-mark" aria-hidden="true">✦</span>
        <span>memory match</span>
      </a>
      <span class="season-tag"><span aria-hidden="true">✿</span> Dreamy Memory</span>
    </header>

    <section class="screen start-screen" id="start-screen" aria-labelledby="welcome-title">
      <div class="welcome-copy">
        <p class="eyebrow"><span aria-hidden="true">✧</span> A little pause for your brain</p>
        <h1 id="welcome-title">Memory<br><span>Match</span></h1>
        <p class="welcome-subtitle">Train your memory, match the pairs, and climb the leaderboard!</p>
        <form id="start-form" class="start-form" novalidate>
          <label for="player-name">Your name</label>
          <div class="name-entry">
            <span aria-hidden="true">☺</span>
            <input id="player-name" name="player-name" type="text" maxlength="24" autocomplete="name" placeholder="What should we call you?" aria-describedby="name-error">
          </div>
          <p class="field-error" id="name-error" role="alert" hidden></p>
          <button class="button button-primary start-button" type="submit">Start a game <span aria-hidden="true">↗</span></button>
        </form>
        <div class="start-links">
          <button class="text-button" type="button" data-open-panel="leaderboard">♛ &nbsp;Leaderboard</button>
          <button class="text-button" type="button" data-open-panel="instructions">ⓘ &nbsp;How to play</button>
        </div>
      </div>

      <div class="welcome-art" aria-hidden="true">
        <div class="art-orbit orbit-one"></div>
        <div class="art-orbit orbit-two"></div>
        <span class="art-spark spark-one">✧</span>
        <span class="art-spark spark-two">✦</span>
        <span class="art-spark spark-three">·</span>
        <div class="art-card art-card-back"><span>✿</span></div>
        <div class="art-card art-card-front"><span>🦋</span></div>
        <div class="art-sticker sticker-flower">🌼</div>
        <div class="art-sticker sticker-star">⭐</div>
        <div class="art-caption">Find your<br>little moments<br>of wonder.</div>
      </div>
    </section>

    <section class="screen game-screen" id="game-screen" aria-labelledby="game-title" hidden>
      <div class="game-heading">
        <div>
          <p class="eyebrow"><span aria-hidden="true">✧</span> Your daily daydream</p>
          <h1 id="game-title">Find the <span>pairs</span></h1>
        </div>
        <div class="game-actions">
          <button class="button button-quiet" id="home-button" type="button" aria-label="Return home">⌂ <span>Home</span></button>
          <button class="button button-quiet" id="restart-button" type="button">↻ <span>Restart</span></button>
          <button class="button button-quiet" type="button" data-open-panel="leaderboard">♛ <span>Leaderboard</span></button>
        </div>
      </div>

      <div class="player-line"><span class="player-avatar" aria-hidden="true">☺</span><span>Playing as <strong id="hud-player">Player</strong></span><span class="best-score" id="best-score">Your best: —</span></div>
      <div class="stats-bar" aria-label="Game statistics">
        <div class="stat"><span class="stat-icon icon-score" aria-hidden="true">✦</span><span class="stat-label">Score</span><strong id="score-value" aria-live="polite">0</strong></div>
        <div class="stat"><span class="stat-icon icon-moves" aria-hidden="true">↗</span><span class="stat-label">Moves</span><strong id="moves-value" aria-live="polite">0</strong></div>
        <div class="stat"><span class="stat-icon icon-pairs" aria-hidden="true">♡</span><span class="stat-label">Pairs</span><strong><span id="pairs-value">0</span><small> / 8</small></strong></div>
        <div class="stat"><span class="stat-icon icon-time" aria-hidden="true">◷</span><span class="stat-label">Time</span><strong id="time-value">00:00</strong></div>
      </div>
      <div class="board-wrap">
        <div class="game-status" id="game-status" aria-live="polite">Find all 8 matching pairs.</div>
        <div class="card-grid" id="card-grid" aria-label="Memory card board"></div>
      </div>
      <p class="board-note"><span aria-hidden="true">✿</span> A calm mind remembers the little things.</p>
    </section>

    <footer class="page-footer"><span>Make a little room for wonder.</span><span>✦</span><span>One pair at a time</span></footer>
  </main>

  <dialog class="modal panel-modal" id="panel-modal" aria-labelledby="panel-title">
    <div class="modal-topline"><span class="modal-kicker" id="panel-kicker">A little guide</span><button class="icon-button" type="button" data-close-panel aria-label="Close dialog">×</button></div>
    <h2 id="panel-title">How to play</h2>
    <div id="panel-content" class="panel-content"></div>
  </dialog>

  <dialog class="modal victory-modal" id="victory-modal" aria-labelledby="victory-title">
    <div class="celebration" aria-hidden="true"><span>✦</span><span>✿</span><span>✧</span><span>✦</span><span>·</span></div>
    <p class="eyebrow">Every pair, a little triumph</p>
    <h2 id="victory-title">Congratulations<span>!</span></h2>
    <p class="victory-message"><strong id="victory-player">Player</strong>, your memory is getting stronger!</p>
    <div class="victory-stats">
      <div><span>Final score</span><strong id="final-score">0</strong></div>
      <div><span>Time taken</span><strong id="final-time">00:00</strong></div>
      <div><span>Total moves</span><strong id="final-moves">0</strong></div>
      <div><span>Pairs matched</span><strong id="final-pairs">8 / 8</strong></div>
    </div>
    <p class="save-message" id="save-message" role="status">Saving your score…</p>
    <div class="victory-actions">
      <button class="button button-primary" id="play-again-button" type="button">Play again <span aria-hidden="true">↗</span></button>
      <button class="button button-quiet" type="button" data-open-panel="leaderboard">♛ <span>Leaderboard</span></button>
      <button class="text-button" id="victory-home-button" type="button">Back to home</button>
    </div>
  </dialog>

  <noscript><p class="noscript-message">This game needs JavaScript enabled to play.</p></noscript>
</body>
</html>