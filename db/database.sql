-- ============================================
--  Asteroid Dodger (NASA API) - Base de datos
--  Archivo: db/database.sql
-- ============================================

CREATE DATABASE IF NOT EXISTS juego_final;
USE juego_final;

DROP TABLE IF EXISTS logs;
DROP TABLE IF EXISTS puntajes;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    nombre         VARCHAR(50) NOT NULL,
    avatar         VARCHAR(10) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE puntajes (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    puntaje    INT NOT NULL,
    fecha      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE logs (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT DEFAULT NULL,
    nivel      ENUM('INFO','WARN','ERROR') DEFAULT 'INFO',
    ruta       VARCHAR(255) DEFAULT NULL,
    evento     VARCHAR(255) NOT NULL,
    fecha      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Usuarios previamente registrados
INSERT INTO usuarios (nombre, avatar) VALUES
('Astra Pilot', 'P1'),
('Cmdr. Nova', 'P2'),
('Cosmic Voyager', 'P3'),
('Star Fox', 'P4'),
('Orion Hunter', 'P5'),
('Galactic Ace', 'P6'),
('Nebula Drifter', 'P7'),
('Quantum Rider', 'P8');

-- Datos iniciales para probar reportes
INSERT INTO puntajes (usuario_id, puntaje, fecha) VALUES
(1, 1500, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 3200, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(3, 800,  DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4, 5400, DATE_SUB(NOW(), INTERVAL 15 DAY)),
(5, 2100, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(6, 4500, DATE_SUB(NOW(), INTERVAL 20 DAY)),
(7, 1200, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(8, 2800, DATE_SUB(NOW(), INTERVAL 10 DAY)),
(1, 3100, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 4200, DATE_SUB(NOW(), INTERVAL 3 DAY));
