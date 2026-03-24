import { useState, useEffect } from 'react';
import { useNotification } from '../../../shared/hooks/useNotification';
import compraService from '../services/compra.service';
import proveedorService from '../../proveedores/services/proveedor.service';
import Button from '../../../shared/components/UI/Button';
import Card from '../../../shared/components/UI/Card';
import Modal from '../../../shared/components/UI/Modal';
import Badge from '../../../shared/components/UI/Badge';
import Loading from '../../../shared/components/UI/Loading';
import {
  Plus,
  Search,
  Eye,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Trash2
} from 'lucide-react';
import FormularioCompra from '../components/FormularioCompra';
import DetallesCompra from '../components/DetallesCompra';
import FormularioRecepcion from '../components/FormularioRecepcion';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';

const Tooltip = ({ text, children }) => (
  <div className="relative group inline-flex">
    {children}
    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 dark:bg-gray-700 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
      {text}
    </span>
  </div>
);

const Compras = () => {
  const { showSuccess, showError } = useNotification();
  const [compras, setCompras] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroProveedor, setFiltroProveedor] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'crear' | 'detalle' | 'recibir'
  const [selectedCompra, setSelectedCompra] = useState(null);
  const [cancelModal, setCancelModal] = useState({ open: false, compra: null, motivo: '' });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    cargarProveedores();
  }, []);

  useEffect(() => {
    cargarCompras();
  }, [pagination.page, filtroEstado, filtroProveedor, searchTerm]);

  const cargarProveedores = async () => {
    try {
      const response = await proveedorService.getAll({ activo: 1 });      setProveedores(response.data);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
    }
  };

  const cargarCompras = async () => {
    try {
      setLoading(true);
      const response = await compraService.getAll({
        page: pagination.page,
        limit: pagination.limit,
        estado: filtroEstado,
        proveedor_id: filtroProveedor,
        search: searchTerm
      });
      
      setCompras(response.data.compras);
      setPagination(response.data.pagination);
    } catch (error) {
      showError(error.message || 'Error al cargar compras');
    } finally {
      setLoading(false);
    }
  };

  const handleCrear = () => {
    setModalType('crear');
    setSelectedCompra(null);
    setModalOpen(true);
  };

  const handleVerDetalle = (compra) => {
    setModalType('detalle');
    setSelectedCompra(compra);
    setModalOpen(true);
  };

  const handleRecibir = async (compra) => {
    try {
      const response = await compraService.getById(compra.id);
      setModalType('recibir');
      setSelectedCompra(response.data);
      setModalOpen(true);
    } catch (error) {
      showError('Error al cargar los detalles de la compra');
    }
  };

  const handleSubmitCompra = async (data) => {
    try {
      await compraService.create(data);
      showSuccess('Compra creada exitosamente');
      setModalOpen(false);
      cargarCompras();
    } catch (error) {
      showError(error.message || 'Error al crear compra');
    }
  };

  const handleSubmitRecepcion = async (data) => {
    try {
      await compraService.recibir(selectedCompra.id, data);
      showSuccess('Mercancía recibida exitosamente');
      setModalOpen(false);
      cargarCompras();
    } catch (error) {
      showError(error.message || 'Error al recibir mercancía');
    }
  };

  const handleCancelar = (compra) => {
    setCancelModal({ open: true, compra, motivo: '' });
  };

  const handleConfirmarCancelacion = async () => {
    if (!cancelModal.motivo.trim()) return;
    try {
      await compraService.cancelar(cancelModal.compra.id, cancelModal.motivo);
      showSuccess('Compra cancelada exitosamente');
      setCancelModal({ open: false, compra: null, motivo: '' });
      cargarCompras();
    } catch (error) {
      showError(error.message || 'Error al cancelar compra');
    }
  };

  const handleEliminar = async (compra) => {
    try {
      await compraService.delete(compra.id);
      showSuccess('Compra eliminada exitosamente');
      cargarCompras();
    } catch (error) {
      showError(error.message || 'Error al eliminar compra');
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (loading && compras.length === 0) {
    return <Loading message="Cargando compras..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Compras
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona tus órdenes de compra y recepciones
          </p>
        </div>

        <Button onClick={handleCrear} size="lg">
          <Plus size={20} />
          Nueva Compra
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Compras</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {pagination.total}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pendientes</p>
              <p className="text-2xl font-bold text-orange-600">
                {compras.filter(c => c.estado === 'pendiente' || c.estado === 'confirmada').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Recibidas</p>
              <p className="text-2xl font-bold text-green-600">
                {compras.filter(c => c.estado === 'recibida').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monto Total</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(compras.reduce((sum, c) => sum + parseFloat(c.total), 0))}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por número o factura..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <select
            value={filtroProveedor}
            onChange={(e) => setFiltroProveedor(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Todos los proveedores</option>
            {proveedores.map(prov => (
              <option key={prov.id} value={prov.id}>{prov.razon_social}</option>
            ))}
          </select>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="confirmada">Confirmada</option>
            <option value="recibida">Recibida</option>
            <option value="parcial">Parcial</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </Card>

      {/* Tabla de compras */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : compras.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            No hay compras
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || filtroEstado || filtroProveedor
              ? 'No se encontraron compras con los filtros aplicados'
              : 'Comienza creando tu primera orden de compra'}
          </p>
          <Button onClick={handleCrear}>
            <Plus size={20} />
            Crear Primera Compra
          </Button>
        </Card>
      ) : (
        <>
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-dark-hover">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Número
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Proveedor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Total
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Pago
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                  {compras.map((compra) => (
                    <tr key={compra.id} className="hover:bg-gray-50 dark:hover:bg-dark-hover">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {compra.numero_compra}
                          </div>
                          {compra.numero_factura && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Fact: {compra.numero_factura}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {compra.proveedor?.razon_social}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(compra.fecha_compra)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center font-medium text-gray-900 dark:text-white">
                        {formatCurrency(compra.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Badge variant={
                          compra.estado === 'recibida' ? 'success' :
                          compra.estado === 'pendiente' ? 'warning' :
                          compra.estado === 'confirmada' ? 'info' :
                          compra.estado === 'cancelada' ? 'danger' : 'default'
                        }>
                          {compra.estado}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Badge variant={
                          compra.estado_pago === 'pagado' ? 'success' :
                          compra.estado_pago === 'pendiente' ? 'warning' :
                          compra.estado_pago === 'vencido' ? 'danger' : 'info'
                        }>
                          {compra.estado_pago}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Tooltip text="Ver detalles">
                            <button
                              onClick={() => handleVerDetalle(compra)}
                              className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            >
                              <Eye size={18} className="text-blue-600" />
                            </button>
                          </Tooltip>
                          {(compra.estado === 'pendiente' || compra.estado === 'confirmada' || compra.estado === 'parcial') && (
                            <Tooltip text="Recibir mercadería">
                              <button
                                onClick={() => handleRecibir(compra)}
                                className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                              >
                                <CheckCircle size={18} className="text-green-600" />
                              </button>
                            </Tooltip>
                          )}
                          {compra.estado !== 'cancelada' && compra.estado !== 'recibida' && (
                            <Tooltip text="Cancelar orden">
                              <button
                                onClick={() => handleCancelar(compra)}
                                className="p-2 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
                              >
                                <XCircle size={18} className="text-orange-600" />
                              </button>
                            </Tooltip>
                          )}
                          {compra.estado === 'pendiente' && (
                            <Tooltip text="Eliminar orden">
                              <button
                                onClick={() => handleEliminar(compra)}
                                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              >
                                <Trash2 size={18} className="text-red-600" />
                              </button>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} compras
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Anterior
                  </Button>
                  
                  <Button
                    variant="secondary"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Modal cancelación */}
      <Modal
        isOpen={cancelModal.open}
        onClose={() => setCancelModal({ open: false, compra: null, motivo: '' })}
        title="Cancelar Orden de Compra"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ¿Estás seguro de que deseas cancelar la orden{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              {cancelModal.compra?.numero_compra}
            </span>?
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Motivo de cancelación <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={cancelModal.motivo}
              onChange={(e) => setCancelModal(prev => ({ ...prev, motivo: e.target.value }))}
              placeholder="Ingrese el motivo..."
              className="w-full rounded-lg border px-4 py-2.5 bg-white dark:bg-dark-card border-gray-300 dark:border-dark-border text-gray-900 dark:text-dark-text focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setCancelModal({ open: false, compra: null, motivo: '' })}
            >
              Volver
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmarCancelacion}
              disabled={!cancelModal.motivo.trim()}
            >
              Confirmar Cancelación
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modales */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          modalType === 'crear' ? 'Nueva Orden de Compra' :
          modalType === 'recibir' ? 'Recibir Mercancía' :
          'Detalles de la Compra'
        }
        size="lg"
      >
        {modalType === 'crear' && (
          <FormularioCompra
            proveedores={proveedores}
            onSubmit={handleSubmitCompra}
            onCancel={() => setModalOpen(false)}
          />
        )}
        {modalType === 'recibir' && selectedCompra && (
          <FormularioRecepcion
            compra={selectedCompra}
            onSubmit={handleSubmitRecepcion}
            onCancel={() => setModalOpen(false)}
          />
        )}
        {modalType === 'detalle' && selectedCompra && (
          <DetallesCompra
            compra={selectedCompra}
            onClose={() => setModalOpen(false)}
            onRecibir={async () => {
              setModalOpen(false);
              await handleRecibir(selectedCompra);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default Compras;