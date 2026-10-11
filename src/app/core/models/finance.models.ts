export type CategoriaId = 'alquiler' | 'comida' | 'ocio' | 'servicios';

export interface Categoria {
  id: CategoriaId;
  nombre: string;
}

export interface Presupuesto {
  ingresoBase: number;
  limitesPorCategoria: Record<CategoriaId, number>;
}

export interface ObjetivoAhorro {
  id: string;
  nombre: string;
  montoObjetivo: number;
  montoAhorrado: number;
  fechaCreacion: string;
}
