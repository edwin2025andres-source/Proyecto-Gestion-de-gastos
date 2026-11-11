# Despliegue gratis: Docker local, Render Free y Neon

## Requisitos

- Docker Desktop/Engine con Compose v2 para desarrollo local.
- Cuentas gratuitas de Render y Neon para publicar la aplicación con base persistente.

## Docker Compose local

1. Copia `.env.example` a `.env`.
2. Reemplaza `JWT_SECRET` y `BACKUP_TOKEN` por valores aleatorios diferentes.
3. Ejecuta `docker compose up -d --build`.
4. Abre `http://localhost:3000`; el chequeo es `/api/health`.

Docker usa SQLite en `/app/data`, guardada en el volumen `fincontrol_data`. `docker compose down` conserva el volumen; `docker compose down -v` lo borra. Deja `DATABASE_URL` vacía para SQLite.

## URL pública con Render Free + Neon Free

1. Crea un proyecto PostgreSQL gratuito en [Neon](https://neon.com/) y copia su cadena de conexión `DATABASE_URL`.
2. Verifica la cuenta de Render y crea un Blueprint desde este repositorio.
3. Pega `DATABASE_URL` cuando Render solicite el valor. El Blueprint genera `JWT_SECRET` y `BACKUP_TOKEN` automáticamente.
4. Espera el despliegue y abre [https://fincontrol-i46e.onrender.com](https://fincontrol-i46e.onrender.com).

El despliegue actual está activo. `GET /api/health` confirmó `{"status":"ok","database":"PostgreSQL conectada"}`.

Con `DATABASE_URL` presente, la aplicación usa PostgreSQL remoto. Render Free tiene almacenamiento de archivos efímero, así que no aloja la SQLite local. El servicio puede dormir tras 15 minutos sin tráfico y tardar cerca de un minuto en responder al primer acceso al despertar. Neon Free mantiene la base dentro de sus cuotas de cómputo y almacenamiento. Consulta las condiciones actuales en [Render](https://render.com/docs/free) y [Neon](https://neon.com/pricing).

## Descargar la base

`GET /api/backup` requiere `BACKUP_TOKEN` como Bearer token en el encabezado Authorization; nunca pongas la clave en el URL. Con PostgreSQL entrega un JSON con las seis tablas leído dentro de una transacción consistente; con SQLite entrega un archivo `.sqlite` consistente.

```sh
export BACKUP_TOKEN='tu-token-de-respaldo'
curl --fail --show-error \
  -H "Authorization: Bearer $BACKUP_TOKEN" \
  "https://fincontrol-i46e.onrender.com/api/backup" \
  --output fincontrol-backup.json
```

En Compose local, usa `http://localhost:3000/api/backup` para guardar `fincontrol.sqlite`. Los respaldos contienen datos personales y hashes de contraseñas: mantenlos fuera de GitHub.

## Límites y operación

- Render Free puede suspender el servicio al agotar sus cuotas mensuales; no ofrece almacenamiento local persistente.
- Neon Free tiene cuotas de cómputo y almacenamiento; si se exceden, las conexiones pueden quedar temporalmente limitadas o requerir cambio de plan.
- Descarga respaldos regularmente. La API entrega exportaciones; la restauración de JSON requiere importarlo a PostgreSQL con un flujo controlado.
- `docker compose ps` muestra la salud local; `docker compose logs -f fincontrol` permite revisar errores.
