# Spec: Módulo de Movimientos
**Módulo:** Gestión de Transacciones
**Tipo:** Feature Component (Angular Standalone)

## 1. Descripción Funcional
Permite al usuario registrar ingresos y gastos para actualizar en tiempo real el saldo de la cuenta. La IA debe basar la generación del servicio en esta especificación.

## 2. Reglas de Negocio (Business Rules)
- **BR1:** El monto ingresado (`monto`) debe ser numérico, positivo y mayor a 0.
- **BR2:** Tipos permitidos: `ingreso` | `gasto`.
- **BR3:** Validación de Saldo: Si `tipo == gasto`, el monto no puede superar el saldo actual. De lo contrario, rechazar transacción.

## 3. Criterios de Aceptación (TDD)
- [ ] `FinanceService` debe ser testeado para fallar si el gasto supera el saldo.
- [ ] La UI debe utilizar Angular Signals para actualizar la tabla de historial automáticamente tras un POST exitoso a `/api/movimientos`.