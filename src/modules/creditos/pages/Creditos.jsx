import { useState, useEffect, useCallback } from 'react';
import Card from '../../../shared/components/UI/Card';
import Button from '../../../shared/components/UI/Button';
import Badge from '../../../shared/components/UI/Badge';
import Modal from '../../../shared/components/UI/Modal';
import Loading from '../../../shared/components/UI/Loading';
import { useNotification } from '../../../shared/hooks/useNotification';
import creditoService from '../services/credito.service';
import FormularioCliente from '../components/FormularioCliente';
import FormularioCredito from '../components/FormularioCredito';
import FormularioPago from '../components/FormularioPago';
import DetallesCredito from '../components/DetallesCredito';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';
import {
  Users, CreditCard, Plus, Search, Eye, DollarSign,
  TrendingUp, AlertCircle, Edit, UserCheck
} from 'lucide-react';

const estadoConfig = {
  pendiente: { label: 'Pendiente', variant: 'warning' },
  parcial:   { label: 'Parcial',   variant: 'info' },
  pagado:    { label: 'Pagado',    variant: 'success' },
  vencido:   { label: 'Vencido',   variant: 'danger' },
};

const TABS = [
  { id: 'creditos', label: 'Créditos', icon: CreditCard },
  { id: 'clientes', label: 'Clientes', icon: Users },
];

