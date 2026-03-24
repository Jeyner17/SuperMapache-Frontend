import { useState, useEffect, useCallback } from 'react';
import Card from '../../../shared/components/UI/Card';
import Button from '../../../shared/components/UI/Button';
import Badge from '../../../shared/components/UI/Badge';
import Loading from '../../../shared/components/UI/Loading';
import { useNotification } from '../../../shared/hooks/useNotification';
import { useAuth } from '../../../shared/hooks/useAuth';
import alertaService from '../services/alerta.service';
import {
  Bell, CheckCheck, Check, AlertTriangle, Package,
  Clock, CreditCard, RefreshCw, Filter
} from 'lucide-react';

const tipoConfig = {
  stock_bajo:      { label: 'Stock bajo',       icon: Package,       badgeVariant: 'warning' },
  agotado:         { label: 'Agotado',          icon: Package,       badgeVariant: 'danger' },
  por_vencer:      { label: 'Por vencer',       icon: Clock,         badgeVariant: 'warning' },
  vencido:         { label: 'Vencido',          icon: AlertTriangle, badgeVariant: 'danger' },
  credito_vencer:  { label: 'Crédito por vencer', icon: CreditCard,  badgeVariant: 'info' },
  credito_vencido: { label: 'Crédito vencido',  icon: CreditCard,    badgeVariant: 'danger' },
};

const prioridadConfig = {
  critica: { label: 'Crítica', variant: 'danger',  color: 'text-red-600',    border: 'border-l-red-500' },
  alta:    { label: 'Alta',    variant: 'warning', color: 'text-orange-600', border: 'border-l-orange-500' },
  media:   { label: 'Media',   variant: 'info',    color: 'text-yellow-600', border: 'border-l-yellow-500' },
  baja:    { label: 'Baja',    variant: 'default', color: 'text-blue-600',   border: 'border-l-blue-400' },
};

