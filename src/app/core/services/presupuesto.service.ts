import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import {
  CategoriaId,
  Presupuesto,
} from '../models/finance.models';

interface ApiPresupuesto {
  configuracion: {
    id: number;
    ingreso_base: number | string;
  } | null;
  limites: Array<{
    id: number;
    categoria_id: number;
    categoria_nombre: string;
    limite_monto: number | string;
  }>;
}

@Injectable({ providedIn: 'root' })
export class PresupuestoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/presupuestos';

  readonly presupuesto = signal<Presupuesto>({
    ingresoBase: 0,
    limitesPorCategoria: {
      alquiler: 0,
      comida: 0,
      ocio: 0,
      servicios: 0,
    },
  });

  obtenerPresupuesto(): void {
    this.http.get<ApiPresupuesto>(this.apiUrl).subscribe({
      next: (presupuesto) => this.presupuesto.set(this.mapearPresupuesto(presupuesto)),
      error: (error: unknown) => {
        console.error('No se pudo cargar el presupuesto', error);
      },
    });
  }

  actualizarPresupuestoLocal(
    ingresoBase: number,
    limitesPorCategoria: Record<CategoriaId, number>,
  ): void {
    const categoriaIds: Record<CategoriaId, number> = {
      alquiler: 1,
      comida: 2,
      ocio: 3,
      servicios: 4,
    };
    const limites = Object.entries(limitesPorCategoria).map(
      ([categoriaId, limite_monto]) => ({
        categoria_id: categoriaIds[categoriaId as CategoriaId],
        limite_monto,
      }),
    );

    this.http.put<ApiPresupuesto>(this.apiUrl, {
      ingreso_base: ingresoBase,
      limites,
    }).subscribe({
      next: (presupuesto) => this.presupuesto.set(this.mapearPresupuesto(presupuesto)),
      error: (error: unknown) => {
        console.error('No se pudo actualizar el presupuesto', error);
      },
    });
  }

  private mapearPresupuesto(data: ApiPresupuesto): Presupuesto {
    const limitesPorCategoria: Record<CategoriaId, number> = {
      alquiler: 0,
      comida: 0,
      ocio: 0,
      servicios: 0,
    };

    for (const limite of data.limites) {
      const categoriaId = this.categoriaIdTexto(limite.categoria_id);
      limitesPorCategoria[categoriaId] = Number(limite.limite_monto);
    }

    return {
      ingresoBase: Number(data.configuracion?.ingreso_base ?? 0),
      limitesPorCategoria,
    };
  }

  private categoriaIdTexto(categoriaId: number): CategoriaId {
    const categorias: Record<number, CategoriaId> = {
      1: 'alquiler',
      2: 'comida',
      3: 'ocio',
      4: 'servicios',
    };

    return categorias[categoriaId] ?? 'servicios';
  }
}
