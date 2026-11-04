# Publicar FinControl permanentemente en Render

Este proyecto usa Express y guarda sus datos en SQLite. El archivo [`render.yaml`](render.yaml) configura un servicio web Node, un disco persistente montado donde la aplicación guarda `data/fincontrol.sqlite`, una comprobación de salud y un secreto JWT generado por Render.

## Crear el servicio una sola vez

1. Confirma que los cambios estén en la rama `main` del repositorio GitHub.
2. Crea o inicia sesión en [Render](https://render.com/).
3. En el panel elige **New → Blueprint** y conecta el repositorio `edwin2025andres-source/Proyecto-Gestion-de-gastos`.
4. Render leerá `render.yaml`. Revisa el servicio **fincontrol** y el costo mostrado antes de confirmar la creación.
5. Acepta la configuración y espera a que el despliegue termine en estado **Live**.
6. Abre la URL `https://fincontrol-....onrender.com` que Render muestra en la página del servicio. Esa es la dirección para computador, teléfono y tableta; no requiere `localhost`, el Mac ni Cloudflare Tunnel.

Al conectar GitHub, los cambios posteriores que se suban a `main` podrán desplegarse automáticamente.

## Costo y disponibilidad

La configuración elige el plan web de 0,5 CPU / 512 MB y un disco de 1 GB. Render publica el plan web de entrada a **US$7/mes** y cobra el almacenamiento persistente a **US$0,25 por GB/mes**; el total estimado inicial es **US$7,25/mes**, antes de impuestos o consumo adicional. Revisa el precio final y la facturación que muestre Render antes de crear el servicio. El plan de pago no se duerme por inactividad; el disco conserva SQLite después de reinicios y despliegues.

El plan gratuito no satisface este objetivo: se duerme tras 15 minutos sin tráfico y su sistema de archivos es temporal, por lo que una base SQLite local puede perderse al reiniciar, desplegar o dormir el servicio.

Consulta la documentación oficial de [Blueprints](https://render.com/docs/infrastructure-as-code), [discos persistentes](https://render.com/docs/disks), [limitaciones del nivel gratuito](https://render.com/docs/free) y [precios](https://render.com/pricing).

## Base de datos local existente

El primer despliegue crea una base SQLite vacía en el disco de Render. **No copia** automáticamente `data/fincontrol.sqlite` desde el Mac, y la base nunca debe subirse a GitHub. Las cuentas y movimientos que ya estén en el Mac siguen allí; para usar esos datos en la versión web hace falta realizar una migración segura antes de que uses el nuevo servicio como base principal.

## Verificar el despliegue

- La URL principal debe mostrar la pantalla de FinControl en HTTPS.
- El endpoint `https://TU-URL.onrender.com/api/health` debe responder `{"status":"ok","database":"SQLite conectada"}`.
- Registra una cuenta de prueba y un movimiento; vuelve a desplegar el servicio y confirma que los datos permanecen.
- No pongas la URL del servicio ni sus secretos en `server.js` o en el archivo `render.yaml`; Render genera y guarda `JWT_SECRET`.
