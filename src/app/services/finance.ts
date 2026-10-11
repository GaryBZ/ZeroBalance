import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Finance {
  // Función generada por Copilot y TDD
  registrarGasto(gasto: number, saldoLibre: number): number | string {
    if (gasto > saldoLibre) {
      return 'Saldo insuficiente';
    }
    return saldoLibre - gasto;
  }
}
