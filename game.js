/* ================================================================
   ASTEROID DODGER v2 — NASA NEO API Game Engine
   3 Levels · 4-Dir Movement · Weapons · Educational · Real Data
   ================================================================ */

// ================================================================
// CONFIGURATION
// ================================================================
const CONFIG = {
    NASA_API_KEY: 'gJTAjGmgHpamHjQvFXCulMd3xLnUL31UEauus81Z',
    NEO_API_BASE: 'https://api.nasa.gov/neo/rest/v1',

    PLAYER: {
        WIDTH: 60,
        HEIGHT: 50,
        SPEED: 6,
        START_X: 80,
        LIVES: 3,
        INVINCIBILITY_FRAMES: 120,
        FIRE_COOLDOWN: 12,
    },

    BULLET: {
        SPEED: 11,
        RADIUS: 3,
        TRAIL_LENGTH: 6,
    },

    ASTEROID: {
        MIN_RADIUS: 14,
        MAX_RADIUS: 72,
    },

    COLORS: {
        DEEP_SPACE: '#0a0a2e',
        MID_SPACE: '#0f0f3d',
        COSMIC_NAVY: '#16213e',
        CYAN: '#00f0ff',
        MAGENTA: '#ff2d75',
        AMBER: '#ffaa00',
        PURPLE: '#7b2ff7',
        WHITE: '#e0e0ff',
        GREEN: '#00ff88',
    }
};

// ================================================================
// LEVEL DEFINITIONS (3 levels)
// ================================================================
const LEVELS = [
    {
        id: 1,
        name: 'Explorador Espacial',
        shortName: 'EXPLORADOR',
        subtitle: 'Aprende a esquivar asteroides',
        duration: 3600,          // 60 seconds at 60fps
        spawnInterval: 100,
        minSpawnInterval: 75,
        spawnAccel: 0.012,       // how much spawn interval decreases per frame
        speedMultiplier: 0.75,
        weaponChance: 0.0015,
        shieldChance: 0.003,
        color: CONFIG.COLORS.GREEN,
    },
    {
        id: 2,
        name: 'Defensor Orbital',
        shortName: 'DEFENSOR',
        subtitle: 'Usa armas para destruir amenazas',
        duration: 3600,
        spawnInterval: 60,
        minSpawnInterval: 38,
        spawnAccel: 0.015,
        speedMultiplier: 1.25,
        weaponChance: 0.004,
        shieldChance: 0.0025,
        color: CONFIG.COLORS.AMBER,
    },
    {
        id: 3,
        name: 'Comandante Estelar',
        shortName: 'COMANDANTE',
        subtitle: 'Supervivencia total: lluvia de asteroides',
        duration: 3600,
        spawnInterval: 38,
        minSpawnInterval: 18,
        spawnAccel: 0.02,
        speedMultiplier: 1.75,
        weaponChance: 0.0035,
        shieldChance: 0.002,
        color: CONFIG.COLORS.MAGENTA,
    },
];

// ================================================================
// SCORING
// ================================================================
const SCORING = {
    DODGE_SAFE: 5,
    DODGE_HAZARDOUS: 25,
    DESTROY_SAFE: 15,
    DESTROY_HAZARDOUS: 40,
    COLLECT_SHIELD: 10,
    COLLECT_WEAPON: 10,
    LEVEL_COMPLETE: 200,   // × level id
    PERFECT_LEVEL: 500,    // no hits taken
};

// ================================================================
// EDUCATIONAL FACTS
// ================================================================
const ASTEROID_FACTS = [
    "📡 La NASA rastrea más de 33,000 asteroides cercanos a la Tierra (NEOs) a través de su programa Planetary Defense.",
    "☄️ Un asteroide de ~10 km de diámetro causó la extinción de los dinosaurios hace 66 millones de años al impactar en Chicxulub, México.",
    "⚠️ Un asteroide es 'potencialmente peligroso' (PHA) si pasa a menos de 7.5 millones de km de la Tierra y mide más de 140 metros.",
    "🛰️ La misión DART de la NASA (2022) desvió exitosamente al asteroide Dimorphos, demostrando que podemos defender la Tierra.",
    "🪨 La mayoría de los asteroides orbitan en el Cinturón Principal entre Marte y Júpiter, a unos 480 millones de km del Sol.",
    "💨 Los asteroides cercanos pueden viajar a velocidades de hasta 200,000 km/h — unas 160 veces más rápido que una bala.",
    "🔭 El programa NEO Surveyor de la NASA detecta aproximadamente 30 asteroides nuevos cercanos a la Tierra cada semana.",
    "🌍 Un asteroide del tamaño de un auto entra en la atmósfera terrestre aproximadamente una vez al año y se desintegra.",
    "📏 El asteroide más grande clasificado como NEO es 1036 Ganymed, con 32 km de diámetro — más grande que Manhattan.",
    "🔬 Los asteroides tipo C (carbonáceos) contienen compuestos orgánicos y agua, posibles ingredientes para la vida.",
    "⏱️ El asteroide Apophis pasará a solo 31,000 km de la Tierra el 13 de abril de 2029 — más cerca que algunos satélites.",
    "🏗️ Algunos asteroides contienen metales valiosos como platino y oro. Un solo asteroide podría valer trillones de dólares.",
];

// ================================================================
// FALLBACK DATA
// ================================================================
const FALLBACK_ASTEROIDS = [
    { name: "(2024 AA1)", isHazardous: false, diameterMax: 130, velocity: 38000 },
    { name: "(2024 BC2)", isHazardous: false, diameterMax: 210, velocity: 52000 },
    { name: "(2024 CX3)", isHazardous: true, diameterMax: 480, velocity: 98000 },
    { name: "(2024 DK4)", isHazardous: false, diameterMax: 75, velocity: 25000 },
    { name: "(2024 EF5)", isHazardous: true, diameterMax: 620, velocity: 115000 },
    { name: "(2024 FG6)", isHazardous: false, diameterMax: 160, velocity: 44000 },
    { name: "(2024 GH7)", isHazardous: false, diameterMax: 320, velocity: 67000 },
    { name: "(2024 HJ8)", isHazardous: true, diameterMax: 850, velocity: 135000 },
    { name: "(2024 IK9)", isHazardous: false, diameterMax: 95, velocity: 32000 },
    { name: "(2024 JL0)", isHazardous: false, diameterMax: 260, velocity: 58000 },
    { name: "(2024 KM1)", isHazardous: true, diameterMax: 420, velocity: 89000 },
    { name: "(2024 LN2)", isHazardous: false, diameterMax: 180, velocity: 47000 },
];


