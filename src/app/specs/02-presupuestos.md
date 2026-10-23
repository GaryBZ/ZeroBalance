# Spec: Módulo de Presupuestos y Categorías
**Módulo:** Planificación Financiera
**Relación BD:** Tablas `configuracion_presupuesto` y `limites_categoria`

## 1. Descripción Funcional
El sistema debe permitir al usuario definir un ingreso base mensual y asignar límites de gasto máximos segmentados por categorías.

## 2. Reglas de Negocio (Business Rules)
- **BR1:** Las categorías fijas son: `Alquiler`, `Comida`, `Ocio`, `Servicios`.
- **BR2:** La suma de los `limites_categoria` no debe exceder el `ingreso_base` configurado.
- **BR3:** Al registrar un gasto en el módulo de movimientos, se debe asociar opcionalmente a un `categoria_id`.

## 3. Criterios de Aceptación (TDD)
- [ ] El endpoint GET `/api/presupuestos` debe retornar el ingreso base y los límites cruzados con el gasto real de las categorías.
- [ ] La interfaz debe renderizar barras de progreso usando Tailwind CSS (rojo si el gasto supera el 90% del límite).