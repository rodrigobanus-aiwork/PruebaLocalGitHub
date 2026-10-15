# 09 — Mapa de estados, cálculos, fuentes y puntos de integración

**Referencia:** `Dashboard(1).tsx`; las ubicaciones y nombres se comprobaron en ese archivo, pero su funcionamiento en producción no está certificado. No usar este mapa para inferir que V4 ya fue desplegada.

## Estados de la pantalla principal

| Estado/variable | Responsabilidad | Consumidor principal | Riesgo de cambio |
|---|---|---|---|
| `data` | registros históricos cargados | las cuatro vistas funcionales | mezclar nuevos esquemas con DataRow sin adaptar |
| `loading` | fase de carga | estado de pantalla | ocultar errores de carga |
| `universe` | universo superior | render de Gobernadores/maquetas | sustituir árbol original accidentalmente |
| vista activa (`view`) | Ranking/Lectura/Evolutivo/Comparación | navegación del universo | perder vistas o sus estados |
| `selectedGovs` | selección por retrato/escudo | destaque, Lectura, Evolutivo | modificar semántica de Todos y selección |
| `socialFilter`/`socials` | redes activas | ranking, evolutivo, comparaciones | suma indebida entre redes |
| `typeFilter` | gobernador/gobierno/ambos | visibilidad y cálculos | confundir cuenta institucional con personal |
| `regionFilter` | filtro geográfico | cuentas visibles y valores | dejar datos de otras provincias |
| `periodFilter`/`availablePeriods` | mes de corte y calendario | ranking, comparación, evolutivo | mezclar `Periodo` y `Período` |
| `isExportModalOpen`, `isExporting`, `exportSuccess` | exportaciones | modal | éxito ficticio de HTML |

Los nombres concretos de estado pueden variar en futuras refactorizaciones. **El contrato es el comportamiento, no el identificador de variable.**

## Estados del Evolutivo

| Estado | Valores/función | Dependencia crítica |
|---|---|---|
| `metric` | selector de métrica | fórmulas y tooltip |
| `granularity` | mensual/trimestral/semestral/anual | agregación de stocks y flujos |
| `startPeriodId`, `endPeriodId` | intervalo temporal | serie y promedio histórico |
| `selectionMode` | clásico / personalizado | fuente de series activas |
| `selectedSeries` | combinaciones cuenta y red | selector personalizado |
| `seriesSearch`, `seriesPanelOpen` | búsqueda y expansión del panel | UI de series |
| `calculationMode` | total / promedio mensual | denominador y cobertura |
| `showHistorical` | línea horizontal | referencia válida/completa |
| `availableSeries`, `activeSeries` | catálogos derivados | series realmente dibujadas |
| `groupedPeriods`, `chartData`, `historicalReference` | resultados derivados | gráfico, ejes y leyenda |

## Grafo de dependencias — sistema histórico

```text
public/data.csv
  -> src/lib/data.ts [fetchAndParseData; DataRow]
  -> Dashboard.tsx [data, período, redes, región, tipo, selección]
     -> stats / ranking -> RankingCard -> ProgressBar
     -> LecturaView
     -> EvolutivosView [series, períodos, cálculo, LineChart]
     -> ComparacionView [cinco configuraciones independientes]

src/lib/data.ts [GOBERNADORES_INFO]
  -> nombres / imágenes / regiones / padrones
  -> retratos, escudos, rankings, lectura y evolución
```

## Grafo — nuevas entidades, estado real y meta

```text
[ESTADO DE LA REFERENCIA]
universe != gobernadores
  -> ProsumiaModulePreview (maqueta)
  -> botones/tarjetas SIN procesamiento real de mega_metricas.csv

[META A IMPLEMENTAR, no presuponer disponible]
public/mega_metricas.csv
  -> parser de esquema V4 + manejo explícito de errores
  -> normalización de categorías, cuentas, redes y métricas
  -> catálogo de entidades (foto opcional, iniciales de respaldo)
  -> estados de universo / categoría / cuenta / red / período
  -> adaptadores de medidas compatibles con vistas originales
  -> Ranking + Lectura + Evolutivo + Comparación
```

## Dependencias que NO se deben acoplar

1. **Identidad ≠ imagen.** La existencia de una entidad viene del CSV o un catálogo explícito, nunca de que haya imagen en `GOBERNADORES_INFO`.
2. **Categoría ≠ universo.** `Intendente` y `Municipio` son categorías fuente diferentes, aunque una futura pantalla las agrupe como `Dirigentes`.
3. **Serie ≠ nombre.** Clave de serie debe distinguir entidad, categoría, red e identidad cuando corresponda. Evitar colisiones de nombres homónimos.
4. **Datos ≠ visual.** El parser no debe definir colores, ni los componentes asignar ceros a valores ausentes.
5. **Métrica ≠ formato.** Stock, flujo, ratio y porcentaje tienen agregaciones diferentes y requieren unidad/denominador explícitos.
6. **Comparador transversal ≠ vista Comparación.** Contratos y alcances diferentes.

## Secuencia mínima para primera integración (solo referencia; no ejecución en esta entrega)

A. Validar CSV V4, sus categorías y métricas. B. Catalogar identidades sin pérdida y sin merges falsos. C. Mostrar círculos con iniciales y nombres, conectados a selección. D. Probar que el filtro restringe correctamente la fuente y que no desaparecen cuentas sin fotos. E. Reutilizar vistas progresivamente, con pruebas de no regresión de Gobernadores. F. Registrar el cambio en historial y capturas de referencia.
