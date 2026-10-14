# Proyecto Gestión de Gastos

La aplicación FinControl está dentro de [`pagina/`](pagina/).

## Iniciar la aplicación

Requisitos: Node.js 22 o posterior y npm.

```bash
cd pagina
npm install
cp .env.example .env
npm start
```

Luego abre <http://localhost:3000>. La base SQLite se creará localmente en `pagina/data/fincontrol.sqlite` al iniciar el servidor. Los datos y credenciales locales no se suben a GitHub.

Consulta [`pagina/README.md`](pagina/README.md) para más información.
