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
- Campana con avisos emergentes para alertas nuevas y navegación con indicador azul animado.
- Pruebas automatizadas de registro, inicio de sesión, metas, presupuestos, alertas y respaldo (`npm test`).
- Guía de instalación, arquitectura editable y presentación final en `Entregables Finales/`.

## Ejecución y publicación

Desarrollo: Node.js 22.5+, `npm ci`, `npm start`. Docker: configura `.env` desde `.env.example` y ejecuta `docker compose up -d --build`. Despliegue público gratuito activo: [https://fincontrol-i46e.onrender.com](https://fincontrol-i46e.onrender.com). `GET /api/health` confirma conexión a Neon PostgreSQL.

Render Free puede dormir por inactividad y tiene cuotas mensuales; Neon Free aplica límites de cómputo y almacenamiento. Revisa las condiciones vigentes de ambos proveedores.

## Mantenimiento

Guarda respaldos fuera del servicio, rota `JWT_SECRET` y `BACKUP_TOKEN`, y comprueba `/api/health` tras un despliegue. Próximas mejoras: restauración JSON automatizada, migraciones versionadas y respaldos programados.

## Entrega final

- Pruebas automatizadas: 1 suite aprobada, 0 fallos en la revisión local.
- Arquitectura: [diagrama y descripción](../ARQUITECTURA.md).
- Casos de prueba: [pruebas automatizadas y guía manual](../PRUEBAS.md).
- Presentación: `Entregables Finales/FinControl_Entrega_Final.pptx` en el repositorio.
- Acceso a PostgreSQL: Neon Console → proyecto `mi-primer-proyecto` → base `neondb` → SQL Editor.

El cronograma y sus fechas están en la sección **Projects** del repositorio; no se administra desde esta Wiki.
