# Memory Match

A responsive memory-card game built with HTML, CSS, browser JavaScript, PHP, PDO, and MySQL. The game board and score are handled in the browser; PHP validates completed results, stores them in MySQL, and serves the live leaderboard and each player's best score.

## Project files

- `index.php` contains the accessible page structure and loads the separate styles and game script.
- `css/style.css` contains the responsive theme, card-flip animation, dialogs, and reduced-motion styling.
- `js/game.js` contains the game state, randomized deck, timer, scoring formula, and fetch requests.
- `config/database.php` creates the PDO connection. Change database settings here or provide the matching `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` environment variables.
- `api/common.php` provides shared JSON, validation, and database-error helpers.
- `api/save_score.php` validates and saves completed games with prepared statements.
- `api/leaderboard.php` returns the latest top ten, ordered by score, moves, then time.
- `api/best_score.php` returns the best saved score for a player name.
- `sql/database.sql` creates the database and score table.

## Run with XAMPP

1. Install and start Apache and MySQL from the XAMPP Control Panel.
2. Copy this entire folder into XAMPP's `htdocs` directory, for example `C:\xampp\htdocs\memory-game`.
3. Open `http://localhost/phpmyadmin`, choose **Import**, select `sql/database.sql`, and run the import. It creates the `memory_match` database and `game_scores` table.
4. Check the settings in `config/database.php`. The defaults are MySQL at `127.0.0.1:3306`, database `memory_match`, user `root`, and an empty password, which match a common local XAMPP setup. If your MySQL account differs, change those values or set the `DB_*` environment variables for Apache.
5. Open `http://localhost/memory-game/` in your browser. Keep Apache and MySQL running while playing.

Do not open `index.php` as a local file: PHP and the API need Apache to run. No Composer packages or frontend dependencies are required. Use PHP 8.1 or newer with the `pdo_mysql` extension enabled, and MySQL 8.0.16+ (or a compatible recent MariaDB release for `CHECK` constraints).

## How the data flows

When a game is completed, `js/game.js` sends the player name, game ID, score, moves, elapsed seconds, and matched pair count as JSON to `api/save_score.php`. PHP validates the input, recalculates the documented score (`pairs * 200 - extra moves * 35 - seconds * 2`, with a floor of zero), then inserts using a PDO prepared statement. A unique game ID makes a repeated save idempotent. The server only verifies reasonable result bounds and score consistency; without authenticated sessions or server-side gameplay, it cannot prove that a browser-reported game was played honestly.

Each time the leaderboard opens, JavaScript fetches `api/leaderboard.php`, which queries MySQL for the top ten and returns JSON; the browser builds the table from that fresh response. `api/best_score.php` similarly queries the maximum stored score for the current player name. If MySQL is unavailable, the APIs return a generic JSON error instead of exposing connection details.