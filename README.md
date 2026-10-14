# FinControl

Aplicación web responsive de control de gastos e ingresos basada en las historias HU001–HU010 de la wiki. Incluye registro e inicio de sesión, categorías, movimientos, presupuestos mensuales, alertas al 80 % y 100 %, reportes, exportación PDF/Excel y metas de ahorro.

## Inicio rápido (macOS)

1. Abre la carpeta en Visual Studio Code.
2. Abre Terminal → Nueva terminal. Ejecuta `npm install` una sola vez.
3. Ejecuta `bash "Iniciar FinControl.command"`. La app abre el navegador y usa el archivo local `data/fincontrol.sqlite`.

No requiere MySQL ni configurar una base de datos externa. Para iniciar manualmente después de instalar dependencias, usa `npm start` y visita [http://localhost:3000](http://localhost:3000). Mantén esa terminal abierta mientras uses la aplicación.

## Abrir FinControl desde un teléfono fuera de tu red

Consulta la guía paso a paso en [ACCESO_DESDE_INTERNET.md](ACCESO_DESDE_INTERNET.md). Usa un túnel de Cloudflare para acceder temporalmente sin configurar el router. El Mac debe permanecer encendido y con el servidor y el túnel activos.

## Datos y seguridad

- La base local se guarda en `data/fincontrol.sqlite`. Conserva ese archivo para mantener tus cuentas y movimientos; cópialo para hacer una copia de seguridad.
- `server.js` crea y actualiza las tablas al iniciar.
- Cada usuario solo consulta y modifica sus propios datos; las contraseñas se guardan con hash.
- En producción, configura HTTPS y un secreto JWT fuerte.

## Estructura

- `server.js`: API, autenticación, reglas y exportación.
- `public/`: interfaz, estilos y lógica de pantallas.
- `data/fincontrol.sqlite`: archivo de base de datos local generado al iniciar.