// ================================================================
// NASA API LOADER
// ================================================================
async function loadAsteroidData() {
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - 6);
    const fmt = (d) => d.toISOString().split('T')[0];
    const url = `${CONFIG.NEO_API_BASE}/feed?start_date=${fmt(start)}&end_date=${fmt(today)}&api_key=${CONFIG.NASA_API_KEY}`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list = [];
        Object.values(data.near_earth_objects).forEach(day => {
            day.forEach(a => {
                list.push({
                    name: a.name,
                    isHazardous: a.is_potentially_hazardous_asteroid,
                    diameterMax: a.estimated_diameter.meters.estimated_diameter_max,
                    velocity: parseFloat(a.close_approach_data[0]?.relative_velocity.kilometers_per_hour || 50000),
                });
            });
        });
        console.log(`✅ ${list.length} asteroides reales cargados de la NASA`);
        return list.length > 0 ? list : FALLBACK_ASTEROIDS;
    } catch (e) {
        console.warn('⚠️ NASA API error, usando datos de respaldo:', e);
        return FALLBACK_ASTEROIDS;
    }
}


// ================================================================
// UTILITIES
// ================================================================
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function rand(lo, hi) { return Math.random() * (hi - lo) + lo; }
function randInt(lo, hi) { return Math.floor(rand(lo, hi + 1)); }
function rectHit(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
function circleRectHit(cx, cy, cr, rx, ry, rw, rh) {
    const nearX = clamp(cx, rx, rx + rw);
    const nearY = clamp(cy, ry, ry + rh);
    const dx = cx - nearX;
    const dy = cy - nearY;
    return (dx * dx + dy * dy) < (cr * cr);
}
function cleanName(name) {
    const m = name.match(/\(([^)]+)\)/);
    return m ? m[1] : name;
}
function formatNum(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return Math.round(n).toLocaleString();
}


// ================================================================
// PARTICLE
// ================================================================
class Particle {
    constructor(x, y, vx, vy, r, color, life = 45) {
        this.x = x; this.y = y; this.vx = vx; this.vy = vy;
        this.r = r; this.color = color;
        this.life = life; this.maxLife = life; this.alive = true;
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        this.vx *= 0.97; this.vy *= 0.97;
        if (--this.life <= 0) this.alive = false;
    }
    draw(ctx) {
        const t = this.life / this.maxLife;
        ctx.globalAlpha = t;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r * t, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}


// ================================================================
// SCORE POPUP
// ================================================================
class ScorePopup {
    constructor(x, y, text, color = CONFIG.COLORS.AMBER) {
        this.x = x; this.y = y; this.text = text; this.color = color;
        this.life = 50; this.maxLife = 50; this.alive = true;
    }
    update() { this.y -= 1.1; if (--this.life <= 0) this.alive = false; }
    draw(ctx) {
        const t = this.life / this.maxLife;
        ctx.globalAlpha = t;
        ctx.font = 'bold 16px Orbitron, sans-serif';
        ctx.fillStyle = this.color;
        ctx.textAlign = 'center';
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fillText(this.text, this.x, this.y);
        ctx.shadowBlur = 0;
        ctx.textAlign = 'left';
        ctx.globalAlpha = 1;
    }
}


// ================================================================
// STAR FIELD
// ================================================================
class StarField {
    constructor(canvas) {
        this.canvas = canvas;
        this.layers = [];
        const cfgs = [
            { speed: 0.25, sMin: 0.4, sMax: 1.0, count: 110, alpha: 0.25 },
            { speed: 0.7, sMin: 0.8, sMax: 1.7, count: 65, alpha: 0.5 },
            { speed: 1.4, sMin: 1.2, sMax: 2.4, count: 30, alpha: 0.75 },
        ];
        cfgs.forEach(c => {
            const stars = [];
            for (let i = 0; i < c.count; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    s: rand(c.sMin, c.sMax),
                    a: c.alpha,
                    tw: Math.random() * Math.PI * 2,
                    ts: rand(0.01, 0.04),
                });
            }
            this.layers.push({ stars, speed: c.speed });
        });
    }
    update() {
        this.layers.forEach(l => l.stars.forEach(s => {
            s.x -= l.speed;
            s.tw += s.ts;
            if (s.x < -3) { s.x = this.canvas.width + 3; s.y = Math.random() * this.canvas.height; }
        }));
    }
    draw(ctx) {
        this.layers.forEach(l => l.stars.forEach(s => {
            ctx.fillStyle = `rgba(224,224,255,${s.a * (0.55 + 0.45 * Math.sin(s.tw))})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.s, 0, Math.PI * 2);
            ctx.fill();
        }));
    }
}


// ================================================================
// BULLET
// ================================================================
class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = CONFIG.BULLET.SPEED;
        this.r = CONFIG.BULLET.RADIUS;
        this.alive = true;
        this.trail = [];
    }
    update() {
        this.trail.push({ x: this.x, y: this.y, a: 1 });
        if (this.trail.length > CONFIG.BULLET.TRAIL_LENGTH) this.trail.shift();
        this.x += this.speed;
    }
    draw(ctx) {
        // Trail
        this.trail.forEach(p => {
            p.a -= 0.16;
            if (p.a <= 0) return;
            ctx.fillStyle = `rgba(0, 240, 255, ${p.a * 0.5})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, this.r * p.a, 0, Math.PI * 2);
            ctx.fill();
        });
        // Bullet head
        ctx.fillStyle = CONFIG.COLORS.CYAN;
        ctx.shadowColor = CONFIG.COLORS.CYAN;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    isOffScreen(w) { return this.x > w + 10; }
}


// ================================================================
// PLAYER (Detailed Spaceship)
// ================================================================
class Player {
    constructor(canvas) {
        this.canvas = canvas;
        this.w = CONFIG.PLAYER.WIDTH;
        this.h = CONFIG.PLAYER.HEIGHT;
        this.x = CONFIG.PLAYER.START_X;
        this.y = canvas.height / 2 - this.h / 2;
        this.speed = CONFIG.PLAYER.SPEED;
        this.lives = CONFIG.PLAYER.LIVES;
        this.invTimer = 0;
        this.hasShield = false;
        this.ammo = 0;
        this.fireCooldown = 0;
        this.trail = [];
        this.enginePhase = 0;
    }

    get isInvincible() { return this.invTimer > 0; }

