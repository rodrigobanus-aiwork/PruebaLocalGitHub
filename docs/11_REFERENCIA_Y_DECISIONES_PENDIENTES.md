# 11 — Registro de evidencia y decisiones pendientes

## Fuentes y fiabilidad

| Insumo | Evidencia disponible | Uso permitido |
|---|---|---|
| `Dashboard(1).tsx` | 1.672 líneas; SHA-256 `2bb9e8a211fa37dd81b4532bb5b4088f03a7f7376258c733effb954c74edc96b` | referencia principal de elementos y ubicación |
| `LecturaView.tsx` (copia de referencia) | archivo revisado previamente | inventario funcional; verificar versión exacta si cambia |
| `ComparacionView.tsx` (copia de referencia) | archivo revisado previamente | inventario funcional; verificar versión exacta si cambia |
| `public/data.csv` | esquema histórico del paquete de referencia | catálogo de atributos; no reemplazar |
| megaarchivo V4 | referencia aportada de 8.503 registros y seis categorías | contrato de entrada; recuento no equivale a cuentas únicas |
| Capturas de pantallas compartidas en conversación | diferencias visibles de Gobernadores y maquetas | orientación visual; **todavía no forman un juego de baselines automatizados** |
| Estado actual de GitHub | **no consultado** | no atribuirle configuración ni archivos sin evidencia |

## Lista de decisiones que NO se pueden inferir

1. La versión **exacta** de producción aprobada frente a archivos históricos y experimentales: confirmar cuando se haga la primera modificación funcional.
2. Qué capturas son línea base visual definitiva, resolución, zoom, plataforma y estado de selección.
3. Qué indicadores sustituyen `Penetración Padrón` e `Impacto Padrón` para medios y organismos sin padrón.
4. Cómo se asignan nuevas categorías a universos visuales: preservar categoría original de datos en cualquier agrupación de UI.
5. Qué equivalencias de `TT` y `TK` y alias nominales están respaldadas por la procedencia de cada archivo: **no fusionar por heurística**.
6. Qué métricas se consideran `Reacciones`, `Interacciones` o `Engagement` entre redes: confirmar definiciones.
7. Si la exportación HTML será una funcionalidad futura o se ajustará el nombre del botón actual.
8. Disponibilidad de fotos/logos de nuevas cuentas; siempre usar iniciales y mostrar nombre en su ausencia.

## Política sobre pendientes

Estas decisiones **no bloquean la instalación del contrato documental**, pero sí bloquean afirmar que una integración V4 cumple completamente su funcionalidad. Resolverlas **solo cuando afecten al cambio solicitado**, evitando preguntar todo otra vez. Anotar las respuestas nuevas aquí y actualizar las fichas pertinentes.

## Prioridad inmediata tras incorporar los documentos

**CAM-V4-001 — Catálogo y selector de entidades nuevas:** leer megaarchivo, normalizar solo identidades justificadas y mostrar círculos con nombre/iniciales; mantener íntegra la rama de Gobernadores. No asumir que ello completa automáticamente Ranking, Lectura, Evolutivo o Comparación. Registrar comprobaciones antes de avanzar a CAM-V4-002.
