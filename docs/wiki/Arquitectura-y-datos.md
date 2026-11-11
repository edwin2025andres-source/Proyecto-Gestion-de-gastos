# Arquitectura y datos

## Componentes

- `public/index.html`, `public/app.js`, `public/styles.css`: interfaz de una sola página servida por Express.
- `server.js`: rutas REST, autenticación, validación de movimientos, presupuestos, metas, consultas y exportación.
- `node:sqlite`: base de datos SQLite en `data/fincontrol.sqlite`.
- `Dockerfile`: imagen Node.js 22, dependencias de producción y proceso sin privilegios de root.
- `compose.yaml`: puerto, variables secretas, chequeo de salud y volumen persistente `fincontrol_data`.
- `render.yaml`: servicio Docker, chequeo `/api/health` y disco persistente de 1 GB montado en `/app/data`.

## Modelo de datos

Las tablas principales son `users`, `categories`, `movements`, `budgets`, `goals` y `alerts`. Las claves foráneas relacionan los datos y se habilitan al iniciar. La creación inicial y los índices se aplican desde `server.js` mediante `CREATE TABLE/INDEX IF NOT EXISTS`.

## Acceso y seguridad

Las rutas privadas validan JWT firmado con `JWT_SECRET`. Contraseñas se almacenan como hash bcrypt. Las consultas de datos de usuario se filtran por el ID autenticado. En producción se exige JWT_SECRET. `/api/backup` está protegido por `BACKUP_TOKEN` independiente y crea una copia SQLite consistente con `VACUUM INTO` antes de responder el archivo.

Las claves de entorno, archivos de base de datos y reportes generados están excluidos de Git. Usa HTTPS y almacena las copias de seguridad de forma privada.

## Persistencia y operación

Un contenedor es reemplazable: la base vive en el volumen/disco montado en `/app/data`. Un servicio con múltiples instancias requeriría una base de datos compartida adecuada; SQLite en un disco de una sola instancia no debe compartirse entre réplicas.
