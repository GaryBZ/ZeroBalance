import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ObjetivoAhorro } from '../../core/models/finance.models';
import { ObjetivoService } from '../../core/services/objetivo.service';

@Component({
  selector: 'app-objetivos',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './objetivos.html',
  styleUrl: './objetivos.css',
})
export class Objetivos {
  private readonly objetivoService = inject(ObjetivoService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly objetivos = this.objetivoService.objetivos;
  protected readonly abonos = signal<Record<string, number | null>>({});
  protected readonly objetivoEditando = signal<string | null>(null);

  protected readonly objetivoForm = this.formBuilder.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    montoObjetivo: [0, [Validators.required, Validators.min(0.01)]],
    montoAhorrado: [0, [Validators.required, Validators.min(0)]],
    fechaLimite: [''],
    estado: ['activo' as ObjetivoAhorro['estado'], Validators.required],
  });

  constructor() {
    this.objetivoService.obtenerObjetivos();
  }

  protected porcentaje(objetivo: ObjetivoAhorro): number {
    if (objetivo.montoObjetivo <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.round((objetivo.montoAhorrado / objetivo.montoObjetivo) * 100),
    );
  }

  protected estaCompletado(objetivo: ObjetivoAhorro): boolean {
    return objetivo.montoAhorrado >= objetivo.montoObjetivo;
  }

  protected crearObjetivo(): void {
    if (this.objetivoForm.invalid) {
      this.objetivoForm.markAllAsTouched();
      return;
    }

    const { nombre, montoObjetivo, montoAhorrado, fechaLimite, estado } =
      this.objetivoForm.getRawValue();
    const objetivo = {
      nombre: nombre.trim(),
      montoObjetivo,
      montoAhorrado,
      fechaLimite: fechaLimite || null,
      estado,
    };
    const id = this.objetivoEditando();

    if (id === null) {
      this.objetivoService.agregarObjetivo(objetivo);
    } else {
      this.objetivoService.actualizarObjetivo(id, objetivo);
      this.objetivoEditando.set(null);
    }

    this.objetivoForm.reset({
      nombre: '',
      montoObjetivo: 0,
      montoAhorrado: 0,
      fechaLimite: '',
      estado: 'activo',
    });
  }

  protected abonar(objetivo: ObjetivoAhorro): void {
    if (this.estaCompletado(objetivo)) {
      return;
    }

    const abono = this.abonos()[objetivo.id] ?? 0;
    if (abono <= 0 || objetivo.montoAhorrado + abono > objetivo.montoObjetivo) {
      return;
    }

    this.objetivoService.actualizarAhorroLocal(
      objetivo.id,
      objetivo.montoAhorrado + abono,
    );
    this.abonos.update((abonos) => ({ ...abonos, [objetivo.id]: null }));
  }

  protected editar(objetivo: ObjetivoAhorro): void {
    this.objetivoEditando.set(objetivo.id);
    this.objetivoForm.setValue({
      nombre: objetivo.nombre,
      montoObjetivo: objetivo.montoObjetivo,
      montoAhorrado: objetivo.montoAhorrado,
      fechaLimite: objetivo.fechaLimite ?? '',
      estado: objetivo.estado,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected cancelarEdicion(): void {
    this.objetivoEditando.set(null);
    this.objetivoForm.reset({
      nombre: '',
      montoObjetivo: 0,
      montoAhorrado: 0,
      fechaLimite: '',
      estado: 'activo',
    });
  }

  protected eliminar(objetivo: ObjetivoAhorro): void {
    if (!window.confirm(`¿Eliminar el objetivo "${objetivo.nombre}"?`)) {
      return;
    }

    this.objetivoService.eliminarObjetivo(objetivo.id);
  }

  protected actualizarAbono(id: string, valor: string): void {
    const abono = valor === '' ? null : Number(valor);
    this.abonos.update((abonos) => ({ ...abonos, [id]: abono }));
  }

  protected proyeccion(objetivo: ObjetivoAhorro): string | null {
    const restante = objetivo.montoObjetivo - objetivo.montoAhorrado;
    if (restante <= 0) {
      return 'Completada';
    }
    if (objetivo.promedioMensual <= 0) {
      return null;
    }
    const fecha = new Date();
    fecha.setMonth(fecha.getMonth() + Math.ceil(restante / objetivo.promedioMensual));
    return fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }
}
