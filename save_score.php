<?php
// ============================================
//  Asteroid Dodger - Guardar puntaje
//  Archivo: save_score.php
// ============================================

session_start();
require_once 'db/db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Sin sesion activa']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['puntaje'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
    exit;
}

$userId = (int)$_SESSION['user_id'];
$puntaje = (int)$data['puntaje'];

try {
    $stmt = $pdo->prepare("INSERT INTO puntajes (usuario_id, puntaje) VALUES (?, ?)");
    $stmt->execute([$userId, $puntaje]);

    logEvent($pdo, $userId, "Puntaje guardado: $puntaje pts", 'INFO', '/save_score.php');

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    logEvent($pdo, $userId, "Error guardando puntaje: " . $e->getMessage(), 'ERROR', '/save_score.php');
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error interno al guardar']);
}
?>
