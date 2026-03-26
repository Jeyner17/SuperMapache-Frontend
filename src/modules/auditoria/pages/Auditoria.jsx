import { useState, useEffect, useCallback, useRef } from 'react';
import Card from '../../../shared/components/UI/Card';
import Button from '../../../shared/components/UI/Button';
import Badge from '../../../shared/components/UI/Badge';
import Loading from '../../../shared/components/UI/Loading';
import Modal from '../../../shared/components/UI/Modal';
import { useNotification } from '../../../shared/hooks/useNotification';
import auditoriaService from '../services/auditoria.service';
import { formatDateTime } from '../../../shared/utils/formatters';
import { Search, Shield, User, Download, ChevronLeft, ChevronRight } from 'lucide-react';

const ACCIONES = ['crear','actualizar','eliminar','login','logout','ver','generar','otro'];
const ACCION_VARIANT = {
  crear:'success', actualizar:'info', eliminar:'danger',
  login:'default', logout:'default', ver:'default', generar:'warning', otro:'default'
};

// Devuelve la fecha del registro independientemente del formato de Sequelize
const getFecha = (r) => r.created_at || r.createdAt || null;

const haceNDias = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};

const Auditoria = () => {
  const { showError } = useNotification();
  const [loading,    setLoading]    = useState(true);
  const [registros,  setRegistros]  = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [modulos,    setModulos]    = useState([]);
  const [detalle,    setDetalle]    = useState(null);

  const [busqueda,     setBusqueda]     = useState('');
  const [filterAccion, setFilterAccion] = useState('');
  const [filterModulo, setFilterModulo] = useState('');
  const [filterDesde,  setFilterDesde]  = useState(haceNDias(30));
  const [filterHasta,  setFilterHasta]  = useState(new Date().toISOString().split('T')[0]);

  const debounceRef = useRef(null);

  const cargar = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 50 };
      if (busqueda)     params.busqueda    = busqueda;
      if (filterAccion) params.accion      = filterAccion;
      if (filterModulo) params.modulo      = filterModulo;
      if (filterDesde)  params.fecha_desde = filterDesde;
      if (filterHasta)  params.fecha_hasta = filterHasta;
      const res = await auditoriaService.getAuditorias(params);
      setRegistros(res.data.registros);
      setPagination(res.data.pagination);
    } catch {
      showError('Error al cargar auditoría');
    } finally {
      setLoading(false);
    }
  }, [busqueda, filterAccion, filterModulo, filterDesde, filterHasta]);

  useEffect(() => {
    cargar(1);
    auditoriaService.getModulos().then(r => setModulos(r.data)).catch(() => {});
  }, [filterAccion, filterModulo, filterDesde, filterHasta]);

  const handleBusqueda = (val) => {
    setBusqueda(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => cargar(1), 300);
  };

  const exportarCSV = () => {
    const sep = ';';
    const cab = `Fecha${sep}Usuario${sep}Rol${sep}Acción${sep}Módulo${sep}Descripción${sep}IP\n`;
    const filas = registros.map(r =>
      [
        formatDateTime(getFecha(r)),
        r.usuario_nombre || '',
        r.usuario_rol    || '',
        r.accion,
        r.modulo,
        (r.descripcion || '').replace(/"/g, '""'),
        r.ip || ''
      ].map(v => `"${v}"`).join(sep)
    ).join('\n');
    const blob = new Blob(['\uFEFF' + cab + filas], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `auditoria_${filterDesde}_${filterHasta}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const selectCls = 'px-3 py-2.5 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield size={24} className="text-primary-600" /> Auditoría del Sistema
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Registro de todas las acciones — <strong>{pagination.total}</strong> entradas
          </p>
        </div>
        <Button variant="secondary" onClick={exportarCSV} icon={<Download size={16} />}>
          Exportar CSV
        </Button>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Buscador */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Usuario, módulo o descripción..."
              value={busqueda} onChange={e => handleBusqueda(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500" />
          </div>

          <select value={filterAccion} onChange={e => setFilterAccion(e.target.value)} className={selectCls}>
            <option value="">Todas las acciones</option>
            {ACCIONES.map(a => <option key={a} value={a} className="capitalize">{a}</option>)}
          </select>

          <select value={filterModulo} onChange={e => setFilterModulo(e.target.value)} className={selectCls}>
            <option value="">Todos los módulos</option>
            {modulos.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          {/* Rango de fechas */}
          <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Desde:</span>
            <input type="date" value={filterDesde} onChange={e => setFilterDesde(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white text-sm" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Hasta:</span>
            <input type="date" value={filterHasta} onChange={e => setFilterHasta(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white text-sm" />
          </div>
        </div>
      </Card>

      {/* Tabla */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Loading /></div>
        ) : registros.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Shield className="mx-auto mb-3 opacity-40" size={48} />
            <p>No hay registros en el período seleccionado</p>
            <p className="text-xs mt-2 opacity-60">Realiza cualquier operación en el sistema para ver actividad aquí</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="bg-gray-50 dark:bg-dark-hover border-b border-gray-200 dark:border-dark-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap w-36">Fecha y hora</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-40">Usuario</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-28">Acción</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">Módulo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">IP</th>
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                  {registros.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-dark-hover">
                      {/* Fecha */}
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap font-mono">
                        {formatDateTime(getFecha(r)) || <span className="opacity-40">—</span>}
                      </td>

                      {/* Usuario */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <User size={13} className="text-gray-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
                              {r.usuario_nombre || '—'}
                            </p>
                            {r.usuario_rol && (
                              <p className="text-xs text-gray-400 truncate">({r.usuario_rol})</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Acción */}
                      <td className="px-4 py-3">
                        <Badge variant={ACCION_VARIANT[r.accion] || 'default'} className="capitalize whitespace-nowrap">
                          {r.accion}
                        </Badge>
                      </td>

                      {/* Módulo */}
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">
                        {r.modulo}
                      </td>

                      {/* Descripción */}
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-xs">
                        <p className="truncate" title={r.descripcion}>{r.descripcion || '—'}</p>
                      </td>

                      {/* IP */}
                      <td className="px-4 py-3 font-mono text-xs text-gray-400 whitespace-nowrap">
                        {r.ip || '—'}
                      </td>

                      {/* Detalle */}
                      <td className="px-4 py-3 text-center">
                        {r.datos_extra && (
                          <button onClick={() => setDetalle(r)}
                            className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-dark-hover text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            ver
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100 dark:border-dark-border text-sm text-gray-500">
                <span>{pagination.total} registros</span>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" disabled={pagination.page <= 1}
                    onClick={() => cargar(pagination.page - 1)} icon={<ChevronLeft size={14} />} />
                  <span className="px-2">{pagination.page} / {pagination.totalPages}</span>
                  <Button variant="secondary" size="sm" disabled={pagination.page >= pagination.totalPages}
                    onClick={() => cargar(pagination.page + 1)} icon={<ChevronRight size={14} />} />
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Modal detalle */}
      <Modal isOpen={!!detalle} onClose={() => setDetalle(null)} title="Detalle del registro" size="md">
        {detalle && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-gray-600 dark:text-gray-300">
              <span className="font-medium text-gray-500">Fecha:</span>
              <span>{formatDateTime(getFecha(detalle))}</span>
              <span className="font-medium text-gray-500">Usuario:</span>
              <span>{detalle.usuario_nombre} <span className="text-gray-400">({detalle.usuario_rol})</span></span>
              <span className="font-medium text-gray-500">Acción:</span>
              <span className="capitalize">{detalle.accion}</span>
              <span className="font-medium text-gray-500">Módulo:</span>
              <span>{detalle.modulo}</span>
              {detalle.referencia_id && <>
                <span className="font-medium text-gray-500">Referencia:</span>
                <span className="font-mono">{detalle.referencia_tipo} #{detalle.referencia_id}</span>
              </>}
              <span className="font-medium text-gray-500">IP:</span>
              <span className="font-mono">{detalle.ip || '—'}</span>
            </div>
            {detalle.descripcion && (
              <div>
                <p className="font-medium text-gray-500 mb-1">Descripción</p>
                <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-dark-hover rounded p-2">{detalle.descripcion}</p>
              </div>
            )}
            {detalle.datos_extra && (
              <div>
                <p className="font-medium text-gray-500 mb-1">Datos extra</p>
                <pre className="bg-gray-50 dark:bg-dark-hover rounded-lg p-3 text-xs overflow-auto max-h-64">
                  {JSON.stringify(detalle.datos_extra, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Auditoria;
