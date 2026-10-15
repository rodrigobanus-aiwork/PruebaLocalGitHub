# 08 — Fichas detalladas de componentes y contratos de interfaz

**Estado de la referencia:** inventario de `Dashboard(1).tsx` (1.672 líneas) y componentes `LecturaView.tsx` y `ComparacionView.tsx` de referencia; ninguna ficha constituye una prueba de navegador. **Inmutabilidad por defecto:** no alterar JSX, clases Tailwind, estructura de DOM, posiciones, colores, orden, lógica ni props de bloques protegidos para conectar V4. Los rangos de líneas son orientativos para **la referencia histórica**, no para cualquier nueva versión.

## UI-001 — Encabezado institucional y navegación

- **Archivo:** `src/components/Dashboard.tsx`; referencia aproximada: líneas 340–386.
- **Inventario:** logo, nombre del tablero contextual, leyenda institucional, referencia territorial y periodicidad; cuatro acciones `Ranking`, `Lectura`, `Evolutivo`, `Comparación`.
- **Entradas/estados:** `universe`, vista activa del universo y filtros pertinentes.
- **Invariantes:** orden, estilos, alineación, tipografía, botones activos e interacción existentes en Gobernadores.
- **Condiciones:** cambiar de vista no elimina selecciones ni rehace otros controles; no confundir la vista `Comparación` con el universo `Comparador`.
- **Validación:** captura de referencia con misma resolución y estado; navegar por cuatro vistas; restaurar Ranking.
- **Límite identificado:** otros universos son maquetas con navegación distinta; no usar su aspecto como referencia aprobada.

## UI-002 — Selector de tipo de cuenta

- **Archivo:** `Dashboard.tsx`; referencia aprox. 389–495.
- **Elementos:** `Gobernadores`, `Gobiernos`, `Ambos`.
- **Estado:** `typeFilter` (o equivalente en versión concreta).
- **Invariantes:** tres opciones diferenciadas, presentación original, selección compatible con catálogo y padrones verificables.
- **Pruebas:** cambiar cada opción; confirmar inclusión/exclusión de cuentas y mantenimiento de métricas correspondientes; volver a Ambas.

## UI-003 — Selección de plataformas

- **Elementos:** Facebook, Instagram, X y TikTok; evolución permite selección múltiple donde el original lo permite.
- **Estado:** `socialFilter`/`socials` y estados del Evolutivo.
- **Invariantes:** etiquetas, colores, orden, estados activos y ausencia de mezclas silenciosas entre plataformas. `YT` aparece en ciertas fuentes/series, pero su disponibilidad en cada control debe verificarse antes de habilitarla.
- **Pruebas:** cambiar individualmente plataformas, combinarlas en Evolutivo y comprobar que valores pertenezcan a la plataforma solicitada.

## UI-004 — Región y período

- **Elementos:** filtro de región (`Todas/Todo`, Centro, Cuyo, NEA, NOA, Patagonia según control) y períodos disponibles.
- **Estados:** `regionFilter`, `periodFilter`, `availablePeriods`.
- **Invariantes:** no perder listas originales ni renombrar regiones sin respaldo. Los períodos provienen de los datos y deben mantener orden cronológico, no alfabético.
- **Pruebas:** elegir una región, verificar provincia incluida/excluida; elegir períodos distantes y volver al predeterminado.

## UI-005 — Selector circular de gobernadores

- **Archivo:** `Dashboard.tsx`; referencia 520–577.
- **Elementos:** botón `Todos`, fila horizontal desplazable, círculos de retratos, nombres/etiquetas flotantes, selección múltiple, contraste/atenuación de no seleccionados.
- **Estados:** `selectedGovs`, cuenta disponible, `GOBERNADORES_INFO` para metadatos visuales.
- **Invariantes:** mismo tamaño de retrato, posición, orden y estilo; `Todos` restablece selección. No cambiar nombres canónicos por títulos inventados.
- **Pruebas:** una cuenta, varias, deselección, `Todos`, selección persistente al cambiar a Evolutivo cuando corresponde.

## UI-006 — Selector institucional de escudos

