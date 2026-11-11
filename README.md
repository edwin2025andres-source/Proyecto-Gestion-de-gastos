# FinControl

Aplicación web responsive para controlar ingresos y gastos. Permite crear categorías, registrar movimientos, definir presupuestos mensuales, recibir alertas al 80 % y 100 %, fijar metas de ahorro y descargar reportes PDF y Excel. Los usuarios y sus datos se guardan en SQLite.

## Ejecutar con Docker

Requiere Docker Desktop (o Docker Engine) con Docker Compose v2. Copia `.env.example` como `.env` y sustituye los dos secretos por valores aleatorios largos. Luego ejecuta:

```sh
docker compose up -d --build
```

En el equipo donde corre Docker, abre `http://localhost:3000`. El volumen `fincontrol_data` conserva la base aunque se reinicie o recree el contenedor. `docker compose down` también conserva el volumen; `docker compose down -v` lo borra.

## URL pública permanente

Docker empaqueta y ejecuta la aplicación; una URL pública requiere alojar el contenedor en un servidor accesible desde Internet. Este repositorio incluye [`render.yaml`](render.yaml) para desplegar en Render con el Dockerfile, disco persistente en `/app/data`, HTTPS y variables secretas generadas por el proveedor:

1. Publica estos cambios en GitHub.
2. En Render, crea un Blueprint desde este repositorio y confirma el servicio `fincontrol`.
3. Espera a que termine el despliegue y abre la URL `*.onrender.com` asignada al servicio.

El servicio requiere un plan que admita disco persistente. Render es una opción de hosting; la URL pública no se crea al ejecutar Docker en el computador local. Consulta la [Wiki del proyecto](https://github.com/edwin2025andres-source/Proyecto-Gestion-de-gastos/wiki) para la guía completa.

## Base de datos y respaldos

- La aplicación crea `data/fincontrol.sqlite` automáticamente al iniciar.
- Con Compose, ese archivo está dentro del volumen `fincontrol_data`, fuera del ciclo de vida del contenedor.
- `GET /api/health` informa si la API y SQLite responden.
- La descarga `GET /api/backup` requiere `BACKUP_TOKEN` como Bearer token. Genera una copia SQLite consistente con `VACUUM INTO`, aun si hay actividad en la aplicación. No se publican usuarios ni datos de respaldo en el repositorio.

Descarga desde una terminal, reemplazando la URL y proporcionando la clave configurada:

```sh
export BACKUP_TOKEN='tu-token-de-respaldo'
curl --fail --show-error \
  -H "Authorization: Bearer $BACKUP_TOKEN" \
  "https://TU-SERVICIO.onrender.com/api/backup" \
  --output fincontrol.sqlite
```

Para Compose, cambia la URL por `http://localhost:3000/api/backup`. Guarda el archivo descargado en un lugar seguro. Para restaurar, detén la aplicación, reemplaza `data/fincontrol.sqlite` (o el archivo del disco persistente del proveedor) con la copia y vuelve a iniciarla. La guía de la Wiki cubre los pasos de cada plataforma.

## Desarrollo sin Docker

Requiere Node.js 22.5 o posterior. Ejecuta `npm ci` y `npm start`, y abre `http://localhost:3000`. `npm run dev` reinicia el servidor al detectar cambios. Los comandos de macOS existentes también están disponibles en [`Iniciar FinControl.command`](Iniciar%20FinControl.command).

## Seguridad y configuración

- `JWT_SECRET` firma sesiones de siete días; el servidor se niega a iniciar en producción si falta.
- `BACKUP_TOKEN` protege la descarga de la base completa. Mantén ambos secretos fuera de Git y usa HTTPS en producción.
- Cada usuario solo accede a sus datos mediante la API autenticada; las contraseñas se guardan con bcrypt.
- No uses `docker compose down -v` salvo que quieras borrar permanentemente la base de datos.

## Estructura

- `server.js`: API Express, autenticación, persistencia SQLite, exportaciones y respaldo.
- `public/`: interfaz, estilos y lógica de pantallas.
- `Dockerfile`, `compose.yaml`: imagen y despliegue Docker.
- `render.yaml`: Blueprint del servicio público de Render y su disco persistente.
- `docs/`: documentación de proyecto.
