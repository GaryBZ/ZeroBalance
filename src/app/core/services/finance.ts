import { Injectable, signal } from '@angular/core';
import {
  Categoria,
  CategoriaId,
  Movimiento,
  ObjetivoAhorro,
  Presupuesto,
  TipoMovimiento,
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

  private readonly movimientos = signal<Movimiento[]>([
    {
      id: 'movimiento-1',
      monto: 3000,
      descripcion: 'Nómina mensual',
      tipo: 'ingreso',
      categoriaId: 'servicios',
      fecha: '2026-10-01',
    },
    {
      id: 'movimiento-2',
      monto: 86.4,
      descripcion: 'Supermercado La Colmena',
      tipo: 'gasto',
      categoriaId: 'comida',
      fecha: '2026-10-09',
    },
    {
      id: 'movimiento-3',
      monto: 32,
      descripcion: 'Metro y transporte',
      tipo: 'gasto',
      categoriaId: 'servicios',
      fecha: '2026-10-08',
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

  obtenerMovimientos(): Movimiento[] {
    return this.movimientos();
  }

  registrarMovimiento(
    monto: number,
    descripcion: string,
    tipo: TipoMovimiento,
    categoriaId: CategoriaId,
  ): Movimiento {
    const movimiento: Movimiento = {
      id: globalThis.crypto?.randomUUID() ?? `${Date.now()}`,
      monto,
      descripcion,
      tipo,
      categoriaId,
      fecha: new Date().toISOString().slice(0, 10),
    };

    this.movimientos.update((movimientos) => [movimiento, ...movimientos]);
    return movimiento;
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
