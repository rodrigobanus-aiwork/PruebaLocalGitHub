# 10 — Procedimiento obligatorio de intervención y entrega

Este documento define un **protocolo repetible de meses**, no un cambio al código actual. Es válido para humanos, IA y tareas locales. **No concede permisos para GitHub**, despliegues o cambios ajenos al pedido.

## A. Abrir una tarea

Completar `docs/PLANTILLA_CAMBIO.md` antes de editar: objetivo, base aprobada, componentes tocados, componentes intocables, datos, riesgos, pruebas, criterios de aceptación, permisos y entregables. Si la base de código no es identificable, detener y solicitarla; nunca reemplazarla por un prototipo propio.

## B. Preparar una línea base reproducible

- Registrar archivo base o referencia de versión y SHA-256, fecha, dependencias.
- Capturar pantalla original en estados aprobados **con** navegador, viewport, zoom, período, red, selección y datos.
- Si las capturas aprobadas no están disponibles, marcar **SIN BASE VISUAL**; no afirmar equivalencia.
- Correr controles existentes y conservar sus resultados previos; distinguir errores previos de regresiones nuevas.

## C. Planificar el cambio más pequeño

- Separar datos, modelo/cálculos y presentación; no reescribir todo para intervenir un filtro.
- Proteger firmas de componentes y relaciones `props`/estado.
- Crear un adaptador de datos si el esquema nuevo difiere; no alterar `public/data.csv` para adaptarlo a V4.
- Revisar denominadores, faltantes, platafomas y temporalidades antes de mapear métricas.
- Si cambian visualizaciones protegidas, requerir aprobación expresa del objeto concreto.

## D. Verificar en cuatro niveles

| Nivel | Herramienta posible | Qué demuestra | Qué NO demuestra |
|---|---|---|---|
| D1 estructura | inspección/lector CSV | archivos, columnas, cobertura | cálculo correcto |
| D2 cálculos | pruebas unitarias | agregaciones y filtros con casos controlados | comportamiento UI |
| D3 compilación | build Vite/TypeScript | dependencias y sintaxis resolubles | interacción o estética |
| D4 aplicación | navegador/Playwright + capturas | flujos y aspecto comparados | ausencia absoluta de bugs |

**No marcar D4 como aprobado por haber ejecutado D1 o D3.** Regresión visual requiere una **referencia aprobada**; una captura experimental no lo es.

## E. Política de entrega y versionado

- Entregar un archivo/paquete autoconsistente: verificar imports, fuentes, assets y que ningún CSV anterior desaparezca.
- Detallar archivos añadidos/cambiados, razón y pruebas ejecutadas, con resultados y limitaciones.
- Si no se pudo ejecutar D3/D4: *entrega pendiente de compilación/prueba visual*, no *100 % funcional*.
- Preservar copia de la base, sin reescribir archivos fuera de alcance.
- Actualizar especificaciones de controles nuevos, pruebas nuevas e historial; versión del contrato por cada cambio aprobado.
- No modificar ni siquiera consultar GitHub desde el asistente sin autorización explícita de la operación solicitada.

## F. Definición de terminado

La tarea se considera **aceptable para aprobación** solo cuando cumple criterios funcionales, no muestra nuevas regresiones en vistas protegidas, pruebas pertinentes registradas y documentación actualizada. Cuando falta una prueba crítica, describirla y dejar la tarea como **pendiente de validación**, no declararla terminada.

## G. Plantilla del informe al usuario

> **Base de trabajo:** [versión y archivo/hash].
> **Se solicitó:** [cambio exacto].
> **Se modificó:** [archivos y bloques, no generalidades].
> **Se preservó:** [vistas y controles].
> **Datos:** [orígenes, cobertura y ausencias].
> **Pruebas:** [D1–D4, aprobadas/fallidas/no ejecutadas y evidencia].
> **Pendientes:** [bugs preexistentes y validaciones].
> **Instalación:** [ubicación exacta de nuevos archivos]; no publicar por defecto.
