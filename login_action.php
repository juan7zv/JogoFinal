<?php
// ============================================
//  Asteroid Dodger - Autenticar piloto
//  Archivo: login_action.php
// ============================================

session_start();
require_once 'db/db.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Sin user_id']);
    exit;
}

$userId = (int)$data['user_id'];

$stmt = $pdo->prepare("SELECT id, nombre FROM usuarios WHERE id = ?");
$stmt->execute([$userId]);
$usuario = $stmt->fetch();

if (!$usuario) {
    logEvent($pdo, null, "Intento de inicio fallido: piloto $userId no existe", 'WARN', '/login_action.php');
    echo json_encode(['success' => false, 'error' => 'Piloto no encontrado']);
    exit;
}

$_SESSION['user_id'] = $usuario['id'];

logEvent($pdo, $usuario['id'], "Piloto a bordo: {$usuario['nombre']}", 'INFO', '/login_action.php');
echo json_encode(['success' => true]);
?>
