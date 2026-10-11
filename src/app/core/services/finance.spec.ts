import { TestBed } from '@angular/core/testing';
import { Finance } from './finance';



describe('FinanceService', () => {
  let service: Finance;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Finance);
  });

  // Prueba basada en SDD: Validar límite de presupuesto
  it('debe retornar "Saldo insuficiente" si el gasto es mayor al saldo libre', () => {
    const resultado = service.registrarGasto(60, 50); // Gasto 60, Saldo 50
    expect(resultado).toBe('Saldo insuficiente');
  });
});