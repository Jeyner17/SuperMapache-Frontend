import { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
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

  // ── Exportar Excel (.xlsx) ─────────────────────────────────────────────────
  const exportarExcel = () => {
    const wb = XLSX.utils.book_new();

    const filas = [
      ['Historial de Ventas'],
      [`Período: ${fechaInicio}  al  ${fechaFin}`],
      [`${stats.total_ventas} ventas completadas`, '', '', '', 'Monto total:', parseFloat(stats.monto_total)],
      [],
      ['N° Venta', 'Fecha', 'Vendedor', 'Método de Pago', 'Estado', 'Total ($)'],
      ...ventas.map(v => [
        v.numero_venta,
        formatDateTime(v.fecha_venta),
        v.usuario?.nombre ?? '—',
        METODO_LABELS[v.metodo_pago] ?? v.metodo_pago,
        ESTADO_LABELS[v.estado]     ?? v.estado,
        parseFloat(v.total),
      ]),
      [],
      ['', '', '', '', 'TOTAL PERÍODO:', parseFloat(stats.monto_total)],
    ];

    const ws = XLSX.utils.aoa_to_sheet(filas);

    ws['!cols'] = [
      { wch: 24 },
      { wch: 20 },
      { wch: 22 },
      { wch: 16 },
      { wch: 14 },
      { wch: 14 },
    ];

    // Formato numérico para columna Total (F, índice 5), filas de datos
    const dataStart = 6; // fila 1-indexed donde empieza la data (después de 5 filas de encabezado)
    for (let r = dataStart; r < dataStart + ventas.length; r++) {
      const cellRef = XLSX.utils.encode_cell({ r, c: 5 });
      if (ws[cellRef]) ws[cellRef].z = '#,##0.00';
    }
    // Fila de total
    const totalRow = dataStart + ventas.length + 1;
    const totalCell = XLSX.utils.encode_cell({ r: totalRow, c: 5 });
    if (ws[totalCell]) ws[totalCell].z = '#,##0.00';

    XLSX.utils.book_append_sheet(wb, ws, 'Ventas');
    XLSX.writeFile(wb, `ventas_${fechaInicio}_al_${fechaFin}.xlsx`);
  };

  // ── Exportar PDF (descarga automática) ────────────────────────────────────
  const exportarPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // Título
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text('Historial de Ventas', 14, 18);

    // Subtítulo
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Período: ${fechaInicio}  al  ${fechaFin}   ·   ${stats.total_ventas} ventas completadas   ·   Total: ${formatCurrency(stats.monto_total)}`,
      14, 26
    );

    // Línea separadora
    doc.setDrawColor(220, 220, 220);
    doc.line(14, 29, 283, 29);

    // Tabla
    autoTable(doc, {
      startY: 33,
      head: [['N° Venta', 'Fecha', 'Vendedor', 'Método de Pago', 'Estado', 'Total']],
      body: ventas.map(v => [
        v.numero_venta,
        formatDateTime(v.fecha_venta),
        v.usuario?.nombre ?? '—',
        METODO_LABELS[v.metodo_pago] ?? v.metodo_pago,
        ESTADO_LABELS[v.estado]     ?? v.estado,
        formatCurrency(v.total),
      ]),
      foot: [['', '', '', '', 'TOTAL PERÍODO:', formatCurrency(stats.monto_total)]],
      styles: {
        fontSize: 9,
        cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
        textColor: [30, 30, 30],
        lineColor: [230, 230, 230],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [243, 244, 246],
        textColor: [75, 85, 99],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'left',
      },
      footStyles: {
        fillColor: [243, 244, 246],
        textColor: [30, 30, 30],
        fontStyle: 'bold',
      },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      columnStyles: { 5: { halign: 'right', fontStyle: 'bold' } },
      margin: { left: 14, right: 14 },
    });

    doc.save(`ventas_${fechaInicio}_al_${fechaFin}.pdf`);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 overflow-y-auto h-full pb-2">

      {/* ── Estadísticas ── */}
      <div className="grid grid-cols-3 gap-4">
        <TarjetaStat
          icono={<ShoppingBag className="w-5 h-5 text-primary-600" />}
          fondo="bg-primary-50 dark:bg-primary-900/20"
          etiqueta={
            estadoFiltro === 'cancelada' ? 'Ventas canceladas'        :
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
        <div className="flex flex-wrap gap-3 items-end">

          {/* Desde */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Desde</label>
            <input
              type="date" value={fechaInicio}
              onChange={e => handleFechaInicio(e.target.value)}
              className={`px-3 py-2 text-sm border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 dark:[color-scheme:dark] ${
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
              className={`px-3 py-2 text-sm border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 dark:[color-scheme:dark] ${
                fechaError ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-dark-border'
              }`}
            />
          </div>

          {/* Error de rango */}
          {fechaError && (
            <div className="w-full -mt-1">
              <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                <span className="font-bold">!</span> {fechaError}
              </p>
            </div>
          )}

          {/* Estado */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Estado</label>
            <select
              value={estadoFiltro} onChange={e => setEstadoFiltro(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 dark:[color-scheme:dark]"
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
              className="px-3 py-2 text-sm border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 dark:[color-scheme:dark]"
            >
              <option value="">Todos</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
              <option value="mixto">Mixto</option>
              <option value="credito">Crédito</option>
            </select>
          </div>

          {/* Búsqueda por N° */}
          <div className="flex flex-col gap-1 flex-1 min-w-44">
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

          {/* Acciones */}
          <Button onClick={handleBuscar} disabled={loading || !!fechaError}>
            <Search size={15} />
            Buscar
          </Button>
          <Button
            variant="secondary"
            onClick={exportarExcel}
            disabled={ventas.length === 0 || !!fechaError}
            title="Exportar a Excel (.csv)"
          >
            <FileSpreadsheet size={15} />
            Excel
          </Button>
          <Button
            variant="secondary"
            onClick={exportarPDF}
            disabled={ventas.length === 0 || !!fechaError}
            title="Exportar a PDF"
          >
            <FileText size={15} />
            PDF
          </Button>
        </div>
      </Card>

      {/* ── Tabla ── */}
      <Card className="overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="overflow-x-auto flex-1">
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
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400 dark:text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Cargando ventas…</span>
                    </div>
                  </td>
                </tr>
              ) : ventas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <Receipt className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No se encontraron ventas en el período seleccionado.
                    </p>
                  </td>
                </tr>
              ) : (
                ventas.map(venta => (
                  <tr
                    key={venta.id}
                    className="hover:bg-gray-50 dark:hover:bg-dark-hover/60 transition-colors"
                  >
                    {/* N° Venta */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-gray-100 dark:bg-dark-hover px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">
                        {venta.numero_venta}
                      </span>
                    </td>

                    {/* Fecha */}
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap text-xs">
                      {formatDateTime(venta.fecha_venta)}
                    </td>

                    {/* Cliente */}
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                      {venta.metodo_pago === 'credito'
                        ? <span className="italic text-amber-600 dark:text-amber-400">Ver créditos</span>
                        : <span>General</span>
                      }
                    </td>

                    {/* Vendedor */}
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm">
                      {venta.usuario?.nombre ?? '—'}
                    </td>

                    {/* Método */}
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        METODO_CHIP[venta.metodo_pago] ?? 'bg-gray-100 text-gray-600'
                      }`}>
                        {METODO_LABELS[venta.metodo_pago] ?? venta.metodo_pago}
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        ESTADO_CHIP[venta.estado] ?? 'bg-gray-100 text-gray-600'
                      }`}>
                        {ESTADO_LABELS[venta.estado] ?? venta.estado}
                      </span>
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                      {formatCurrency(venta.total)}
                    </td>

                    {/* Comprobante */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => { setVentaSeleccionada(venta); setModalComprobanteOpen(true); }}
                        title="Ver comprobante"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors border border-primary-200 dark:border-primary-800"
                      >
                        <Eye size={13} />
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Paginación ── */}
        {paginacion.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-dark-border flex items-center justify-between gap-4 flex-shrink-0">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Mostrando{' '}
              {(paginacion.page - 1) * LIMIT + 1}–
              {Math.min(paginacion.page * LIMIT, paginacion.total)}{' '}
              de <span className="font-semibold text-gray-700 dark:text-gray-300">{paginacion.total}</span> ventas
            </span>

            <div className="flex items-center gap-1">
              <BtnPagina
                onClick={() => cargarVentas(paginacion.page - 1)}
                disabled={paginacion.page === 1 || loading}
              >
                <ChevronLeft size={15} />
              </BtnPagina>

              {paginasVisibles(paginacion.page, paginacion.totalPages).map((p, i) =>
                p === '…' ? (
                  <span key={`sep-${i}`} className="px-1 text-gray-400 text-sm select-none">…</span>
                ) : (
                  <BtnPagina
                    key={p}
                    activo={p === paginacion.page}
                    onClick={() => cargarVentas(p)}
                    disabled={loading}
                  >
                    {p}
                  </BtnPagina>
                )
              )}

              <BtnPagina
                onClick={() => cargarVentas(paginacion.page + 1)}
                disabled={paginacion.page === paginacion.totalPages || loading}
              >
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
          <ReciboVenta
            venta={ventaSeleccionada}
            sinAcciones
          />
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
