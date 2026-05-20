<?php
// ============================================
//  Asteroid Dodger - Juego Principal
//  Archivo: game.php
// ============================================

session_start();
require_once 'db/db.php';

// Redirigir si no ha seleccionado piloto
if (!isset($_SESSION['user_id'])) {
    header('Location: index.php');
    exit;
}

$stmt = $pdo->prepare("SELECT nombre, avatar FROM usuarios WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
$piloto = $stmt->fetch();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Asteroid Dodger - Simulador</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
    <style>
        body { overflow: hidden; margin: 0; padding: 0; }
        .hud-top-center {
            position: absolute; top: 20px; left: 50%; transform: translateX(-50%);
            background: rgba(10, 10, 46, 0.8); padding: 5px 20px; border-radius: 20px;
            border: 1px solid var(--electric-cyan); font-family: 'Rajdhani';
        }
        .hud-lives { font-size: 1.5rem; letter-spacing: 5px; }
    </style>
</head>
<body>

<div id="game-container">
    <canvas id="gameCanvas"></canvas>

    <!-- HUD principal -->
    <div id="hud" class="ui-overlay">
        <div class="hud-top-center">
            Piloto: <strong><?= htmlspecialchars($piloto['avatar'] . ' ' . $piloto['nombre']) ?></strong>
        </div>

        <div class="hud-panel hud-left">
            <div class="hud-stat" id="hud-level-name">NIVEL 1</div>
            <div class="hud-val" id="hud-level-title" style="font-size: 1rem; color: var(--amber);">EXPLORADOR</div>
            <hr style="border-color: rgba(255,255,255,0.1); margin: 8px 0;">

            <div class="hud-stat">PUNTAJE</div>
            <div class="hud-val" id="hud-score">0</div>

            <div style="margin-top: 10px; display:none;" id="ammo-display">
                <div class="hud-stat">MUNICION</div>
                <div class="hud-val" id="hud-ammo" style="color: var(--amber);">0</div>
            </div>

            <div style="margin-top: 10px; display:none;" id="shield-display">
                <div class="hud-val" style="color: var(--safe-green);">ESCUDO ACTIVO</div>
            </div>
        </div>

        <div class="hud-panel hud-right" style="text-align: right;">
            <div class="hud-stat">INTEGRIDAD</div>
            <div class="hud-lives" id="hud-lives">3</div>
        </div>
    </div>

    <div id="level-progress" class="level-progress" style="display: none;">
        <div id="level-progress-fill" class="level-progress-fill"></div>
    </div>

    <div id="level-up" class="level-up">NIVEL 1</div>

    <!-- Inicio -->
    <div id="start-screen" class="screen-overlay">
        <div class="modal-box">
            <h1 class="title-glow">ASTEROID DODGER</h1>
            <p style="margin-bottom: 20px;">Esquiva asteroides usando datos reales de la NASA.</p>
            <button id="play-btn" class="btn btn-primary">COMENZAR MISION</button>
            <br><br>
            <a href="index.php" style="color: var(--electric-cyan); text-decoration: none;">&larr; Volver a la Base</a>
        </div>
    </div>

    <!-- Cargando -->
    <div id="loading-screen" class="screen-overlay" style="display: none;">
        <div class="modal-box">
            <h2 style="color: var(--electric-cyan);">Conectando con la NASA...</h2>
            <p>Descargando datos de asteroides cercanos a la Tierra.</p>
        </div>
    </div>

    <!-- Game over -->
    <div id="game-over" class="screen-overlay" style="display: none;">
        <div class="modal-box">
            <h1 style="color: var(--hot-magenta); font-size: 3rem;">NAVE DESTRUIDA</h1>
            <p style="font-size: 1.2rem; margin: 15px 0;">Puntaje Final: <strong id="final-score" style="color: var(--amber); font-size: 2rem;">0</strong></p>

            <div id="save-status" style="margin: 20px 0; font-family: 'Rajdhani'; font-size: 1.2rem; color: var(--electric-cyan);">
                Guardando registro en el servidor...
            </div>

            <div id="gameover-actions" style="display: none; margin-top: 20px;">
                <button id="retry-btn" class="btn btn-primary">REINTENTAR</button>
                <a href="leaderboard.php" class="btn btn-secondary" style="margin-left: 10px;">VER RANKING</a>
            </div>
        </div>
    </div>

    <!-- Cambio de nivel -->
    <div id="level-transition" class="screen-overlay" style="display: none;">
        <div class="modal-box">
            <h1 id="transition-title" style="color: var(--safe-green); font-size: 2.5rem;">NIVEL COMPLETADO</h1>
            <h2 id="transition-subtitle" style="color: var(--amber); margin-top: 10px;">Siguiente Nivel</h2>
            <div id="transition-stats" class="stats-grid"></div>
            <p id="asteroid-fact" style="margin: 20px 0; color: #ccc;"></p>
            <button id="next-level-btn" class="btn btn-primary" style="margin-top: 20px;">CONTINUAR &rarr;</button>
        </div>
    </div>

    <!-- Victoria -->
    <div id="victory-screen" class="screen-overlay" style="display: none;">
        <div class="modal-box">
            <h1 style="color: var(--safe-green); font-size: 2.5rem;">MISION COMPLETADA</h1>
            <p id="victory-record" style="display:none; color: var(--amber); font-weight: bold;">Nuevo record local</p>
            <div id="victory-stats" class="stats-grid"></div>

            <div id="victory-save-status" style="margin: 20px 0; font-family: 'Rajdhani'; font-size: 1.2rem; color: var(--electric-cyan);">
                Guardando registro en el servidor...
            </div>

            <div id="victory-actions" style="display: none; margin-top: 20px;">
                <button id="play-again-btn" class="btn btn-primary">JUGAR OTRA VEZ</button>
                <a href="leaderboard.php" class="btn btn-secondary" style="margin-left: 10px;">VER RANKING</a>
            </div>
        </div>
    </div>

    <!-- Pausa -->
    <div id="pause-screen" class="screen-overlay" style="display: none;">
        <div class="modal-box">
            <h1 class="title-glow">PAUSA</h1>
            <p style="margin-bottom: 20px;">Presiona P para continuar.</p>
        </div>
    </div>

    <div id="asteroid-info" class="asteroid-info">Info</div>
</div>

<script src="game.js"></script>
</body>
</html>
