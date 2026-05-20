# Asteroid Dodger - NASA API

Aplicacion web dinamica desarrollada con HTML, CSS, JavaScript, PHP y MySQL.

## Navegacion

1. `index.php`: pantalla principal. Permite seleccionar un piloto registrado y consultar asteroides reales usando la API NEO de NASA.
2. `game.php`: simulador interactivo. El piloto esquiva asteroides y obtiene un puntaje.
3. `save_score.php`: guarda el puntaje final del piloto en la base de datos.
4. `leaderboard.php`: muestra el ranking, filtros por piloto y reportes por semana, mes y todo el tiempo.

## Tecnologias utilizadas

- HTML y CSS para la estructura y diseno visual.
- JavaScript con Canvas para el juego.
- API publica NASA Near Earth Object Web Service para datos de asteroides.
- PHP con PDO para conexion segura a MySQL.
- MySQL para usuarios, puntajes y logs.
- Chart.js para la grafica de progreso por piloto.

## Experiencia de usuario

La aplicacion usa una tematica espacial. El usuario selecciona un piloto, revisa asteroides reales detectados por NASA, juega una mision interactiva y luego puede consultar su progreso y ranking.

## Modelo entidad-relacion

Tabla `usuarios`:
- `id` clave primaria.
- `nombre` nombre del piloto.
- `avatar` icono del piloto.
- `fecha_creacion` fecha de registro.

Tabla `puntajes`:
- `id` clave primaria.
- `usuario_id` clave foranea hacia `usuarios.id`.
- `puntaje` puntos obtenidos.
- `fecha` fecha del registro.

Tabla `logs`:
- `id` clave primaria.
- `usuario_id` clave foranea opcional hacia `usuarios.id`.
- `nivel` tipo de evento: INFO, WARN o ERROR.
- `ruta` archivo donde ocurre el evento.
- `evento` descripcion del evento.
- `fecha` fecha del log.

Relaciones:
- Un usuario puede tener muchos puntajes.
- Un usuario puede tener muchos logs.
- Si se elimina un usuario, sus puntajes se eliminan y sus logs quedan como sistema.

## Instalacion basica

1. Crear la base de datos ejecutando `db/database.sql` en MySQL.
2. Revisar usuario, clave y puerto en `db/db.php`.
3. Abrir `index.php` desde el servidor local de XAMPP.
