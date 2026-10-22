import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { CategoriaId } from '../models/finance.models';

export type Frecuencia = 'semanal' | 'mensual' | 'anual';

export interface GastoRecurrente {
  id: string;
  descripcion: string;
  monto: number;
  categoriaId: CategoriaId;
  frecuencia: Frecuencia;
  proximaFecha: string;
  activo: boolean;
}

export type GastoRecurrenteInput = Omit<GastoRecurrente, 'id'>;

interface ApiRecurrente {
  id: number;
  descripcion: string;
  monto: number | string;
  categoria_id: number | null;
  frecuencia: Frecuencia;
  proxima_fecha: string;
  activo: boolean;
}

@Injectable({ providedIn: 'root' })
export class RecurrenteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/recurrentes';
  readonly gastos = signal<GastoRecurrente[]>([]);

  listar(): void {
    this.http.get<ApiRecurrente[]>(this.apiUrl).subscribe({
      next: (gastos) => this.gastos.set(gastos.map((gasto) => this.mapear(gasto))),
      error: (error: unknown) => console.error('No se pudieron cargar los gastos recurrentes', error),
    });
  }

  crear(input: GastoRecurrenteInput): void {
    this.http.post<ApiRecurrente>(this.apiUrl, this.payload(input)).subscribe({
      next: () => this.listar(),
      error: (error: unknown) => console.error('No se pudo crear el gasto recurrente', error),
    });
  }

  actualizar(id: string, input: GastoRecurrenteInput): void {
    this.http.put<ApiRecurrente>(`${this.apiUrl}/${id}`, this.payload(input)).subscribe({
      next: () => this.listar(),
      error: (error: unknown) => console.error('No se pudo actualizar el gasto recurrente', error),
    });
  }

  eliminar(id: string): void {
    this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe({
      next: () => this.gastos.update((gastos) => gastos.filter((gasto) => gasto.id !== id)),
      error: (error: unknown) => console.error('No se pudo eliminar el gasto recurrente', error),
    });
  }

  private payload(input: GastoRecurrenteInput) {
    return {
      descripcion: input.descripcion,
      monto: input.monto,
      categoria_id: this.categoriaIdNumerico(input.categoriaId),
      frecuencia: input.frecuencia,
      proxima_fecha: input.proximaFecha,
      activo: input.activo,
    };
  }

  private mapear(gasto: ApiRecurrente): GastoRecurrente {
    return {
      id: String(gasto.id),
      descripcion: gasto.descripcion,
      monto: Number(gasto.monto),
      categoriaId: this.categoriaIdTexto(gasto.categoria_id),
      frecuencia: gasto.frecuencia,
      proximaFecha: gasto.proxima_fecha,
      activo: gasto.activo,
    };
  }

  private categoriaIdTexto(id: number | null): CategoriaId {
    return ({ 1: 'alquiler', 2: 'comida', 3: 'ocio', 4: 'servicios' } as Record<number, CategoriaId>)[id ?? 4] ?? 'servicios';
  }

  private categoriaIdNumerico(id: CategoriaId): number {
    return ({ alquiler: 1, comida: 2, ocio: 3, servicios: 4 } as Record<CategoriaId, number>)[id];
  }
}
