# Abrir FinControl desde Internet (Mac y teléfono)

Esta guía publica temporalmente tu aplicación local mediante un túnel de Cloudflare. No hace falta abrir puertos del router. El enlace funciona mientras el Mac, FinControl y el túnel permanezcan encendidos.

## 1. Instalar Cloudflare Tunnel (una sola vez)

En el Mac, abre **Terminal** y ejecuta:

```bash
brew install cloudflared
```

Si aparece `command not found: brew`, instala Homebrew desde [brew.sh](https://brew.sh/) y después vuelve a ejecutar el comando.

## 2. Iniciar FinControl

Abre una primera ventana de Terminal y ejecuta estos comandos desde la carpeta del proyecto:

```bash
cd "/Users/edwin/Desktop/ING sof/app/pagina"
npm start
```

Si el proyecto está en otra carpeta, reemplaza la ruta por la ubicación real. Deja esta ventana abierta. FinControl debe mostrar que está disponible en el puerto 3000.

## 3. Crear el enlace público temporal

Abre una segunda ventana de Terminal y ejecuta:

```bash
cloudflared tunnel --url http://localhost:3000
```

Espera a que aparezca un enlace parecido a `https://nombre-aleatorio.trycloudflare.com`. Ese es el enlace que debes abrir en el teléfono. No cierres esta segunda ventana.

## 4. Probarlo en el teléfono

Abre el enlace `https://...trycloudflare.com` en Safari o Chrome. Para confirmar que funciona fuera de tu red local, apaga el Wi-Fi del teléfono y usa datos móviles. Puedes crear tu cuenta o iniciar sesión como de costumbre.

## Al terminar

- Para cerrar el acceso público, presiona **Control + C** en la ventana donde corre `cloudflared`.
- Para detener FinControl, presiona **Control + C** en la primera ventana.
- La próxima vez tendrás que iniciar ambos procesos otra vez. Cloudflare Quick Tunnel puede generar un enlace distinto en cada inicio.

## Dónde quedan los datos

Los datos se guardan en `data/fincontrol.sqlite` en el Mac que está ejecutando el servidor. El túnel solo permite acceder a esa aplicación; no copia la base de datos al repositorio ni al teléfono. No borres ese archivo si quieres conservar las cuentas y movimientos. Haz copias de seguridad periódicas.

## Seguridad y disponibilidad

Mientras el túnel está activo, cualquier persona que tenga el enlace puede llegar a la pantalla de acceso. Comparte el enlace solo con personas de confianza y usa contraseñas únicas. El Mac debe estar encendido, conectado a Internet y sin suspensión. Este método es temporal; para tener un enlace permanente que funcione aunque el Mac esté apagado, hay que desplegar la aplicación en un servicio de hosting y configurar almacenamiento persistente para la base de datos.
