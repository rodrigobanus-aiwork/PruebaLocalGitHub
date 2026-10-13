# PROSUMIA - dashboard original para GitHub Pages

Esta edicion toma los componentes visuales de **Estetica Correcta**. No rediseña Ranking, Lectura, Evolutivo ni Comparacion.

## Publicacion

Subir el **contenido descomprimido de este ZIP** a la raiz del repositorio de GitHub, conservando carpetas (incluida `.github/workflows`). En Settings > Pages > Build and deployment seleccionar **GitHub Actions**. Cada push a `main` o `master` compila y publica automaticamente el sitio. La URL de un repositorio llamado `prosumia-static` es `https://USUARIO.github.io/prosumia-static/`.

No requiere instalar nada en Windows, ni Google AI Studio ni Hugging Face. GitHub Actions instala dependencias de forma automatica.

## Datos

Los datos originales residen en `public/data.csv`. Para actualizarlos, agregar filas al CSV y guardar en el repositorio. Los filtros y graficos de la version original permanecen en sus componentes.

## Seguridad y limites

GitHub Pages sirve recursos publicos: se desactivo el formulario de contraseña original porque no protegia los datos en un hosting estatico. No publicar datos confidenciales. Esta version **no incorpora aun las funciones semanales del ZIP nuevo**: primero se valida 1.0. La accion de exportacion, que requeria Express, descarga el CSV original como alternativa; el resto de la visualizacion utiliza el frontend original. La compilacion real y la comparacion visual en navegador **no pudieron verificarse en este entorno** por falta de conexion al registro npm. Ante errores, revisar la pestaña Actions del repositorio.
