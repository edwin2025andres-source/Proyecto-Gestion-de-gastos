# FinControl

Aplicación web responsive para controlar ingresos y gastos. Permite gestionar categorías, movimientos, presupuestos mensuales, alertas al 80 % y 100 %, metas de ahorro y reportes PDF/Excel. Admite SQLite para Docker local y PostgreSQL para el despliegue alojado.

## Ejecutar con Docker

Requiere Docker Desktop (o Docker Engine) con Compose v2. Copia `.env.example` a `.env` y configura secretos aleatorios distintos en `JWT_SECRET` y `BACKUP_TOKEN`. Después inicia la aplicación:

```sh
docker compose up -d --build
```

Abre `http://localhost:3000` en el equipo donde corre Docker. SQLite se guarda en el volumen Docker `fincontrol_data`, que sobrevive a reinicios y recreaciones del contenedor. `docker compose down` conserva la base; `docker compose down -v` la elimina.

## Publicar gratis en Internet

El Blueprint `render.yaml` configura el servicio web gratis de Render y usa Neon Free como base PostgreSQL persistente. La variable `DATABASE_URL` conecta Render con Neon; cuando está configurada, el servidor usa PostgreSQL en lugar de crear SQLite en el disco efímero.

1. Crea una base PostgreSQL en el plan Free de [Neon](https://neon.com/) y copia su URL de conexión `DATABASE_URL`.
2. Verifica tu cuenta de Render y crea un Blueprint desde este repositorio.
3. Cuando Render solicite `DATABASE_URL`, pega la URL de Neon. Render generará `JWT_SECRET` y `BACKUP_TOKEN`.
4. Espera el despliegue y abre la URL `*.onrender.com` que Render asigne.

La base Neon gratuita conserva los datos, pero tiene cuotas de uso. Render Free duerme el servicio tras 15 minutos sin tráfico; el primer acceso posterior puede tardar cerca de un minuto. Revisa las cuotas gratuitas actuales de [Render](https://render.com/docs/free) y [Neon](https://neon.com/pricing). Render no debe usar SQLite local en este despliegue porque su sistema de archivos se borra al dormir o redeplegar.

## Descargar la base de datos

`GET /api/backup` requiere `BACKUP_TOKEN` como Bearer token enviado en el encabezado Authorization. Con PostgreSQL crea una exportación JSON consistente con todas las tablas; con SQLite descarga un archivo `.sqlite` consistente. La clave nunca va en la URL.

```sh
export BACKUP_TOKEN='tu-token-de-respaldo'
curl --fail --show-error \
  -H "Authorization: Bearer $BACKUP_TOKEN" \
  "https://TU-SERVICIO.onrender.com/api/backup" \
  --output fincontrol-backup.json
```

Para Docker local, cambia la URL por `http://localhost:3000/api/backup`. Guarda la descarga en un lugar privado; contiene datos financieros y hashes de contraseña.

## Desarrollo sin Docker

Requiere Node.js 22.5 o posterior. Ejecuta `npm ci` y `npm start`; la aplicación usa `data/fincontrol.sqlite` si `DATABASE_URL` no está definida. `npm run dev` reinicia el servidor al detectar cambios.

## Seguridad

- En producción, `JWT_SECRET` es obligatorio; Render lo genera automáticamente.
- `BACKUP_TOKEN` protege la exportación completa de la base.
- Las contraseñas se guardan con bcrypt y las rutas privadas filtran datos por usuario autenticado.
- No guardes `.env`, `DATABASE_URL` ni exportaciones de la base en Git.

## Estructura

- `server.js`: API Express, autenticación, lógica financiera y exportaciones.
- `database.js`: adaptador PostgreSQL/SQLite, esquema y consultas.
- `public/`: interfaz y estilos.
- `Dockerfile`, `compose.yaml`: imagen y entorno Docker local.
- `render.yaml`: servicio gratuito de Render conectado a PostgreSQL externo.
- `docs/`: documentación del proyecto.
