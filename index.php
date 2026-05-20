<?php
// ============================================
//  Asteroid Dodger - Inicio y seleccion de piloto
//  Archivo: index.php
// ============================================

session_start();
require_once 'db/db.php';

$pilotos = [];
try {
    $stmt = $pdo->query("SELECT id, nombre, avatar FROM usuarios ORDER BY nombre ASC");
    $pilotos = $stmt->fetchAll();
} catch (Exception $e) {
    die("Error cargando pilotos.");
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>NASA NEO Tracker & Asteroid Dodger</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Rajdhani:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
    <style>
        .split-layout {
            display: grid;
            grid-template-columns: 1fr 350px;
            gap: 30px;
        }
        @media (max-width: 900px) {
            .split-layout { grid-template-columns: 1fr; }
        }
        .login-box { text-align: center; }
        .login-box .select-glass { margin: 20px 0; width: 100%; }
        .neo-controls { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .neo-controls input[type="date"] {
            background: rgba(0,0,0,0.3);
            border: 1px solid var(--electric-cyan);
            color: white;
            padding: 10px;
            border-radius: 8px;
            font-family: 'Rajdhani';
        }
    </style>
</head>
<body>
    <div class="container">
        <div style="text-align: center; margin-bottom: 40px;">
            <h1 class="title-glow">ASTEROID DODGER</h1>
            <p>Consulta asteroides reales de la NASA y juega el simulador de defensa espacial.</p>
        </div>

        <div class="split-layout">
            <div class="glass-panel">
                <h2 style="color: var(--amber); margin-bottom: 15px;">Radar NASA - NEO Tracker</h2>

                <div class="neo-controls">
                    <input type="date" id="start-date">
                    <input type="date" id="end-date">
                    <button id="fetch-btn" class="btn btn-secondary">Buscar Asteroides</button>
                </div>

                <div id="stats-container" style="display: flex; gap: 20px; margin-bottom: 20px;">
                    <div>Total NEOs: <strong id="total-neo" style="color: var(--electric-cyan);">0</strong></div>
                    <div>Peligrosos: <strong id="hazardous-count" style="color: var(--hot-magenta);">0</strong></div>
                </div>

                <div id="neo-container" class="neo-container">
                    <div style="text-align:center; padding: 30px; color:#888;">Cargando asteroides reales...</div>
                </div>
            </div>

            <div>
                <div class="glass-panel login-box" style="margin-bottom: 30px;">
                    <h3 style="color: var(--electric-cyan);">Ingreso al Simulador</h3>
                    <p style="font-size: 0.9rem; color: #aaa;">Selecciona un piloto para registrar tus puntajes.</p>

                    <select id="piloto-select" class="select-glass">
                        <option value="">-- Selecciona Piloto --</option>
                        <?php foreach($pilotos as $p): ?>
                            <option value="<?= $p['id'] ?>">
                                <?= htmlspecialchars($p['avatar'] . ' ' . $p['nombre']) ?>
                            </option>
                        <?php endforeach; ?>
                    </select>

                    <button id="play-btn" class="btn btn-primary" style="width: 100%;">INICIAR JUEGO</button>
                    <div id="login-error" style="color: var(--hot-magenta); font-weight: bold; margin-top: 10px; display: none;"></div>
                </div>

                <div class="glass-panel" style="text-align: center;">
                    <h3 style="color: var(--amber); margin-bottom: 15px;">Muro de Honor</h3>
                    <p style="font-size: 0.9rem; color: #aaa; margin-bottom: 20px;">Consulta el ranking y los reportes.</p>
                    <a href="leaderboard.php" class="btn btn-secondary">Ver Estadisticas</a>
                </div>
            </div>
        </div>
    </div>

    <script>
        document.getElementById('play-btn').addEventListener('click', async () => {
            const userId = document.getElementById('piloto-select').value;
            const errDiv = document.getElementById('login-error');

            if (!userId) {
                errDiv.textContent = 'Por favor selecciona un piloto.';
                errDiv.style.display = 'block';
                return;
            }

            try {
                const res = await fetch('login_action.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: userId })
                });
                const data = await res.json();

                if (data.success) {
                    window.location.href = 'game.php';
                } else {
                    errDiv.textContent = data.error;
                    errDiv.style.display = 'block';
                }
            } catch (e) {
                errDiv.textContent = 'Error de conexion.';
                errDiv.style.display = 'block';
            }
        });

        const NASA_API_KEY = 'gJTAjGmgHpamHjQvFXCulMd3xLnUL31UEauus81Z';
        const NEO_API_BASE = 'https://api.nasa.gov/neo/rest/v1';

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 6);

        const formatDate = (date) => date.toISOString().split('T')[0];

        async function renderNEOs() {
            const container = document.getElementById('neo-container');
            const startInput = document.getElementById('start-date');
            const endInput = document.getElementById('end-date');

            if (!startInput.value) startInput.value = formatDate(startDate);
            if (!endInput.value) endInput.value = formatDate(endDate);

            container.innerHTML = '<div style="grid-column: 1/-1; text-align:center;">Buscando datos en NASA...</div>';

            try {
                const res = await fetch(`${NEO_API_BASE}/feed?start_date=${startInput.value}&end_date=${endInput.value}&api_key=${NASA_API_KEY}`);
                if (!res.ok) throw new Error('Error NASA API');
                const data = await res.json();

                let allNEOS = [];
                Object.values(data.near_earth_objects).forEach(day => {
                    day.forEach(ast => {
                        allNEOS.push({
                            name: ast.name,
                            date: ast.close_approach_data[0]?.close_approach_date || 'N/A',
                            isHazardous: ast.is_potentially_hazardous_asteroid,
                            diameterMax: Math.round(ast.estimated_diameter.meters.estimated_diameter_max),
                            velocity: parseFloat(ast.close_approach_data[0]?.relative_velocity.kilometers_per_hour || 0),
                        });
                    });
                });

                document.getElementById('total-neo').textContent = allNEOS.length;
                document.getElementById('hazardous-count').textContent = allNEOS.filter(n => n.isHazardous).length;

                if (allNEOS.length === 0) {
                    container.innerHTML = '<div style="grid-column: 1/-1;">No hay asteroides en este rango.</div>';
                    return;
                }

                allNEOS.sort((a, b) => b.diameterMax - a.diameterMax);

                container.innerHTML = allNEOS.slice(0, 6).map(neo => `
                    <div class="neo-card ${neo.isHazardous ? 'danger' : ''}">
                        <div class="neo-header">
                            <h3 class="neo-name">${neo.name}</h3>
                        </div>
                        <div style="font-size: 0.9rem; color: #ccc;">
                            <div><strong>Aproximacion:</strong> ${neo.date}</div>
                            <div><strong>Tamano:</strong> ${neo.diameterMax.toLocaleString()} m</div>
                            <div><strong>Velocidad:</strong> ${Math.round(neo.velocity).toLocaleString()} km/h</div>
                            <div style="margin-top:10px; color:${neo.isHazardous ? 'var(--hot-magenta)' : 'var(--safe-green)'}">
                                ${neo.isHazardous ? 'PELIGROSO' : 'SEGURO'}
                            </div>
                        </div>
                    </div>
                `).join('');

            } catch (e) {
                container.innerHTML = '<div style="grid-column: 1/-1; color: var(--hot-magenta);">Error al conectar con la NASA.</div>';
            }
        }

        document.getElementById('fetch-btn').addEventListener('click', renderNEOs);
        document.addEventListener('DOMContentLoaded', renderNEOs);
    </script>
</body>
</html>
