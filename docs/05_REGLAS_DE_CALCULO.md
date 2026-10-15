# 05 — Contrato de cálculos y agregaciones

## Indicadores originales (Gobernadores/Gobiernos)

| Indicador | Definición del código auditado | Requisito |
|---|---|---|
| Seguidores | `Fans` del mes | **Stock**, no sumar meses |
| Penetración Padrón (%) | `Fans / padrón × 100` | Solo con padrón válido, positivo y correspondiente |
| Publicaciones | Número de publicaciones del mes | **Flujo**, sumar meses cuando se agregue período |
| Engagement / Post | `Reacciones / Publicaciones` | No calcular si publicaciones es cero o falta dato |
| Impacto Padrón (%) | `Reacciones / padrón × 100` | No calcular sin padrón válido |

## Ampliaciones futuras

- **Comentarios, Reacciones, Interacciones, Publicaciones, Visualizaciones:** métricas de flujo; sumar mensualidades completas para totales de período cuando los datos y la definición de fuente lo permitan.
- **Seguidores (Fans):** stock al cierre del período, no suma de los meses. `crecimiento_absoluto = Fans_fin - Fans_inicio`, solo cuando existen dos cortes comparables de la misma cuenta+red.
- **Crecimiento seguidores** si viene precalculado: distinguir de crecimiento calculado; no sumarlo ni mezclarlo hasta verificar su definición y posible equivalencia.
- **Engagement / Post:** cociente de sumas `suma(Reacciones) / suma(Publicaciones)`; no media simple de ratios mensuales sin justificación.
- **Promedio mensual:** dividir el total por meses **válidos y comparables**; especificar denominador y excluir/mostrar cobertura insuficiente.
- **Promedio histórico:** exigir trimestres calendarios de 3 meses o años de 12 meses cuando ese sea el criterio aprobado; comparar métricas homogéneas; pesos por cuenta+red acordados. No exigir `Fans` para calcular `Publicaciones` o `Reacciones`.

## Ausencia, ceros y cobertura

- Valor **ausente** = no se observó registro; valor **cero** = hubo registro explícito `Valor=0`.
- Prohibido hacer `dato || 0` para métricas ausentes y luego presentarlas como valores medidos.
- Si una entidad solo tiene Reacciones, debe mostrarse en Reacciones aunque no tenga Fans.
- No mostrar divisiones por padrón usando un valor ficticio de fallback (`padron || 1`, `1000000`, etc.).
- No calcular un cociente de métricas de distintos períodos ni redes.
- Para comparaciones inter-plataforma, indicar definiciones no equivalentes (p. ej. `Visualizaciones`).
- Al incorporar V4 no cambiar inadvertidamente el cálculo ya aprobado de Gobernadores; cualquier corrección se solicita y valida aparte.

## Ejemplos de pruebas aritméticas

- Fans septiembre 120.000, octubre 125.500 ⇒ crecimiento absoluto +5.500; no +245.500.
- Reacciones 850, publicaciones 10 ⇒ Engagement / Post 85,0.
- Publicaciones mensual 10, 20, 30 ⇒ total trimestral 60 y promedio mensual 20 (solo si están los tres meses).
- Si falta el mes central, no declarar un trimestre completo ni imputar cero.
- Si faltan Fans pero hay Reacciones y Publicaciones, sí se puede calcular Engagement / Post.

## Pendiente de validación

Las fórmulas históricas implementadas en `Dashboard(1).tsx` no se consideran plenamente validadas solo por existir. En el archivo auditado la referencia histórica exige `Fans` para métricas ajenas y `chartData` omite series si los seguidores son 0/no disponibles. Corregir en una tarea específica, con pruebas antes/después y sin alterar el diseño del gráfico.