- **Archivo:** `Dashboard.tsx`; referencia 579–631.
- **Elementos:** segunda fila independiente de escudos, nombre de provincia, estados seleccionados, scroll horizontal.
- **Invariantes:** no fusionar filas gobernador/gobierno ni sustituir escudos por avatares genéricos cuando las imágenes existen.
- **Pruebas:** alternar Gobernadores/Gobiernos/Ambos; seleccionar escudos; comprobar que estadísticas corresponden a cuentas institucionales.

## UI-007 — Ranking de cinco columnas

- **Archivo:** `Dashboard.tsx`; referencia 644–761; componentes `RankingCard`, `ProgressBar`.
- **Columnas y orden aprobado:** Seguidores; Penetración Padrón; Publicaciones; Engagement/Post; Impacto Padrón.
- **Contenido obligatorio por tarjeta:** icono, título, subtítulo, lista de posiciones, nombre, miniatura/escudo, cifra formateada, barra proporcional, color semáforo, tooltip de diferencias, destaque/atenuación de seleccionados.
- **Entradas:** registros del período y plataforma, catálogo de cuentas, valor máximo, posición y padrones; **un dato ausente no equivale a cero**.
- **Invariantes:** exactamente cinco columnas en universo Gobernadores; sin recolocar tarjetas ni modificar semáforos; el destaque de seleccionados no debe necesariamente ocultar otras cuentas.
- **Pruebas:** número y orden de tarjetas; top por indicador contra datos; tooltip visible; 1 y 3 cuentas elegidas; scroll en viewport de referencia.
- **Otras categorías:** reutilizar el patrón, pero jamás crear porcentajes sobre padrón donde falta denominador; definir indicadores apropiados por categoría en un cambio separado.

## UI-008 — Lectura

- **Archivo:** `LecturaView.tsx`; implementación observada en copia de referencia, no certificada contra publicación actual.
- **Bloques:** estado vacío, encabezado con imagen/entidad, contexto provincial, indicadores por plataforma, narrativas de alcance/actividad, evolución y alertas, hitos, comparación de cuentas cuando hay selección múltiple.
- **Entradas:** cuentas seleccionadas, datos filtrados, período/red pertinentes y catálogo de identidades.
- **Invariantes:** estructura, orden y estilos de las secciones existentes; textos calculados con valores reales; sin inventar atributos ausentes.
- **Pruebas:** sin selección, una cuenta, varias cuentas, métrica ausente, textos y valores coincidentes con registros.

## UI-009 — Evolutivo: barra de controles

- **Archivo:** `Dashboard.tsx`, `EvolutivosView`, aprox. 1376–1472.
- **Elementos:** título, temporalidad mensual/trimestral/semestral/anual, `Desde`, `Hasta`, métrica, `Clásico`, `Personalizado`, total/promedio mensual donde corresponda y checkbox de referencia histórica horizontal.
- **Estados:** `metric`, `granularity`, `startPeriodId`, `endPeriodId`, `selectionMode`, `calculationMode`, `showHistorical`.
- **Invariantes:** mismo orden, localización y denominaciones; cambiar granularidad agrega medidas correctas y no cambia el tipo de gráfico.
- **Pruebas:** combinaciones de temporalidades; rango desde/hasta; métrica sin datos; total/promedio; línea histórica solo cuando hay cobertura suficiente.

## UI-010 — Evolutivo: selector personalizado

- **Archivo:** `Dashboard.tsx`; aprox. 1473–1508.
- **Elementos:** cantidad de series, botones `Limpiar`, `Elegir cuentas y redes`/`Cerrar selector`, fichas removibles, búsqueda y casillas cuenta×red; muestra de color por serie.
- **Estados:** `selectedSeries`, `seriesSearch`, `seriesPanelOpen`, `activeSeries`, `availableSeries`.
- **Invariantes:** selección granular por cuenta y red; series no seleccionadas no aparecen; `Limpiar` no borra registros ni afecta el histórico.
- **Pruebas:** seleccionar dos redes de una cuenta y una red de otra, quitar una, limpiar, buscar sin coincidencias.

## UI-011 — Evolutivo: gráfico y marcas

