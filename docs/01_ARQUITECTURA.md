# 01 — Arquitectura y mapa de dependencias

## Alcance y referencia

Referencia auditada: archivo aportado `Dashboard(1).tsx` (1.672 líneas), SHA-256 `2bb9e8a211fa37dd81b4532bb5b4088f03a7f7376258c733effb954c74edc96b`. Se han consultado copias de referencia de `LecturaView.tsx` y `ComparacionView.tsx`; **las diferencias con otras ramas/versiones no se consideran verificadas**.

## Arquitectura actual, no propuesta

| Archivo / bloque | Papel | Dependencias |
|---|---|---|
| `src/components/Dashboard.tsx` | Orquestador principal, navegación, filtros, estadísticas y gráfico Evolutivo | `src/lib/data.ts`, `utils.ts`, `LecturaView`, `ComparacionView`, Recharts, Lucide |
| `ProgressBar` en Dashboard, aprox. líneas 22–56 | Fila de ranking con icono/imagen, valor, barra, tooltip | `GOBERNADORES_INFO`, props de ranking |
| `Dashboard`, aprox. 87–936 | Carga, filtros, selección, 5 tarjetas, vistas, exportación | `data.csv`, estados React, componentes |
| `EvolutivosView`, aprox. 972–1580 | Selección de series, temporalidades, métricas y gráfico LineChart | `DataRow`, `GOBERNADORES_INFO`, Recharts |
| `ProsumiaModulePreview`, aprox. 1587–1643 | Maquetas de Dirigentes, Medios, Comparador | No consume datos reales V4 |
| `RankingCard`, aprox. 1646–1663 | Tarjeta con título, subtítulo, ícono, contenido | Props |
| `getTrafficLightColor`, aprox. 1665–1668 | Semáforos por posición | Índice y longitud de ranking |
| `src/components/LecturaView.tsx` | Análisis textual y comparaciones de cuentas | `GOBERNADORES_INFO`, data seleccionada |
| `src/components/ComparacionView.tsx` | Cinco columnas configurables de red/métrica | `Dashboard` (imports de helpers), `DataRow` |
| `src/lib/data.ts` | Tipado, importación CSV, metadatos gubernamentales | Papa Parse |
| `public/data.csv` | Histórico de gobernadores/gobiernos | 9 columnas legacy |
| `public/mega_metricas.csv` (V4 propuesto) | Métricas de otras categorías | 9 columnas V4, lector nuevo |
| `public/` imágenes | Fotos, escudos, logo | catálogo de nombres/rutas |

## Flujos funcionales

**Gobernadores/Gobiernos:** `data.csv` → `fetchAndParseData` → estados `data`, `periodFilter`, `socialFilter`, `regionFilter`, `typeFilter`, `selectedGovs` → `stats` / `visibleGovernors` → selector circular y `RankingCard`/`ProgressBar` → `LecturaView` / `EvolutivosView` / `ComparacionView`.

**Nuevas entidades, estado actual del archivo auditado:** `universe != gobernadores` → `ProsumiaModulePreview` → maquetas SIN datos. **No existe en este archivo una conexión funcional al megaarchivo.**

**Evolutivo:** estados `metric`, `granularity`, `startPeriodId`, `endPeriodId`, `selectionMode`, `showHistorical`, `calculationMode`, `selectedSeries` → `availableSeries` → `activeSeries` → `groupedPeriods` → `chartData` / `historicalReference` → Recharts `LineChart`.

## Objetivo de ampliación (NO implementado en la referencia)

Adaptar lectura y modelo de entidades sin cambiar distribución visual. Las cuentas V4 deben producir nombres, círculos (fallback iniciales), selección, rankings, Lectura, Evolutivo y Comparación **con el mismo lenguaje visual**; reutilización de lógica/cálculos requiere interfaces comunes y adaptación explícita para métricas sin padrón. No asumir que simplemente importar `EntityModule` prueba equivalencia de vistas.

## Zonas de alto riesgo

- `GOBERNADORES_INFO` determina fotos, región, padrón y es usado también en Evolutivo. No aplicar `padron || 1` como padrón real.
- `ComparacionView` importa helpers desde `Dashboard`, por lo que extraer componentes exige revisar dependencias circulares.
- `ProsumiaModulePreview` tiene estados y elementos de diseño que NO consultan el CSV V4; una maqueta no equivale a una integración.
- `handleDownloadStandaloneHtml` en archivo auditado descarga CSV aunque su botón diga HTML: BUG DOCUMENTADO, no declararlo funcional.

**No se exige reestructurar todo el árbol** para cumplir este contrato. Los cambios deben ser incrementales.
