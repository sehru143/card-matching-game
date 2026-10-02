<?php
declare(strict_types=1);

require_once __DIR__ . '/common.php';
require_method('POST');

$data = read_json_body();
$name = valid_player_name($data['player_name'] ?? null);
$gameId = $data['game_id'] ?? null;
$pairs = filter_var($data['pairs'] ?? null, FILTER_VALIDATE_INT);
$moves = filter_var($data['moves'] ?? null, FILTER_VALIDATE_INT);
$seconds = filter_var($data['time_seconds'] ?? null, FILTER_VALIDATE_INT);
$submittedScore = filter_var($data['score'] ?? null, FILTER_VALIDATE_INT);

if ($name === null || !is_string($gameId) || preg_match('/^[a-f0-9-]{36}$/i', $gameId) !== 1) {
    json_response(['success' => false, 'message' => 'Please provide a valid player name and completed game.'], 422);
}
if ($pairs !== 8 || $moves === false || $moves < 8 || $moves > 1000 || $seconds === false || $seconds < 1 || $seconds > 7200) {
    json_response(['success' => false, 'message' => 'Only completed games with valid move and time totals can be saved.'], 422);
}

$score = calculate_score($pairs, $moves, $seconds);
if ($submittedScore === false || $submittedScore !== $score) {
    json_response(['success' => false, 'message' => 'The score did not match the submitted game results. Please finish a new game and try again.'], 422);
}

try {
    $pdo = database();
    $insert = $pdo->prepare(
        'INSERT IGNORE INTO game_scores (game_token, player_name, score, moves, time_seconds, pairs)
         VALUES (:game_token, :player_name, :score, :moves, :time_seconds, :pairs)'
    );
    $insert->execute([
        'game_token' => $gameId,
        'player_name' => $name,
        'score' => $score,
        'moves' => $moves,
        'time_seconds' => $seconds,
        'pairs' => $pairs,
    ]);
    $duplicate = $insert->rowCount() === 0;

    $best = $pdo->prepare('SELECT MAX(score) FROM game_scores WHERE player_name = :player_name');
    $best->execute(['player_name' => $name]);
    $bestScore = $best->fetchColumn();
    json_response([
        'success' => true,
        'duplicate' => $duplicate,
        'saved_score' => $score,
        'best_score' => $bestScore === false || $bestScore === null ? null : (int) $bestScore,
    ], $duplicate ? 200 : 201);
} catch (PDOException) {
    database_error();
}