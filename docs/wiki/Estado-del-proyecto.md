# Estado del proyecto

## Objetivo

Ayudar a organizar ingresos, gastos, presupuestos y metas de ahorro en una aplicación web para computador y móvil.

## Alcance implementado

- Registro e inicio de sesión, categorías y movimientos.
- Historial, filtros, resumen y presupuestos mensuales con alertas.
- Metas de ahorro y aportes asociados a movimientos.
- Reportes PDF/Excel e interfaz responsive.
- SQLite local en Docker con volumen persistente.
- Adaptador PostgreSQL para alojamiento público y respaldo protegido descargable.
- Blueprint para Render Free conectado a Neon Free.

## Ejecución y publicación

Desarrollo: Node.js 22.5+, `npm ci`, `npm start`. Docker: configura `.env` desde `.env.example` y ejecuta `docker compose up -d --build`. Publicación gratis: crea una base Neon PostgreSQL, configura su `DATABASE_URL` en el Blueprint Render y abre la URL HTTPS asignada.

Render Free puede dormir por inactividad y tiene cuotas mensuales; Neon Free aplica límites de cómputo y almacenamiento. Revisa las condiciones vigentes de ambos proveedores.

## Mantenimiento

Guarda respaldos fuera del servicio, rota `JWT_SECRET` y `BACKUP_TOKEN`, y comprueba `/api/health` tras un despliegue. Próximas mejoras: restauración JSON automatizada, migraciones versionadas y respaldos programados.
