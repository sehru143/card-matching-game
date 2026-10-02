<?php
declare(strict_types=1);

require_once __DIR__ . '/common.php';
require_method('GET');

try {
    $pdo = database();
    $query = $pdo->query(
        'SELECT player_name, score, moves, time_seconds, DATE_FORMAT(created_at, "%Y-%m-%d") AS date
         FROM game_scores
         ORDER BY score DESC, moves ASC, time_seconds ASC, created_at ASC
         LIMIT 10'
    );
    json_response(['success' => true, 'scores' => $query->fetchAll()]);
} catch (PDOException) {
    database_error();
}