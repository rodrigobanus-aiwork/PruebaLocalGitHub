# Prosumia 2.0 - Prueba controlada

Versión experimental basada en la Prosumia 1.0 de estética correcta. **No sobrescribir la rama `main`.**

## Cambios
- Evolutivo: elección individual de combinaciones cuenta + red (FB, IG, TikTok, X, YouTube).
- La selección de cada cuenta es independiente de la selección global de redes de Ranking.
- Colores estables diferenciados por perfil dentro de la misma familia cromática de red.
- Se mantienen Ranking, Lectura y Comparación.

## Publicación de prueba sin cambiar la 1.0
1. En GitHub, crear la rama `prosumia-v2` a partir de `main`.
2. Dentro de esa rama, reemplazar **solo** `src/components/Dashboard.tsx` por el incluido en esta entrega; añadir `.github/workflows/preview-v2.yml` en esa misma ruta.
3. Verificar que en **Actions** finalice verde «Prosumia 2.0 - Vista previa aislada».
4. Comprobar la versión estable en `https://rodrigobanus-aiwork.github.io/PruebaLocalGitHub/` y la prueba en `https://rodrigobanus-aiwork.github.io/PruebaLocalGitHub/v2/`.

La automatización compila y despliega las DOS versiones, preservando 1.0 en la raíz. No modificar los CSV para esta prueba.

## Pruebas manuales de UX
- Comparar IG del Gobierno de Santa Fe con FB de M. Pullaro, sin series cruzadas adicionales.
- Elegir dos o más cuentas FB y comprobar tonalidades diferentes.
- Cambiar mes y rango sin cambiar los colores de perfiles.
- Probar FB, IG, TikTok, X y YouTube cuando haya datos.
- Confirmar que Ranking, Lectura y Comparación sean idénticos a 1.0.

## Validación local de la entrega
- Sintaxis TSX verificada por el compilador TypeScript en modo transpile (sin errores sintácticos).
- 11.314 registros mensuales, 229 combinaciones cuenta-red disponibles en CSV.
- **No se verificó build completo**: la conexión DNS a registry.npmjs.org falla (`EAI_AGAIN`) en este entorno.
- **No se probó en navegador**; la compilación de GitHub y la prueba funcional siguen pendientes.
