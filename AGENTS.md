# PROSUMIA — Contrato permanente de mantenimiento para agentes y desarrolladores

**Versión:** 2.0 · **Estado:** documentación lista para incorporación, pendiente de aprobación del usuario; sin cambios funcionales · **Idioma:** español.
**Ámbito:** toda modificación del repositorio, sea realizada por una IA o por una persona.
**Principio rector:** **SUMAR SIN ROMPER**. Toda capacidad previamente aprobada se conserva salvo instrucción explícita que identifique el elemento a cambiar.

> Este archivo es una instrucción del proyecto para agentes compatibles con `AGENTS.md`. No constituye una protección técnica automática; las pruebas y las revisiones siguen siendo obligatorias.

## Jerarquía de fuentes de verdad

1. La **versión de código expresamente aprobada** para la tarea (rama y commit registrados en la propuesta de cambio). Nunca inferir que el último experimento es la base aprobada.
2. El contrato funcional y visual en `docs/` y las capturas aprobadas en `docs/referencias_visuales/`.
3. Las estructuras y reglas de datos documentadas en `docs/04_MODELO_DE_DATOS.md` y `docs/05_REGLAS_DE_CALCULO.md`.
4. Los pedidos puntuales del usuario **no implican permiso para alterar funciones ajenas a ese pedido**.

**Conflicto:** si el pedido contradice una regla protegida, explicitar el conflicto y pedir autorización para *esa modificación concreta*. No rediseñar como solución de conveniencia.

## Reglas no negociables

1. **No reconstruir componentes existentes.** Analizar el código y reutilizar botones, gráficos, selector de cuentas, tarjetas y vistas antes de crear otra implementación.
2. **Prohibición de regresiones.** Una categoría nueva no puede eliminar, reorganizar ni sustituir partes aprobadas de Gobernadores/Gobiernos.
3. **Proteger estructura y orden.** Mantener encabezado, logo, cuatro vistas (`Ranking`, `Lectura`, `Evolutivo`, `Comparación`), filtros originales, dos hileras de fotografías/escudos, cinco tarjetas del ranking, tooltips, leyendas, colores, tipos de gráfico y comportamiento de selección.
4. **Datos ≠ interfaz.** Incorporar CSV, entidades o métricas en lectura, modelo y cálculos; cambios visuales solo donde sea imprescindible y expresamente autorizado.
5. **Fuentes de datos coexistentes.** Conservar `public/data.csv` para Gobernadores/Gobiernos. La base V4 no lo reemplaza por defecto.
6. **Ninguna cuenta desaparece por no tener fotografía.** Mostrar círculo, iniciales y nombre; imagen opcional. Nunca depender de `GOBERNADORES_INFO` para determinar la existencia de nuevas entidades.
7. **Nombres de categoría fieles al CSV.** No convertir `Detractor`, `Municipio`, `Intendente`, `Ministro provincial`, `Ministerio provincial` y `Figuras nacionales` en una sola clase `Dirigentes` a nivel de datos. Un agrupador visual no reemplaza la categoría original.
8. **Identidad y normalización trazables.** No fusionar cuentas parecidas sin evidencia; preservar nombre fuente, categoría, plataforma y una clave de cuenta estable; distinguir `Chaco TV` de `TV Local`.
9. **No fabricar métricas.** Valor ausente es `sin dato`, no cero. No calcular penetración o impacto padrón sin padrón verificable; seguidores son stock, publicaciones/reacciones son flujos.
10. **No declarar funcionamiento por sintaxis.** `TSX válido`, `compila`, `abre`, `funciona` y `conserva la apariencia` son verificaciones diferentes. Reportar cuál se hizo, cuál no y con qué evidencia.
11. **Una modificación acotada por vez.** Antes de editar, elaborar alcance, archivos afectados, contratos implicados, riesgos y comprobaciones. No modificar otros bloques por estética o conveniencia.
12. **Sin GitHub por defecto.** NO consultar, crear ramas, subir, modificar, desplegar ni hacer commits en GitHub a menos que el usuario autorice expresamente esa operación para ese turno. Entregar archivos locales listos para que el usuario decida subirlos.
13. **Sin instalaciones para pruebas del usuario por defecto.** El usuario busca entregables listos para abrir; no imponer CMD, Node, BAT ni recompilaciones locales salvo solicitud.
14. **No anunciar entregas incompletas como terminadas.** Si faltan archivos importados, CSV, imágenes o compilación, declarar el bloqueo y proporcionar un inventario exacto de dependencias.
15. **Mantener este contrato.** Cada cambio aprobado debe actualizar especificaciones, matriz de pruebas e historial. Un cambio que modifica comportamientos sin documentación está incompleto.

## Procedimiento obligatorio por cambio

**ANTES:**
- Registrar base aprobada (rama/commit o archivo + hash) y requerimiento exacto.
- Identificar archivos, componentes, estados y dependencias; listar invariantes protegidas.
- Especificar casos con datos presentes, faltantes y categorías sin determinada métrica.

**DURANTE:**
- Hacer cambios localizados. No reemplazar un gráfico por otra visualización ni duplicar motores de cálculo.
- Si se extrae un componente, mantener sus props/estados/DOM y comprobar equivalencia funcional y visual.

**DESPUÉS:**
- Ejecutar controles de esquema y cálculos; compilar si el entorno lo permite.
- Probar navegación, selectores, rankings, Lectura, Evolutivo y Comparación.
- Comparar capturas contra la referencia aprobada (mismo tamaño de pantalla, filtros y datos).
- Verificar exportación y ausencia de errores de consola.
- Entregar un resumen: *qué se añadió / qué quedó intacto / qué se verificó / qué no se pudo verificar*.
- Actualizar `docs/06_HISTORIAL_DE_CAMBIOS.md` y `docs/07_MATRIZ_DE_PRUEBAS.md` cuando corresponda.

## Referencias obligatorias

- `docs/01_ARQUITECTURA.md`: archivos, dependencias y separación de responsabilidades.
- `docs/02_CONTRATO_VISUAL.md`: elementos visuales que NO pueden cambiar sin aprobación.
- `docs/03_FUNCIONALIDADES.md`: controles y reglas de interacción.
- `docs/04_MODELO_DE_DATOS.md`: orígenes, categorías y claves.
- `docs/05_REGLAS_DE_CALCULO.md`: stock, flujos, métricas y advertencias.
- `docs/06_HISTORIAL_DE_CAMBIOS.md`: decisiones aprobadas y pendientes.
- `docs/07_MATRIZ_DE_PRUEBAS.md`: pruebas que deben pasar antes de toda entrega.

**No confiar únicamente en comentarios.** El contrato describe el objetivo; las pruebas verifican que siga funcionando.

## Procedimientos y fichas de referencia de uso obligatorio

- `docs/08_FICHAS_DE_COMPONENTES.md`: contratos UI-001 a UI-015, con controles y pruebas.
- `docs/09_MAPA_ESTADOS_Y_DATOS.md`: trazabilidad de estados, cálculos y conexión V4.
- `docs/10_PROCEDIMIENTO_DE_CAMBIOS.md`: pasos D1–D4 y aceptación.
- `docs/PLANTILLA_CAMBIO.md`: ficha nueva por cada solicitud puntual.
- `docs/11_REFERENCIA_Y_DECISIONES_PENDIENTES.md`: fuentes verificadas y decisiones no inventables.

**Regla operativa:** leer las fichas relevantes y completar una ficha de cambio antes de editar. El hecho de que `AGENTS.md` esté versionado en GitHub no implica que un asistente tenga autorización de acceder a GitHub ni que lo lea automáticamente.
