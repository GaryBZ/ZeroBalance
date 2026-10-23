# Spec: Objetivos de Ahorro
**Módulo:** Metas Financieras
**Tipo:** Feature Component

## 1. Descripción Funcional
Permite establecer metas a mediano/largo plazo, visualizando cuánto falta para alcanzar la meta.

## 2. Reglas de Negocio (Business Rules)
- **BR1:** Todo objetivo debe tener un `nombre` y un `monto_meta` mayor a cero.
- **BR2:** El `monto_actual` debe inicializarse en 0 y no puede ser mayor que `monto_meta`.
- **BR3:** El cálculo de porcentaje `(monto_actual / monto_meta) * 100` debe realizarse en el frontend mediante Signals computadas (`computed()`).

## 3. Criterios de Aceptación (UI/UX)
- [ ] Las tarjetas de objetivos deben seguir el diseño Neobrutalista (bordes gruesos oscuros, `border-gray-900`).
- [ ] Integrar botón para "Añadir fondos" al objetivo.