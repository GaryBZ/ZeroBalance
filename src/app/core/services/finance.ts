import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Finance {
  registrarGasto(gasto: number, saldoLibre: number): number | string {
    if (gasto > saldoLibre) {
      return 'Saldo insuficiente';
    }

    return saldoLibre - gasto;
  }
}
