# Instalar el contrato en Prosumia

Este ZIP contiene **exclusivamente archivos de documentación y una prueba de inspección de código**. No incluye ni cambia `Dashboard.tsx`, la aplicación React ni los datos.

1. Descomprimir el ZIP.
2. Incorporar `AGENTS.md` a **la raíz** del proyecto, al lado de `package.json`.
3. Incorporar la carpeta `docs/` a la raíz, respetando sus rutas.
4. Incorporar `tests/verificar_contrato_estatico.py` solo si se desea contar con un primer verificador estático opcional.
5. Revisar y aprobar el contrato; completar las capturas aprobadas en `docs/referencias_visuales/` y registrar la línea base (rama/commit, si corresponde).

**Importante:** este paquete NO modifica GitHub por sí mismo; el usuario decide si y cuándo añadirlo. Los archivos son Markdown ordinarios y legibles en cualquier editor o en GitHub.

`AGENTS.md` ofrece instrucciones persistentes a agentes compatibles, pero no todos lo leen automáticamente. Antes de cambios críticos, solicitar explícitamente que la IA lea `AGENTS.md` y el documento específico aplicable, y que confirme qué regresiones protegerá.

## Contenido adicional de la versión definitiva

- `docs/08_FICHAS_DE_COMPONENTES.md`: quince fichas por componente y estado visual.
- `docs/09_MAPA_ESTADOS_Y_DATOS.md`: estados, dependencias y conexión histórica/V4.
- `docs/10_PROCEDIMIENTO_DE_CAMBIOS.md`: protocolo de implementación, pruebas y entregas.
- `docs/PLANTILLA_CAMBIO.md`: formulario Markdown reutilizable por tarea.
- `docs/11_REFERENCIA_Y_DECISIONES_PENDIENTES.md`: evidencia y decisiones aún abiertas.

**No subir scripts temporales ni archivos de datos con este paquete.** Incorporar `AGENTS.md`, carpeta `docs` y, opcionalmente, `tests/verificar_contrato_estatico.py`. No subir `__pycache__`.

## Verificación realizada al crear el paquete

- Comprobados campos y distribución de `mega_metricas_con_ministros(1).csv` (8.503 filas), y variante `Periodo` del CSV histórico.
- Inspeccionado código `Dashboard(1).tsx` y componentes auxiliares de referencia.
- No se ha compilado React ni probado una aplicación en navegador en esta entrega: el trabajo es documental.
