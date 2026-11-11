# Despliegue Docker y Render

## Requisitos

- Docker Desktop o Docker Engine con Compose v2 para ejecutar localmente.
- Un servicio de hosting de contenedores con disco persistente para tener una URL pública estable. El Blueprint `render.yaml` prepara esa configuración en Render.

## Docker Compose

1. Copia `.env.example` a `.env`.
2. Sustituye `JWT_SECRET` y `BACKUP_TOKEN` por secretos aleatorios diferentes. Por ejemplo, en macOS/Linux se pueden generar con `openssl rand -hex 32`.
3. Inicia con `docker compose up -d --build`.
4. Abre `http://localhost:3000`; verifica `http://localhost:3000/api/health`.

Compose mantiene `/app/data` en el volumen `fincontrol_data`. Reiniciar, actualizar o recrear el contenedor conserva los datos. `docker compose down` conserva el volumen. `docker compose down -v` elimina la base.

## URL pública con Render

1. Sube el commit con Dockerfile y `render.yaml` a GitHub.
2. En el panel de Render, crea un Blueprint y selecciona este repositorio.
3. Confirma el recurso `fincontrol` y espera a que termine el build Docker.
4. Render genera `JWT_SECRET` y `BACKUP_TOKEN`, configura el chequeo `/api/health` y monta el disco persistente en `/app/data`.
5. Abre la URL HTTPS que Render asigna al servicio.

El plan seleccionado debe admitir discos persistentes. Configura una sola instancia para SQLite. Si se elimina el disco o se destruye el volumen, la base deja de estar disponible; descarga respaldos y guárdalos fuera del proveedor.

## Descargar respaldo

La ruta `GET /api/backup` solo responde cuando existe `BACKUP_TOKEN`; se debe enviar por encabezado Authorization y nunca incluir en el URL.

En la terminal, exporta el token desde el `.env` local, o cópialo desde las variables del servicio Render:

```sh
export BACKUP_TOKEN='tu-token-de-respaldo'
curl --fail --show-error \
  -H "Authorization: Bearer $BACKUP_TOKEN" \
  "https://TU-SERVICIO.onrender.com/api/backup" \
  --output fincontrol.sqlite
```

Para verificar el archivo con SQLite: `sqlite3 fincontrol.sqlite 'PRAGMA integrity_check;'`; el resultado esperado es `ok`.

## Restaurar

Primero haz un respaldo del estado actual y detén el servicio. En Docker Compose, ejecuta `docker compose down`, coloca el archivo de respaldo en `data/fincontrol.sqlite` y reinicia con `docker compose up -d`. En Render, detén el servicio y reemplaza la base en el disco persistente por un mecanismo de consola/SSH que preserve el montaje; luego vuelve a iniciar. No subas copias de la base a GitHub.

## Diagnóstico

- `docker compose ps`: verifica que el contenedor esté healthy.
- `docker compose logs -f fincontrol`: revisa errores de inicio.
- `GET /api/health`: comprueba la API y SQLite.
- Un error de inicio en producción normalmente indica que falta `JWT_SECRET`.
