# Estado general del proyecto

## Objetivo

FinControl permite llevar ingresos, gastos y metas de ahorro en una aplicación web accesible desde computador o teléfono.

## Alcance implementado

- Alta de usuario e inicio de sesión.
- Categorías personalizables y movimientos de ingresos y gastos.
- Resumen, filtros y presupuestos por mes y categoría.
- Alertas de consumo presupuestal al 80 % y 100 %.
- Metas de ahorro con aportes validados contra el saldo disponible.
- Reportes PDF y Excel.
- Interfaz responsive.
- Persistencia SQLite, despliegue Docker y comprobación de salud.
- Respaldo descargable protegido por una clave separada.

## Ejecución y publicación

Desarrollo: Node.js 22.5+, `npm ci`, `npm start`. Docker: `docker compose up -d --build`. URL pública: configurar el Blueprint Render con `render.yaml`; confirmar un plan que incluya disco persistente y usar la URL HTTPS generada.

## Mantenimiento de datos

Proteger y rotar `JWT_SECRET` y `BACKUP_TOKEN` desde el panel del hosting o el archivo `.env` local. Descargar respaldos de SQLite con regularidad y guardarlos fuera del servicio de hosting. Verificar `/api/health` tras desplegar. No borrar el disco persistente al reconstruir o actualizar el servicio.

## Próximos pasos sugeridos

- Configurar una política externa para programar respaldos y probar restauraciones.
- Añadir migraciones versionadas al cambiar el esquema.
- Agregar pruebas automatizadas de rutas y reglas financieras.
- Evaluar una base administrada si se requieren varias instancias concurrentes.
