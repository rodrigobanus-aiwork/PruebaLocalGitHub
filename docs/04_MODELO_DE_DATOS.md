# 04 — Contrato de datos y normalización

## Fuentes existentes

### Base histórica: `public/data.csv`

Separador `;`, formato LONG, **nueve columnas exactas**:

```text
año;Período;mes_n;RRSS;Gobernador;Atributo;Valor;Provincia;tipo
```

La cabecera original local inspeccionada utiliza `Periodo` (sin tilde), mientras el contrato TypeScript contempla `Período` y el parser admite `Periodo`; ambos encabezados son válidos. No renombrar sin comprobar compatibilidad.

`Gobernador` es el nombre de campo heredado; no significa que todas las futuras entidades sean gobernadores. Tipos históricos: `Gobernador`, `Gobierno`. Esta base se conserva y NO se sobreescribe con V4 por defecto.

### Megaarchivo V4: `mega_metricas_con_ministros(1).csv`

Separador `;`, formato LONG, **nueve columnas exactas**:

```text
Año;Mes;Mes_num;Red;Entidad;Métrica;Valor;Provincia;Categoría
```

**Inventario verificado del archivo recibido:** 8.503 registros. Categorías exactas:

| Categoría | Registros |
|---|---:|
| Detractor | 3.208 |
| Municipio | 2.268 |
| Intendente | 1.722 |
| Ministro provincial | 618 |
| Figuras nacionales | 540 |
| Ministerio provincial | 147 |
| **Total** | **8.503** |

**Redes tal como llegan:** `FB`, `IG`, `TT`, `TK`, `X`, `YT`. Su equivalencia se debe definir y auditar (en particular `TT` y `TK`, no adivinar). No confundir códigos con los valores históricos `TW` y `TIK TOK`.

**Métricas tal como llegan:** `Publicaciones`, `Fans`, `Comentarios`, `Reacciones`, `Crecimiento seguidores`, `Crecimiento de seguidores`, `Interacciones`, `Visualizaciones`. Unificar las dos denominaciones de crecimiento solo si representan igual definición y unidad.

## Modelo lógico recomendado (sin exigir nuevas columnas al usuario)

Una observación analítica incluye `fecha_mes`, `categoria`, `nombre_fuente`, `entidad_id`, `cuenta_id`, `red_normalizada`, `metrica_normalizada`, `valor`, `provincia`, `fuente_archivo`, `nombre_original`. Estas columnas pueden **derivarse en el proceso ETL**: no imponer rediseñar el CSV original.

- `entidad_id`: identidad única y estable de la persona/institución.
- `cuenta_id`: cuenta de red social específica; **una misma entidad puede tener varias cuentas**.
- `categoria`: categoría de fuente, conservada; un `universo_ui` (si se necesita) es un campo separado.
- `nombre_original`: texto de entrada antes de normalizar.
- `nombre_canonico`: nombre aprobado para la interfaz; nunca reemplazar sin trazabilidad.
- `red`: plataforma única; no sumar stocks de redes como equivalentes.
- `fecha_mes`: año y mes calendario; tipos válidos, mes entre 1 y 12.

## Validaciones obligatorias

1. Todos los nombres, categorías, redes, atributos y fechas no nulos; `Valor` finito.
2. Recuento de filas de entrada y salida; explicar toda exclusión.
3. Duplicados por clave de observación **después** de normalizar. Resolver antes de sumar.
4. Variantes de nombre solo bajo tabla de equivalencias explícita, reversible y revisada; **Chaco TV y TV Local son cuentas distintas**.
5. Territorios con acentos/capitalización normalizados bajo tabla, conservando valores originales para auditoría.
6. Stock `Fans` exige tratamiento diferente de flujos; no usar 0 como reemplazo de ausente.
7. Una entidad sin foto o escudo figura igualmente como círculo con nombre y fallback iniciales.
8. No perder cuentas o registros al filtrar por categorías que tengan datos en otros meses: seleccionar período válido por categoría, o indicar ausencia sin inventar datos.
9. Exportar CSV de resultados con trazabilidad y esquema documentado.
10. Publicaciones individuales y menciones de Meltwater tendrán fuentes independientes y unificadores explícitos; no mezclar sus unidades sin validación.

## Decisiones pendientes (NO dar por aprobadas)

- Equivalencias exactas `TT`/`TK` y `TW`/`X`.
- Listado final de nombres canónicos y alias de perfiles.
- Reglas de visualización y unidades por red (vistas vs reproducciones).
- Clasificación de `Detractor` como tipo de entidad vs rol de análisis.
- Cuentas con múltiples alias o perfiles en una misma red.
- Inclusión de nuevas imágenes oficiales.
