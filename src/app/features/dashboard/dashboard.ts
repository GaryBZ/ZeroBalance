import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Movimiento } from '../../core/models/finance.models';
import { MovimientoService } from '../../core/services/movimiento.service';
import { PresupuestoService } from '../../core/services/presupuesto.service';
import { ObjetivoService } from '../../core/services/objetivo.service';
import { CategoriaId } from '../../core/models/finance.models';
import { RecurrenteService } from '../../core/services/recurrente.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly movimientoService = inject(MovimientoService);
  private readonly presupuestoService = inject(PresupuestoService);
  private readonly objetivoService = inject(ObjetivoService);
  private readonly recurrenteService = inject(RecurrenteService);

  protected readonly movimientos = this.movimientoService.movimientos;
  protected readonly presupuesto = this.presupuestoService.presupuesto;
  protected readonly objetivos = this.objetivoService.objetivos;
  protected readonly recurrentes = this.recurrenteService.gastos;
  protected readonly proximosRecurrentes = computed(() => {
    const limite = new Date();
    limite.setDate(limite.getDate() + 30);
    return this.recurrentes()
      .filter((gasto) => gasto.activo && new Date(gasto.proximaFecha) <= limite)
      .slice(0, 3);
  });

  protected readonly ingresos = computed(() =>
    this.movimientos()
      .filter((movimiento) => movimiento.tipo === 'ingreso')
      .reduce((total, movimiento) => total + movimiento.monto, 0),
  );

  protected readonly gastos = computed(() =>
    this.movimientos()
      .filter((movimiento) => movimiento.tipo === 'gasto')
      .reduce((total, movimiento) => total + movimiento.monto, 0),
  );

  protected readonly saldoDisponible = computed(
    () => this.ingresos() - this.gastos(),
  );

  protected readonly porcentajeSaldo = computed(() => {
    const ingresos = this.ingresos();
    return ingresos > 0
      ? Math.min(100, Math.max(0, (this.saldoDisponible() / ingresos) * 100))
      : 0;
  });

  protected readonly movimientosRecientes = computed(() =>
    [...this.movimientos()]
      .sort((a, b) => this.fechaTimestamp(b) - this.fechaTimestamp(a))
      .slice(0, 4),
  );

  protected readonly gastoMensual = computed(() => {
    const ahora = new Date();
    return this.movimientos()
      .filter(
        (movimiento) =>
          movimiento.tipo === 'gasto' &&
          this.fechaTimestamp(movimiento) >=
            new Date(ahora.getFullYear(), ahora.getMonth(), 1).getTime(),
      )
      .reduce((total, movimiento) => total + movimiento.monto, 0);
  });

  protected readonly porcentajePresupuesto = computed(() => {
    const base = this.presupuesto().ingresoBase;
    return base > 0 ? Math.min(100, Math.round((this.gastoMensual() / base) * 100)) : 0;
  });

  protected readonly alertaPresupuesto = computed(() => {
    const porcentaje = this.porcentajePresupuesto();
    if (porcentaje >= 100) {
      return 'Has superado tu presupuesto base mensual.';
    }
    if (porcentaje >= 90) {
      return 'Estás muy cerca de superar tu presupuesto base.';
    }
    if (porcentaje >= 70) {
      return 'Ya utilizaste una parte importante de tu presupuesto.';
    }
    return null;
  });

  protected readonly gastosPorCategoria = computed(() => {
    const categorias: Array<{ id: CategoriaId; nombre: string; total: number }> = [
      { id: 'alquiler', nombre: 'Alquiler', total: 0 },
      { id: 'comida', nombre: 'Comida', total: 0 },
      { id: 'ocio', nombre: 'Ocio', total: 0 },
      { id: 'servicios', nombre: 'Servicios', total: 0 },
    ];

    for (const movimiento of this.movimientos()) {
      if (movimiento.tipo !== 'gasto') {
        continue;
      }
      const categoria = categorias.find((item) => item.id === movimiento.categoriaId);
      if (categoria) {
        categoria.total += movimiento.monto;
      }
    }

    const maximo = Math.max(...categorias.map((categoria) => categoria.total), 1);
    return categorias.map((categoria) => ({
      ...categoria,
      porcentaje: Math.round((categoria.total / maximo) * 100),
    }));
  });

  protected readonly gastosPorMes = computed(() => {
    const ahora = new Date();
    const meses: Array<{
      clave: string;
      nombre: string;
      ingresos: number;
      gastos: number;
    }> = [];

    for (let desplazamiento = 5; desplazamiento >= 0; desplazamiento -= 1) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - desplazamiento, 1);
      meses.push({
        clave: `${fecha.getFullYear()}-${fecha.getMonth()}`,
        nombre: new Intl.DateTimeFormat('es', { month: 'short' })
          .format(fecha)
          .replace('.', ''),
        ingresos: 0,
        gastos: 0,
      });
    }

    for (const movimiento of this.movimientos()) {
      const fecha = new Date(movimiento.fecha);
      const mes = meses.find(
        (item) => item.clave === `${fecha.getFullYear()}-${fecha.getMonth()}`,
      );
      if (!mes) {
        continue;
      }
      if (movimiento.tipo === 'ingreso') {
        mes.ingresos += movimiento.monto;
      } else {
        mes.gastos += movimiento.monto;
      }
    }

    const maximo = Math.max(
      ...meses.flatMap((mes) => [mes.ingresos, mes.gastos]),
      1,
    );
    return meses.map((mes) => ({
      ...mes,
      alturaIngresos: Math.max(4, Math.round((mes.ingresos / maximo) * 100)),
      alturaGastos: Math.max(4, Math.round((mes.gastos / maximo) * 100)),
    }));
  });

  protected readonly totalGastosPorCategoria = computed(() =>
    this.gastosPorCategoria().reduce((total, categoria) => total + categoria.total, 0),
  );

  protected porcentajeDelTotal(total: number): number {
    const totalGastos = this.totalGastosPorCategoria();
    return totalGastos > 0 ? Math.round((total / totalGastos) * 100) : 0;
  }

  protected estiloGraficoCategorias(): string {
    const categorias = this.gastosPorCategoria();
    const porcentajes = categorias.map((categoria) => this.porcentajeDelTotal(categoria.total));
    if (this.totalGastosPorCategoria() === 0) {
      return 'conic-gradient(#374151 0% 100%)';
    }

    const colores = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
    let inicio = 0;
    const segmentos = porcentajes.map((porcentaje, indice) => {
      const fin = inicio + porcentaje;
      const segmento = `${colores[indice]} ${inicio}% ${fin}%`;
      inicio = fin;
      return segmento;
    });
    return `conic-gradient(${segmentos.join(', ')})`;
  }

  protected async exportarMovimientos(): Promise<void> {
    const { default: ExcelJS } = await import('exceljs');
    const fechaGeneracion = new Date();
    const fechaTexto = fechaGeneracion.toLocaleString('es-MX', {
      dateStyle: 'long',
      timeStyle: 'short',
    });
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ZeroBalance';
    workbook.created = fechaGeneracion;
    const hoja = workbook.addWorksheet('Movimientos', {
      views: [{ state: 'frozen', ySplit: 4 }],
    });

    hoja.mergeCells('A1:E1');
    hoja.getCell('A1').value = 'ZeroBalance - Historial de movimientos';
    hoja.getCell('A1').font = { bold: true, size: 16, color: { argb: '111827' } };
    hoja.getCell('A1').alignment = { vertical: 'middle' };
    hoja.getRow(1).height = 28;

    hoja.mergeCells('A2:E2');
    hoja.getCell('A2').value = `Fecha de generación: ${fechaTexto}`;
    hoja.getCell('A2').font = { italic: true, size: 10, color: { argb: '4B5563' } };

    hoja.addRow([]);
    const encabezado = hoja.addRow(['Fecha', 'Tipo', 'Descripción', 'Categoría', 'Monto']);
    encabezado.height = 22;
    encabezado.eachCell((celda) => {
      celda.font = { bold: true, color: { argb: 'FFFFFF' } };
      celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DC2626' } };
      celda.alignment = { vertical: 'middle', horizontal: 'left' };
      celda.border = {
        top: { style: 'thin', color: { argb: '111827' } },
        left: { style: 'thin', color: { argb: '111827' } },
        bottom: { style: 'thin', color: { argb: '111827' } },
        right: { style: 'thin', color: { argb: '111827' } },
      };
    });

    for (const movimiento of this.movimientos()) {
      const fila = hoja.addRow([
        new Date(movimiento.fecha),
        movimiento.tipo === 'ingreso' ? 'Ingreso' : 'Gasto',
        movimiento.descripcion,
        this.descripcionCategoria(movimiento),
        movimiento.monto,
      ]);
      fila.getCell(1).numFmt = 'dd/mm/yyyy hh:mm';
      fila.getCell(5).numFmt = '$#,##0.00';
      fila.getCell(5).alignment = { horizontal: 'right' };
      fila.eachCell((celda) => {
        celda.border = {
          top: { style: 'thin', color: { argb: '9CA3AF' } },
          left: { style: 'thin', color: { argb: '9CA3AF' } },
          bottom: { style: 'thin', color: { argb: '9CA3AF' } },
          right: { style: 'thin', color: { argb: '9CA3AF' } },
        };
      });
    }

    hoja.columns = [
      { key: 'fecha', width: 22 },
      { key: 'tipo', width: 14 },
      { key: 'descripcion', width: 38 },
      { key: 'categoria', width: 18 },
      { key: 'monto', width: 16 },
    ];
    hoja.autoFilter = { from: 'A4', to: 'E4' };

    const buffer = await workbook.xlsx.writeBuffer();
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(
      new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
    );
    enlace.download = `zerobalance-movimientos-${fechaGeneracion.toISOString().slice(0, 10)}.xlsx`;
    enlace.click();
    URL.revokeObjectURL(enlace.href);
  }

  constructor() {
    this.movimientoService.obtenerMovimientos();
    this.presupuestoService.obtenerPresupuesto();
    this.objetivoService.obtenerObjetivos();
    this.recurrenteService.listar();
  }

  protected descripcionCategoria(movimiento: Movimiento): string {
    return movimiento.categoriaId.charAt(0).toUpperCase() +
      movimiento.categoriaId.slice(1);
  }

  protected fechaTimestamp(movimiento: Movimiento): number {
    const timestamp = new Date(movimiento.fecha).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }
}
