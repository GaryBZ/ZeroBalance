import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Categoria, CategoriaId } from '../models/finance.models';

interface ApiCategoria {
  id: number;
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/categorias';

  readonly categorias = signal<Categoria[]>([]);

  obtenerCategorias(): void {
    this.http.get<ApiCategoria[]>(this.apiUrl).subscribe({
      next: (categorias) => {
        this.categorias.set(categorias.map((categoria) => ({
          id: this.categoriaId(categoria.nombre),
          nombre: categoria.nombre,
        })));
      },
      error: (error: unknown) => {
        console.error('No se pudieron cargar las categorías', error);
      },
    });
  }

  private categoriaId(nombre: string): CategoriaId {
    const id = nombre.trim().toLowerCase();
    if (id === 'alquiler' || id === 'comida' || id === 'ocio' || id === 'servicios') {
      return id;
    }
    return 'servicios';
  }
}
