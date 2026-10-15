# 02 — Contrato visual: elementos aprobados e invariantes

Este documento **no autoriza ningún rediseño**. Registra estructura visible del `Dashboard(1).tsx`. Las capturas oficiales deben agregarse a `docs/referencias_visuales/` después de aprobación del usuario; no se incluye ninguna imagen inventada.

## Encabezado y orden

1. Encabezado superior pegajoso: logo, título contextual, `powered by analytics`, ubicación Argentina e indicador Ranking Mensual.
2. Pestañas analíticas del universo Gobernadores: **Ranking → Lectura → Evolutivo → Comparación**, iconos y estilo original. No moverlas a otro renglón/columna sin permiso.
3. Controles, donde corresponda: **Gobernadores / Gobiernos / Ambos**; redes **FB, IG, X/TW, TikTok** con sus colores; filtro región; selector de mes; **Exportar**.
4. Debajo, universos originales **Gobernadores, Dirigentes, Medios, Comparador**. Sus nombres, número y disposición solo cambian con aprobación expresa; categorías internas pueden ampliarse en filtros.
5. Selector visual: primera franja circular de fotografías de personas + `Todos`; segunda franja de escudos institucionales con sus etiquetas. Conservar scroll y estados de resaltado.

## Ranking original de Gobernadores

**Exactamente cinco columnas** en este orden y con sus nombres: **Seguidores, Penetración Padrón, Publicaciones, Engagement / Post, Impacto Padrón**. Cada tarjeta conserva icono, título/subtítulo, filas con ranking, miniatura circular, nombre, valor, barra proporcional, colores semáforo y tooltip de diferencia. Las cuentas elegidas se destacan; las restantes permanecen listadas atenuadas.

## Lectura

Conservar componentes de análisis narrativo, métricas por red, alertas, hitos, comparaciones individuales y entre seleccionados. No reemplazar por tarjetas resumen genéricas.

## Evolutivo

- Tipo **gráfico de líneas**, no barras. Ejes, rejilla, tooltips, leyenda y puntos activos.
- Fotografías o escudos al final de las líneas cuando corresponda; sin imagen usar indicador visual con iniciales, no eliminar la cuenta.
- Temporalidades: mensual/trimestral/semestral/anual. Períodos Desde/Hasta.
- Selector Métrica. Modo Clásico y Personalizado, selector de cuentas+red independientes y tonos estables por plataforma.
- Selector total/promedio mensual para métricas que proceden. Una sola referencia histórica horizontal opcional.
- Escala vertical no debe depender de series ocultas; ningún reemplazo por gráfico agregado.

## Comparación

Cinco columnas **independientemente configurables** por red y métrica, con lista, miniatura, valor y barra de cada una. No confundir con el Comparador transversal que aún es maqueta en el archivo auditado.

## Nuevas categorías

Conservar la misma jerarquía visual y los mismos patrones de selección. Una nueva entidad con datos **siempre debe aparecer como círculo con nombre**, incluso sin archivo de imagen (mostrar iniciales/monograma). Las nuevas métricas no autorizan introducir arbitrariamente una sexta tarjeta ni eliminar las cinco históricas: el diseño de las columnas aplicables debe aprobarse aparte.

## Protección y evidencia

**Antes y después**: mismas dimensiones de ventana, redes, categoría, período, selección, datos y zoom del navegador. Comparar capturas del encabezado, las cinco tarjetas, dos hileras de selección, Lectura, Evolutivo y Comparación; inspeccionar DOM/interacciones. Si una captura base no está disponible, decirlo en vez de inventarla.

**Criterio de aceptación:** cambios visuales **cero** en bloques protegidos salvo diferencias inevitables del contenido (nombre, valor, imagen de una nueva entidad) y modificaciones aprobadas.
