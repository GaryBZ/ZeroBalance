import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Finance } from '../../core/services/finance';
import { ObjetivoAhorro } from '../../core/models/finance.models';

@Component({
  selector: 'app-objetivos',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './objetivos.html',
  styleUrl: './objetivos.css',
})
export class Objetivos {
  private readonly finance = inject(Finance);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly objetivos = signal<ObjetivoAhorro[]>(
    this.finance.obtenerObjetivos(),
  );
  protected readonly abonos = signal<Record<string, number | null>>({});

  protected readonly objetivoForm = this.formBuilder.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    montoObjetivo: [0, [Validators.required, Validators.min(0.01)]],
    montoAhorrado: [0, [Validators.required, Validators.min(0)]],
  });

  protected porcentaje(objetivo: ObjetivoAhorro): number {
    if (objetivo.montoObjetivo <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.round((objetivo.montoAhorrado / objetivo.montoObjetivo) * 100),
    );
  }

  protected crearObjetivo(): void {
    if (this.objetivoForm.invalid) {
      this.objetivoForm.markAllAsTouched();
      return;
    }

    const { nombre, montoObjetivo, montoAhorrado } =
      this.objetivoForm.getRawValue();
    this.finance.crearObjetivo(nombre.trim(), montoObjetivo, montoAhorrado);
    this.objetivos.set(this.finance.obtenerObjetivos());
    this.objetivoForm.reset({
      nombre: '',
      montoObjetivo: 0,
      montoAhorrado: 0,
    });
  }

  protected abonar(objetivo: ObjetivoAhorro): void {
    const abono = this.abonos()[objetivo.id] ?? 0;

    if (abono <= 0) {
      return;
    }

    this.finance.actualizarAhorroObjetivo(
      objetivo.id,
      objetivo.montoAhorrado + abono,
    );
    this.objetivos.set(this.finance.obtenerObjetivos());
    this.abonos.update((abonos) => ({ ...abonos, [objetivo.id]: null }));
  }

  protected actualizarAbono(id: string, valor: string): void {
    const abono = valor === '' ? null : Number(valor);
    this.abonos.update((abonos) => ({ ...abonos, [id]: abono }));
  }
}
