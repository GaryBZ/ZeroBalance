import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { ObjetivoAhorro } from '../models/finance.models';

interface ApiObjetivo {
  id: number;
  nombre: string;
  monto_meta: number | string;
  monto_actual: number | string;
  fecha_limite: string | null;
  estado: ObjetivoAhorro['estado'];
  promedio_mensual: number | string;
}

export interface ObjetivoInput {
  nombre: string;
  montoObjetivo: number;
  montoAhorrado?: number;
  fechaLimite?: string | null;
  estado?: ObjetivoAhorro['estado'];
}

@Injectable({ providedIn: 'root' })
export class ObjetivoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/objetivos';

  readonly objetivos = signal<ObjetivoAhorro[]>([]);

  obtenerObjetivos(): void {
    this.http.get<ApiObjetivo[]>(this.apiUrl).subscribe({
      next: (objetivos) => {
        this.objetivos.set(objetivos.map((objetivo) => this.mapearObjetivo(objetivo)));
      },
      error: (error: unknown) => {
        console.error('No se pudieron cargar los objetivos', error);
      },
    });
  }

  agregarObjetivo(objetivo: ObjetivoInput): void {
    this.http.post<ApiObjetivo>(this.apiUrl, {
      nombre: objetivo.nombre,
      monto_meta: objetivo.montoObjetivo,
      monto_actual: objetivo.montoAhorrado ?? 0,
      fecha_limite: objetivo.fechaLimite ?? null,
      estado: objetivo.estado ?? 'activo',
    }).subscribe({
      next: () => this.obtenerObjetivos(),
      error: (error: unknown) => {
        console.error('No se pudo crear el objetivo', error);
      },
    });
  }

  actualizarObjetivo(id: string, objetivo: ObjetivoInput): void {
    this.http.put<ApiObjetivo>(`${this.apiUrl}/${id}`, {
      nombre: objetivo.nombre,
      monto_meta: objetivo.montoObjetivo,
      monto_actual: objetivo.montoAhorrado ?? 0,
      fecha_limite: objetivo.fechaLimite ?? null,
      estado: objetivo.estado ?? 'activo',
    }).subscribe({
      next: () => this.obtenerObjetivos(),
      error: (error: unknown) => {
        console.error('No se pudo actualizar el objetivo', error);
      },
    });
  }

  eliminarObjetivo(id: string): void {
    this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.objetivos.update((objetivos) =>
          objetivos.filter((objetivo) => objetivo.id !== id),
        );
      },
      error: (error: unknown) => {
        console.error('No se pudo eliminar el objetivo', error);
      },
    });
  }

  actualizarAhorroLocal(id: string, montoAhorrado: number): void {
    this.http.patch<ApiObjetivo>(`${this.apiUrl}/${id}/ahorro`, {
      monto_actual: montoAhorrado,
    }).subscribe({
      next: () => this.obtenerObjetivos(),
      error: (error: unknown) => {
        console.error('No se pudo actualizar el ahorro del objetivo', error);
      },
    });
  }

  private mapearObjetivo(objetivo: ApiObjetivo): ObjetivoAhorro {
    return {
      id: String(objetivo.id),
      nombre: objetivo.nombre,
      montoObjetivo: Number(objetivo.monto_meta),
      montoAhorrado: Number(objetivo.monto_actual),
      fechaCreacion: '',
      fechaLimite: objetivo.fecha_limite,
      estado: objetivo.estado,
      promedioMensual: Number(objetivo.promedio_mensual),
    };
  }
}
