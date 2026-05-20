<?php
// ============================================
//  Asteroid Dodger - Leaderboard y Reportes
//  Archivo: leaderboard.php
// ============================================

session_start();
require_once 'db/db.php';

$stmt = $pdo->query("SELECT id, nombre, avatar FROM usuarios ORDER BY nombre ASC");
$pilotos = $stmt->fetchAll();

$tab = $_GET['tab'] ?? 'todo'; // semana, mes, todo
$filtroId = $_GET['piloto'] ?? '';

if (!in_array($tab, ['semana', 'mes', 'todo'], true)) {
    $tab = 'todo';
}

$where = [];
$params = [];

if ($tab === 'semana') {
    $where[] = "p.fecha >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
} elseif ($tab === 'mes') {
    $where[] = "p.fecha >= DATE_SUB(NOW(), INTERVAL 1 MONTH)";
}

if ($filtroId !== '') {
    $where[] = "p.usuario_id = ?";
    $params[] = (int)$filtroId;
}

$whereClause = $where ? "WHERE " . implode(" AND ", $where) : "";

// Top de partidas individuales
$sqlTop = "
    SELECT u.nombre, u.avatar, p.puntaje, p.fecha
    FROM puntajes p
    JOIN usuarios u ON p.usuario_id = u.id
    $whereClause
    ORDER BY p.puntaje DESC
    LIMIT 10
";
$stmt = $pdo->prepare($sqlTop);
$stmt->execute($params);
$topScores = $stmt->fetchAll();

// Reporte agrupado por usuario para semana, mes o todo el tiempo
$sqlResumen = "
    SELECT
        u.nombre,
        u.avatar,
        COUNT(p.id) AS partidas,
        MAX(p.puntaje) AS mejor_puntaje,
        ROUND(AVG(p.puntaje), 0) AS promedio,
        SUM(p.puntaje) AS total_puntos
    FROM puntajes p
    JOIN usuarios u ON p.usuario_id = u.id
    $whereClause
    GROUP BY u.id, u.nombre, u.avatar
    ORDER BY mejor_puntaje DESC
";
$stmt = $pdo->prepare($sqlResumen);
$stmt->execute($params);
$resumenPilotos = $stmt->fetchAll();