- **Archivo:** `Dashboard.tsx`; aprox. 1511–1578; motor `Recharts LineChart`.
- **Elementos:** líneas individuales por cuenta×red, colores de plataforma, puntos, ejes, cuadrícula, tooltip, leyenda, fotografías/escudos al final de las series y `ReferenceLine` histórica opcional.
- **Entradas:** `displayedChartData`, `activeSeries`, `metric`, `historicalReference` y catálogo de imágenes.
- **Invariantes:** **nunca** reemplazar por barras agregadas; la imagen al extremo no es decorativa y no puede desaparecer; no cambiar colores ni escalas con datos inventados.
- **Pruebas:** 1/3/muchas series, capturas con mismas dimensiones y filtros, ausencia de series espurias, etiquetas e imagen/fallback correctos.
- **Incidencia conocida:** en la referencia algunos cálculos filtran series sin Fans aunque posean otros valores; documentado para corrección futura independiente.

## UI-012 — Comparación de cinco columnas

- **Archivo:** `ComparacionView.tsx` (referencia externa al Dashboard).
- **Elementos:** cinco tarjetas, cada una con selectores independientes de red y métrica, ranking, icono, cifras, barras y miniaturas.
- **Invariantes:** una configuración no altera las otras; los resultados dependen de la red y métrica de cada columna.
- **Pruebas:** cambiar solo columna 2; comprobar columnas 1,3,4,5 estables; cambiar 3 métricas; verificar top con CSV.

## UI-013 — Exportación

- **Archivo:** `Dashboard.tsx`; aprox. 799–933.
- **Elementos:** botón `Exportar`, modal, cerrar, descarga CSV, descarga etiquetada HTML, feedback de ejecución.
- **Invariantes:** no prometer exportación HTML real si descarga un CSV. La corrección del bug será un pedido distinto y debe verificarse abriendo el artefacto.
- **Pruebas:** modal abre/cierra; archivo descargado tiene formato y datos que indica su etiqueta; comportamiento ante errores.

## UI-014 — Universos y maquetas

- **Archivo:** `Dashboard.tsx`, `ProsumiaModulePreview`, aprox. 1587–1643.
- **Universos:** Gobernadores, Dirigentes, Medios, Comparador; son navegación de nivel superior y distintos de pestañas analíticas.
- **Estado histórico:** Gobernadores implementado; los tres restantes usan maqueta y no leen automáticamente V4.
- **Invariantes:** no confundir botón navegable con módulo terminado. La evolución funcional debe reemplazar progresivamente la maqueta **solo** en la sección intervenida; nunca reemplazar el árbol aprobado de Gobernadores.
- **Pruebas:** cada universo conserva el selector superior; los módulos conectados deben cargar datos antes de declararse terminados.

## UI-015 — Nuevas categorías y avatares sin fotografía (pendiente)

- **Fuentes:** `mega_metricas.csv` (si se incorpora), catálogo normalizado con claves `Categoría+Entidad+Red` según caso, sin fusionar identidades solo por similitud.
- **Elementos exigidos:** todos los nombres de cuentas reales con **círculo seleccionable** y foto/logo cuando exista; en otro caso iniciales tipográficas dentro del mismo círculo, con nombre accesible y visible.
- **Entradas:** categoría original, red, período, entidad disponible; imágenes opcionales.
- **Pruebas de aceptación:** recuento de nombres generado desde la fuente coincide con catálogo tras normalización justificada; ninguna entidad desaparece por imagen faltante; selección altera efectivamente las vistas; no hay placeholders `Maqueta · Sin datos cargados` cuando sí existen métricas procesables.
- **No se afirma implementado.** Debe ejecutarse como primera tarea funcional posterior a este contrato.

## Requisito transversal: accesibilidad y estados

- Los elementos accionables deben seguir siendo botones/selectores reales con nombres legibles. Las imágenes deben tener alternativa textual.
- Diferenciar estado **sin registros para filtro**, **métrica no disponible**, **dato nulo**, **cargando** y **error de carga**.
- Una falla de red no debe convertirse en ranking de ceros ni esconderse como tabla vacía.
- Los controles de filtrado deben respetar la semántica de su vista (selección vs. destaque). Toda desviación exige ficha de cambio explícita.
