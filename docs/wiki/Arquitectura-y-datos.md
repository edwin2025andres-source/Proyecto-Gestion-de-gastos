# Arquitectura y datos

## Componentes

- `public/`: interfaz responsive servida por Express.
- `server.js`: rutas REST, autenticación, reglas financieras y exportaciones.
- `database.js`: adapta `node:sqlite` para Docker local y `pg` para PostgreSQL cuando existe `DATABASE_URL`.
- `Dockerfile` y `compose.yaml`: imagen Docker local y volumen SQLite persistente.
- `render.yaml`: web service Render Free y configuración de secretos; `DATABASE_URL` se conecta con Neon Free.

## Modelo de datos

Las tablas principales son `users`, `categories`, `movements`, `budgets`, `goals` y `alerts`. Esquemas compatibles para SQLite y PostgreSQL se crean al iniciar, con índices y claves foráneas.

## Acceso y seguridad

Las rutas privadas validan JWT firmado por `JWT_SECRET`. Contraseñas se almacenan con bcrypt y las consultas filtran por el ID autenticado. `/api/backup` está protegido con `BACKUP_TOKEN`; genera una exportación JSON consistente para PostgreSQL o una copia SQLite local.

Las credenciales, bases y respaldos están excluidos de Git. Usa HTTPS y almacena las copias de seguridad en un lugar privado.

## Persistencia y operación

SQLite local vive en el volumen Compose `fincontrol_data`. En la web gratuita, los datos viven en Neon PostgreSQL y no en el disco efímero de Render. Render Free puede dormir por inactividad y Neon Free tiene cuotas de cómputo/almacenamiento. Las réplicas concurrentes comparten PostgreSQL; no compartas un SQLite en disco.
