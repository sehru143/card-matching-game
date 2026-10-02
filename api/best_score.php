<?php
declare(strict_types=1);

require_once __DIR__ . '/common.php';
require_method('GET');

$name = valid_player_name($_GET['name'] ?? null);
if ($name === null) {
    json_response(['success' => false, 'message' => 'Please provide a valid player name.'], 422);
}

try {
    $pdo = database();
    $query = $pdo->prepare('SELECT MAX(score) AS best_score FROM game_scores WHERE player_name = :player_name');
    $query->execute(['player_name' => $name]);
    $bestScore = $query->fetchColumn();
    json_response(['success' => true, 'best_score' => $bestScore === false || $bestScore === null ? null : (int) $bestScore]);
} catch (PDOException) {
    database_error();
}