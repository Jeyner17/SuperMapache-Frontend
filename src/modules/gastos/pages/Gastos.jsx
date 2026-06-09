import { useState, useEffect, useCallback, useRef } from 'react';
import Card from '../../../shared/components/UI/Card';
import Button from '../../../shared/components/UI/Button';
import Modal from '../../../shared/components/UI/Modal';
import Badge from '../../../shared/components/UI/Badge';
import Loading from '../../../shared/components/UI/Loading';
import FormularioGasto from '../components/FormularioGasto';
import { useNotification } from '../../../shared/hooks/useNotification';
import { useAuth } from '../../../shared/hooks/useAuth';
import gastoService from '../services/gasto.service';
import cajaService from '../../caja/services/caja.service';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';
import { Plus, Search, Edit2, Trash2, TrendingDown, Calendar, Tag, CreditCard, Download, Wallet, FileText, X } from 'lucide-react';

const LIMIT = 15;

const CATEGORIAS = ['servicios','mantenimiento','sueldos','insumos','alquiler','transporte','publicidad','otros'];
const CATEGORIAS_LABEL = {
  servicios:'Servicios', mantenimiento:'Mantenimiento', sueldos:'Sueldos',
  insumos:'Insumos', alquiler:'Alquiler', transporte:'Transporte',
  publicidad:'Publicidad', otros:'Otros'
};
const CATEGORIA_COLOR = {
  servicios:'info', mantenimiento:'warning', sueldos:'default',
  insumos:'success', alquiler:'danger', transporte:'default',
  publicidad:'info', otros:'default'
};

const inputCls = 'w-full px-3 py-2.5 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none';

