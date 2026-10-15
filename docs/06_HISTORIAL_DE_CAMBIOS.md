# 06 — Historial de cambios y decisiones

**Regla:** cada cambio funcional aprobado agrega una entrada con identificador, fecha, archivos afectados, motivo, evidencia de pruebas, aprobación y reversión posible. **No dar por aprobado lo que fue únicamente un prototipo.**

## Línea de base documental

- **2026-10-15 · CONTRATO-001** — Se crea contrato Prosumia 1.0 para preservar estructura, datos y funcionalidad. **Estado: para revisión/aprobación**. Ningún archivo de la aplicación fue modificado.
- **Fuente documentada:** `Dashboard(1).tsx`, 1.672 líneas, SHA-256 `2bb9e8a211fa37dd81b4532bb5b4088f03a7f7376258c733effb954c74edc96b`.
- **Referencia de producto reportada por el usuario:** versión `main` con Ranking, Lectura, Evolutivo y Comparación, fotografías, escudos, cinco columnas y navegación de universos. La referencia exacta de código/commit vigente deberá registrarse al usar el contrato.
- **V4:** `mega_metricas_con_ministros(1).csv` contiene 8.503 registros y seis categorías. La integración funcional al Dashboard **no se considera validada**.
- **Riesgos existentes:** nuevas secciones son maquetas en fuente auditada; exportación rotulada HTML descarga CSV; cálculos históricos requieren validación.

- **2026-10-15 · CONTRATO-002** — Se completa versión documental 2.0 con 15 fichas visuales, mapa de estados/datos, protocolo de cambios, plantilla reutilizable y registro de decisiones pendientes. Se comprobó integridad del ZIP y se ejecutaron 16 controles estáticos sobre una copia de fuente y CSV; no se ejecutaron pruebas de interfaz en navegador ni se alteró el código de aplicación. **Estado: lista para incorporar; aceptación funcional futura pendiente.**

## Plantilla para cambios posteriores

```text
ID:
Fecha:
Solicitado:
Base aprobada (archivo + hash o rama + commit):
Ámbito permitido:
Archivos editados:
Elementos visuales que permanecen iguales:
Datos / cálculos que cambian:
Pruebas unitarias:
Pruebas de interacción:
Comparación de capturas:
Resultado de compilación:
Limitaciones / pendientes:
Aprobación explícita:
Cómo volver al estado previo:
```

## Política de cierre

No marcar `Aprobado` sin autorización del usuario. No declarar `Comprobado` sin indicar herramienta y resultado. No modificar `main`, GitHub u otros servicios sin autorización explícita en ese turno.
