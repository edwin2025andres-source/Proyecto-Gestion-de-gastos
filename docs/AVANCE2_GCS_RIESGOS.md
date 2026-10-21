# Avance 2 — GCS, riesgos y estado del prototipo

## Estado funcional

El README describe FinControl como una aplicación web responsive basada en HU001–HU010. Incluye registro/inicio de sesión, categorías, movimientos, presupuestos mensuales, alertas al 80 % y 100 %, reportes, exportación PDF/Excel y metas de ahorro. El servidor/API está en server.js; la interfaz, en public/; la base local SQLite se crea al iniciar.

El porcentaje real de avance debe confirmarse frente a los criterios de aceptación y una demostración. La lista de funciones del README, por sí sola, no acredita que cada historia haya sido probada. Los pendientes del corte 1 deben identificarse en GitHub Projects y asociarse a issues/PRs antes de declararlos corregidos.

## Gestión de configuración (GCS / SCM)

### Elementos bajo control

- Código: server.js y public/.
- Dependencias: package.json y package-lock.json; mantenerlos sincronizados.
- Configuración: .env.example con nombres y valores ficticios; los secretos reales quedan fuera de Git.
- Datos: data/fincontrol.sqlite es una base local de ejecución; respaldar antes de migraciones y excluir datos personales del repositorio.
- Documentación: README y Wiki describen instalación, configuración, decisiones y cambios relevantes.

### Flujo propuesto

1. Abrir un issue por cambio y crear una rama feature/, fix/ o docs/ desde main.
2. Hacer cambios pequeños, vincularlos al issue y revisar el diff para excluir secretos, datos y archivos temporales.
3. Validar instalación y aceptación de las funciones afectadas; documentar los pasos y resultados en el PR.
4. Integrar a main después de revisión y mantener Projects actualizado con el estado real.
5. Registrar el commit que corresponde a la entrega. Para revertir, preferir un commit correctivo o git revert.

## Riesgos y controles

| Riesgo | Prioridad | Control propuesto |
|---|---|---|
| Secreto JWT débil o expuesto | Alta | Variable de entorno, valor aleatorio fuerte, exclusión de .env y rotación si se filtra. |
| Acceso a datos de otra cuenta | Alta | Autorizar cada consulta y modificación; probar con dos usuarios independientes. |
| Pérdida/corrupción de SQLite | Alta | Copias antes de migrar y prueba de restauración. |
| Exposición remota sin HTTPS | Alta | Limitar túneles a demostraciones, no usar datos reales y cerrar el acceso al terminar. |
| Errores de presupuesto/alertas | Alta | Aceptación para 80 %, 100 %, sobrepaso, cambio de mes y redondeo. |
| Dependencias vulnerables/incompatibles | Media | Revisar lockfile, cambios de versión e instalación limpia. |
| Exportación incompleta | Media | Comparar PDF/Excel con filtros, periodo y movimientos seleccionados. |

La evaluación de probabilidad e impacto es cualitativa; el equipo debe revisarla con sus escenarios reales.

## Seguridad y demostración

El README indica que cada usuario debe consultar y modificar sus propios datos, que las contraseñas se guardan con hash, y que producción requiere HTTPS y un secreto JWT fuerte. Para la exposición usar datos ficticios. Recorrido: iniciar sesión, crear movimiento, definir presupuesto, observar alerta, consultar reporte y exportar. Registrar commit, resultado esperado y resultado observado.

## Pendientes de cierre

- Contrastar esta versión con issues del corte 1; no se asume que un issue esté corregido sin evidencia.
- Ejecutar aceptación por HU y adjuntar capturas del prototipo en ejecución.
- Confirmar que la instalación y el arranque funcionan desde cero.
- Actualizar Projects solo después de comprobar cada tarea.

## Fuentes

- [Repositorio FinControl](https://github.com/edwin2025andres-source/Proyecto-Gestion-de-gastos) (README y estructura visible).
- Rúbrica “Avance 2 Proyecto de Curso” suministrada para esta entrega.
