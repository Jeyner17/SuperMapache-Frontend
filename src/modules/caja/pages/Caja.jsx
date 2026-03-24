import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../../../shared/hooks/useNotification';
import cajaService from '../services/caja.service';
import Card from '../../../shared/components/UI/Card';
import Button from '../../../shared/components/UI/Button';
import Modal from '../../../shared/components/UI/Modal';
import Badge from '../../../shared/components/UI/Badge';
import Loading from '../../../shared/components/UI/Loading';
import FormularioApertura from '../components/FormularioApertura';
import FormularioCierre from '../components/FormularioCierre';
import FormularioMovimiento from '../components/FormularioMovimiento';
import DetallesTurno from '../components/DetallesTurno';
import { formatCurrency, formatDateTime, formatDate } from '../../../shared/utils/formatters';
import {
  Wallet, Plus, Eye, ArrowDownCircle, ArrowUpCircle,
  ShoppingCart, Clock, CheckCircle, History, RefreshCw
} from 'lucide-react';

const Tooltip = ({ text, children }) => (
  <div className="relative group inline-flex">
    {children}
    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 dark:bg-gray-700 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
      {text}
    </span>
  </div>
);

const Caja = () => {
  const { showSuccess, showError } = useNotification();

  const [turnoActivo, setTurnoActivo] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [turnos, setTurnos] = useState([]);
  const [loadingTurno, setLoadingTurno] = useState(true);
  const [loadingTurnos, setLoadingTurnos] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 8, total: 0, totalPages: 0 });

  const [modal, setModal] = useState({ open: false, tipo: '' }); // 'abrir' | 'cerrar' | 'movimiento' | 'detalle'
  const [turnoDetalle, setTurnoDetalle] = useState(null);

  const cargarTurnoActivo = useCallback(async () => {
    try {
      setLoadingTurno(true);
      const response = await cajaService.getTurnoActivo();
      if (response.data) {
        setTurnoActivo(response.data.turno);
        setResumen(response.data.resumen);
      } else {
        setTurnoActivo(null);
        setResumen(null);
      }
    } catch (error) {
      showError('Error al cargar turno activo');
    } finally {
      setLoadingTurno(false);
    }
  }, []);

  const cargarHistorial = useCallback(async () => {
    try {
      setLoadingTurnos(true);
      const response = await cajaService.getTurnos({
        page: pagination.page,
        limit: pagination.limit
      });
      setTurnos(response.data.turnos);
      setPagination(prev => ({ ...prev, ...response.data.pagination }));
    } catch (error) {
      showError('Error al cargar historial de turnos');
    } finally {
      setLoadingTurnos(false);
    }
  }, [pagination.page]);

  useEffect(() => { cargarTurnoActivo(); }, [cargarTurnoActivo]);
  useEffect(() => { cargarHistorial(); }, [cargarHistorial]);

  const abrirModal = (tipo) => setModal({ open: true, tipo });
  const cerrarModal = () => setModal({ open: false, tipo: '' });

  const handleAbrirTurno = async (data) => {
    try {
      await cajaService.abrirTurno(data);
      showSuccess('Caja abierta exitosamente');
      cerrarModal();
      cargarTurnoActivo();
      cargarHistorial();
    } catch (error) {
      showError(error.message || 'Error al abrir caja');
    }
  };

  const handleCerrarTurno = async (data) => {
    try {
      await cajaService.cerrarTurno(data);
      showSuccess('Caja cerrada exitosamente');
      cerrarModal();
      cargarTurnoActivo();
      cargarHistorial();
    } catch (error) {
      showError(error.message || 'Error al cerrar caja');
    }
  };

  const handleRegistrarMovimiento = async (data) => {
    try {
      await cajaService.registrarMovimiento(data);
      showSuccess(`${data.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'} registrado`);
      cerrarModal();
      cargarTurnoActivo();
    } catch (error) {
      showError(error.message || 'Error al registrar movimiento');
    }
  };

  const handleVerDetalle = async (turno) => {
    try {
      const response = await cajaService.getTurnoById(turno.id);
      setTurnoDetalle(response.data);
      abrirModal('detalle');
    } catch (error) {
      showError('Error al cargar detalles del turno');
    }
  };

  if (loadingTurno) return <Loading message="Cargando caja..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Caja</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Control de apertura, cierre y movimientos de efectivo
          </p>
        </div>
        <div className="flex gap-2">
          <Tooltip text="Actualizar">
            <button
              onClick={() => { cargarTurnoActivo(); cargarHistorial(); }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors"
            >
              <RefreshCw size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </Tooltip>
          {!turnoActivo ? (
            <Button onClick={() => abrirModal('abrir')} size="lg">
              <Wallet size={20} />
              Abrir Caja
            </Button>
          ) : (
            <Button variant="danger" onClick={() => abrirModal('cerrar')} size="lg">
              <Wallet size={20} />
              Cerrar Caja
            </Button>
          )}
        </div>
      </div>

      {/* Panel del turno activo */}
      {turnoActivo ? (
        <Card className="p-6 border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Wallet className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{turnoActivo.numero_turno}</h2>
                  <Badge variant="success">Abierta</Badge>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Abierta a las {formatDateTime(turnoActivo.fecha_apertura)} · {resumen?.tiempo_abierto}
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => abrirModal('movimiento')}
            >
              <Plus size={16} />
              Ingreso / Egreso
            </Button>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-dark-card rounded-lg shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Saldo Inicial</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">{formatCurrency(resumen?.saldo_inicial ?? 0)}</p>
            </div>
            <div className="p-4 bg-white dark:bg-dark-card rounded-lg shadow-sm">
              <div className="flex items-center gap-1 mb-1">
                <ShoppingCart size={12} className="text-green-600" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Ventas Efectivo</p>
              </div>
              <p className="text-xl font-bold text-green-600">{formatCurrency(resumen?.total_ventas_efectivo ?? 0)}</p>
            </div>
            <div className="p-4 bg-white dark:bg-dark-card rounded-lg shadow-sm">
              <div className="flex items-center gap-1 mb-1">
                <ArrowDownCircle size={12} className="text-blue-600" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Ingresos</p>
              </div>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(resumen?.total_ingresos ?? 0)}</p>
            </div>
            <div className="p-4 bg-white dark:bg-dark-card rounded-lg shadow-sm">
              <div className="flex items-center gap-1 mb-1">
                <ArrowUpCircle size={12} className="text-red-600" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Egresos</p>
              </div>
              <p className="text-xl font-bold text-red-600">{formatCurrency(resumen?.total_egresos ?? 0)}</p>
            </div>
          </div>

          {/* Total esperado */}
          <div className="mt-4 p-4 bg-white dark:bg-dark-card rounded-lg shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Esperado en Caja</p>
              <p className="text-3xl font-bold text-primary-600">{formatCurrency(resumen?.total_esperado ?? 0)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Ventas tarjeta / transfer.</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatCurrency(resumen?.total_ventas_tarjeta ?? 0)} / {formatCurrency(resumen?.total_ventas_transferencia ?? 0)}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-12 text-center border-2 border-dashed border-gray-300 dark:border-gray-600">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No hay caja abierta</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Abre la caja para comenzar a registrar ventas y movimientos</p>
          <Button onClick={() => abrirModal('abrir')}>
            <Wallet size={20} />
            Abrir Caja Ahora
          </Button>
        </Card>
      )}

      {/* Historial de turnos */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <History size={20} className="text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Historial de Turnos</h2>
        </div>

        {loadingTurnos ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : turnos.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No hay turnos registrados</p>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-dark-hover">
                  <tr>
                    {['Turno', 'Cajero', 'Apertura', 'Cierre', 'Efectivo', 'Total Esperado', 'Diferencia', 'Estado', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                  {turnos.map(t => {
                    const dif = t.diferencia !== null ? parseFloat(t.diferencia) : null;
                    return (
                      <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-dark-hover">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white text-sm">{t.numero_turno}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{t.usuario?.nombre}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{formatDateTime(t.fecha_apertura)}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {t.fecha_cierre ? formatDateTime(t.fecha_cierre) : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-green-600">{formatCurrency(t.total_ventas_efectivo)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(t.total_esperado)}</td>
                        <td className="px-4 py-3 text-sm font-medium">
                          {dif !== null ? (
                            <span className={dif === 0 ? 'text-green-600' : dif > 0 ? 'text-blue-600' : 'text-red-600'}>
                              {dif >= 0 ? '+' : ''}{formatCurrency(dif)}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={t.estado === 'abierta' ? 'success' : 'default'} size="sm">
                            {t.estado === 'abierta' ? 'Abierta' : 'Cerrada'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Tooltip text="Ver detalle">
                            <button
                              onClick={() => handleVerDetalle(t)}
                              className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            >
                              <Eye size={16} className="text-blue-600" />
                            </button>
                          </Tooltip>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 dark:border-dark-border flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {pagination.total} turnos en total
                </p>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" disabled={pagination.page === 1}
                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>Anterior</Button>
                  <Button variant="secondary" size="sm" disabled={pagination.page === pagination.totalPages}
                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>Siguiente</Button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Modales */}
      <Modal isOpen={modal.open && modal.tipo === 'abrir'} onClose={cerrarModal} title="Abrir Caja" size="sm">
        <FormularioApertura onSubmit={handleAbrirTurno} onCancel={cerrarModal} />
      </Modal>

      <Modal isOpen={modal.open && modal.tipo === 'cerrar'} onClose={cerrarModal} title="Cerrar Caja — Arqueo" size="md">
        <FormularioCierre turno={turnoActivo} resumen={resumen} onSubmit={handleCerrarTurno} onCancel={cerrarModal} />
      </Modal>

      <Modal isOpen={modal.open && modal.tipo === 'movimiento'} onClose={cerrarModal} title="Registrar Movimiento" size="sm">
        <FormularioMovimiento onSubmit={handleRegistrarMovimiento} onCancel={cerrarModal} />
      </Modal>

      <Modal isOpen={modal.open && modal.tipo === 'detalle'} onClose={cerrarModal} title="Detalle del Turno" size="lg">
        <DetallesTurno turno={turnoDetalle} onClose={cerrarModal} />
      </Modal>
    </div>
  );
};

export default Caja;