// Historial del piloto seleccionado
$historial = [];
if ($filtroId !== '') {
    $whereHist = ["usuario_id = ?"];
    $paramsHist = [(int)$filtroId];

    if ($tab === 'semana') {
        $whereHist[] = "fecha >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
    } elseif ($tab === 'mes') {
        $whereHist[] = "fecha >= DATE_SUB(NOW(), INTERVAL 1 MONTH)";
    }

    $stmt = $pdo->prepare("
        SELECT puntaje, DATE_FORMAT(fecha, '%d/%m') AS dia
        FROM puntajes
        WHERE " . implode(" AND ", $whereHist) . "
        ORDER BY fecha ASC
    ");
    $stmt->execute($paramsHist);
    $historial = $stmt->fetchAll();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Leaderboard - Asteroid Dodger</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Rajdhani:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        .filter-form {
            display: flex; gap: 15px; justify-content: center; align-items: center;
            margin-bottom: 30px; flex-wrap: wrap;
        }
        .medal { font-size: 1.2rem; }
        .report-grid { display: grid; grid-template-columns: 1fr; gap: 30px; }
        .report-grid.with-chart { grid-template-columns: 1fr 1fr; }
        @media (max-width: 900px) { .report-grid.with-chart { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <div class="container">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 class="title-glow">SALON DE LA FAMA</h1>
            <p>Ranking y reportes de puntajes registrados en la base de datos.</p>
        </div>

        <div class="tabs-container">
            <a href="?tab=semana&piloto=<?= htmlspecialchars($filtroId) ?>" class="tab-btn <?= $tab==='semana' ? 'active' : '' ?>">Esta Semana</a>
            <a href="?tab=mes&piloto=<?= htmlspecialchars($filtroId) ?>" class="tab-btn <?= $tab==='mes' ? 'active' : '' ?>">Este Mes</a>
            <a href="?tab=todo&piloto=<?= htmlspecialchars($filtroId) ?>" class="tab-btn <?= $tab==='todo' ? 'active' : '' ?>">Todo el Tiempo</a>
        </div>

        <form class="filter-form" method="GET">
            <input type="hidden" name="tab" value="<?= htmlspecialchars($tab) ?>">
            <select name="piloto" class="select-glass" onchange="this.form.submit()">
                <option value="">-- Todos los Pilotos --</option>
                <?php foreach($pilotos as $p): ?>
                    <option value="<?= $p['id'] ?>" <?= $filtroId == $p['id'] ? 'selected' : '' ?>>
                        <?= htmlspecialchars($p['avatar'] . ' ' . $p['nombre']) ?>
                    </option>
                <?php endforeach; ?>
            </select>
            <?php if($filtroId): ?>
                <a href="?tab=<?= htmlspecialchars($tab) ?>" class="btn" style="background: rgba(255,255,255,0.1); font-size: 0.8rem;">Quitar Filtro</a>
            <?php endif; ?>
        </form>

        <div class="report-grid <?= $filtroId ? 'with-chart' : '' ?>">
            <div class="glass-panel">
                <h3 style="color: var(--amber); margin-bottom: 15px; text-align: center;">Top 10 de partidas</h3>
                <table class="table-glass">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Piloto</th>
                            <th>Puntaje</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($topScores)): ?>
                            <tr><td colspan="4" style="text-align:center; padding: 20px;">No hay registros en este periodo.</td></tr>
                        <?php else: ?>
                            <?php foreach($topScores as $index => $score): ?>
                                <tr>
                                    <td style="font-family: 'Orbitron'; color: var(--amber);"><?= $index + 1 ?></td>
                                    <td><strong><?= htmlspecialchars($score['avatar'] . ' ' . $score['nombre']) ?></strong></td>
                                    <td style="color: var(--electric-cyan); font-family: 'Orbitron';"><?= number_format($score['puntaje']) ?></td>
                                    <td style="color: #aaa; font-size: 0.9rem;"><?= date('d/m/Y H:i', strtotime($score['fecha'])) ?></td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>

            <?php if ($filtroId): ?>
                <div class="glass-panel">
                    <h3 style="color: var(--amber); margin-bottom: 15px; text-align: center;">Progreso del piloto</h3>
                    <?php if (empty($historial)): ?>
                        <p style="text-align:center; color:#aaa;">No hay partidas para este filtro.</p>
                    <?php else: ?>
                        <canvas id="progresoChart" style="min-height: 280px;"></canvas>
                    <?php endif; ?>
                </div>
            <?php endif; ?>
        </div>

        <div class="glass-panel" style="margin-top: 30px;">
            <h3 style="color: var(--amber); margin-bottom: 15px; text-align: center;">Resumen agrupado por piloto</h3>
            <table class="table-glass">
                <thead>
                    <tr>
                        <th>Piloto</th>
                        <th>Partidas</th>
                        <th>Mejor puntaje</th>
                        <th>Promedio</th>
                        <th>Total puntos</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($resumenPilotos)): ?>
                        <tr><td colspan="5" style="text-align:center; padding: 20px;">No hay datos para agrupar en este periodo.</td></tr>
                    <?php else: ?>
                        <?php foreach($resumenPilotos as $fila): ?>
                            <tr>
                                <td><strong><?= htmlspecialchars($fila['avatar'] . ' ' . $fila['nombre']) ?></strong></td>
                                <td><?= number_format($fila['partidas']) ?></td>
                                <td style="color: var(--electric-cyan); font-family: 'Orbitron';"><?= number_format($fila['mejor_puntaje']) ?></td>
                                <td><?= number_format($fila['promedio']) ?></td>
                                <td><?= number_format($fila['total_puntos']) ?></td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>

        <div style="text-align: center; margin-top: 40px;">
            <a href="index.php" class="btn btn-primary">VOLVER A LA BASE</a>
        </div>
    </div>

    <?php if ($filtroId && !empty($historial)): ?>
        <script>
            const ctx = document.getElementById('progresoChart').getContext('2d');
            const labels = <?= json_encode(array_column($historial, 'dia')) ?>;
            const dataPuntos = <?= json_encode(array_column($historial, 'puntaje')) ?>;

            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Puntaje',
                        data: dataPuntos,
                        borderColor: '#00f0ff',
                        backgroundColor: 'rgba(0, 240, 255, 0.2)',
                        borderWidth: 2,
                        pointBackgroundColor: '#ffaa00',
                        pointRadius: 4,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#aaa' } },
                        x: { grid: { display: false }, ticks: { color: '#aaa' } }
                    },
                    plugins: { legend: { display: false } }
                }
            });
        </script>
    <?php endif; ?>
</body>
</html>
