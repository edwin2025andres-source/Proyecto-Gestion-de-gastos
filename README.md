# FinControl

Aplicación web responsive para registrar ingresos y gastos, administrar categorías, presupuestos mensuales y alertas, revisar reportes y crear metas de ahorro.

## Requisitos

- Node.js 22 o posterior (usa el módulo integrado `node:sqlite`).
- npm.

## Ejecutar localmente

```bash
npm install
cp .env.example .env
npm start
```

Abre <http://localhost:3000>. Crea una cuenta desde la pantalla inicial. El servidor genera automáticamente `data/fincontrol.sqlite` al iniciar.

También puedes abrir `Iniciar FinControl.command` en macOS después de instalar las dependencias.

## Datos y configuración

- La aplicación usa SQLite; no necesita MySQL.
- La base de datos y el archivo `.env` son locales y están excluidos de Git.
- Cambia `JWT_SECRET` en `.env` por un secreto largo y privado antes de exponer la aplicación públicamente.
- Para conservar los datos, realiza una copia de seguridad de `data/fincontrol.sqlite`.

## Estructura

- `server.js`: API, autenticación y acceso a SQLite.
- `public/`: interfaz responsive y lógica del cliente.
- `data/`: base de datos creada localmente al ejecutar el servidor.

La aplicación permite registrar cuentas, movimientos, categorías, presupuestos, alertas por límites, reportes PDF/Excel y metas de ahorro.
