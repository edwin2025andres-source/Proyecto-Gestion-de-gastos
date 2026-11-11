# Publicar FinControl gratis en Render

FinControl usa SQLite en Docker local y PostgreSQL en la web. La opción gratis de [`render.yaml`](render.yaml) publica el servidor Node/Express en Render Free y conecta una base Neon Free mediante `DATABASE_URL`; no guarda SQLite en el almacenamiento efímero de Render.

## Preparar Neon

1. Crea un proyecto PostgreSQL en [Neon](https://neon.com/) con el plan gratuito.
2. Copia la cadena de conexión PostgreSQL (`DATABASE_URL`) desde la opción **Connect**. Guárdala de forma privada.

## Crear el servicio web

1. Verifica tu cuenta de Render.
2. En Render, crea un Blueprint desde el repositorio `edwin2025andres-source/Proyecto-Gestion-de-gastos`.
3. Al sincronizar el Blueprint, proporciona el `DATABASE_URL` de Neon cuando Render lo solicite.
4. Render genera `JWT_SECRET` y `BACKUP_TOKEN`. Espera el estado **Live** y abre la URL `*.onrender.com`.
5. Confirma que `/api/health` responda con `PostgreSQL conectada`.

La app crea sus tablas al iniciar. La base alojada vive en Neon y sobrevive a reinicios del servicio web. Render Free duerme tras 15 minutos sin tráfico y su primer acceso después puede tardar cerca de un minuto. Render y Neon imponen cuotas en sus planes gratuitos; revisa sus límites vigentes antes de publicar.

## Respaldo

Descarga `GET /api/backup` con `BACKUP_TOKEN` en un encabezado `Authorization: Bearer`. En PostgreSQL el archivo resultante es JSON con las tablas, no una base SQLite. Consérvalo fuera de GitHub; contiene información financiera y hashes de contraseña.

## Datos locales

La SQLite de Docker local está en el volumen `fincontrol_data` y no se migra automáticamente a Neon. Para empezar con la base web, regístrate en el enlace público. Si ya tienes cuentas o movimientos que deban pasar a Neon, exporta la base y planifica una migración antes de usar el servicio como base principal.
