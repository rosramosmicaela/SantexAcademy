# FIFA Players – Challenge XAcademy

Aplicación web para gestionar un listado de jugadores de FIFA (ediciones 2015 a 2023),
con backend en Node.js (NestJS + Sequelize), frontend en Angular y base de datos MySQL.

## Cómo correr el proyecto

Requisito: tener Docker Desktop instalado y abierto.

```bash
git clone https://github.com/rosramosmicaela/SantexAcademy.git
cd SantexAcademy/football-api
cp .env.sample .env        # en Windows (PowerShell): copy .env.sample .env
docker compose up
```

La primera vez tarda varios minutos: descarga las imágenes y carga los jugadores en la base.

| Servicio | Dirección |
| --- | --- |
| Frontend (Angular) | http://localhost:4200 |
| API (NestJS) | http://localhost:3000 |
| Documentación Swagger | http://localhost:3000/api/docs |

Para entrar: en la pantalla de login, ingresá un usuario y una contraseña (mínimo 6 caracteres)
y tocá "Crear cuenta". Después tocá "Ingresar".

Para borrar todos los datos y empezar de cero: `docker compose down -v`.

## Funcionalidades

1. **Listado de jugadores**: paginado (20 por página) y filtrable por nombre, club, posición y versión de FIFA.
   Se puede descargar el listado filtrado en CSV.
2. **Detalle de un jugador**: datos del jugador y un gráfico radar (Chart.js) con sus seis skills.
3. **Editar un jugador**: nombre, posición, club, nacionalidad, calificación y skills.
4. **Crear un jugador**: formulario para crear un jugador nuevo (por ejemplo, uno mismo).
5. **Login**: todos los endpoints de jugadores exigen estar autenticado. Sin sesión, la API responde 401.

## Endpoints principales

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | /api/auth/register | Crea un usuario |
| POST | /api/auth/login | Devuelve un token JWT |
| GET | /api/players | Listado paginado (page, limit, name, club, position, fifaVersion) |
| GET | /api/players/export | Descarga el listado filtrado en CSV |
| GET | /api/players/:id | Detalle de un jugador |
| POST | /api/players | Crea un jugador |
| PATCH | /api/players/:id | Edita un jugador |

Los endpoints de jugadores requieren el header `Authorization: Bearer <token>`.
Se pueden probar desde Swagger (botón "Authorize").

## Decisiones técnicas y funcionales

- **Partí del repositorio de ejemplo** (Angular + NestJS + MySQL + Docker) en lugar de empezar desde cero,
  porque ya traía la arquitectura y el `docker-compose.yml` funcionando.
- **ORM: Sequelize.** Es el que ya venía configurado en el proyecto. El acceso a datos se hace a través de
  una interfaz (`IPlayerRepository`), así el servicio no depende de cómo se guardan los datos.
  Las otras implementaciones que venían (en memoria y TypeORM) no se usan.
- **Filtro por versión de FIFA.** Un mismo jugador aparece una vez por cada edición del juego,
  así que sin ese filtro el listado muestra repetidos. Por eso el listado permite elegir la versión.
- **Paginación en el servidor**, con un máximo de 100 por página, para no cargar miles de filas en el navegador.
  El orden es por calificación descendente.
- **Descarga en CSV.** El endpoint de exportación recorre todas las páginas que cumplen el filtro
  (tope de seguridad de 20.000 filas). Se agrega una marca al inicio para que Excel muestre bien los acentos
  y se escapan las comas y comillas de los textos.
- **Skills del radar:** velocidad (pace), tiro (shooting), pase (passing), regate (dribbling),
  defensa (defending) y físico (physic). Son los seis valores principales de cada jugador.
- **Validaciones en el backend** con `class-validator` y un `ValidationPipe` global: se rechazan datos inválidos
  (por ejemplo, una calificación mayor a 99) con un error 400 y un mensaje claro.
  **En el frontend** se usan formularios reactivos de Angular con las mismas reglas.
- **Manejo de errores con códigos HTTP:** 400 (datos inválidos), 401 (sin sesión), 404 (jugador inexistente),
  409 (usuario ya existe).
- **Login con JWT.** Las contraseñas no se guardan en texto plano: se guardan con hash (scrypt con sal).
  El token dura 8 horas. Un guard de NestJS protege todas las rutas de jugadores.
  En Angular, un interceptor agrega el token a cada pedido y un guard de rutas manda al login
  a quien no inició sesión. El token se guarda en `localStorage` (decisión simple para este proyecto).
- **Jugadores creados por formulario:** se guardan con valores por defecto para los campos que el formulario
  no pide (versión de FIFA 23, edad 25 y potencial igual a la calificación).
- **Secretos:** el archivo `.env` no se sube al repositorio; se incluye `.env.sample` como modelo.
  El secreto del JWT tiene un valor por defecto de desarrollo y debería cambiarse en producción.
- **Documentación de la API con Swagger** en `/api/docs`.

## Problemas encontrados y cómo se resolvieron

- El modelo de Sequelize no leía las skills (salían en 0): hubo que declarar los campos con `declare`.
- Docker en Windows no detecta algunos cambios de archivos: se resolvió reiniciando el servicio
  (`docker compose restart backend`).

## Limitaciones conocidas y pendientes

- Algunos nombres muestran caracteres raros (por ejemplo "AndrÃ©s"): viene de la codificación de los datos
  cargados en la base y no se llegó a corregir.
- No se implementaron los puntos extra (línea de tiempo de habilidades, análisis con IA con LangChain
  e importación de CSV).

## Herramientas utilizadas

Para armar el proyecto me apoyé en Claude (asistente de IA) como guía y para resolver errores.
Probé y revisé cada parte.