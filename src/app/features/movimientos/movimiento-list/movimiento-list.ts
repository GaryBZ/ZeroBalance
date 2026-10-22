import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import {
  Component,
  ElementRef,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import * as Tesseract from 'tesseract.js';
import {
  Categoria,
  CategoriaId,
  Movimiento,
  TipoMovimiento,
} from '../../../core/models/finance.models';
import { MovimientoService } from '../../../core/services/movimiento.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { Toast } from '../../../core/services/toast';

@Component({
  selector: 'app-movimiento-list',
  imports: [CommonModule, CurrencyPipe, DatePipe, ReactiveFormsModule],
  templateUrl: './movimiento-list.html',
  styleUrl: './movimiento-list.css',
})
export class MovimientoList {
  private readonly movimientosPorPagina = 7;
  private readonly movimientoService = inject(MovimientoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly toast = inject(Toast);

  protected readonly categorias = this.categoriaService.categorias;
  protected readonly movimientos = this.movimientoService.movimientos;
  protected readonly textoBusqueda = signal('');
  protected readonly filtroTipo = signal<'todos' | TipoMovimiento>('todos');
  protected readonly filtroCategoria = signal<'todas' | CategoriaId>('todas');
  protected readonly movimientoEditando = signal<string | null>(null);
  protected readonly movimientosFiltrados = computed(() => {
    const texto = this.textoBusqueda().trim().toLowerCase();
    const tipo = this.filtroTipo();
    const categoria = this.filtroCategoria();

    return this.movimientos().filter((movimiento) =>
      (!texto || movimiento.descripcion.toLowerCase().includes(texto)) &&
      (tipo === 'todos' || movimiento.tipo === tipo) &&
      (categoria === 'todas' || movimiento.categoriaId === categoria),
    );
  });
  protected readonly paginaActual = signal(1);
  protected readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.movimientosFiltrados().length / this.movimientosPorPagina)),
  );
  protected readonly movimientosPaginados = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.movimientosPorPagina;
    return     this.movimientosFiltrados().slice(inicio, inicio + this.movimientosPorPagina);
  });
  protected readonly escaneando = signal(false);
  protected readonly modalEscaneoAbierto = signal(false);
  protected readonly archivoArrastrado = signal(false);

  @ViewChild('archivoRecibo') private archivoRecibo?: ElementRef<HTMLInputElement>;

  protected readonly movimientoForm = this.formBuilder.nonNullable.group({
    monto: [0, [Validators.required, Validators.min(0.01)]],
    descripcion: ['', [Validators.required, Validators.minLength(2)]],
    tipo: ['gasto' as TipoMovimiento, Validators.required],
    categoriaId: ['comida' as CategoriaId, Validators.required],
  });

  constructor() {
    this.categoriaService.obtenerCategorias();
    this.movimientoService.obtenerMovimientos();
  }

  protected guardarMovimiento(): void {
    if (this.movimientoForm.invalid) {
      this.movimientoForm.markAllAsTouched();
      this.toast.error('Revisa el monto y la descripción antes de guardar.');
      return;
    }

    const datos = this.movimientoForm.getRawValue();
    const movimiento = {
      monto: datos.monto,
      descripcion: datos.descripcion.trim(),
      tipo: datos.tipo,
      categoriaId: datos.categoriaId,
    };
    const id = this.movimientoEditando();
    if (id === null) {
      this.movimientoService.agregarMovimiento(movimiento);
      this.toast.success('Movimiento guardado correctamente.');
    } else {
      this.movimientoService.actualizarMovimiento(id, movimiento);
      this.movimientoEditando.set(null);
      this.toast.success('Movimiento actualizado correctamente.');
    }
    this.paginaActual.set(1);
    this.movimientoForm.reset({
      monto: 0,
      descripcion: '',
      tipo: 'gasto',
      categoriaId: 'comida',
    });
  }

  protected editarMovimiento(movimiento: Movimiento): void {
    this.movimientoEditando.set(movimiento.id);
    this.movimientoForm.setValue({
      monto: movimiento.monto,
      descripcion: movimiento.descripcion,
      tipo: movimiento.tipo,
      categoriaId: movimiento.categoriaId,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected cancelarEdicion(): void {
    this.movimientoEditando.set(null);
    this.movimientoForm.reset({
      monto: 0,
      descripcion: '',
      tipo: 'gasto',
      categoriaId: 'comida',
    });
  }

  protected eliminarMovimiento(movimiento: Movimiento): void {
    if (!window.confirm(`¿Eliminar "${movimiento.descripcion}"?`)) {
      return;
    }
    this.movimientoService.eliminarMovimiento(movimiento.id);
    this.toast.success('Movimiento eliminado correctamente.');
  }

  protected actualizarBusqueda(valor: string): void {
    this.textoBusqueda.set(valor);
    this.paginaActual.set(1);
  }

  protected actualizarTipo(valor: string): void {
    this.filtroTipo.set(valor as 'todos' | TipoMovimiento);
    this.paginaActual.set(1);
  }

  protected actualizarCategoria(valor: string): void {
    this.filtroCategoria.set(valor as 'todas' | CategoriaId);
    this.paginaActual.set(1);
  }

  protected irAPagina(pagina: number): void {
    const paginaValida = Math.min(Math.max(pagina, 1), this.totalPaginas());
    this.paginaActual.set(paginaValida);
  }

  protected paginaAnterior(): void {
    this.irAPagina(this.paginaActual() - 1);
  }

  protected paginaSiguiente(): void {
    this.irAPagina(this.paginaActual() + 1);
  }

  protected abrirModalEscaneo(): void {
    this.modalEscaneoAbierto.set(true);
  }

  protected cerrarModalEscaneo(): void {
    if (this.escaneando()) {
      return;
    }

    this.modalEscaneoAbierto.set(false);
  }

  protected abrirSelectorArchivo(): void {
    this.archivoRecibo?.nativeElement.click();
  }

  protected marcarArrastre(event: DragEvent, activo: boolean): void {
    event.preventDefault();
    event.stopPropagation();
    this.archivoArrastrado.set(activo);
  }

  protected async soltarRecibo(event: DragEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    this.archivoArrastrado.set(false);
    const imagen = event.dataTransfer?.files[0];
    await this.procesarArchivo(imagen);
  }

  protected async escanearRecibo(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    await this.procesarArchivo(input.files?.[0]);
    input.value = '';
  }

  private async procesarArchivo(imagen: File | undefined): Promise<void> {
    if (!imagen) {
      return;
    }

    if (!imagen.type.startsWith('image/')) {
      this.toast.error('Selecciona un archivo de imagen válido.');
      return;
    }

    await this.procesarImagen(imagen);
  }

  private async procesarImagen(imagen: Blob): Promise<void> {
    this.escaneando.set(true);
    this.toast.success('Escaneando...');

    try {
      const resultado = await Tesseract.recognize(imagen, 'spa');
      const confianza = resultado.data.confidence;

      if (confianza < 40) {
        this.toast.error(
          'La imagen no se leyó con suficiente claridad. Usa una foto nítida y bien iluminada.',
        );
        return;
      }

      const monto = this.extraerTotal(resultado.data.text);

      if (monto === null) {
        this.toast.error('No encontramos un total en el recibo.');
        return;
      }

      const categoriaId = this.detectarCategoria(resultado.data.text);
      this.movimientoForm.patchValue({
        monto,
        descripcion: 'Factura escaneada',
        tipo: 'gasto',
      });
      if (categoriaId) {
        this.movimientoForm.controls.categoriaId.setValue(categoriaId);
      }
      this.toast.success('¡Escaneo exitoso!');
    } catch {
      this.toast.error('No pudimos leer el recibo. Intenta con una imagen más nítida.');
    } finally {
      this.escaneando.set(false);
      this.modalEscaneoAbierto.set(false);
    }
  }

  private extraerTotal(texto: string): number | null {
    const lineasConTotal = texto
      .split(/\r?\n/)
      .filter((linea) => /\btotal\b/i.test(linea));
    const textoObjetivo = lineasConTotal.length > 0
      ? lineasConTotal.join(' ')
      : texto;
    const importes = textoObjetivo.match(
      /(?:[$€£]\s*)?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})|\d+(?:[.,]\d{2}))/g,
    ) ?? [];
    const montos = importes
      .map((importe) => this.normalizarImporte(importe))
      .filter((importe): importe is number => importe !== null);

    return montos.length > 0 ? Math.max(...montos) : null;
  }

  private normalizarImporte(valor: string): number | null {
    const limpio = valor.replace(/[^\d.,]/g, '');
    const ultimoPunto = limpio.lastIndexOf('.');
    const ultimaComa = limpio.lastIndexOf(',');

    if (ultimoPunto !== -1 && ultimaComa !== -1) {
      const separadorDecimal = ultimoPunto > ultimaComa ? '.' : ',';
      const separadorMiles = separadorDecimal === '.' ? ',' : '.';
      return this.convertirNumero(
        limpio.replaceAll(separadorMiles, '').replace(separadorDecimal, '.'),
      );
    }

    if (ultimaComa !== -1) {
      const partes = limpio.split(',');
      return this.convertirNumero(
        partes[partes.length - 1].length === 2
          ? limpio.replace(',', '.')
          : limpio.replaceAll(',', ''),
      );
    }

    const partes = limpio.split('.');
    return this.convertirNumero(
      partes[partes.length - 1].length === 2
        ? limpio
        : limpio.replaceAll('.', ''),
    );
  }

  private convertirNumero(valor: string): number | null {
    const numero = Number(valor);
    return Number.isFinite(numero) && numero > 0 ? numero : null;
  }

  private detectarCategoria(texto: string): CategoriaId | null {
    const contenido = texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const puntuaciones: Record<CategoriaId, number> = {
      alquiler: 0,
      comida: 0,
      ocio: 0,
      servicios: 0,
    };

    const sumar = (categoria: CategoriaId, expresion: RegExp, puntos: number): void => {
      if (expresion.test(contenido)) {
        puntuaciones[categoria] += puntos;
      }
    };

    // Comercio y productos específicos tienen prioridad sobre palabras genéricas.
    sumar(
      'ocio',
      /steam|hades\s*(ii|2)?|playstation|ps5|xbox|nintendo|videojuego|video juego|consola|game\b|gaming|dlc|epic games|ubisoft/,
      10,
    );
    sumar(
      'ocio',
      /cine|streaming|netflix|spotify|concierto|entretenimiento/,
      5,
    );
    sumar(
      'ocio',
      /laptop|computadora|ordenador|celular|telefono movil|tablet|monitor|teclado|mouse|electronica|tecnologia|iphone|samsung/,
      6,
    );
    sumar(
      'servicios',
      /kw\/?h|kwh|kilowatt|litros?\s*(consumidos|consumo)|m3|m³|agua|luz|electricidad|gas|internet|telefonia|servicio/,
      6,
    );
    sumar('alquiler', /alquiler|renta|arrendamiento|hipoteca/, 8);
    sumar(
      'comida',
      /supermercado|restaurante|comida|cafe|abarrotes|mercado|walmart|costco|oxxo/,
      5,
    );

    const categoriaGanadora = (Object.entries(puntuaciones) as [CategoriaId, number][])
      .sort(([, puntuacionA], [, puntuacionB]) => puntuacionB - puntuacionA)[0];

    return categoriaGanadora[1] > 0 ? categoriaGanadora[0] : null;
  }

  protected nombreCategoria(categoriaId: CategoriaId): string {
    return this.categorias().find((categoria) => categoria.id === categoriaId)?.nombre ?? categoriaId;
  }

  protected esIngreso(movimiento: Movimiento): boolean {
    return movimiento.tipo === 'ingreso';
  }
}
