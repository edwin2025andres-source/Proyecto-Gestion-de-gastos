# FinControl

Aplicación web responsive para registrar ingresos y gastos, administrar categorías, presupuestos mensuales y alertas, revisar reportes y crear metas de ahorro.

## Requisitos

- Node.js 22 o posterior (utiliza el módulo integrado `node:sqlite`).
- npm.

## Ejecutar localmente

```bash
npm install
cp .env.example .env
npm start
```

Abre <http://localhost:3000> y crea una cuenta desde la pantalla inicial. El servidor crea `data/fincontrol.sqlite` al iniciar.

En macOS, también puedes abrir `Iniciar FinControl.command` después de instalar las dependencias.

## Datos y seguridad

- La aplicación usa SQLite; no necesita MySQL.
- La base de datos y el archivo `.env` se guardan localmente y están excluidos de Git.
- Antes de exponer la aplicación públicamente, cambia `JWT_SECRET` en `.env` por un secreto largo y privado.
- Para conservar los datos, haz una copia de seguridad de `data/fincontrol.sqlite`.

## Estructura

- `server.js`: API, autenticación, reglas y exportación PDF/Excel.
- `public/`: interfaz responsive y lógica de pantallas.
- `data/`: base local generada cuando inicia el servidor.
