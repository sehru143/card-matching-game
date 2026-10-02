CREATE DATABASE IF NOT EXISTS memory_match
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE memory_match;

CREATE TABLE IF NOT EXISTS game_scores (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  game_token CHAR(36) NOT NULL,
  player_name VARCHAR(24) NOT NULL,
  score INT UNSIGNED NOT NULL,
  moves SMALLINT UNSIGNED NOT NULL,
  time_seconds SMALLINT UNSIGNED NOT NULL,
  pairs TINYINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_game_scores_game_token (game_token),
  KEY idx_game_scores_leaderboard (score DESC, moves ASC, time_seconds ASC),
  KEY idx_game_scores_player_best (player_name, score DESC),
  CONSTRAINT chk_game_scores_pairs CHECK (pairs = 8),
  CONSTRAINT chk_game_scores_moves CHECK (moves >= 8),
  CONSTRAINT chk_game_scores_time CHECK (time_seconds BETWEEN 1 AND 7200)
) ENGINE=InnoDB;