import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import {
  CategoriaId,
  Movimiento,
  TipoMovimiento,
} from '../models/finance.models';

interface ApiMovimiento {
  id: number;
  tipo: TipoMovimiento;
  monto: number | string;
  descripcion: string;
  fecha: string;
  categoria_id: number | null;
}

export interface MovimientoInput {
  monto: number;
  descripcion: string;
  tipo: TipoMovimiento;
  categoriaId: CategoriaId;
}

@Injectable({ providedIn: 'root' })
export class MovimientoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/movimientos';

  readonly movimientos = signal<Movimiento[]>([]);

  obtenerMovimientos(): void {
    this.http.get<ApiMovimiento[]>(this.apiUrl).subscribe({
      next: (movimientos) => {
        this.movimientos.set(
          movimientos.map((movimiento) => this.mapearMovimiento(movimiento)),
        );
      },
      error: (error: unknown) => {
        console.error('No se pudieron cargar los movimientos', error);
      },
    });
  }

  agregarMovimiento(movimiento: MovimientoInput): void {
    this.http.post<ApiMovimiento>(this.apiUrl, this.payload(movimiento)).subscribe({
      next: () => this.obtenerMovimientos(),
      error: (error: unknown) => {
        console.error('No se pudo agregar el movimiento', error);
      },
    });
  }

  actualizarMovimiento(id: string, movimiento: MovimientoInput): void {
    this.http.put<ApiMovimiento>(`${this.apiUrl}/${id}`, this.payload(movimiento)).subscribe({
      next: () => this.obtenerMovimientos(),
      error: (error: unknown) => {
        console.error('No se pudo actualizar el movimiento', error);
      },
    });
  }

  eliminarMovimiento(id: string): void {
    this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe({
      next: () => this.movimientos.update((movimientos) =>
        movimientos.filter((movimiento) => movimiento.id !== id),
      ),
      error: (error: unknown) => {
        console.error('No se pudo eliminar el movimiento', error);
      },
    });
  }

  private payload(movimiento: MovimientoInput): {
    tipo: TipoMovimiento;
    monto: number;
    descripcion: string;
    categoria_id: number;
  } {
    return {
      tipo: movimiento.tipo,
      monto: movimiento.monto,
      descripcion: movimiento.descripcion,
      categoria_id: this.categoriaIdNumerico(movimiento.categoriaId),
    };
  }

  private mapearMovimiento(movimiento: ApiMovimiento): Movimiento {
    return {
      id: String(movimiento.id),
      monto: Number(movimiento.monto),
      descripcion: movimiento.descripcion,
      tipo: movimiento.tipo,
      categoriaId: this.categoriaIdTexto(movimiento.categoria_id),
      fecha: movimiento.fecha,
    };
  }

  private categoriaIdTexto(categoriaId: number | null): CategoriaId {
    const categorias: Record<number, CategoriaId> = {
      1: 'alquiler',
      2: 'comida',
      3: 'ocio',
      4: 'servicios',
    };

    return categorias[categoriaId ?? 2] ?? 'comida';
  }

  private categoriaIdNumerico(categoriaId: CategoriaId): number {
    const categorias: Record<CategoriaId, number> = {
      alquiler: 1,
      comida: 2,
      ocio: 3,
      servicios: 4,
    };

    return categorias[categoriaId];
  }
}
