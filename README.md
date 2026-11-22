# FinControl

FinControl permite registrar ingresos y gastos, organizar categorías, definir presupuestos, recibir alertas, seguir metas de ahorro y generar reportes. Usa SQLite en Docker local y PostgreSQL cuando se publica en Render.

La interfaz también muestra las alertas nuevas en una ventana emergente, desplaza el indicador azul al cambiar de sección y confirma la identidad actual al recuperar la sesión para evitar conservar el nombre de otra cuenta. La sección **Pruebas** resume los casos de inicio de sesión, metas, presupuestos y cambio de cuenta.

## Abrir la aplicación publicada

Usa [FinControl](https://fincontrol-i46e.onrender.com). Crea una cuenta o inicia sesión. El sitio se conecta a PostgreSQL en Neon. El estado actual puede comprobarse en [GET /api/health](https://fincontrol-i46e.onrender.com/api/health).

El servicio web y la base se configuraron en planes gratuitos. Render puede suspender el servicio después de un período sin uso, por eso el primer acceso puede demorar. Los datos permanecen en Neon mientras el proyecto se mantenga dentro de sus cuotas gratuitas.

### Ver la base de datos

Abre [Neon Console](https://console.neon.tech/) e inicia sesión con la cuenta que creó el proyecto Neon `mi-primer-proyecto`. Entra al proyecto, selecciona la base `neondb` y abre **SQL Editor** para consultar las tablas `users`, `categories`, `movements`, `budgets`, `goals` y `alerts`. La contraseña de conexión vive como secreto en Render y no debe publicarse.

## Instalar en un computador nuevo

### Requisitos

- Docker Desktop instalado y abierto (Windows o macOS), o Docker Engine con Docker Compose v2 (Linux).
- Git para clonar el repositorio.

### Pasos

1. Clona el proyecto y entra a la carpeta:

   ```sh
   git clone https://github.com/edwin2025andres-source/Proyecto-Gestion-de-gastos.git
   cd Proyecto-Gestion-de-gastos
   ```

2. Copia el archivo de configuración de ejemplo: `cp .env.example .env` en macOS/Linux o `Copy-Item .env.example .env` en PowerShell.
3. Abre `.env` y cambia `JWT_SECRET` y `BACKUP_TOKEN` por valores aleatorios largos y diferentes. Deja `DATABASE_URL=` vacía para iniciar una base SQLite local. No subas este archivo a GitHub.
4. Construye e inicia la aplicación:

   ```sh
   docker compose up -d --build
   ```

5. Confirma que el contenedor esté activo con `docker compose ps`. Para usar la aplicación publicada, abre [FinControl](https://fincontrol-i46e.onrender.com) y crea una cuenta. Si solo estás comprobando la instancia Docker de este computador, abre `http://127.0.0.1:3000`.

La base SQLite local vive en el volumen Docker `fincontrol_data`. `docker compose down` detiene la aplicación y conserva la base; `docker compose down -v` también borra el volumen y sus datos.

### Ejecutar sin Docker

Instala Node.js 22.5 o posterior, copia y configura `.env`, y ejecuta `npm ci` seguido de `npm start`. La instancia de desarrollo responde en `http://127.0.0.1:3000`; la aplicación pública está en [FinControl](https://fincontrol-i46e.onrender.com). La aplicación local guarda SQLite en `data/fincontrol.sqlite`. Para desarrollo con reinicio automático, usa `npm run dev`.

## Pruebas

Ejecuta `npm test` para iniciar una instancia temporal de SQLite y probar el registro, inicio de sesión, categorías, creación de metas, presupuestos, notificaciones de presupuesto y descarga protegida del respaldo. La base temporal se elimina al terminar. Consulta los casos en [docs/PRUEBAS.md](docs/PRUEBAS.md).

## Arquitectura

La aplicación usa una interfaz web, una API Express y un adaptador de base de datos SQLite/PostgreSQL. El diagrama está en [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md).

## Despliegue y respaldos

El Blueprint `render.yaml` configura Render Free con PostgreSQL persistente en Neon. `DATABASE_URL` conecta el servicio con Neon; Render genera `JWT_SECRET` y `BACKUP_TOKEN`.

La ruta `GET /api/backup` requiere `BACKUP_TOKEN` en el encabezado `Authorization: Bearer`. Para descargar la exportación JSON en producción, copia el valor privado desde Render > servicio FinControl > Environment y ejecuta:

```sh
export BACKUP_TOKEN='tu-token-privado'
curl --fail --show-error \
  -H "Authorization: Bearer $BACKUP_TOKEN" \
  "https://fincontrol-i46e.onrender.com/api/backup" \
  --output fincontrol-backup.json
```

En Windows PowerShell configura la variable de sesión con `$env:BACKUP_TOKEN='tu-token-privado'` y usa `curl.exe` con el mismo encabezado. La copia JSON incluye las tablas de la aplicación; consérvala en un lugar privado, fuera del repositorio. La descarga es manual; no se ejecuta automáticamente.

Consulta los pasos completos en [DESPLIEGUE_RENDER.md](DESPLIEGUE_RENDER.md) y la [Wiki de GitHub](https://github.com/edwin2025andres-source/Proyecto-Gestion-de-gastos/wiki).

La [presentación final](Entregables%20Finales/FinControl_Entrega_Final.pptx) resume el producto, la arquitectura, las pruebas y los retos. Consulta el [cronograma de entrega](docs/CRONOGRAMA_ENTREGA.md) y su [registro en GitHub Issues](https://github.com/edwin2025andres-source/Proyecto-Gestion-de-gastos/issues/1). El tablero solicitado está en [GitHub Projects](https://github.com/users/edwin2025andres-source/projects/1); agregar elementos al tablero requiere el permiso `project` de GitHub, que la credencial disponible no concede.

## Seguridad

- No publiques `.env`, `DATABASE_URL`, `JWT_SECRET`, `BACKUP_TOKEN` ni respaldos.
- Las contraseñas se almacenan con bcrypt y las rutas privadas filtran los datos por cuenta autenticada.
- El respaldo de producción contiene datos financieros y hashes de contraseña.
