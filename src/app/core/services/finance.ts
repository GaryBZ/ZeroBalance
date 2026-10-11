import { Injectable, signal } from '@angular/core';
import {
  Categoria,
  CategoriaId,
  ObjetivoAhorro,
  Presupuesto,
} from '../models/finance.models';

@Injectable({
  providedIn: 'root',
})
export class Finance {
  private readonly categorias = signal<Categoria[]>([
    { id: 'alquiler', nombre: 'Alquiler' },
    { id: 'comida', nombre: 'Comida' },
    { id: 'ocio', nombre: 'Ocio' },
    { id: 'servicios', nombre: 'Servicios' },
  ]);

  private readonly presupuesto = signal<Presupuesto>({
    ingresoBase: 3000,
    limitesPorCategoria: {
      alquiler: 1000,
      comida: 450,
      ocio: 250,
      servicios: 300,
    },
  });

  private readonly objetivos = signal<ObjetivoAhorro[]>([
    {
      id: 'viaje-japon',
      nombre: 'Viaje a Japón',
      montoObjetivo: 3500,
      montoAhorrado: 1250,
      fechaCreacion: '2026-01-15',
    },
    {
      id: 'ps5',
      nombre: 'PS5',
      montoObjetivo: 650,
      montoAhorrado: 280,
      fechaCreacion: '2026-02-03',
    },
  ]);

  obtenerCategorias(): Categoria[] {
    return this.categorias();
  }

  obtenerPresupuesto(): Presupuesto {
    return this.presupuesto();
  }

  actualizarPresupuesto(ingresoBase: number, limitesPorCategoria: Record<CategoriaId, number>): void {
    this.presupuesto.set({
      ingresoBase,
      limitesPorCategoria: { ...limitesPorCategoria },
    });
  }

  obtenerObjetivos(): ObjetivoAhorro[] {
    return this.objetivos();
  }

  crearObjetivo(
    nombre: string,
    montoObjetivo: number,
    montoAhorrado = 0,
  ): ObjetivoAhorro {
    const objetivo: ObjetivoAhorro = {
      id: globalThis.crypto?.randomUUID() ?? `${Date.now()}`,
      nombre,
      montoObjetivo,
      montoAhorrado,
      fechaCreacion: new Date().toISOString().slice(0, 10),
    };

    this.objetivos.update((objetivos) => [...objetivos, objetivo]);
    return objetivo;
  }

  actualizarAhorroObjetivo(id: string, montoAhorrado: number): void {
    this.objetivos.update((objetivos) =>
      objetivos.map((objetivo) =>
        objetivo.id === id
          ? { ...objetivo, montoAhorrado }
          : objetivo,
      ),
    );
  }

  registrarGasto(gasto: number, saldoLibre: number): number | string {
    if (gasto > saldoLibre) {
      return 'Saldo insuficiente';
    }
    return saldoLibre - gasto;
  }
}
