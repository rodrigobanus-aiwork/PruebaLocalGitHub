# 03 — Inventario de controles y contrato funcional

Fuente primaria `Dashboard(1).tsx`. Estados: **implementado en la fuente**, **maqueta** o **pendiente de verificación**. `Implementado` no equivale a prueba de navegador pasada.

| Control/objeto | Estado en la referencia | Contrato invariante |
|---|---|---|
| Ranking/Lectura/Evolutivo/Comparación en encabezado | Implementado para Gobernadores | Cambiar vista sin alterar filtros ni perder el resto |
| Gobernadores / Gobiernos / Ambos | Implementado | Distinguir tipo de cuenta y aplicar filtros en Ranking/Comparación |
| Botones FB, IG, X, TikTok | Implementado | Conservar color, icono y lógica de selección; evolutivo admite múltiples redes |
| Región Centro/Cuyo/NEA/NOA/Patagonia/Todas | Implementado | Aplicar filtro sin inventar regiones |
| Selector de período | Implementado | Utilizar períodos válidos de los datos disponibles |
| Exportar y modal | Implementado parcialmente | Abrir/cerrar y exportar CSV; opción HTML debe corregirse antes de anunciarse funcional |
| Fotografías + `Todos` | Implementado | Selección múltiple, deselección, destaque visual, tooltip de nombre |
| Escudos institucionales | Implementado | Seleccionables, agrupados en segunda franja |
| 5 tarjetas de ranking | Implementado | Orden descendente, miniatura, tooltip, valores y semáforo |
| Lectura por cuenta | Implementado en componente externo de referencia | Texto, hitos, alertas y comparación de seleccionados |
| Evolutivo: métricas, granularidad, Desde/Hasta | Implementado | Mantener selecciones y recalcular según métrica |
| Evolutivo: Clásico / Personalizado | Implementado | Clásico usa círculos+redes; personalizado usa cuenta+red |
| Evolutivo: buscar, marcar, quitar y limpiar series | Implementado | Serie por cuenta y red, sin incluir no seleccionados en el eje |
| Evolutivo: cálculo total/promedio y línea histórica | Implementado parcialmente | Revisar cobertura, denominador y períodos completos, sin alterar visual |
| Comparación de cinco columnas independientes | Implementado en componente externo de referencia | Selección de red y métrica por columna |
| Dirigentes y Medios | Maqueta | Los controles visuales actuales NO procesan métricas nuevas |
| Comparador transversal | Maqueta | No afirmar que efectúa comparación real |
| Selector de entidades V4 con fallback iniciales | Pendiente de integrar | Círculo+nombre siempre visible cuando existe cuenta |
| Filtros V4 por categoría/territorio/red/mes | Pendiente de integrar | Datos solo de la combinación solicitada; no categorías vacías por defecto |
| Importación de archivo local | Función presente, UI por confirmar | No afirmarla visible sin ubicar control conectado |

## Reglas de interacción

- `seleccionar` debe cambiar resultados de *todas* las vistas para las que el selector controla cuentas; no solo el color del botón.
- `Todos` limpia selección, no borra los datos.
- Sin cuentas seleccionadas, conservar semántica original de la vista Clásica.
- Cambiar categoría no debe heredar cuentas inválidas ni dejar filtros incompatibles silenciosamente.
- Si falta una métrica: mostrar `Sin datos`, ofrecer otras métricas disponibles. **Nunca dibujar valores ficticios**.
- La comparación entre redes no suma seguidores de plataformas distintas como si pertenecieran a una sola cuenta, salvo métrica agregada expresamente definida.
- Distinguir `Comparación` (vista del universo) de `Comparador` (universos distintos).

## Definición de terminado

Un botón está **terminado** cuando: (a) aparece como se aprobó; (b) responde a interacción; (c) cambia datos/selección correctamente; (d) estados vacíos/casos límite se prueban; (e) no altera otras vistas.
