# Spec: Módulo de Movimientos
**Módulo:** Gestión de transacciones  
**Tipo:** Feature Angular Standalone + API REST

## 1. Objetivo y alcance
Permitir registrar, consultar, editar y eliminar ingresos y gastos persistidos en
PostgreSQL. El dashboard consume los movimientos para calcular ingresos, gastos,
saldo, tendencias y distribución por categoría.

## 2. Modelo de datos
- `id`: identificador numérico.
- `tipo`: `ingreso` | `gasto`.
- `monto`: número positivo.
- `descripcion`: texto obligatorio.
- `fecha`: fecha/hora generada por la base de datos.
- `categoria_id`: categoría asociada, opcional.

## 3. Reglas de negocio
- **BR1:** `monto` debe ser numérico, finito y mayor que cero.
- **BR2:** `tipo` solo puede ser `ingreso` o `gasto`.
- **BR3:** La descripción es obligatoria.
- **BR4:** La categoría puede ser nula, pero cuando se proporciona debe
  corresponder a una categoría existente.
- **BR5:** Los movimientos se almacenan en PostgreSQL y no únicamente en el
  estado local del frontend.

## 4. Contrato de API
- `GET /api/movimientos`: devuelve el historial ordenado por fecha descendente.
- `POST /api/movimientos`: crea un movimiento.
- `PUT /api/movimientos/:id`: actualiza un movimiento existente.
- `DELETE /api/movimientos/:id`: elimina un movimiento existente.

## 5. Criterios de aceptación
- [x] Un movimiento válido se registra mediante `POST` y retorna la entidad creada.
- [x] Un monto cero, negativo o no numérico retorna `400`.
- [x] Un tipo diferente de `ingreso` o `gasto` retorna `400`.
- [x] La UI actualiza el Signal de movimientos después de una operación exitosa.
- [x] El historial permite búsqueda, filtros y paginación.
- [x] El dashboard calcula métricas a partir de los movimientos de la API.
- [x] Existen pruebas de API para la consulta de movimientos con Jest y Supertest.