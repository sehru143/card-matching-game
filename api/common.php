<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

function json_response(array $payload, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function require_method(string $method): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== $method) {
        header('Allow: ' . $method);
        json_response(['success' => false, 'message' => 'This request method is not supported.'], 405);
    }
}

function valid_player_name(mixed $name): ?string
{
    if (!is_string($name)) {
        return null;
    }

    $name = trim($name);
    if ($name === '' || preg_match('/^[\p{L}\p{M}\p{N} .\'-]{1,24}$/u', $name) !== 1) {
        return null;
    }
    return $name;
}

function calculate_score(int $pairs, int $moves, int $seconds): int
{
    return max(0, ($pairs * 200) - (max(0, $moves - $pairs) * 35) - ($seconds * 2));
}

function read_json_body(): array
{
    $body = file_get_contents('php://input');
    if ($body === false || strlen($body) > 4096) {
        json_response(['success' => false, 'message' => 'The submitted game data is invalid.'], 400);
    }
    try {
        $data = json_decode($body, true, 16, JSON_THROW_ON_ERROR);
    } catch (JsonException) {
        json_response(['success' => false, 'message' => 'The submitted game data is not valid JSON.'], 400);
    }
    if (!is_array($data)) {
        json_response(['success' => false, 'message' => 'The submitted game data is invalid.'], 400);
    }
    return $data;
}

function database_error(): never
{
    error_log('Memory Match database request failed.');
    json_response(['success' => false, 'message' => 'The score service is temporarily unavailable. Please check the database setup and try again.'], 503);
}