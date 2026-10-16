# Prosumia - Verificacion conjunta de pasos 02 y 03

## Version examinada
- Base local: `PruebaLocalGitHub-main.zip` (copia estable).
- `src/components/Dashboard.tsx`: contenido del Paso 02.
- `src/components/EntityModule.tsx`: contenido del Paso 03.
- `public/mega_metricas.csv`: version Etapa 1, 8503 registros.

## Resultados comprobados
1. Transpilacion de sintaxis TypeScript/TSX sin diagnosticos para Dashboard, EntityModule, LecturaView y ComparacionView.
2. Los nombres `RankingCard`, `ProgressBar`, `getTrafficLightColor` importados desde Dashboard estan exportados alli.
3. En nuevas entidades, las cinco columnas se construyen mediante el `RankingCard` y `ProgressBar` originales, no mediante una tarjeta paralela.
4. Los registros del CSV suman 8503 y contienen seis categorias.
5. El codigo original de las otras tres vistas en el modulo nuevo no se modifico en el Paso 03.

## Limites y riesgos abiertos
- La ejecucion de `npm ci` local agoto el tiempo disponible; no se completaron `vite build` ni pruebas de navegador. No afirmar compilacion aprobada.
- Dependencia circular: `Dashboard.tsx` importa `EntityModule.tsx`, que importa elementos visuales de `Dashboard.tsx`. Su carga en navegador y la compilacion final requieren prueba.
- La distribucion de la seccion de nuevas entidades y los filtros no coincide todavia con el Dashboard de Gobernadores. El paso 03 solo reutiliza el dibujo de tarjetas y filas.
- Lectura, Evolutivo y Comparacion de nuevas entidades todavia no son equivalentes a las vistas originales.
- El CSV de este paquete tiene las seis categorias de la Etapa 1; no integra los 5544 registros posteriores de influencers correntinos.
- Este paquete se debe aplicar en rama de prueba con una compilacion de GitHub Actions, sin mezclar con main.

## Instalacion para prueba en la rama `prueba-ranking-entidades`
Reemplazar en esa rama exclusivamente:
- `src/components/Dashboard.tsx`
- `src/components/EntityModule.tsx`

El CSV incluido en la carpeta `public/` se entrega para reproduccion local/diagnostico: no reemplazar una base mas reciente por este CSV de 8503 registros.

Comprobar: (1) Actions build, (2) vista `/v2/`, (3) Ranking de Gobernadores, (4) Ranking de Dirigentes y Medios, (5) seleccion de cuentas, (6) cinco columnas. Si falla algun punto, NO fusionar a main.
