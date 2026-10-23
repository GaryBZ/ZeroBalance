# Spec: Módulo de Objetivos de Ahorro
**Módulo:** Metas financieras  
**Tipo:** Feature Angular Standalone + API REST

## 1. Objetivo y alcance
Permitir crear metas de ahorro, consultar su progreso, registrar abonos,
editar sus datos y eliminarlas. La información debe permanecer en PostgreSQL
para que el progreso se conserve al recargar la aplicación.

## 2. Modelo de datos
- `id`: identificador numérico.
- `nombre`: nombre de la meta.
- `monto_meta`: valor objetivo.
- `monto_actual`: ahorro acumulado.
- `fecha_limite`: fecha opcional en formato `YYYY-MM-DD`.
- `estado`: `activo` | `pausado` | `completado` | `cancelado`.
- `promedio_mensual`: promedio calculado a partir de los abonos.

## 3. Reglas de negocio
- **BR1:** El nombre es obligatorio.
- **BR2:** `monto_meta` debe ser mayor que cero.
- **BR3:** `monto_actual` debe ser mayor o igual a cero y no puede superar
  `monto_meta`.
- **BR4:** Al alcanzar el monto meta, el objetivo se marca como completado.
- **BR5:** Un abono positivo registra su diferencia en `abonos_objetivo`.
- **BR6:** Una meta completada no acepta abonos adicionales desde la interfaz.
- **BR7:** La fecha se transforma a `YYYY-MM-DD` antes de asignarse al input
  HTML y antes de enviarse a la API.

## 4. Contrato de API
- `GET /api/objetivos`: lista objetivos y promedio mensual.
- `POST /api/objetivos`: crea un objetivo.
- `PUT /api/objetivos/:id`: actualiza datos del objetivo.
- `PATCH /api/objetivos/:id/ahorro`: registra el nuevo ahorro.
- `DELETE /api/objetivos/:id`: elimina un objetivo.

## 5. Criterios de aceptación
- [x] Se puede crear un objetivo con nombre, monto, fecha y estado.
- [x] Se puede editar nombre, monto meta, fecha límite y estado.
- [x] Se puede eliminar un objetivo.
- [x] Se pueden registrar abonos persistidos en PostgreSQL.
- [x] El porcentaje se calcula mediante Angular Signals y `computed()`.
- [x] Se muestra una barra de progreso y el estado de la meta.
- [x] Una meta completada muestra el estado “Completado”.
- [x] Se muestra una proyección cuando existe promedio mensual.
- [x] Las tarjetas usan el estilo visual neobrutalista del sistema.