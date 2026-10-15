# 07 — Matriz de regresión y criterio de aceptación

**Objetivo:** proteger funcionalidades previamente aprobadas y verificar que una nueva categoría no cambie el Dashboard histórico.

| ID | Prueba | Resultado esperado | Tipo | Estado inicial |
|---|---|---|---|---|
| REG-01 | Inicio con datos históricos | Gobernadores muestra contenido real y no maqueta | Integración | Pendiente de automatizar |
| REG-02 | Encabezado | Misma posición/orden de logo, título, cuatro vistas y filtros | Captura + DOM | Pendiente de línea base aprobada |
| REG-03 | Cinco columnas | Exactamente cinco tarjetas, títulos y orden originales | DOM + captura | Pendiente |
| REG-04 | Fotos/escudos | Dos hileras, `Todos`, selecciones múltiples y nombres | Interacción + captura | Pendiente |
| REG-05 | Selección ranking | Destaca elegidos sin eliminar los demás | Interacción | Pendiente |
| REG-06 | Lectura | Cuenta elegida produce textos, métricas y comparaciones | Interacción | Pendiente |
| REG-07 | Evolutivo | Es LineChart, no gráfico de barras agregado; conserva leyenda y tooltip | DOM + captura | Pendiente |
| REG-08 | Evolutivo selección | Clásico respeta círculos+redes; Personalizado selecciona por cuenta+red | Interacción | Pendiente |
| REG-09 | Evolutivo temporal | Mensual, trimestral, semestral, anual y Desde/Hasta funcionan | Integración | Pendiente |
| REG-10 | Promedios | No usa meses incompletos; no exige Fans para métricas ajenas | Unidad | Pendiente |
| REG-11 | Comparación | Cinco columnas con selectors independientes de red/métrica | Interacción | Pendiente |
| REG-12 | V4 categorías | Seis nombres exactos, sin agregar `Dirigentes` como reemplazo de categoría | Datos + UI | Pendiente |
| REG-13 | V4 nombres/círculos | Cada cuenta elegible tiene círculo + nombre, con iniciales sin foto | Integración | Pendiente |
| REG-14 | V4 red/mes | Solo cuentas de la selección, sin sumar stocks de redes distintas | Unidad + integración | Pendiente |
| REG-15 | V4 cobertura | 8.503 registros antes de limpiar, exclusiones y equivalencias documentadas | Datos | Pendiente |
| REG-16 | Exportación | CSV real; HTML solo si realmente se genera archivo HTML abrible | Integración | Bug conocido |
| REG-17 | Consola | Sin errores React, importaciones faltantes o solicitudes 404 | Navegador | Pendiente |
| REG-18 | Presentación | Sin pérdida de textos, controles, estilos o imágenes base | Capturas aprobadas | Pendiente |

## Comprobaciones aritméticas recomendadas

- Por categoría+red+mes: sumas de conteos y ausencia de duplicados posteriores a normalización.
- Fans como stock; flujos como suma; crecimiento como diferencia comparable.
- Denominadores de padrón verificables y ausencia identificada como tal.
- Promedios con cobertura, períodos completos y series homólogas.

## Niveles de evidencia — no confundir

1. **Archivo encontrado** ≠ código válido.
2. **Sintaxis correcta** ≠ compila.
3. **Compila** ≠ los datos se cargan.
4. **Carga datos** ≠ filtros/botones funcionan.
5. **Funciona** ≠ respeta el diseño aprobado.

**El cambio solo puede darse por terminado** cuando las pruebas relevantes resulten satisfactorias y se registre cualquier prueba no ejecutada. En caso de no disponer de entorno de navegador, entregar código como *no verificado visualmente*, no como HTML plenamente validado.

## Capturas de referencia

Guardar ejemplos aprobados en `docs/referencias_visuales/`: encabezado, selector fotos/escudos, ranking, Lectura, Evolutivo mensual y anual, Comparación, filtros desplegados. Para cada captura anotar resolución, navegador, zoom, período, red, selección y versión de datos. No sustituir por capturas de maquetas experimentales.
