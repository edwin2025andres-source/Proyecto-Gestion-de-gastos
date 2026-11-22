# Pruebas de FinControl

## Ejecutar

Requisitos: Node.js 22.5 o posterior y dependencias instaladas con `npm ci`.

```sh
npm test
```

La suite inicia una instancia aislada del servidor y crea SQLite dentro de una carpeta temporal del sistema. No lee ni modifica la base local `data/fincontrol.sqlite`, Neon o cuentas reales. Al cerrar el servidor elimina la base de prueba.

## Casos automatizados

| Área | Verificación |
|---|---|
| Salud | La API responde y reporta la base SQLite temporal activa. |
| Registro | Rechaza campos inválidos, crea usuario y categorías iniciales, normaliza correo y evita duplicados. |
| Inicio de sesión | Permite clave correcta y rechaza clave incorrecta. |
| Autorización | Las rutas de metas rechazan solicitudes sin JWT. |
| Metas | Rechaza objetivo cero y crea/lista una meta válida. |
| Presupuestos y avisos | Al registrar gastos que superan 80 % y 100 %, genera ambos avisos. |
| Respaldos | Niega una clave incorrecta y entrega SQLite con el token de prueba correcto. |
| Interfaz | La ruta principal entrega la página FinControl. |

## Comprobación manual en el sitio publicado

1. Abre [FinControl](https://fincontrol-i46e.onrender.com) y registra una cuenta nueva.
2. Cierra sesión e inicia con el correo y contraseña que acabas de crear.
3. En **Metas**, crea una meta con monto y fecha límite; confirma que aparece en el listado.
4. En **Presupuestos**, define un límite para una categoría de gasto. Registra movimientos hasta superar 80 % y luego 100 %.
5. Comprueba que la campana muestra el aviso emergente y permite marcarlo como leído.
6. Abre `/api/health`; debe responder `status: ok` y `PostgreSQL conectada`.

La comprobación manual usa la base real de la cuenta con la que se inicia sesión; crea los datos de prueba en esa cuenta y elimínalos desde la interfaz si ya no se necesitan.
