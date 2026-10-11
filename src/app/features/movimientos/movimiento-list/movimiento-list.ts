import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  Categoria,
  CategoriaId,
  Movimiento,
  TipoMovimiento,
} from '../../../core/models/finance.models';
import { Finance } from '../../../core/services/finance';

@Component({
  selector: 'app-movimiento-list',
  imports: [CommonModule, CurrencyPipe, DatePipe, ReactiveFormsModule],
  templateUrl: './movimiento-list.html',
  styleUrl: './movimiento-list.css',
})
export class MovimientoList {
  private readonly finance = inject(Finance);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly categorias: Categoria[] =
    this.finance.obtenerCategorias();
  protected readonly movimientos = signal<Movimiento[]>(
    this.finance.obtenerMovimientos(),
  );

  protected readonly movimientoForm = this.formBuilder.nonNullable.group({
    monto: [0, [Validators.required, Validators.min(0.01)]],
    descripcion: ['', [Validators.required, Validators.minLength(2)]],
    tipo: ['gasto' as TipoMovimiento, Validators.required],
    categoriaId: ['comida' as CategoriaId, Validators.required],
  });

  protected guardarMovimiento(): void {
    if (this.movimientoForm.invalid) {
      this.movimientoForm.markAllAsTouched();
      return;
    }

    const datos = this.movimientoForm.getRawValue();
    this.finance.registrarMovimiento(
      datos.monto,
      datos.descripcion.trim(),
      datos.tipo,
      datos.categoriaId,
    );
    this.movimientos.set(this.finance.obtenerMovimientos());
    this.movimientoForm.reset({
      monto: 0,
      descripcion: '',
      tipo: 'gasto',
      categoriaId: 'comida',
    });
  }

  protected nombreCategoria(categoriaId: CategoriaId): string {
    return this.categorias.find((categoria) => categoria.id === categoriaId)?.nombre ?? categoriaId;
  }

  protected esIngreso(movimiento: Movimiento): boolean {
    return movimiento.tipo === 'ingreso';
  }
}
