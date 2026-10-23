# Spec: Módulo de Presupuestos y Categorías
**Módulo:** Planificación financiera  
**Relación BD:** `configuracion_presupuesto`, `limites_categoria` y `categorias`

## 1. Objetivo y alcance
Permitir definir el ingreso base mensual y un límite máximo por categoría.
El frontend combina esta configuración con los movimientos y gastos recurrentes
para mostrar el gasto real, el dinero comprometido y el disponible.

## 2. Categorías
Las categorías iniciales del sistema son:

- Alquiler.
- Comida.
- Ocio.
- Servicios.

## 3. Reglas de negocio
- **BR1:** El ingreso base debe ser mayor o igual a cero.
- **BR2:** Cada límite de categoría debe ser mayor o igual a cero.
- **BR3:** La suma de límites no debe superar el ingreso base; la interfaz debe
  mostrar una alerta cuando esto ocurra.
- **BR4:** Los movimientos pueden asociarse a una categoría mediante
  `categoria_id`.
- **BR5:** Los gastos recurrentes no sustituyen al presupuesto: representan
  compromisos futuros y se muestran como una deducción estimada mensual.
- **BR6:** La frecuencia recurrente se normaliza para el cálculo mensual:
  semanal = `monto * 52 / 12`, mensual = `monto`, anual = `monto / 12`.

## 4. Contrato de API
- `GET /api/categorias`: lista las categorías disponibles.
- `GET /api/presupuestos`: devuelve ingreso base y límites.
- `PUT /api/presupuestos`: actualiza la configuración y sus límites.

El gasto real por categoría y los compromisos recurrentes se calculan en el
frontend a partir de los datos obtenidos de sus servicios respectivos.

## 5. Criterios de aceptación
- [x] Se puede consultar y actualizar el ingreso base.
- [x] Se puede consultar y actualizar el límite de cada categoría.
- [x] La interfaz muestra total asignado, restante y porcentaje asignado.
- [x] Se muestra una alerta cuando los límites superan el ingreso base.
- [x] Se muestra el compromiso mensual de gastos recurrentes.
- [x] Se muestra el compromiso recurrente correspondiente a cada categoría.
- [x] Se usan barras de progreso y estilos responsive con Tailwind CSS.