    update(keys) {
        // 4-directional movement
        if (keys['ArrowUp'] || keys['w'] || keys['W']) this.y -= this.speed;
        if (keys['ArrowDown'] || keys['s'] || keys['S']) this.y += this.speed;
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) this.x -= this.speed;
        if (keys['ArrowRight'] || keys['d'] || keys['D']) this.x += this.speed;

        // Bounds — ship can move in the left ~60% of screen
        this.x = clamp(this.x, 10, this.canvas.width * 0.6);
        this.y = clamp(this.y, 10, this.canvas.height - this.h - 10);

        // Engine trail
        this.trail.push({
            x: this.x + 3,
            y: this.y + this.h / 2 + rand(-4, 4),
            a: 1, s: rand(2, 4.5),
        });
        if (this.trail.length > 22) this.trail.shift();

        if (this.invTimer > 0) this.invTimer--;
        if (this.fireCooldown > 0) this.fireCooldown--;
        this.enginePhase += 0.15;
    }

    shoot() {
        if (this.ammo <= 0 || this.fireCooldown > 0) return null;
        this.ammo--;
        this.fireCooldown = CONFIG.PLAYER.FIRE_COOLDOWN;
        // Bullet spawns at the nose of the ship
        return new Bullet(this.x + this.w + 5, this.y + this.h / 2);
    }

    draw(ctx) {
        // Trail
        this.trail.forEach(p => {
            p.a -= 0.04;
            if (p.a <= 0) return;
            ctx.fillStyle = `rgba(0,240,255,${p.a * 0.5})`;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.s * p.a, 0, Math.PI * 2); ctx.fill();
        });

        // Blink when invincible
        if (this.invTimer > 0 && Math.floor(this.invTimer / 5) % 2 === 0) return;

        const cx = this.x + this.w / 2;
        const cy = this.y + this.h / 2;
        ctx.save();
        ctx.translate(cx, cy);

        // ---- ENGINE EXHAUST (animated) ----
        const flameLen = 10 + Math.sin(this.enginePhase * 3) * 5 + Math.random() * 4;
        const flameW = 5 + Math.sin(this.enginePhase * 2) * 2;
        // Main flame
        const fg = ctx.createLinearGradient(-this.w / 2 - flameLen, 0, -this.w / 2 + 4, 0);
        fg.addColorStop(0, 'rgba(255,60,0,0)');
        fg.addColorStop(0.4, 'rgba(255,160,0,0.8)');
        fg.addColorStop(1, 'rgba(255,220,100,0.9)');
        ctx.fillStyle = fg;
        ctx.beginPath();
        ctx.moveTo(-this.w / 2 + 4, -flameW);
        ctx.lineTo(-this.w / 2 - flameLen, 0);
        ctx.lineTo(-this.w / 2 + 4, flameW);
        ctx.closePath();
        ctx.fill();
        // Inner flame (blue core)
        ctx.fillStyle = `rgba(100,180,255,${0.5 + Math.random() * 0.3})`;
        ctx.beginPath();
        ctx.moveTo(-this.w / 2 + 4, -flameW * 0.4);
        ctx.lineTo(-this.w / 2 - flameLen * 0.5, 0);
        ctx.lineTo(-this.w / 2 + 4, flameW * 0.4);
        ctx.closePath();
        ctx.fill();

        // ---- WINGS (behind body) ----
        // Top wing
        ctx.fillStyle = '#1a2a4a';
        ctx.beginPath();
        ctx.moveTo(4, -7);
        ctx.lineTo(-8, -24);
        ctx.lineTo(-18, -21);
        ctx.lineTo(-6, -9);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,240,255,0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Bottom wing
        ctx.beginPath();
        ctx.moveTo(4, 7);
        ctx.lineTo(-8, 24);
        ctx.lineTo(-18, 21);
        ctx.lineTo(-6, 9);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Wing tip lights
        const tipAlpha = 0.5 + 0.5 * Math.sin(this.enginePhase * 2);
        ctx.fillStyle = this.hasShield ? `rgba(0,255,136,${tipAlpha})` : `rgba(0,240,255,${tipAlpha})`;
        ctx.beginPath(); ctx.arc(-13, -22.5, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(-13, 22.5, 2, 0, Math.PI * 2); ctx.fill();

        // ---- MAIN FUSELAGE ----
        ctx.fillStyle = '#2a3a5c';
        ctx.shadowColor = 'rgba(0,240,255,0.15)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(28, 0);           // nose
        ctx.lineTo(14, -8);
        ctx.lineTo(-2, -10);
        ctx.lineTo(-22, -9);         // back top
        ctx.lineTo(-26, -5);
        ctx.lineTo(-26, 5);
        ctx.lineTo(-22, 9);          // back bottom
        ctx.lineTo(-2, 10);
        ctx.lineTo(14, 8);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Fuselage accent stripe
        ctx.fillStyle = '#3a4d70';
        ctx.beginPath();
        ctx.moveTo(26, 0);
        ctx.lineTo(14, -3.5);
        ctx.lineTo(-24, -3.5);
        ctx.lineTo(-24, 3.5);
        ctx.lineTo(14, 3.5);
        ctx.closePath();
        ctx.fill();

        // Panel lines
        ctx.strokeStyle = 'rgba(255,255,255,0.07)';
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(5, -9); ctx.lineTo(5, 9); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-10, -9.5); ctx.lineTo(-10, 9.5); ctx.stroke();

        // ---- COCKPIT ----
        ctx.fillStyle = 'rgba(0,200,255,0.65)';
        ctx.shadowColor = '#00ccff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.ellipse(16, 0, 7, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        // Cockpit reflection
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.beginPath();
        ctx.ellipse(17.5, -1.5, 3, 1.5, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // ---- NOSE CANNON ----
        ctx.fillStyle = '#5a6a8c';
        ctx.fillRect(27, -2, 5, 4);
        ctx.fillStyle = '#7a8aac';
        ctx.fillRect(31, -1.2, 3, 2.4);
        // Cannon glow when ready to fire
        if (this.ammo > 0 && this.fireCooldown === 0) {
            ctx.fillStyle = `rgba(0,240,255,${0.4 + 0.3 * Math.sin(this.enginePhase * 4)})`;
            ctx.beginPath();
            ctx.arc(34, 0, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // ---- SHIELD BUBBLE ----
        if (this.hasShield) {
            const sa = 0.2 + Math.sin(Date.now() / 200) * 0.08;
            ctx.strokeStyle = `rgba(0,255,136,${sa})`;
            ctx.lineWidth = 2;
            ctx.shadowColor = CONFIG.COLORS.GREEN;
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(2, 0, 35, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        ctx.restore();
    }

    getBounds() {
        // Hitbox covers main body only (not wing tips)
        return { x: this.x + 6, y: this.y + 12, w: this.w - 10, h: this.h - 24 };
    }
}


// ================================================================
// ASTEROID (with name label)
// ================================================================
class Asteroid {
    constructor(canvas, neoData, level) {
        this.canvas = canvas;
        this.rawName = neoData.name;
        this.displayName = cleanName(neoData.name);
        this.isHazardous = neoData.isHazardous;
        this.realDiameter = Math.round(neoData.diameterMax);
        this.realVelocity = Math.round(neoData.velocity);

        // Size from real diameter
        this.radius = clamp(neoData.diameterMax / 11, CONFIG.ASTEROID.MIN_RADIUS, CONFIG.ASTEROID.MAX_RADIUS);

        // Position off-screen right
        this.x = canvas.width + this.radius + rand(0, 130);
        this.y = rand(this.radius + 30, canvas.height - this.radius - 30);

        // Speed from real velocity + level
        const normV = clamp(neoData.velocity / 150000, 0, 1);
        const base = lerp(2.0, 5.0, normV);
        this.speed = base * level.speedMultiplier;

        this.vy = rand(-0.5, 0.5);
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = rand(-0.022, 0.022);
        this.passed = false;
        this.alive = true;

        // Generate rocky vertices
        this.verts = [];
        const n = randInt(8, 12);
        for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2;
            const w = this.radius * rand(0.7, 1.3);
            this.verts.push({ x: Math.cos(a) * w, y: Math.sin(a) * w });
        }

        // Craters
        this.craters = [];
        for (let i = 0; i < randInt(2, 4); i++) {
            const a = Math.random() * Math.PI * 2;
            const d = Math.random() * this.radius * 0.4;
            this.craters.push({ x: Math.cos(a) * d, y: Math.sin(a) * d, r: rand(2, this.radius * 0.16) });
        }
    }

    update() {
        this.x -= this.speed;
        this.y += this.vy;
        this.rotation += this.rotSpeed;
        if (this.y - this.radius < 0 || this.y + this.radius > this.canvas.height) {
            this.vy *= -1;
            this.y = clamp(this.y, this.radius, this.canvas.height - this.radius);
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Glow
        if (this.isHazardous) {
            ctx.shadowColor = CONFIG.COLORS.MAGENTA;
            ctx.shadowBlur = 20 + Math.sin(Date.now() / 130) * 8;
        } else {
            ctx.shadowColor = 'rgba(255,170,0,0.2)';
            ctx.shadowBlur = 5;
        }

        // Body
        ctx.fillStyle = this.isHazardous ? '#5a1828' : '#4a3c28';
        ctx.beginPath();
        ctx.moveTo(this.verts[0].x, this.verts[0].y);
        for (let i = 1; i < this.verts.length; i++) ctx.lineTo(this.verts[i].x, this.verts[i].y);
        ctx.closePath();
        ctx.fill();

        // Border
        ctx.strokeStyle = this.isHazardous ? CONFIG.COLORS.MAGENTA : '#8b7355';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Surface highlight
        ctx.fillStyle = this.isHazardous ? 'rgba(255,80,130,0.07)' : 'rgba(255,200,120,0.05)';
        ctx.beginPath(); ctx.arc(-this.radius * 0.2, -this.radius * 0.2, this.radius * 0.45, 0, Math.PI * 2); ctx.fill();

        // Craters
        this.craters.forEach(c => {
            ctx.fillStyle = this.isHazardous ? 'rgba(255,45,117,0.1)' : 'rgba(0,0,0,0.15)';
            ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); ctx.fill();
        });

        ctx.restore();

        // ---- NAME LABEL (not rotated) ----
        const labelY = this.y - this.radius - 10;
        ctx.font = '600 10px Rajdhani, sans-serif';
        ctx.textAlign = 'center';
        const nameText = this.displayName;
        const tw = ctx.measureText(nameText).width;

        // Background pill
        ctx.fillStyle = this.isHazardous ? 'rgba(255,45,117,0.18)' : 'rgba(224,224,255,0.08)';
        const px = 5, py = 3;
        ctx.beginPath();
        ctx.roundRect(this.x - tw / 2 - px, labelY - 9 - py, tw + px * 2, 14 + py * 2, 6);
        ctx.fill();

        // Border
        ctx.strokeStyle = this.isHazardous ? 'rgba(255,45,117,0.3)' : 'rgba(224,224,255,0.12)';
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Text
        ctx.fillStyle = this.isHazardous ? 'rgba(255,100,150,0.85)' : 'rgba(224,224,255,0.55)';
        ctx.fillText(nameText, this.x, labelY);

        // Hazardous indicator
        if (this.isHazardous) {
            ctx.font = '8px sans-serif';
            ctx.fillText('⚠️', this.x - tw / 2 - 12, labelY + 1);
        }

        ctx.textAlign = 'left';
    }

    isOffScreen() { return this.x + this.radius < -20; }

    getBounds() {
        const r = this.radius * 0.7;
        return { x: this.x - r, y: this.y - r, w: r * 2, h: r * 2 };
    }
}


// ================================================================
// SHIELD POWER-UP
// ================================================================
class ShieldPowerUp {
    constructor(canvas) {
        this.canvas = canvas;
        this.r = 18;
        this.x = canvas.width + this.r;
        this.y = rand(this.r + 40, canvas.height - this.r - 40);
        this.speed = 2.2;
        this.alive = true;
        this.phase = 0;
    }
    update() { this.x -= this.speed; this.phase += 0.07; }
    draw(ctx) {
        const p = Math.sin(this.phase) * 3;
        ctx.save();
        ctx.shadowColor = CONFIG.COLORS.GREEN;
        ctx.shadowBlur = 16 + p * 2;
        ctx.fillStyle = `rgba(0,255,136,${0.12 + Math.sin(this.phase) * 0.04})`;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r + p, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = CONFIG.COLORS.GREEN;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;
        // Icon
        ctx.fillStyle = CONFIG.COLORS.GREEN;
        const s = 7;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - s);
        ctx.lineTo(this.x + s * 0.7, this.y);
        ctx.lineTo(this.x, this.y + s);
        ctx.lineTo(this.x - s * 0.7, this.y);
        ctx.closePath();
        ctx.fill();
        ctx.font = 'bold 8px Orbitron';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#003';
        ctx.fillText('S', this.x, this.y + 1);
        ctx.restore();
    }
    isOffScreen() { return this.x + this.r < 0; }
    getBounds() { return { x: this.x - this.r, y: this.y - this.r, w: this.r * 2, h: this.r * 2 }; }
}


// ================================================================
// WEAPON POWER-UP
// ================================================================
class WeaponPowerUp {
    constructor(canvas) {
        this.canvas = canvas;
        this.r = 18;
        this.x = canvas.width + this.r;
        this.y = rand(this.r + 40, canvas.height - this.r - 40);
        this.speed = 2.5;
        this.alive = true;
        this.phase = 0;
        this.ammoGiven = 10;
    }
    update() { this.x -= this.speed; this.phase += 0.08; }
    draw(ctx) {
        const p = Math.sin(this.phase) * 3;
        ctx.save();
        ctx.shadowColor = CONFIG.COLORS.AMBER;
        ctx.shadowBlur = 16 + p * 2;
        ctx.fillStyle = `rgba(255,170,0,${0.12 + Math.sin(this.phase) * 0.04})`;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r + p, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = CONFIG.COLORS.AMBER;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;
        // Lightning bolt icon
        ctx.fillStyle = CONFIG.COLORS.AMBER;
        ctx.beginPath();
        ctx.moveTo(this.x + 3, this.y - 8);
        ctx.lineTo(this.x - 2, this.y + 1);
        ctx.lineTo(this.x + 1, this.y + 1);
        ctx.lineTo(this.x - 3, this.y + 8);
        ctx.lineTo(this.x + 2, this.y - 1);
        ctx.lineTo(this.x - 1, this.y - 1);
        ctx.closePath();
        ctx.fill();
        // Ammo count label
        ctx.font = 'bold 8px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillStyle = CONFIG.COLORS.AMBER;
        ctx.fillText(`+${this.ammoGiven}`, this.x, this.y + this.r + 12);
        ctx.restore();
    }
    isOffScreen() { return this.x + this.r < 0; }
    getBounds() { return { x: this.x - this.r, y: this.y - this.r, w: this.r * 2, h: this.r * 2 }; }
}


// ================================================================
// GAME ENGINE
// ================================================================
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // State
        this.state = 'start';
        this.keys = {};
        this.neoDataPool = [];
        this.currentLevelIdx = 0;

        // Objects
        this.player = null;
        this.starField = new StarField(this.canvas);
        this.asteroids = [];
        this.bullets = [];
        this.powerUps = [];
        this.particles = [];
        this.scorePopups = [];

        // Counters
        this.score = 0;
        this.spawnTimer = 0;
        this.levelTimer = 0;
        this.currentSpawnInterval = 100;
        this.shake = { x: 0, y: 0, intensity: 0 };

        // Per-level stats
        this.levelStats = { dodged: 0, destroyed: 0, hazardousDodged: 0, hazardousDestroyed: 0, shotsFired: 0, hitsTaken: 0 };

        // Totals
        this.totalStats = { dodged: 0, destroyed: 0, hazardousDodged: 0, hazardousDestroyed: 0, shotsFired: 0, hitsTaken: 0 };

        this._toastTimeout = null;
        this._animId = null;

        this.highScore = 0;
        this.fetchHighScore();
        this.setupControls();
        this.bgLoop();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    get currentLevel() { return LEVELS[this.currentLevelIdx]; }

    fetchHighScore() {
        this.highScore = parseInt(localStorage.getItem('asteroidDodgerHighScore') || '0', 10);
    }

    saveHighScore() {
        localStorage.setItem('asteroidDodgerHighScore', String(this.highScore));
    }

    // ---------------- CONTROLS ----------------

    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                if (this.state === 'playing') this.tryShoot();
            }
            if (e.key === 'p' || e.key === 'P') {
                if (this.state === 'playing') this.pause();
                else if (this.state === 'paused') this.resume();
            }
        });
        document.addEventListener('keyup', (e) => this.keys[e.key] = false);

        // Touch shooting
        this.canvas.addEventListener('touchstart', (e) => {
            if (this.state === 'playing') this.tryShoot();
        });

        // Buttons
        const onClick = (id, action) => {
            const button = document.getElementById(id);
            if (button) button.addEventListener('click', action);
        };

        onClick('play-btn', () => this.startGame());
        onClick('retry-btn', () => this.startGame());
        onClick('next-level-btn', () => this.nextLevel());
        onClick('play-again-btn', () => this.startGame());

        // Clear errors when typing in save inputs
        ['gameover', 'victory'].forEach(prefix => {
            const input = document.getElementById(`${prefix}-name`);
            if (input) {
                input.addEventListener('input', () => {
                    input.classList.remove('input-error');
                    const err = document.getElementById(`${prefix}-error`);
                    err.classList.remove('visible');
                    const btn = document.getElementById(`${prefix}-save-btn`);
                    btn.disabled = false;
                });
            }
        });
    }

    // ---------------- BACKGROUND LOOP ----------------

    bgLoop() {
        const run = () => {
            if (this.state !== 'playing' && this.state !== 'paused') {
                this.drawBackground();
            }
            requestAnimationFrame(run);
        };
        run();
    }

    drawBackground() {
        const ctx = this.ctx;
        const W = this.canvas.width, H = this.canvas.height;
        const bg = ctx.createLinearGradient(0, 0, W, H);
        bg.addColorStop(0, CONFIG.COLORS.DEEP_SPACE);
        bg.addColorStop(0.5, CONFIG.COLORS.MID_SPACE);
        bg.addColorStop(1, CONFIG.COLORS.COSMIC_NAVY);
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
        this.drawNebula(ctx);
        this.starField.update();
        this.starField.draw(ctx);
    }

    drawNebula(ctx) {
        const t = Date.now() / 9000;
        const W = this.canvas.width, H = this.canvas.height;
        const nebs = [
            { x: W * 0.25, y: H * 0.35, r: 220, c: '123,47,247' },
            { x: W * 0.72, y: H * 0.65, r: 260, c: '0,80,255' },
            { x: W * 0.85, y: H * 0.18, r: 180, c: '255,45,117' },
        ];
        nebs.forEach((n, i) => {
            const ox = Math.sin(t + i * 2.1) * 35;
            const oy = Math.cos(t + i * 1.7) * 25;
            const g = ctx.createRadialGradient(n.x + ox, n.y + oy, 0, n.x + ox, n.y + oy, n.r);
            g.addColorStop(0, `rgba(${n.c},0.035)`);
            g.addColorStop(1, `rgba(${n.c},0)`);
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, W, H);
        });
    }

    // ---------------- GAME LIFECYCLE ----------------

    async startGame() {
        this.hideAllScreens();
        this.showScreen('loading-screen');
        document.getElementById('hud').style.display = 'flex';
        this.state = 'loading';

        if (this.neoDataPool.length === 0) {
            this.neoDataPool = await loadAsteroidData();
        }

        this.score = 0;
        this.currentLevelIdx = 0;
        this.totalStats = { dodged: 0, destroyed: 0, hazardousDodged: 0, hazardousDestroyed: 0, shotsFired: 0, hitsTaken: 0 };

        this.hideScreen('loading-screen');
        this.startLevel();
    }

    startLevel() {
        const lvl = this.currentLevel;
        this.player = new Player(this.canvas);
        // Keep lives from previous level (with +1 refill, max 3)
        if (this.currentLevelIdx > 0) {
            this.player.lives = clamp((this._prevLives || 3) + 1, 1, 3);
        }

        this.starField = new StarField(this.canvas);
        this.asteroids = [];
        this.bullets = [];
        this.powerUps = [];
        this.particles = [];
        this.scorePopups = [];

        this.spawnTimer = 0;
        this.levelTimer = 0;
        this.currentSpawnInterval = lvl.spawnInterval;
        this.shake = { x: 0, y: 0, intensity: 0 };
        this.levelStats = { dodged: 0, destroyed: 0, hazardousDodged: 0, hazardousDestroyed: 0, shotsFired: 0, hitsTaken: 0 };

        // Update HUD
        document.getElementById('hud').style.display = 'flex';
        document.getElementById('level-progress').style.display = 'block';
        document.getElementById('level-progress-fill').style.width = '0%';
        document.getElementById('hud-level-name').textContent = `NIVEL ${lvl.id}`;
        document.getElementById('hud-level-title').textContent = lvl.shortName;
        this.updateHUD();
        this.updateAmmoDisplay();

        document.body.classList.add('playing');
        this.state = 'playing';

        // Show level start announcement
        const el = document.getElementById('level-up');
        el.textContent = `NIVEL ${lvl.id}: ${lvl.name.toUpperCase()}`;
        el.classList.remove('show');
        void el.offsetWidth;
        el.classList.add('show');

        if (this._animId) cancelAnimationFrame(this._animId);
        this.gameLoop();
    }

    completeLevel() {
        this.state = 'level-transition';
        this._prevLives = this.player.lives;
        document.getElementById('hud').style.display = 'none';
        document.getElementById('level-progress').style.display = 'none';
        document.body.classList.remove('playing');

        const lvl = this.currentLevel;

        // Level complete bonus
        const bonus = SCORING.LEVEL_COMPLETE * lvl.id;
        let perfectBonus = 0;
        if (this.levelStats.hitsTaken === 0) {
            perfectBonus = SCORING.PERFECT_LEVEL;
        }
        this.score += bonus + perfectBonus;

        // Accumulate totals
        Object.keys(this.levelStats).forEach(k => this.totalStats[k] += this.levelStats[k]);

        // Build transition screen
        document.getElementById('transition-title').textContent = `NIVEL ${lvl.id} COMPLETADO`;
        document.getElementById('transition-subtitle').textContent = lvl.name;

        const statsHTML = `
            <div class="transition-stat">
                <span class="stat-label">Esquivados</span>
                <span class="stat-val green">${this.levelStats.dodged}</span>
            </div>
            <div class="transition-stat">
                <span class="stat-label">Destruidos</span>
                <span class="stat-val amber">${this.levelStats.destroyed}</span>
            </div>
            <div class="transition-stat">
                <span class="stat-label">Disparos</span>
                <span class="stat-val">${this.levelStats.shotsFired}</span>
            </div>
            <div class="transition-stat">
                <span class="stat-label">Precisión</span>
                <span class="stat-val ${this.levelStats.shotsFired > 0 ? 'amber' : ''}">${this.levelStats.shotsFired > 0
                ? Math.round((this.levelStats.destroyed / this.levelStats.shotsFired) * 100) + '%'
                : 'N/A'
            }</span>
            </div>
            <div class="transition-stat">
                <span class="stat-label">Bonus Nivel</span>
                <span class="stat-val amber">+${bonus}</span>
            </div>
            <div class="transition-stat">
                <span class="stat-label">${perfectBonus > 0 ? '⭐ Perfecto' : 'Daños'}</span>
                <span class="stat-val ${perfectBonus > 0 ? 'green' : 'magenta'}">${perfectBonus > 0 ? `+${perfectBonus}` : this.levelStats.hitsTaken
            }</span>
            </div>
        `;
        document.getElementById('transition-stats').innerHTML = statsHTML;

        // Random educational fact
        const fact = ASTEROID_FACTS[Math.floor(Math.random() * ASTEROID_FACTS.length)];
        document.getElementById('asteroid-fact').textContent = fact;

        // Button text
        const btn = document.getElementById('next-level-btn');
        if (this.currentLevelIdx < LEVELS.length - 1) {
            btn.textContent = `⚡ SIGUIENTE: ${LEVELS[this.currentLevelIdx + 1].name.toUpperCase()}`;
        } else {
            btn.textContent = '🏆 VER RESULTADOS';
        }

        this.showScreen('level-transition');
    }

    nextLevel() {
        this.hideScreen('level-transition');
        this.currentLevelIdx++;
        if (this.currentLevelIdx >= LEVELS.length) {
            this.victory();
        } else {
            this.startLevel();
        }
    }

    victory() {
        this.state = 'victory';
        // Accumulate last level stats if not already done
        const isRecord = this.score > this.highScore;
        if (isRecord) {
            this.highScore = this.score;
        }
        this.saveHighScore();
        this.updateHighScoreDisplay();

        const ts = this.totalStats;
        const html = `
            <div class="final-stat">
                <span class="stat-label">Score Total</span>
                <span class="stat-val amber">${this.score}</span>
            </div>
            <div class="final-stat">
                <span class="stat-label">Esquivados</span>
                <span class="stat-val green">${ts.dodged}</span>
            </div>
            <div class="final-stat">
                <span class="stat-label">Destruidos</span>
                <span class="stat-val">${ts.destroyed}</span>
            </div>
            <div class="final-stat">
                <span class="stat-label">Hazardous Derrotados</span>
                <span class="stat-val magenta">${ts.hazardousDestroyed + ts.hazardousDodged}</span>
            </div>
            <div class="final-stat highlight">
                <span class="stat-label">🏆 High Score</span>
                <span class="stat-val amber">${this.highScore}</span>
            </div>
        `;
        document.getElementById('victory-stats').innerHTML = html;
        document.getElementById('victory-record').style.display = isRecord ? 'block' : 'none';
        this.showScreen('victory-screen');
        this.autoSaveScore('victory-save-status', 'victory-actions');
    }

    gameOver() {
        this.state = 'gameover';
        document.querySelector('.ui-overlay').style.display = 'none';

        // Accumulate current level stats
        Object.keys(this.levelStats).forEach(k => this.totalStats[k] += this.levelStats[k]);

        document.getElementById('final-score').textContent = this.score;
        this.showScreen('game-over');
        
        // Auto-guardado
        this.autoSaveScore();
    }


    pause() {
        this.state = 'paused';
        this.showScreen('pause-screen');
        document.body.classList.remove('playing');
    }

    resume() {
        this.state = 'playing';
        this.hideScreen('pause-screen');
        document.body.classList.add('playing');
        this.gameLoop();
    }

    // ---------------- GAME LOOP ----------------

    gameLoop() {
        if (this.state !== 'playing') return;
        this.update();
        this.draw();
        this._animId = requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        const lvl = this.currentLevel;

        this.starField.update();
        this.player.update(this.keys);

        // ---- Level timer & progress ----
        this.levelTimer++;
        if (this.levelTimer % 60 === 0) {
            const pct = Math.min((this.levelTimer / lvl.duration) * 100, 100);
            document.getElementById('level-progress-fill').style.width = pct + '%';
        }
        if (this.levelTimer >= lvl.duration) {
            this.completeLevel();
            return;
        }

        // ---- Spawn asteroids ----
        this.currentSpawnInterval = Math.max(
            lvl.minSpawnInterval,
            this.currentSpawnInterval - lvl.spawnAccel
        );
        this.spawnTimer++;
        if (this.spawnTimer >= this.currentSpawnInterval) {
            this.spawnAsteroid();
            this.spawnTimer = 0;
        }

        // ---- Spawn power-ups ----
        if (Math.random() < lvl.weaponChance) {
            this.powerUps.push(new WeaponPowerUp(this.canvas));
        }
        if (Math.random() < lvl.shieldChance && !this.player.hasShield) {
            this.powerUps.push(new ShieldPowerUp(this.canvas));
        }

        // ---- Update bullets ----
        this.bullets.forEach(b => b.update());

        // ---- Update asteroids ----
        for (const ast of this.asteroids) {
            ast.update();

            // Dodged?
            if (!ast.passed && ast.x + ast.radius < this.player.x) {
                ast.passed = true;
                const pts = ast.isHazardous ? SCORING.DODGE_HAZARDOUS : SCORING.DODGE_SAFE;
                this.score += pts;
                this.levelStats.dodged++;
                if (ast.isHazardous) this.levelStats.hazardousDodged++;

                this.scorePopups.push(new ScorePopup(ast.x, ast.y, `+${pts}`,
                    ast.isHazardous ? CONFIG.COLORS.MAGENTA : CONFIG.COLORS.AMBER));

                // Educational toast
                this.showToast(`✨ Esquivaste: ${ast.displayName} (${ast.realDiameter}m, ${formatNum(ast.realVelocity)} km/h)`);
                this.updateHUD();
            }

            // Bullet-asteroid collision
            for (const bul of this.bullets) {
                if (!bul.alive || !ast.alive) continue;
                if (circleRectHit(bul.x, bul.y, bul.r, ast.x - ast.radius, ast.y - ast.radius, ast.radius * 2, ast.radius * 2)) {
                    bul.alive = false;
                    ast.alive = false;
                    const pts = ast.isHazardous ? SCORING.DESTROY_HAZARDOUS : SCORING.DESTROY_SAFE;
                    this.score += pts;
                    this.levelStats.destroyed++;
                    if (ast.isHazardous) this.levelStats.hazardousDestroyed++;

                    this.scorePopups.push(new ScorePopup(ast.x, ast.y, `💥 +${pts}`,
                        ast.isHazardous ? CONFIG.COLORS.MAGENTA : CONFIG.COLORS.CYAN));
                    this.spawnExplosion(ast.x, ast.y,
                        ast.isHazardous ? CONFIG.COLORS.MAGENTA : CONFIG.COLORS.AMBER, 18);

                    this.showToast(`💥 Destruiste: ${ast.displayName} (${ast.realDiameter}m)`);
                    this.updateHUD();
                }
            }

            // Player-asteroid collision
            if (!this.player.isInvincible && ast.alive && !ast.passed) {
                if (rectHit(this.player.getBounds(), ast.getBounds())) {
                    this.handleHit(ast);
                }
            }
        }

        // ---- Update power-ups ----
        for (const pu of this.powerUps) {
            pu.update();
            if (!pu.alive) continue;
            if (rectHit(this.player.getBounds(), pu.getBounds())) {
                pu.alive = false;
                if (pu instanceof ShieldPowerUp) {
                    this.player.hasShield = true;
                    this.score += SCORING.COLLECT_SHIELD;
                    document.getElementById('shield-display').style.display = 'flex';
                    this.scorePopups.push(new ScorePopup(pu.x, pu.y, '+ESCUDO', CONFIG.COLORS.GREEN));
                    this.showToast('🛡️ ¡Escudo activado! Absorbe 1 impacto');
                } else if (pu instanceof WeaponPowerUp) {
                    this.player.ammo += pu.ammoGiven;
                    this.score += SCORING.COLLECT_WEAPON;
                    this.scorePopups.push(new ScorePopup(pu.x, pu.y, `+${pu.ammoGiven} MUNICIÓN`, CONFIG.COLORS.AMBER));
                    this.showToast(`⚡ ¡+${pu.ammoGiven} disparos! Presiona ESPACIO para disparar`);
                    this.updateAmmoDisplay();
                }
                this.updateHUD();
            }
        }

        // ---- Update effects ----
        this.particles.forEach(p => p.update());
        this.scorePopups.forEach(p => p.update());

        // ---- Cleanup ----
        this.asteroids = this.asteroids.filter(a => a.alive && !a.isOffScreen());
        this.bullets = this.bullets.filter(b => b.alive && !b.isOffScreen(this.canvas.width));
        this.powerUps = this.powerUps.filter(p => p.alive && !p.isOffScreen());
        this.particles = this.particles.filter(p => p.alive);
        this.scorePopups = this.scorePopups.filter(p => p.alive);

        // ---- Screen shake ----
        if (this.shake.intensity > 0) {
            this.shake.intensity *= 0.88;
            this.shake.x = (Math.random() - 0.5) * this.shake.intensity;
            this.shake.y = (Math.random() - 0.5) * this.shake.intensity;
            if (this.shake.intensity < 0.3) this.shake = { x: 0, y: 0, intensity: 0 };
        }
    }

    tryShoot() {
        const bullet = this.player.shoot();
        if (bullet) {
            this.bullets.push(bullet);
            this.levelStats.shotsFired++;
            this.updateAmmoDisplay();
            // Muzzle flash particles
            for (let i = 0; i < 5; i++) {
                this.particles.push(new Particle(
                    bullet.x, bullet.y,
                    rand(1, 4), rand(-1.5, 1.5),
                    rand(1.5, 3), CONFIG.COLORS.CYAN, randInt(8, 18)
                ));
            }
        }
    }

    handleHit(asteroid) {
        if (this.player.hasShield) {
            this.player.hasShield = false;
            document.getElementById('shield-display').style.display = 'none';
            this.spawnExplosion(asteroid.x, asteroid.y, CONFIG.COLORS.GREEN, 16);
            this.showToast('🛡️ ¡Escudo destruido!');
            asteroid.alive = false;
        } else {
            this.player.lives--;
            this.levelStats.hitsTaken++;
            this.player.invTimer = CONFIG.PLAYER.INVINCIBILITY_FRAMES;
            this.spawnExplosion(
                this.player.x + this.player.w / 2,
                this.player.y + this.player.h / 2,
                CONFIG.COLORS.MAGENTA, 25
            );
            this.shake.intensity = 16;
            this.updateHUD();
            if (this.player.lives <= 0) this.gameOver();
        }
    }

    spawnAsteroid() {
        if (this.neoDataPool.length === 0) return;
        const idx = Math.floor(Math.random() * this.neoDataPool.length);
        this.asteroids.push(new Asteroid(this.canvas, this.neoDataPool[idx], this.currentLevel));
    }

    spawnExplosion(x, y, color, count = 20) {
        for (let i = 0; i < count; i++) {
            const a = Math.random() * Math.PI * 2;
            const s = rand(1.5, 7);
            this.particles.push(new Particle(x, y, Math.cos(a) * s, Math.sin(a) * s, rand(2, 5), color, randInt(22, 50)));
        }
    }

    // ---------------- DRAW ----------------

    draw() {
        const ctx = this.ctx;
        const W = this.canvas.width, H = this.canvas.height;

        ctx.save();
        ctx.translate(this.shake.x, this.shake.y);

        // Background
        const bg = ctx.createLinearGradient(0, 0, W, H);
        bg.addColorStop(0, CONFIG.COLORS.DEEP_SPACE);
        bg.addColorStop(0.5, CONFIG.COLORS.MID_SPACE);
        bg.addColorStop(1, CONFIG.COLORS.COSMIC_NAVY);
        ctx.fillStyle = bg;
        ctx.fillRect(-20, -20, W + 40, H + 40);

        this.drawNebula(ctx);
        this.starField.draw(ctx);

        // Power-ups
        this.powerUps.forEach(p => p.draw(ctx));

        // Asteroids
        this.asteroids.forEach(a => a.draw(ctx));

        // Bullets
        this.bullets.forEach(b => b.draw(ctx));

        // Player
        this.player.draw(ctx);

        // Particles & popups
        this.particles.forEach(p => p.draw(ctx));
        this.scorePopups.forEach(p => p.draw(ctx));

        ctx.restore();
    }

    // ---------------- UI HELPERS ----------------

    updateHUD() {
        document.getElementById('hud-score').textContent = this.score;
        const lives = Math.max(0, this.player ? this.player.lives : 0);
        document.getElementById('hud-lives').textContent = lives > 0 ? Array(lives).fill('❤️').join(' ') : '💀';
    }

    updateAmmoDisplay() {
        const ammo = this.player ? this.player.ammo : 0;
        const display = document.getElementById('ammo-display');
        if (ammo > 0) {
            display.style.display = 'flex';
            document.getElementById('hud-ammo').textContent = `⚡ ${ammo}`;
        } else {
            display.style.display = 'none';
        }
    }

    updateHighScoreDisplay() {
        const el = document.querySelector('#high-score-start span');
        if (el) el.textContent = this.highScore;
    }

    showToast(text) {
        const t = document.getElementById('asteroid-info');
        t.textContent = text;
        t.classList.add('visible');
        clearTimeout(this._toastTimeout);
        this._toastTimeout = setTimeout(() => t.classList.remove('visible'), 2500);
    }

    showScreen(id) {
        const el = document.getElementById(id);
        el.style.display = 'flex';
        el.classList.remove('fade-out');
    }

    hideScreen(id) {
        const el = document.getElementById(id);
        el.classList.add('fade-out');
        setTimeout(() => { el.style.display = 'none'; el.classList.remove('fade-out'); }, 300);
    }

    hideAllScreens() {
        ['start-screen', 'loading-screen', 'game-over', 'victory-screen', 'level-transition', 'pause-screen'].forEach(id => {
            const el = document.getElementById(id);
            el.style.display = 'none';
            el.classList.remove('fade-out');
        });
    }

    async autoSaveScore(statusId = 'save-status', actionsId = 'gameover-actions') {
        const saveStatus = document.getElementById(statusId);
        const actions = document.getElementById(actionsId);
        
        try {
            const res = await fetch('save_score.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ puntaje: this.score })
            });
            const data = await res.json();
            
            if (data.success) {
                saveStatus.innerHTML = '✅ Puntaje guardado exitosamente.';
                saveStatus.style.color = 'var(--safe-green)';
            } else {
                saveStatus.innerHTML = '⚠️ Error: ' + data.error;
                saveStatus.style.color = 'var(--hot-magenta)';
            }
        } catch (e) {
            saveStatus.innerHTML = '⚠️ Error de conexión al servidor.';
            saveStatus.style.color = 'var(--hot-magenta)';
        }
        
        actions.style.display = 'block';
    }


}


// ================================================================
// INIT
// ================================================================
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
