import { useState, useEffect, useCallback } from 'react';
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNotification } from '../../../shared/hooks/useNotification';
import ventaService from '../services/venta.service';
import Card from '../../../shared/components/UI/Card';
import Button from '../../../shared/components/UI/Button';
import Modal from '../../../shared/components/UI/Modal';
import ReciboVenta from '../components/ReciboVenta';
import { formatCurrency, formatDateTime } from '../../../shared/utils/formatters';
import {
  Search, FileSpreadsheet, FileText,
  TrendingUp, ShoppingBag, BarChart2,
  ChevronLeft, ChevronRight, Eye,
  Receipt,
} from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────────────────────
const hoy = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const METODO_LABELS = {
  efectivo: 'Efectivo', tarjeta: 'Tarjeta', transferencia: 'Transferencia',
  mixto: 'Mixto', credito: 'Crédito',
};
const METODO_CHIP = {
  efectivo:      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  tarjeta:       'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  transferencia: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  mixto:         'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  credito:       'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};
const ESTADO_CHIP = {
  completada: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelada:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  pendiente:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};
const ESTADO_LABELS = { completada: 'Completada', cancelada: 'Cancelada', pendiente: 'Pendiente' };

const LIMIT = 15;

// ── Componente principal ───────────────────────────────────────────────────────
const HistorialVentas = () => {
  const { showError } = useNotification();

  // estado
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paginacion, setPaginacion] = useState({ page: 1, total: 0, totalPages: 1 });
  const [stats, setStats] = useState({ total_ventas: 0, monto_total: 0, promedio_venta: 0 });
  const [loadingStats, setLoadingStats] = useState(false);

  // filtros
  const [fechaInicio, setFechaInicio] = useState(hoy());
  const [fechaFin, setFechaFin]       = useState(hoy());
  const [fechaError, setFechaError]   = useState('');
  const [estadoFiltro, setEstadoFiltro]       = useState('');
  const [metodoPagoFiltro, setMetodoPagoFiltro] = useState('');
  const [search, setSearch] = useState('');

  const [exportando, setExportando] = useState(false);

  // modal comprobante
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [modalComprobanteOpen, setModalComprobanteOpen] = useState(false);

  // ── Carga de datos ─────────────────────────────────────────────────────────
  const cargarVentas = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await ventaService.getAll({
        page,
        limit: LIMIT,
        fecha_inicio: fechaInicio,
        fecha_fin: `${fechaFin}T23:59:59`,
        ...(estadoFiltro     && { estado: estadoFiltro }),
        ...(metodoPagoFiltro && { metodo_pago: metodoPagoFiltro }),
        ...(search           && { search }),
      });
      setVentas(res.data?.ventas ?? []);
      setPaginacion(prev => ({ ...prev, ...res.data?.pagination, page }));
    } catch (err) {
      showError(err.message || 'Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  }, [fechaInicio, fechaFin, estadoFiltro, metodoPagoFiltro, search, showError]);

  const cargarStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await ventaService.getEstadisticas({
        fecha_inicio: fechaInicio,
        fecha_fin:    `${fechaFin}T23:59:59`,
        ...(estadoFiltro     && { estado:       estadoFiltro }),
        ...(metodoPagoFiltro && { metodo_pago:  metodoPagoFiltro }),
        ...(search           && { search }),
      });
      setStats(res.data ?? { total_ventas: 0, monto_total: 0, promedio_venta: 0 });
    } catch { /* stats no crítico */ } finally {
      setLoadingStats(false);
    }
  }, [fechaInicio, fechaFin, estadoFiltro, metodoPagoFiltro, search]);

  // carga inicial (ventas del día actual)
  useEffect(() => {
    cargarVentas(1);
    cargarStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFechaInicio = (val) => {
    setFechaInicio(val);
    setFechaError(val > fechaFin ? 'La fecha "Desde" no puede ser mayor que la fecha "Hasta".' : '');
  };

  const handleFechaFin = (val) => {
    setFechaFin(val);
    setFechaError(val < fechaInicio ? 'La fecha "Hasta" no puede ser menor que la fecha "Desde".' : '');
  };

  const handleBuscar = () => {
    if (fechaInicio > fechaFin) {
      setFechaError('La fecha "Desde" no puede ser mayor que la fecha "Hasta".');
      return;
    }
    setFechaError('');
    cargarVentas(1);
    cargarStats();
  };

  // ── Fetch de TODOS los registros filtrados (sin paginar) ──────────────────
  const obtenerTodasLasVentas = async () => {
    const res = await ventaService.getAll({
      page: 1,
      limit: 10000,
      fecha_inicio: fechaInicio,
      fecha_fin: `${fechaFin}T23:59:59`,
      ...(estadoFiltro     && { estado: estadoFiltro }),
      ...(metodoPagoFiltro && { metodo_pago: metodoPagoFiltro }),
      ...(search           && { search }),
    });
    return res.data?.ventas ?? [];
  };

  // ── Exportar Excel (.xlsx) — ExcelJS con estilos ──────────────────────────
  const exportarExcel = async () => {
    setExportando(true);
    try {
      const todas = await obtenerTodasLasVentas();

      const wb = new ExcelJS.Workbook();
      wb.creator = 'SuperMapache';
      const ws = wb.addWorksheet('Ventas', { views: [{ showGridLines: false }] });

      // Anchos de columna
      ws.columns = [
        { key: 'numero',  width: 26 },
        { key: 'fecha',   width: 22 },
        { key: 'cajero',  width: 24 },
        { key: 'metodo',  width: 18 },
        { key: 'estado',  width: 16 },
        { key: 'total',   width: 16 },
      ];

      // ── Fila 1: Título ─────────────────────────────────────────────────────
      ws.mergeCells('A1:F1');
      const tituloCell = ws.getCell('A1');
      tituloCell.value = 'Historial de Ventas';
      tituloCell.font  = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FF1E293B' } };
      tituloCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      tituloCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      ws.getRow(1).height = 28;

      // ── Fila 2: Período ────────────────────────────────────────────────────
      ws.mergeCells('A2:F2');
      const periodoCell = ws.getCell('A2');
      periodoCell.value = `Período: ${fechaInicio}  al  ${fechaFin}   ·   ${todas.length} registros`;
      periodoCell.font  = { name: 'Calibri', size: 10, color: { argb: 'FF64748B' } };
      periodoCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      periodoCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      ws.getRow(2).height = 18;

      // ── Fila 3: vacía ──────────────────────────────────────────────────────
      ws.getRow(3).height = 6;

      // ── Fila 4: Encabezados ────────────────────────────────────────────────
      const HEADER_BG   = 'FF0F172A';
      const HEADER_TEXT = 'FFFFFFFF';
      const headers = ['N° Venta', 'Fecha', 'Cajero', 'Método de Pago', 'Estado', 'Total ($)'];
      const headerRow = ws.getRow(4);
      headers.forEach((h, i) => {
        const cell = headerRow.getCell(i + 1);
        cell.value = h;
        cell.font  = { name: 'Calibri', size: 10, bold: true, color: { argb: HEADER_TEXT } };
        cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_BG } };
        cell.alignment = { vertical: 'middle', horizontal: i === 5 ? 'right' : 'left', indent: 1 };
        cell.border = { bottom: { style: 'thin', color: { argb: 'FF334155' } } };
      });
      headerRow.height = 22;

      // ── Filas de datos ─────────────────────────────────────────────────────
      const ROW_ALT  = 'FFF1F5F9';
      const ROW_BASE = 'FFFFFFFF';
      todas.forEach((v, idx) => {
        const row = ws.addRow([
          v.numero_venta,
          formatDateTime(v.fecha_venta),
          v.usuario?.nombre ?? '—',
          METODO_LABELS[v.metodo_pago] ?? v.metodo_pago,
          ESTADO_LABELS[v.estado]     ?? v.estado,
          parseFloat(v.total),
        ]);
        row.height = 18;
        const bg = idx % 2 === 0 ? ROW_BASE : ROW_ALT;
        row.eachCell((cell, colNum) => {
          cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF1E293B' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
          cell.alignment = { vertical: 'middle', horizontal: colNum === 6 ? 'right' : 'left', indent: 1 };
          cell.border = { bottom: { style: 'hair', color: { argb: 'FFE2E8F0' } } };
          if (colNum === 6) cell.numFmt = '#,##0.00';
        });
      });

      // ── Fila vacía ─────────────────────────────────────────────────────────
      ws.addRow([]);

      // ── Fila de total ──────────────────────────────────────────────────────
      const totalRow = ws.addRow(['', '', '', '', 'TOTAL PERÍODO:', parseFloat(stats.monto_total)]);
      totalRow.height = 20;
      totalRow.eachCell((cell, colNum) => {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF0F172A' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
        cell.alignment = { vertical: 'middle', horizontal: colNum === 6 ? 'right' : 'right', indent: 1 };
        cell.border = { top: { style: 'thin', color: { argb: 'FF94A3B8' } } };
        if (colNum === 6) cell.numFmt = '#,##0.00';
      });

      // Descargar
      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `ventas_${fechaInicio}_al_${fechaFin}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      showError(err.message || 'Error al exportar Excel');
    } finally {
      setExportando(false);
    }
  };

  // ── Exportar PDF (descarga automática) ────────────────────────────────────
  const exportarPDF = async () => {
    setExportando(true);
    try {
      const todas = await obtenerTodasLasVentas();
      const doc   = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const PW    = doc.internal.pageSize.getWidth();

      // Banda de encabezado
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, PW, 22, 'F');

      // Título
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('Historial de Ventas', 12, 14);

      // Período (derecha)
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(`${fechaInicio}  –  ${fechaFin}`, PW - 12, 14, { align: 'right' });

      // Barra de resumen
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 22, PW, 10, 'F');
      doc.setFontSize(8);
      doc.setTextColor(203, 213, 225);
      doc.text(`Registros: ${todas.length}`, 12, 28.5);
      doc.text(`Total del período: ${formatCurrency(stats.monto_total)}`, PW - 12, 28.5, { align: 'right' });

      // Tabla
      autoTable(doc, {
        startY: 35,
        head: [['N° Venta', 'Fecha', 'Cajero / Vendedor', 'Método de Pago', 'Estado', 'Total']],
        body: todas.map(v => [
          v.numero_venta,
          formatDateTime(v.fecha_venta),
          v.usuario?.nombre ?? '—',
          METODO_LABELS[v.metodo_pago] ?? v.metodo_pago,
          ESTADO_LABELS[v.estado]      ?? v.estado,
          formatCurrency(v.total),
        ]),
        foot: [['', '', '', '', 'TOTAL PERÍODO', formatCurrency(stats.monto_total)]],
        styles: {
          font: 'helvetica',
          fontSize: 8.5,
          cellPadding: { top: 3.5, bottom: 3.5, left: 5, right: 5 },
          textColor: [30, 41, 59],
          lineColor: [226, 232, 240],
          lineWidth: 0.15,
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: [51, 65, 85],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8,
          halign: 'left',
          cellPadding: { top: 4, bottom: 4, left: 5, right: 5 },
        },
        footStyles: {
          fillColor: [241, 245, 249],
          textColor: [15, 23, 42],
          fontStyle: 'bold',
          fontSize: 8.5,
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 42, font: 'courier', fontSize: 7.5 },
          5: { halign: 'right', fontStyle: 'bold', cellWidth: 28 },
        },
        margin: { left: 12, right: 12 },
        // Número de página en footer
        didDrawPage: ({ doc: d, pageNumber, pageCount }) => {
          const pg = d.internal.pageSize;
          d.setFontSize(7);
          d.setTextColor(148, 163, 184);
          d.text(
            `Página ${pageNumber} de ${pageCount}   ·   SuperMercado Mapache`,
            pg.getWidth() / 2,
            pg.getHeight() - 5,
            { align: 'center' }
          );
        },
      });

      doc.save(`ventas_${fechaInicio}_al_${fechaFin}.pdf`);
    } catch (err) {
      showError(err.message || 'Error al exportar PDF');
    } finally {
      setExportando(false);
    }
  };

  const abrirComprobante = (venta) => { setVentaSeleccionada(venta); setModalComprobanteOpen(true); };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 overflow-y-auto h-full pb-2">

      {/* ── Estadísticas ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <TarjetaStat
          icono={<ShoppingBag className="w-5 h-5 text-primary-600" />}
          fondo="bg-primary-50 dark:bg-primary-900/20"
          etiqueta={
            estadoFiltro === 'cancelada' ? 'Ventas canceladas'           :
            estadoFiltro === 'pendiente' ? 'Ventas pendientes (crédito)' :
            'Ventas completadas'
          }
          valor={loadingStats ? '…' : stats.total_ventas.toLocaleString()}
        />
        <TarjetaStat
          icono={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          fondo="bg-emerald-50 dark:bg-emerald-900/20"
          etiqueta="Monto total del período"
          valor={loadingStats ? '…' : formatCurrency(stats.monto_total)}
          destacado
        />
        <TarjetaStat
          icono={<BarChart2 className="w-5 h-5 text-blue-600" />}
          fondo="bg-blue-50 dark:bg-blue-900/20"
          etiqueta="Promedio por venta"
          valor={loadingStats ? '…' : formatCurrency(stats.promedio_venta)}
        />
      </div>

      {/* ── Filtros ── */}
      <Card className="p-4">
        <div className="flex flex-col gap-3">

          {/* Fechas + selects: grid en móvil, flex en desktop */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 items-end">

            {/* Desde */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Desde</label>
              <input
                type="date" value={fechaInicio}
                onChange={e => handleFechaInicio(e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 dark:[color-scheme:dark] ${
                  fechaError ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-dark-border'
                }`}
              />
            </div>

            {/* Hasta */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Hasta</label>
              <input
                type="date" value={fechaFin}
                onChange={e => handleFechaFin(e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 dark:[color-scheme:dark] ${
                  fechaError ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-dark-border'
                }`}
              />
            </div>

            {/* Estado */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Estado</label>
              <select
                value={estadoFiltro} onChange={e => setEstadoFiltro(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 dark:[color-scheme:dark]"
              >
                <option value="">Todos</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
                <option value="pendiente">Pendiente (crédito)</option>
              </select>
            </div>

            {/* Método */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Método de pago</label>
              <select
                value={metodoPagoFiltro} onChange={e => setMetodoPagoFiltro(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 dark:[color-scheme:dark]"
              >
                <option value="">Todos</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
                <option value="mixto">Mixto</option>
                <option value="credito">Crédito</option>
              </select>
            </div>
          </div>

          {/* Error de rango */}
          {fechaError && (
            <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
              <span className="font-bold">!</span> {fechaError}
            </p>
          )}

          {/* Búsqueda + botones */}
          <div className="flex gap-2 items-end">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Buscar N° venta</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text" value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleBuscar()}
                  placeholder="VENTA-202505-…"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <Button onClick={handleBuscar} disabled={loading || !!fechaError} className="shrink-0">
              <Search size={15} />
              <span className="hidden sm:inline">Buscar</span>
            </Button>
            <Button
              variant="secondary"
              onClick={exportarExcel}
              disabled={paginacion.total === 0 || !!fechaError || exportando}
              title="Exportar a Excel"
              className="shrink-0"
            >
              <FileSpreadsheet size={15} />
              <span className="hidden sm:inline">{exportando ? 'Exportando…' : 'Excel'}</span>
            </Button>
            <Button
              variant="secondary"
              onClick={exportarPDF}
              disabled={paginacion.total === 0 || !!fechaError || exportando}
              title="Exportar a PDF"
              className="shrink-0"
            >
              <FileText size={15} />
              <span className="hidden sm:inline">{exportando ? 'Exportando…' : 'PDF'}</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* ── Contenido: tabla (desktop) + tarjetas (móvil) ── */}
      <Card className="overflow-hidden flex-1 flex flex-col min-h-0">

        {/* Estado vacío / cargando compartido */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 gap-2 text-gray-400 dark:text-gray-500">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Cargando ventas…</span>
          </div>
        ) : ventas.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16">
            <Receipt className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No se encontraron ventas en el período seleccionado.
            </p>
          </div>
        ) : (
          <>
            {/* ── Tabla — solo desktop ── */}
            <div className="hidden sm:block overflow-x-auto flex-1">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gray-50 dark:bg-dark-hover border-b border-gray-200 dark:border-dark-border">
                    {['N° Venta', 'Fecha', 'Cliente', 'Vendedor', 'Método', 'Estado', 'Total', 'Comprobante']
                      .map((col, i) => (
                        <th
                          key={col}
                          className={`px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap ${
                            i === 6 ? 'text-right' : i === 7 ? 'text-center' : 'text-left'
                          }`}
                        >
                          {col}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                  {ventas.map(venta => (
                    <tr key={venta.id} className="hover:bg-gray-50 dark:hover:bg-dark-hover/60 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs bg-gray-100 dark:bg-dark-hover px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">
                          {venta.numero_venta}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap text-xs">
                        {formatDateTime(venta.fecha_venta)}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                        {venta.metodo_pago === 'credito'
                          ? <span className="italic text-amber-600 dark:text-amber-400">Ver créditos</span>
                          : <span>General</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm">
                        {venta.usuario?.nombre ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${METODO_CHIP[venta.metodo_pago] ?? 'bg-gray-100 text-gray-600'}`}>
                          {METODO_LABELS[venta.metodo_pago] ?? venta.metodo_pago}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ESTADO_CHIP[venta.estado] ?? 'bg-gray-100 text-gray-600'}`}>
                          {ESTADO_LABELS[venta.estado] ?? venta.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                        {formatCurrency(venta.total)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => abrirComprobante(venta)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors border border-primary-200 dark:border-primary-800"
                        >
                          <Eye size={13} />
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Tarjetas — solo móvil ── */}
            <div className="sm:hidden divide-y divide-gray-100 dark:divide-dark-border overflow-y-auto flex-1">
              {ventas.map(venta => (
                <div key={venta.id} className="p-4 hover:bg-gray-50 dark:hover:bg-dark-hover/40 transition-colors">
                  {/* Fila superior: N° venta + Total */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono text-xs bg-gray-100 dark:bg-dark-hover px-2 py-1 rounded text-gray-700 dark:text-gray-300 leading-tight">
                      {venta.numero_venta}
                    </span>
                    <span className="text-base font-bold text-gray-900 dark:text-white whitespace-nowrap">
                      {formatCurrency(venta.total)}
                    </span>
                  </div>

                  {/* Fila media: fecha + vendedor */}
                  <div className="flex items-center justify-between gap-2 mb-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatDateTime(venta.fecha_venta)}</span>
                    <span className="truncate text-right">{venta.usuario?.nombre ?? '—'}</span>
                  </div>

                  {/* Fila inferior: badges + botón */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${METODO_CHIP[venta.metodo_pago] ?? 'bg-gray-100 text-gray-600'}`}>
                        {METODO_LABELS[venta.metodo_pago] ?? venta.metodo_pago}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ESTADO_CHIP[venta.estado] ?? 'bg-gray-100 text-gray-600'}`}>
                        {ESTADO_LABELS[venta.estado] ?? venta.estado}
                      </span>
                    </div>
                    <button
                      onClick={() => abrirComprobante(venta)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors border border-primary-200 dark:border-primary-800 shrink-0"
                    >
                      <Eye size={13} />
                      Ver
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Paginación ── */}
        {paginacion.totalPages > 1 && !loading && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-dark-border flex items-center justify-between gap-2 flex-shrink-0">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              <span className="hidden sm:inline">Mostrando </span>
              {(paginacion.page - 1) * LIMIT + 1}–{Math.min(paginacion.page * LIMIT, paginacion.total)}
              {' '}de{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-300">{paginacion.total}</span>
            </span>

            {/* Móvil: solo flechas + página actual */}
            <div className="flex sm:hidden items-center gap-2">
              <BtnPagina onClick={() => cargarVentas(paginacion.page - 1)} disabled={paginacion.page === 1 || loading}>
                <ChevronLeft size={15} />
              </BtnPagina>
              <span className="text-xs text-gray-600 dark:text-gray-400 px-1">
                {paginacion.page} / {paginacion.totalPages}
              </span>
              <BtnPagina onClick={() => cargarVentas(paginacion.page + 1)} disabled={paginacion.page === paginacion.totalPages || loading}>
                <ChevronRight size={15} />
              </BtnPagina>
            </div>

            {/* Desktop: paginación completa con números */}
            <div className="hidden sm:flex items-center gap-1">
              <BtnPagina onClick={() => cargarVentas(paginacion.page - 1)} disabled={paginacion.page === 1 || loading}>
                <ChevronLeft size={15} />
              </BtnPagina>
              {paginasVisibles(paginacion.page, paginacion.totalPages).map((p, i) =>
                p === '…' ? (
                  <span key={`sep-${i}`} className="px-1 text-gray-400 text-sm select-none">…</span>
                ) : (
                  <BtnPagina key={p} activo={p === paginacion.page} onClick={() => cargarVentas(p)} disabled={loading}>
                    {p}
                  </BtnPagina>
                )
              )}
              <BtnPagina onClick={() => cargarVentas(paginacion.page + 1)} disabled={paginacion.page === paginacion.totalPages || loading}>
                <ChevronRight size={15} />
              </BtnPagina>
            </div>
          </div>
        )}
      </Card>

      {/* ── Modal comprobante ── */}
      <Modal
        isOpen={modalComprobanteOpen}
        onClose={() => { setModalComprobanteOpen(false); setVentaSeleccionada(null); }}
        title="Comprobante de Venta"
        size="md"
      >
        {ventaSeleccionada && (
          <ReciboVenta venta={ventaSeleccionada} sinAcciones />
        )}
      </Modal>
    </div>
  );
};

// ── Sub: tarjeta de estadística ────────────────────────────────────────────────
const TarjetaStat = ({ icono, fondo, etiqueta, valor, destacado = false }) => (
  <Card className={`p-4 ${destacado ? 'ring-1 ring-emerald-200 dark:ring-emerald-800' : ''}`}>
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${fondo}`}>
        {icono}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{etiqueta}</p>
        <p className={`text-xl font-bold truncate ${
          destacado ? 'text-emerald-600' : 'text-gray-900 dark:text-white'
        }`}>
          {valor}
        </p>
      </div>
    </div>
  </Card>
);

// ── Sub: botón de paginación ───────────────────────────────────────────────────
const BtnPagina = ({ children, activo = false, disabled = false, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
      activo
        ? 'bg-primary-600 text-white'
        : 'border border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover text-gray-700 dark:text-gray-300'
    }`}
  >
    {children}
  </button>
);

// ── Helper: páginas visibles con ellipsis ─────────────────────────────────────
const paginasVisibles = (actual, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (actual <= 4) return [1, 2, 3, 4, 5, '…', total];
  if (actual >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '…', actual - 1, actual, actual + 1, '…', total];
};

export default HistorialVentas;