const Creditos = () => {
  const { showSuccess, showError } = useNotification();
  const [tab, setTab] = useState('creditos');
  const [loading, setLoading] = useState(true);

  // Data
  const [resumen, setResumen] = useState(null);
  const [creditos, setCreditos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [clientesPag, setClientesPag] = useState({ page: 1, totalPages: 1, total: 0 });

  // Filters
  const [searchCredito, setSearchCredito] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [searchCliente, setSearchCliente] = useState('');

  // Modals
  const [modalNuevoCliente, setModalNuevoCliente] = useState(false);
  const [modalEditarCliente, setModalEditarCliente] = useState(false);
  const [modalNuevoCredito, setModalNuevoCredito] = useState(false);
  const [modalPago, setModalPago] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [clienteEditar, setClienteEditar] = useState(null);
  const [creditoPago, setCreditoPago] = useState(null);
  const [creditoDetalle, setCreditoDetalle] = useState(null);

  const cargarResumen = useCallback(async () => {
    try {
      const res = await creditoService.getResumen();
      setResumen(res.data);
    } catch { /* silencioso */ }
  }, []);

  const cargarCreditos = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await creditoService.getCreditos({
        page, limit: 15,
        search: searchCredito || undefined,
        estado: filterEstado || undefined
      });
      setCreditos(res.data.creditos || []);
      setPagination({ page: res.data.page, totalPages: res.data.totalPages, total: res.data.total });
    } catch {
      showError('Error al cargar créditos');
    } finally {
      setLoading(false);
    }
  }, [searchCredito, filterEstado, showError]);

  const cargarClientes = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await creditoService.getClientes({
        page, limit: 15,
        search: searchCliente || undefined
      });
      setClientes(res.data.clientes || []);
      setClientesPag({ page: res.data.page, totalPages: res.data.totalPages, total: res.data.total });
    } catch {
      showError('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  }, [searchCliente, showError]);

  useEffect(() => { cargarResumen(); }, [cargarResumen]);
  useEffect(() => { if (tab === 'creditos') cargarCreditos(1); }, [tab, cargarCreditos]);
  useEffect(() => { if (tab === 'clientes') cargarClientes(1); }, [tab, cargarClientes]);

  // Handlers clientes
  const handleCrearCliente = async (data) => {
    try {
      await creditoService.crearCliente(data);
      showSuccess('Cliente creado correctamente');
      setModalNuevoCliente(false);
      cargarClientes(1);
      cargarResumen();
    } catch (err) {
      showError(err.response?.data?.message || 'Error al crear cliente');
      throw err;
    }
  };

  const handleEditarCliente = async (data) => {
    try {
      await creditoService.actualizarCliente(clienteEditar.id, data);
      showSuccess('Cliente actualizado correctamente');
      setModalEditarCliente(false);
      setClienteEditar(null);
      cargarClientes(clientesPag.page);
    } catch (err) {
      showError(err.response?.data?.message || 'Error al actualizar cliente');
      throw err;
    }
  };

  // Handlers créditos
  const handleCrearCredito = async (data) => {
    try {
      await creditoService.crearCredito(data);
      showSuccess('Crédito registrado correctamente');
      setModalNuevoCredito(false);
      cargarCreditos(1);
      cargarResumen();
    } catch (err) {
      showError(err.response?.data?.message || 'Error al registrar crédito');
      throw err;
    }
  };

  const handleVerDetalle = async (credito) => {
    try {
      const res = await creditoService.getCreditoById(credito.id);
      setCreditoDetalle(res.data);
      setModalDetalle(true);
    } catch {
      showError('Error al cargar detalle del crédito');
    }
  };

  const handleAbrirPago = (credito) => {
    setCreditoPago(credito);
    setModalPago(true);
  };

  const handleRegistrarPago = async (data) => {
    try {
      await creditoService.registrarPago(creditoPago.id, data);
      showSuccess('Pago registrado correctamente');
      setModalPago(false);
      setCreditoPago(null);
      cargarCreditos(pagination.page);
      cargarResumen();
    } catch (err) {
      showError(err.response?.data?.message || 'Error al registrar pago');
      throw err;
    }
  };

  const tarjetasResumen = resumen ? [
    { label: 'Total Pendiente',  value: formatCurrency(resumen.total_pendiente),  color: 'text-red-600',     icon: TrendingUp },
    { label: 'Total Vencido',    value: formatCurrency(resumen.total_vencido),    color: 'text-orange-600',  icon: AlertCircle },
    { label: 'Clientes Activos', value: resumen.clientes_activos,                 color: 'text-primary-600', icon: UserCheck },
    { label: 'Créditos Activos', value: (resumen.por_estado?.pendiente || 0) + (resumen.por_estado?.parcial || 0), color: 'text-blue-600', icon: CreditCard },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Créditos / Fiado</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Gestión de clientes y deudas a crédito</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setModalNuevoCliente(true)}>
            <Users size={16} className="mr-1.5" /> Nuevo Cliente
          </Button>
          <Button onClick={() => setModalNuevoCredito(true)}>
            <Plus size={16} className="mr-1.5" /> Registrar Crédito
          </Button>
        </div>
      </div>

      {/* Tarjetas resumen */}
      {resumen && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tarjetasResumen.map(({ label, value, color, icon: Icon }) => (
            <Card key={label} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                  <p className={`text-xl font-bold ${color}`}>{value}</p>
                </div>
                <Icon size={24} className={`${color} opacity-60`} />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-dark-border">
        <nav className="flex gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}>
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab: Créditos */}
      {tab === 'creditos' && (
        <Card>
          <div className="p-4 border-b border-gray-200 dark:border-dark-border flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" value={searchCredito}
                onChange={e => setSearchCredito(e.target.value)}
                placeholder="Buscar por número o cliente..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500" />
            </div>
            <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500">
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="parcial">Parcial</option>
              <option value="pagado">Pagado</option>
              <option value="vencido">Vencido</option>
            </select>
          </div>

          {loading ? <Loading /> : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                <thead className="bg-gray-50 dark:bg-dark-hover">
                  <tr>
                    {['Número', 'Cliente', 'Total', 'Pagado', 'Pendiente', 'Vencimiento', 'Estado', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-100 dark:divide-gray-700">
                  {creditos.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">No hay créditos</td></tr>
                  ) : creditos.map(c => {
                    const cfg = estadoConfig[c.estado] || estadoConfig.pendiente;
                    const vencido = new Date(c.fecha_vencimiento) < new Date() && c.estado !== 'pagado';
                    return (
                      <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-dark-hover">
                        <td className="px-4 py-3 font-mono font-medium text-gray-900 dark:text-white whitespace-nowrap">{c.numero_credito}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{c.cliente?.nombre}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">{formatCurrency(c.monto_total)}</td>
                        <td className="px-4 py-3 text-green-600 whitespace-nowrap">{formatCurrency(c.monto_pagado)}</td>
                        <td className="px-4 py-3 font-semibold text-red-600 whitespace-nowrap">{formatCurrency(c.saldo_pendiente)}</td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm ${vencido ? 'text-red-600 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                          {formatDate(c.fecha_vencimiento)}
                        </td>
                        <td className="px-4 py-3"><Badge variant={cfg.variant} size="sm">{cfg.label}</Badge></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleVerDetalle(c)} title="Ver detalle"
                              className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors">
                              <Eye size={15} />
                            </button>
                            {c.estado !== 'pagado' && (
                              <button onClick={() => handleAbrirPago(c)} title="Registrar pago"
                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors">
                                <DollarSign size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-dark-border flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>{pagination.total} créditos</span>
              <div className="flex gap-2">
                <button disabled={pagination.page === 1} onClick={() => cargarCreditos(pagination.page - 1)}
                  className="px-3 py-1 rounded border border-gray-300 dark:border-dark-border disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-dark-hover">
                  Anterior
                </button>
                <span className="px-3 py-1">Página {pagination.page} de {pagination.totalPages}</span>
                <button disabled={pagination.page === pagination.totalPages} onClick={() => cargarCreditos(pagination.page + 1)}
                  className="px-3 py-1 rounded border border-gray-300 dark:border-dark-border disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-dark-hover">
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Tab: Clientes */}
      {tab === 'clientes' && (
        <Card>
          <div className="p-4 border-b border-gray-200 dark:border-dark-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" value={searchCliente}
                onChange={e => setSearchCliente(e.target.value)}
                placeholder="Buscar por nombre o cédula..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>

          {loading ? <Loading /> : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                <thead className="bg-gray-50 dark:bg-dark-hover">
                  <tr>
                    {['Nombre', 'Cédula', 'Teléfono', 'Saldo Pendiente', 'Límite', 'Estado', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-100 dark:divide-gray-700">
                  {clientes.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">No hay clientes registrados</td></tr>
                  ) : clientes.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-dark-hover">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{c.nombre}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.cedula || '—'}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.telefono || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${parseFloat(c.saldo_pendiente) > 0 ? 'text-red-600' : 'text-gray-500 dark:text-gray-400'}`}>
                          {formatCurrency(c.saldo_pendiente)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {parseFloat(c.limite_credito) > 0 ? formatCurrency(c.limite_credito) : 'Sin límite'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={c.activo ? 'success' : 'default'} size="sm">
                          {c.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => { setClienteEditar(c); setModalEditarCliente(true); }} title="Editar"
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors">
                          <Edit size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {clientesPag.totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-dark-border flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>{clientesPag.total} clientes</span>
              <div className="flex gap-2">
                <button disabled={clientesPag.page === 1} onClick={() => cargarClientes(clientesPag.page - 1)}
                  className="px-3 py-1 rounded border border-gray-300 dark:border-dark-border disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-dark-hover">
                  Anterior
                </button>
                <span className="px-3 py-1">Página {clientesPag.page} de {clientesPag.totalPages}</span>
                <button disabled={clientesPag.page === clientesPag.totalPages} onClick={() => cargarClientes(clientesPag.page + 1)}
                  className="px-3 py-1 rounded border border-gray-300 dark:border-dark-border disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-dark-hover">
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Modals */}
      <Modal isOpen={modalNuevoCliente} onClose={() => setModalNuevoCliente(false)} title="Nuevo Cliente">
        <FormularioCliente onSubmit={handleCrearCliente} onCancel={() => setModalNuevoCliente(false)} />
      </Modal>

      <Modal isOpen={modalEditarCliente} onClose={() => { setModalEditarCliente(false); setClienteEditar(null); }} title="Editar Cliente">
        <FormularioCliente cliente={clienteEditar} onSubmit={handleEditarCliente} onCancel={() => { setModalEditarCliente(false); setClienteEditar(null); }} />
      </Modal>

      <Modal isOpen={modalNuevoCredito} onClose={() => setModalNuevoCredito(false)} title="Registrar Crédito">
        <FormularioCredito onSubmit={handleCrearCredito} onCancel={() => setModalNuevoCredito(false)} />
      </Modal>

      <Modal isOpen={modalPago} onClose={() => { setModalPago(false); setCreditoPago(null); }} title="Registrar Pago">
        {creditoPago && (
          <FormularioPago credito={creditoPago} onSubmit={handleRegistrarPago} onCancel={() => { setModalPago(false); setCreditoPago(null); }} />
        )}
      </Modal>

      <Modal isOpen={modalDetalle} onClose={() => { setModalDetalle(false); setCreditoDetalle(null); }} title="Detalle del Crédito" size="lg">
        <DetallesCredito credito={creditoDetalle} onClose={() => { setModalDetalle(false); setCreditoDetalle(null); }} />
      </Modal>
    </div>
  );
};

export default Creditos;
