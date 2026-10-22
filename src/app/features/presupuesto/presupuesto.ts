import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Categoria,
  CategoriaId,
  Presupuesto as PresupuestoModel,
} from '../../core/models/finance.models';
import { PresupuestoService } from '../../core/services/presupuesto.service';
import { CategoriaService } from '../../core/services/categoria.service';

@Component({
  selector: 'app-presupuesto',
  imports: [CommonModule, CurrencyPipe, FormsModule],
  templateUrl: './presupuesto.html',
  styleUrl: './presupuesto.css',
})
export class Presupuesto {
  private readonly presupuestoService = inject(PresupuestoService);
  private readonly categoriaService = inject(CategoriaService);

  protected readonly categorias = this.categoriaService.categorias;
  protected readonly presupuesto = this.presupuestoService.presupuesto;
  protected readonly nuevoIngresoBase = signal<number | null>(
    this.presupuesto().ingresoBase,
  );
  protected readonly nuevosLimites = signal<
    Partial<Record<CategoriaId, number | null>>
  >({});

  protected readonly totalAsignado = computed(() =>
    Object.values(this.presupuesto().limitesPorCategoria).reduce(
      (total, limite) => total + limite,
      0,
    ),
  );
  protected readonly presupuestoExcedido = computed(
    () => this.totalAsignado() > this.presupuesto().ingresoBase,
  );
  protected readonly restante = computed(
    () => this.presupuesto().ingresoBase - this.totalAsignado(),
  );
  protected readonly porcentajeAsignado = computed(() =>
    Math.min(
      100,
      (this.totalAsignado() / (this.presupuesto().ingresoBase || 1)) * 100,
    ),
  );

  constructor() {
    effect(() => {
      const ingresoBase = this.presupuesto().ingresoBase;
      if (this.nuevoIngresoBase() === 0) {
        this.nuevoIngresoBase.set(ingresoBase);
      }
    });
    this.categoriaService.obtenerCategorias();
    this.presupuestoService.obtenerPresupuesto();
  }

  protected actualizarIngresoBase(): void {
    const ingresoBase = this.nuevoIngresoBase();

    if (ingresoBase === null || !Number.isFinite(ingresoBase) || ingresoBase < 0) {
      return;
    }

    this.guardarPresupuesto(ingresoBase, this.presupuesto().limitesPorCategoria);
  }

  protected actualizarLimite(categoriaId: CategoriaId): void {
    const limite = this.nuevosLimites()[categoriaId];

    if (limite === null || limite === undefined || !Number.isFinite(limite) || limite < 0) {
      return;
    }

    this.guardarPresupuesto(this.presupuesto().ingresoBase, {
      ...this.presupuesto().limitesPorCategoria,
      [categoriaId]: limite,
    });
    this.nuevosLimites.update((limites) => ({
      ...limites,
      [categoriaId]: null,
    }));
  }

  protected limiteActual(categoriaId: CategoriaId): number {
    return this.presupuesto().limitesPorCategoria[categoriaId];
  }

  protected nuevoLimite(categoriaId: CategoriaId): number | null {
    return this.nuevosLimites()[categoriaId] ?? this.limiteActual(categoriaId);
  }

  protected cambiarIngresoBase(valor: string): void {
    this.nuevoIngresoBase.set(valor === '' ? null : Number(valor));
  }

  protected cambiarLimite(categoriaId: CategoriaId, valor: string): void {
    this.nuevosLimites.update((limites) => ({
      ...limites,
      [categoriaId]: valor === '' ? null : Number(valor),
    }));
  }

  private guardarPresupuesto(
    ingresoBase: number,
    limitesPorCategoria: Record<CategoriaId, number>,
  ): void {
    this.presupuestoService.actualizarPresupuestoLocal(
      ingresoBase,
      limitesPorCategoria,
    );
    this.nuevoIngresoBase.set(ingresoBase);
  }
}
