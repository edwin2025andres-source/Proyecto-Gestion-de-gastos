# Acceso público a FinControl

La aplicación está publicada en [https://fincontrol-i46e.onrender.com](https://fincontrol-i46e.onrender.com). Abre ese enlace desde un computador o teléfono, crea una cuenta o inicia sesión; no necesitas mantener este computador encendido ni iniciar un túnel.

La versión pública se conecta a PostgreSQL en Neon. Para revisar su estado, abre [el chequeo de salud](https://fincontrol-i46e.onrender.com/api/health). Para consultar tablas, abre [Neon Console](https://console.neon.tech/) → proyecto `mi-primer-proyecto` → base `neondb` → **SQL Editor**.

Render puede suspender el servicio por inactividad en su plan gratuito, así que el primer acceso después de un tiempo puede tardar. Los datos siguen en Neon. Descarga copias periódicas desde la ruta protegida `/api/backup`; los pasos están en el [README](README.md#despliegue-y-respaldos).

Docker local sirve para desarrollo y pruebas aisladas. Sus datos SQLite no se comparten automáticamente con la versión pública.