const Gastos = () => {
  const { showSuccess, showError } = useNotification();
  const { user, hasPermission } = useAuth();

  const [loading,      setLoading]      = useState(true);
  const [gastos,       setGastos]       = useState([]);
  const [resumen,      setResumen]      = useState(null);
  const [pagination,   setPagination]   = useState({ page: 1, totalPages: 1, total: 0 });
  const [busqueda,     setBusqueda]     = useState('');
  const [filterCat,    setFilterCat]    = useState('');
  const [fechaDesde,   setFechaDesde]   = useState('');
  const [fechaHasta,   setFechaHasta]   = useState('');
  const [turnoActivo,  setTurnoActivo]  = useState(null);
  const [gastoEdit,    setGastoEdit]    = useState(null);
  const [gastoElim,    setGastoElim]    = useState(null);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [eliminando,   setEliminando]   = useState(false);
  const [exportandoXLS, setExportandoXLS] = useState(false);
  const [exportandoPDF, setExportandoPDF] = useState(false);
  const debounceRef = useRef(null);

  // Construye los parámetros de filtro actuales
  const buildFiltros = useCallback((extra = {}) => {
    const p = {};
    if (busqueda)   p.busqueda    = busqueda;
    if (filterCat)  p.categoria   = filterCat;
    if (fechaDesde) p.fecha_desde = fechaDesde;
    if (fechaHasta) p.fecha_hasta = fechaHasta;
    return { ...p, ...extra };
  }, [busqueda, filterCat, fechaDesde, fechaHasta]);

  const cargar = useCallback(async (
    page  = 1,
    bus   = busqueda,
    cat   = filterCat,
    desde = fechaDesde,
    hasta = fechaHasta
  ) => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (bus)   params.busqueda    = bus;
      if (cat)   params.categoria   = cat;
      if (desde) params.fecha_desde = desde;
      if (hasta) params.fecha_hasta = hasta;

      const [resGastos, resResumen] = await Promise.all([
        gastoService.getGastos(params),
        gastoService.getResumen()
      ]);
      setGastos(resGastos.data.gastos);
      setPagination(resGastos.data.pagination);
      setResumen(resResumen.data);
    } catch {
      showError('Error al cargar los gastos');
    } finally {
      setLoading(false);
    }
  }, [busqueda, filterCat, fechaDesde, fechaHasta]);

  useEffect(() => {
    cargar(1);
    cajaService.getTurnoActivo().then(r => setTurnoActivo(r.data)).catch(() => {});
  }, [filterCat, fechaDesde, fechaHasta]);

  const handleBusqueda = (val) => {
    setBusqueda(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => cargar(1, val, filterCat, fechaDesde, fechaHasta), 300);
  };

  const limpiarFechas = () => { setFechaDesde(''); setFechaHasta(''); };

  const abrirCrear  = () => { setGastoEdit(null); setModalOpen(true); };
  const abrirEditar = (g) => { setGastoEdit(g);   setModalOpen(true); };
  const cerrarModal = () => { setModalOpen(false); setGastoEdit(null); };

  const handleSubmit = async (data) => {
    try {
      if (gastoEdit) {
        await gastoService.actualizarGasto(gastoEdit.id, data);
        showSuccess('Gasto actualizado');
      } else {
        const payload = turnoActivo ? { ...data, turno_id: turnoActivo.id } : data;
        await gastoService.crearGasto(payload);
        showSuccess('Gasto registrado' + (turnoActivo ? ` — vinculado al turno ${turnoActivo.numero_turno}` : ''));
      }
      cerrarModal();
      cargar(1);
    } catch (err) {
      showError(err.response?.data?.message || 'Error al guardar');
      throw err;
    }
  };

  const handleEliminar = async () => {
    if (!gastoElim) return;
    setEliminando(true);
    try {
      await gastoService.eliminarGasto(gastoElim.id);
      showSuccess('Gasto eliminado');
      setGastoElim(null);
      cargar(1);
    } catch {
      showError('Error al eliminar');
    } finally {
      setEliminando(false);
    }
  };

  // ── Exportar XLS: delega al backend (todos los registros del filtro) ──────
  const exportarXLS = async () => {
    setExportandoXLS(true);
    try {
      const blob = await gastoService.exportarXLS(buildFiltros());
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `gastos_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showError('Error al exportar Excel');
    } finally {
      setExportandoXLS(false);
    }
  };

  // ── Exportar PDF: obtiene todos los registros del filtro, genera client-side
  const exportarPDF = async () => {
    setExportandoPDF(true);
    try {
      const { jsPDF }              = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      // Trae todos los registros del filtro actual sin paginación
      const res  = await gastoService.getGastos(buildFiltros({ page: 1, limit: 10000 }));
      const todos = res.data.gastos;

      const doc = new jsPDF({ orientation: 'portrait', format: 'a4' });
      const fechaGen = new Date().toLocaleDateString('es-EC', { day: '2-digit', month: 'long', year: 'numeric' });

      // Título
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(17);
      doc.setTextColor(30, 58, 95);
      doc.text('SuperMapache', 14, 20);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(107, 114, 128);
      doc.text('Reporte de Gastos Operativos', 14, 28);

      // Meta
      const metaParts = [];
      if (fechaDesde && fechaHasta) metaParts.push(`Período: ${fechaDesde} — ${fechaHasta}`);
      else if (fechaDesde)          metaParts.push(`Desde: ${fechaDesde}`);
      else if (fechaHasta)          metaParts.push(`Hasta: ${fechaHasta}`);
      if (filterCat)                metaParts.push(`Categoría: ${CATEGORIAS_LABEL[filterCat] || filterCat}`);
      metaParts.push(`Generado: ${fechaGen}`);
      metaParts.push(`${todos.length} registros`);

      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(metaParts.join('   ·   '), 14, 35);

      // Línea separadora
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 39, 196, 39);

      // Tabla
      autoTable(doc, {
        startY: 44,
        head: [['N° Gasto', 'Fecha', 'Categoría', 'Descripción', 'Método', 'Monto']],
        body: todos.map(g => [
          g.numero_gasto,
          g.fecha_gasto
            ? new Date(g.fecha_gasto + 'T00:00:00').toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' })
            : '',
          CATEGORIAS_LABEL[g.categoria] || g.categoria,
          g.descripcion,
          g.metodo_pago.charAt(0).toUpperCase() + g.metodo_pago.slice(1),
          `$${parseFloat(g.monto).toFixed(2)}`
        ]),
        foot: [['', '', '', '', 'TOTAL', `$${todos.reduce((s, g) => s + parseFloat(g.monto), 0).toFixed(2)}`]],
        showFoot: 'lastPage',
        headStyles: {
          fillColor: [30, 58, 95],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 8.5
        },
        footStyles: {
          fillColor: [235, 242, 255],
          textColor: [30, 58, 95],
          fontStyle: 'bold',
          fontSize: 10
        },
        bodyStyles: { fontSize: 8, textColor: [55, 65, 81] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 30, fontSize: 7, textColor: [107, 114, 128] },
          1: { cellWidth: 20 },
          2: { cellWidth: 22 },
          3: { cellWidth: 'auto' },
          4: { cellWidth: 22 },
          5: { cellWidth: 22, halign: 'right', textColor: [220, 38, 38], fontStyle: 'bold' }
        },
        margin: { left: 14, right: 14 },
        styles: { overflow: 'linebreak', cellPadding: 3 }
      });

      // Números de página (post-generación para tener el total correcto)
      const totalPaginas = doc.getNumberOfPages();
      for (let i = 1; i <= totalPaginas; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(209, 213, 219);
        doc.text(
          `Página ${i} de ${totalPaginas}   ·   SuperMapache`,
          14,
          doc.internal.pageSize.height - 8
        );
      }

      doc.save(`gastos_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch {
      showError('Error al exportar PDF');
    } finally {
      setExportandoPDF(false);
    }
  };

  const puedeEditar   = !!user;
  const puedeEliminar = hasPermission('gestionar_configuracion');
  const hayFiltroFecha = fechaDesde || fechaHasta;

  return (
    <div className="p-6 space-y-6">

      {/* Encabezado */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gastos Operativos</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Registro de egresos del negocio</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" onClick={exportarXLS} loading={exportandoXLS} icon={<Download size={15} />}>
            Excel
          </Button>
          <Button variant="secondary" onClick={exportarPDF} loading={exportandoPDF} icon={<FileText size={15} />}>
            PDF
          </Button>
          {puedeEditar && (
            <Button onClick={abrirCrear} icon={<Plus size={18} />}>Nuevo Gasto</Button>
          )}
        </div>
      </div>

      {/* Tarjetas resumen */}
      {resumen && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <TrendingDown className="mx-auto mb-2 text-red-500" size={24} />
            <p className="text-xs text-gray-500 dark:text-gray-400">Total este mes</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(resumen.total_mes)}</p>
          </Card>
          <Card className="p-4 text-center">
            <Tag className="mx-auto mb-2 text-blue-500" size={24} />
            <p className="text-xs text-gray-500 dark:text-gray-400">Registros este mes</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{resumen.cantidad}</p>
          </Card>
          {Object.entries(resumen.por_categoria || {})
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(([cat, monto]) => (
              <Card key={cat} className="p-4 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{CATEGORIAS_LABEL[cat] || cat}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(monto)}</p>
              </Card>
            ))}
        </div>
      )}

      {/* Filtros */}
      <Card className="p-4 space-y-3">
        {/* Fila 1: búsqueda + categoría */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Buscar por descripción, N° o comprobante..."
              value={busqueda}
              onChange={e => handleBusqueda(e.target.value)}
              className={`${inputCls} pl-9`}
            />
          </div>
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            className={inputCls}
            style={{ width: 'auto', minWidth: '180px' }}
          >
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map(c => <option key={c} value={c}>{CATEGORIAS_LABEL[c]}</option>)}
          </select>
        </div>

        {/* Fila 2: rango de fechas */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Desde</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={e => setFechaDesde(e.target.value)}
              max={fechaHasta || undefined}
              className={inputCls}
            />
          </div>
          <div className="flex items-center gap-2 flex-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Hasta</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={e => setFechaHasta(e.target.value)}
              min={fechaDesde || undefined}
              className={inputCls}
            />
          </div>
          {hayFiltroFecha && (
            <button
              onClick={limpiarFechas}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 transition-colors whitespace-nowrap"
            >
              <X size={13} /> Limpiar fechas
            </button>
          )}
        </div>
      </Card>

      {/* Tabla */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Loading /></div>
        ) : gastos.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <TrendingDown className="mx-auto mb-3 opacity-50" size={48} />
            <p>No hay gastos para los filtros aplicados</p>
            {puedeEditar && !busqueda && !filterCat && !hayFiltroFecha && (
              <Button className="mt-4" onClick={abrirCrear} icon={<Plus size={16} />}>Registrar primero</Button>
            )}
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-dark-hover border-b border-gray-200 dark:border-dark-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">N°</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                {gastos.map(g => (
                  <tr key={g.id} className="hover:bg-gray-50 dark:hover:bg-dark-hover">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{g.numero_gasto}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-gray-400" />
                        {formatDate(g.fecha_gasto)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={CATEGORIA_COLOR[g.categoria] || 'default'}>
                        {CATEGORIAS_LABEL[g.categoria] || g.categoria}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white max-w-xs">
                      <p className="truncate">{g.descripcion}</p>
                      {g.comprobante && <p className="text-xs text-gray-400">{g.comprobante}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <CreditCard size={14} />
                        <span className="capitalize">{g.metodo_pago}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-red-600">
                      -{formatCurrency(g.monto)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        {puedeEditar && (
                          <button onClick={() => abrirEditar(g)} title="Editar"
                            className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600">
                            <Edit2 size={15} />
                          </button>
                        )}
                        {puedeEliminar && (
                          <button onClick={() => setGastoElim(g)} title="Eliminar"
                            className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600">
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginación */}
            <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100 dark:border-dark-border text-sm text-gray-500">
              <span>
                {pagination.total} {pagination.total === 1 ? 'gasto' : 'gastos'}
                {pagination.totalPages > 1 && ` · página ${pagination.page} de ${pagination.totalPages}`}
              </span>
              {pagination.totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <Button variant="secondary" size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => cargar(pagination.page - 1)}>
                    ← Anterior
                  </Button>
                  <span className="px-3 py-1 text-xs font-medium">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <Button variant="secondary" size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => cargar(pagination.page + 1)}>
                    Siguiente →
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </Card>

      {/* Modal crear/editar */}
      <Modal isOpen={modalOpen} onClose={cerrarModal}
        title={gastoEdit ? 'Editar Gasto' : 'Registrar Gasto'} size="lg">
        {!gastoEdit && turnoActivo && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 text-sm border border-yellow-200 dark:border-yellow-700">
            <Wallet size={16} />
            <span>Se vinculará al turno activo <strong>{turnoActivo.numero_turno}</strong></span>
          </div>
        )}
        <FormularioGasto gasto={gastoEdit} onSubmit={handleSubmit} onCancel={cerrarModal} />
      </Modal>

      {/* Modal eliminar */}
      <Modal isOpen={!!gastoElim} onClose={() => setGastoElim(null)} title="Eliminar Gasto" size="sm">
        <p className="text-gray-600 dark:text-gray-300 mb-1">
          ¿Eliminar el gasto <strong>{gastoElim?.numero_gasto}</strong>?
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{gastoElim?.descripcion}</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setGastoElim(null)}>Cancelar</Button>
          <Button variant="danger" onClick={handleEliminar} loading={eliminando}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Gastos;
