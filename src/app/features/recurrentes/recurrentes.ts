import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriaId } from '../../core/models/finance.models';
import { CategoriaService } from '../../core/services/categoria.service';
import { Frecuencia, GastoRecurrente, RecurrenteService } from '../../core/services/recurrente.service';

@Component({
  selector: 'app-recurrentes',
  imports: [CommonModule, CurrencyPipe, DatePipe, ReactiveFormsModule],
  templateUrl: './recurrentes.html',
  styleUrl: './recurrentes.css',
})
export class Recurrentes {
  private readonly service = inject(RecurrenteService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly fb = inject(FormBuilder);
  protected readonly gastos = this.service.gastos;
  protected readonly categorias = this.categoriaService.categorias;
  protected readonly editando = signal<string | null>(null);
  protected readonly form = this.fb.nonNullable.group({
    descripcion: ['', [Validators.required, Validators.minLength(2)]],
    monto: [0, [Validators.required, Validators.min(0.01)]],
    categoriaId: ['servicios' as CategoriaId, Validators.required],
    frecuencia: ['mensual' as Frecuencia, Validators.required],
    proximaFecha: [new Date().toISOString().slice(0, 10), Validators.required],
    activo: [true],
  });

  constructor() {
    this.categoriaService.obtenerCategorias();
    this.service.listar();
  }

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const input = { ...value };
    const id = this.editando();
    if (id) this.service.actualizar(id, input);
    else this.service.crear(input);
    this.cancelar();
  }

  protected editar(gasto: GastoRecurrente): void {
    this.editando.set(gasto.id);
    this.form.setValue({
      descripcion: gasto.descripcion,
      monto: gasto.monto,
      categoriaId: gasto.categoriaId,
      frecuencia: gasto.frecuencia,
      proximaFecha: gasto.proximaFecha.slice(0, 10),
      activo: gasto.activo,
    });
  }

  protected cancelar(): void {
    this.editando.set(null);
    this.form.reset({
      descripcion: '',
      monto: 0,
      categoriaId: 'servicios',
      frecuencia: 'mensual',
      proximaFecha: new Date().toISOString().slice(0, 10),
      activo: true,
    });
  }

  protected eliminar(gasto: GastoRecurrente): void {
    if (window.confirm(`¿Eliminar "${gasto.descripcion}"?`)) this.service.eliminar(gasto.id);
  }

  protected categoria(id: CategoriaId): string {
    return this.categorias().find((categoria) => categoria.id === id)?.nombre ?? id;
  }

  protected frecuenciaTexto(frecuencia: Frecuencia): string {
    return frecuencia === 'semanal' ? 'Semanal' : frecuencia === 'anual' ? 'Anual' : 'Mensual';
  }

  protected proximos(): GastoRecurrente[] {
    const limite = new Date();
    limite.setDate(limite.getDate() + 30);
    return this.gastos().filter((gasto) => gasto.activo && new Date(gasto.proximaFecha) <= limite);
  }
}
