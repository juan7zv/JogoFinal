<?php
// ============================================
//  Asteroid Dodger - Conexion a BD y Logger
//  Archivo: db/db.php
// ============================================

$host    = 'localhost';
$db      = 'juego_final';
$user    = 'root';
$pass    = '';
$charset = 'utf8mb4';
$port    = 3307;

$dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    die("Error de conexion a la Base de Datos: " . $e->getMessage());
}

function logEvent($pdo, $usuario_id, $evento, $nivel = 'INFO', $ruta = null) {
    try {
        $stmt = $pdo->prepare(
            "INSERT INTO logs (usuario_id, nivel, ruta, evento) VALUES (?, ?, ?, ?)"
        );
        $stmt->execute([$usuario_id, $nivel, $ruta, $evento]);
    } catch (Exception $e) {
        // Si falla el log en BD, el archivo de texto sigue funcionando.
    }

    $logDir = __DIR__ . '/../logs';
    if (!is_dir($logDir)) {
        mkdir($logDir, 0777, true);
    }

    $fecha = date('Y-m-d H:i:s');
    $userStr = $usuario_id ? "PilotoID:$usuario_id" : "Sistema";
    $rutaStr = $ruta ?: 'N/A';

    $linea = "[$fecha] [$nivel] [$rutaStr] $userStr - $evento" . PHP_EOL;
    file_put_contents($logDir . '/app.log', $linea, FILE_APPEND);
}
?>