const Alertas = () => {
  const { showSuccess, showError } = useNotification();
  const { hasPermission } = useAuth();
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [alertas, setAlertas]     = useState([]);
  const [resumen, setResumen]     = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const [filterTipo, setFilterTipo]         = useState('');
  const [filterPrioridad, setFilterPrioridad] = useState('');
  const [filterLeida, setFilterLeida]       = useState('false');
  const [filterResuelta, setFilterResuelta] = useState('false');

  const cargar = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page, limit: 20,
        tipo:      filterTipo      || undefined,
        prioridad: filterPrioridad || undefined,
        leida:     filterLeida     !== '' ? filterLeida     : undefined,
        resuelta:  filterResuelta  !== '' ? filterResuelta  : undefined,
      };
      const [resAlertas, resResumen] = await Promise.all([
        alertaService.getAlertas(params),
        alertaService.getResumen()
      ]);
      setAlertas(resAlertas.data.alertas || []);
      setPagination({ page: resAlertas.data.page, totalPages: resAlertas.data.totalPages, total: resAlertas.data.total });
      setResumen(resResumen.data);
    } catch {
      showError('Error al cargar alertas');
    } finally {
      setLoading(false);
    }
  }, [filterTipo, filterPrioridad, filterLeida, filterResuelta, showError]);

  useEffect(() => { cargar(1); }, [cargar]);

  const handleMarcarLeida = async (id) => {
    try {
      await alertaService.marcarLeida(id);
      setAlertas(prev => prev.map(a => a.id === id ? { ...a, leida: true } : a));
      setResumen(prev => prev ? { ...prev, no_leidas: Math.max(0, prev.no_leidas - 1) } : prev);
    } catch { showError('Error al actualizar alerta'); }
  };

  const handleMarcarResuelta = async (id) => {
    try {
      await alertaService.marcarResuelta(id);
      showSuccess('Alerta marcada como resuelta');
      cargar(pagination.page);
    } catch (err) {
      showError(err.response?.data?.message || 'Error al resolver alerta');
    }
  };

  const handleMarcarTodasLeidas = async () => {
    try {
      const res = await alertaService.marcarTodasLeidas();
      showSuccess(`${res.data.cantidad} alertas marcadas como leídas`);
      cargar(1);
    } catch { showError('Error al actualizar alertas'); }
  };

  const handleGenerar = async () => {
    setGenerando(true);
    try {
      const res = await alertaService.generarAlertas();
      showSuccess(`${res.data.generadas} alertas generadas`);
      cargar(1);
    } catch { showError('Error al generar alertas'); }
    finally { setGenerando(false); }
  };

  const tarjetasResumen = resumen ? [
    { label: 'Sin leer',  value: resumen.no_leidas, color: 'text-primary-600', icon: Bell },
    { label: 'Críticas',  value: resumen.criticas,  color: 'text-red-600',     icon: AlertTriangle },
    { label: 'Altas',     value: resumen.altas,     color: 'text-orange-600',  icon: AlertTriangle },
    { label: 'Total activas', value: resumen.total, color: 'text-gray-700 dark:text-gray-300', icon: Bell },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alertas</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Notificaciones automáticas del sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleMarcarTodasLeidas}>
            <CheckCheck size={16} className="mr-1.5" /> Leer todas
          </Button>
          {hasPermission('gestionar_configuracion') && (
            <Button onClick={handleGenerar} loading={generando}>
              <RefreshCw size={16} className="mr-1.5" /> Generar ahora
            </Button>
          )}
        </div>
      </div>

      {/* Resumen */}
      {resumen && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tarjetasResumen.map(({ label, value, color, icon: Icon }) => (
            <Card key={label} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                </div>
                <Icon size={24} className={`${color} opacity-60`} />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Filtros */}
      <Card>
        <div className="p-4 border-b border-gray-200 dark:border-dark-border flex flex-wrap gap-3 items-center">
          <Filter size={16} className="text-gray-400 shrink-0" />

          <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500">
            <option value="">Todos los tipos</option>
            <option value="stock_bajo">Stock bajo</option>
            <option value="agotado">Agotado</option>
            <option value="por_vencer">Por vencer</option>
            <option value="vencido">Vencido</option>
            <option value="credito_vencer">Crédito por vencer</option>
            <option value="credito_vencido">Crédito vencido</option>
          </select>

          <select value={filterPrioridad} onChange={e => setFilterPrioridad(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500">
            <option value="">Todas las prioridades</option>
            <option value="critica">Crítica</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>

          <select value={filterLeida} onChange={e => setFilterLeida(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500">
            <option value="">Leídas y no leídas</option>
            <option value="false">Solo no leídas</option>
            <option value="true">Solo leídas</option>
          </select>

          <select value={filterResuelta} onChange={e => setFilterResuelta(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500">
            <option value="false">Activas</option>
            <option value="">Todas</option>
            <option value="true">Resueltas</option>
          </select>
        </div>

        {/* Lista */}
        {loading ? <Loading /> : alertas.length === 0 ? (
          <div className="py-16 text-center text-gray-500 dark:text-gray-400">
            <Bell size={32} className="mx-auto mb-3 opacity-40" />
            <p>No hay alertas con estos filtros</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {alertas.map(alerta => {
              const tipo = tipoConfig[alerta.tipo] || tipoConfig.stock_bajo;
              const prio = prioridadConfig[alerta.prioridad] || prioridadConfig.media;
              const TipoIcon = tipo.icon;

              return (
                <div key={alerta.id}
                  className={`flex gap-4 p-4 border-l-4 ${prio.border} ${!alerta.leida ? 'bg-gray-50 dark:bg-dark-hover' : ''} ${alerta.resuelta ? 'opacity-60' : ''}`}>
                  <div className={`mt-0.5 p-2 rounded-lg bg-gray-100 dark:bg-dark-card shrink-0`}>
                    <TipoIcon size={16} className={prio.color} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2 mb-1">
                      <p className={`font-medium text-sm ${!alerta.leida ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                        {alerta.titulo}
                      </p>
                      <Badge variant={prio.variant} size="sm">{prio.label}</Badge>
                      <Badge variant={tipo.badgeVariant} size="sm">{tipo.label}</Badge>
                      {alerta.resuelta && <Badge variant="success" size="sm">Resuelta</Badge>}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{alerta.mensaje}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(alerta.created_at).toLocaleString('es-EC')}
                    </p>
                  </div>

                  {!alerta.resuelta && (
                    <div className="flex flex-col gap-1 shrink-0">
                      {!alerta.leida && (
                        <button onClick={() => handleMarcarLeida(alerta.id)} title="Marcar como leída"
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors">
                          <Bell size={14} />
                        </button>
                      )}
                      <button onClick={() => handleMarcarResuelta(alerta.id)} title="Marcar como resuelta"
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors">
                        <Check size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-dark-border flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{pagination.total} alertas</span>
            <div className="flex gap-2">
              <button disabled={pagination.page === 1} onClick={() => cargar(pagination.page - 1)}
                className="px-3 py-1 rounded border border-gray-300 dark:border-dark-border disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-dark-hover">
                Anterior
              </button>
              <span className="px-3 py-1">Página {pagination.page} de {pagination.totalPages}</span>
              <button disabled={pagination.page === pagination.totalPages} onClick={() => cargar(pagination.page + 1)}
                className="px-3 py-1 rounded border border-gray-300 dark:border-dark-border disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-dark-hover">
                Siguiente
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Alertas;
