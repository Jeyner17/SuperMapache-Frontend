import { useState, useEffect, useRef } from 'react';
import { useNotification } from '../../../shared/hooks/useNotification';
import proveedorService from '../services/proveedor.service';
import Button from '../../../shared/components/UI/Button';
import Card from '../../../shared/components/UI/Card';
import Modal from '../../../shared/components/UI/Modal';
import Badge from '../../../shared/components/UI/Badge';
import Loading from '../../../shared/components/UI/Loading';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  DollarSign,
  Package,
  Star,
  AlertTriangle,
  Building2
} from 'lucide-react';
import FormularioProveedor from '../components/FormularioProveedor';
import DetallesProveedor from '../components/DetallesProveedor';

const Proveedores = () => {
  const { showSuccess, showError } = useNotification();
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimer = useRef(null);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [proveedorToDelete, setProveedorToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(searchTimer.current);
  }, [searchTerm]);

  useEffect(() => {
    cargarProveedores();
  }, [debouncedSearch, filtroTipo]);

  const cargarProveedores = async () => {
    try {
      setLoading(true);
      const response = await proveedorService.getAll({
        search: debouncedSearch,
        tipo_proveedor: filtroTipo
      });
      setProveedores(response.data);
    } catch (error) {
      showError(error.message || 'Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setSelectedProveedor(null);
    setModalOpen(true);
  };

  const handleEdit = (proveedor) => {
    setModalMode('edit');
    setSelectedProveedor(proveedor);
    setModalOpen(true);
  };

  const handleView = (proveedor) => {
    setModalMode('view');
    setSelectedProveedor(proveedor);
    setModalOpen(true);
  };

  const handleDelete = (proveedor) => {
    setProveedorToDelete(proveedor);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await proveedorService.delete(proveedorToDelete.id);
      showSuccess('Proveedor eliminado exitosamente');
      setDeleteModalOpen(false);
      setProveedorToDelete(null);
      cargarProveedores();
    } catch (error) {
      showError(error.message || 'Error al eliminar proveedor');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setProveedorToDelete(null);
  };

  const handleSubmit = async (data) => {
    try {
      if (modalMode === 'create') {
        await proveedorService.create(data);
        showSuccess('Proveedor creado exitosamente');
      } else if (modalMode === 'edit') {
        await proveedorService.update(selectedProveedor.id, data);
        showSuccess('Proveedor actualizado exitosamente');
      }
      setModalOpen(false);
      cargarProveedores();
    } catch (error) {
      showError(error.message || 'Error al guardar proveedor');
    }
  };

  if (loading && proveedores.length === 0 && !searchTerm && !filtroTipo) {
    return <Loading message="Cargando proveedores..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Proveedores
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona tus proveedores y contactos comerciales
          </p>
        </div>

        <Button onClick={handleCreate} size="lg">
          <Plus size={20} />
          Nuevo Proveedor
        </Button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Proveedores</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {proveedores.length}
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Activos</p>
              <p className="text-2xl font-bold text-green-600">
                {proveedores.filter(p => p.activo).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Con Crédito</p>
              <p className="text-2xl font-bold text-orange-600">
                {proveedores.filter(p => p.dias_credito > 0).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Calificación Prom.</p>
              <p className="text-2xl font-bold text-yellow-600">
                {proveedores.length > 0
                  ? (proveedores.reduce((sum, p) => sum + parseFloat(p.calificacion || 0), 0) / proveedores.length).toFixed(1)
                  : '0.0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
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
              placeholder="Buscar por nombre, RUC o contacto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Todos los tipos</option>
            <option value="productos">Productos</option>
            <option value="servicios">Servicios</option>
            <option value="ambos">Ambos</option>
          </select>
        </div>
      </Card>

      {/* Grid de proveedores */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : proveedores.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            No hay proveedores
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || filtroTipo
              ? 'No se encontraron proveedores con los filtros aplicados'
              : 'Comienza agregando tu primer proveedor'}
          </p>
          <Button onClick={handleCreate}>
            <Plus size={20} />
            Crear Primer Proveedor
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proveedores.map((proveedor) => (
            <ProveedorCard
              key={proveedor.id}
              proveedor={proveedor}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
        </div>
      )}

      {/* Modal crear/editar/ver */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          modalMode === 'create'
            ? 'Nuevo Proveedor'
            : modalMode === 'edit'
            ? 'Editar Proveedor'
            : 'Detalles del Proveedor'
        }
        size={modalMode === 'view' ? 'lg' : 'md'}
      >
        {modalMode === 'view' ? (
          <DetallesProveedor
            proveedor={selectedProveedor}
            onClose={() => setModalOpen(false)}
          />
        ) : (
          <FormularioProveedor
            mode={modalMode}
            initialData={selectedProveedor}
            onSubmit={handleSubmit}
            onCancel={() => setModalOpen(false)}
          />
        )}
      </Modal>

      {/* Modal eliminar */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        title=""
        showCloseButton={false}
        size="sm"
      >
        <div className="flex flex-col items-center text-center px-2 pb-2">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <AlertTriangle size={32} className="text-red-600 dark:text-red-400" />
          </div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            ¿Eliminar proveedor?
          </h3>

          <p className="text-gray-600 dark:text-gray-400 mb-1">
            Estás a punto de eliminar
          </p>

          {proveedorToDelete && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg mb-4 mt-1 bg-gray-100 dark:bg-gray-800">
              <Building2 size={20} className="text-gray-500 flex-shrink-0" />
              <div className="text-left">
                <p className="font-semibold text-base text-gray-800 dark:text-white leading-tight">
                  {proveedorToDelete.razon_social}
                </p>
                {proveedorToDelete.ruc && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    RUC: {proveedorToDelete.ruc}
                  </p>
                )}
              </div>
            </div>
          )}

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Esta acción no se puede deshacer. Se eliminará el proveedor y toda su información.
          </p>

          <div className="flex gap-3 w-full">
            <button
              onClick={handleDeleteCancel}
              disabled={deleting}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {deleting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Sí, eliminar
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Componente para tarjeta de proveedor
const ProveedorCard = ({ proveedor, onEdit, onDelete, onView }) => {
  return (
    <Card className="p-6 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-1">
            {proveedor.razon_social}
          </h3>
          {proveedor.nombre_comercial && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {proveedor.nombre_comercial}
            </p>
          )}
        </div>
        <Badge variant={proveedor.activo ? 'success' : 'danger'}>
          {proveedor.activo ? 'Activo' : 'Inactivo'}
        </Badge>
      </div>

      {/* Información de contacto */}
      <div className="space-y-2 mb-4">
        {proveedor.ruc && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium mr-2">RUC:</span>
            <span>{proveedor.ruc}</span>
          </div>
        )}
        
        {proveedor.email && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Mail size={14} className="mr-2" />
            <span className="truncate">{proveedor.email}</span>
          </div>
        )}
        
        {proveedor.telefono && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Phone size={14} className="mr-2" />
            <span>{proveedor.telefono}</span>
          </div>
        )}
        
        {proveedor.ciudad && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <MapPin size={14} className="mr-2" />
            <span>{proveedor.ciudad}</span>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 gap-3 mb-4 pt-4 border-t border-gray-200 dark:border-dark-border">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Tipo</p>
          <Badge variant="info" size="sm">
            {proveedor.tipo_proveedor === 'productos' ? 'Productos' :
             proveedor.tipo_proveedor === 'servicios' ? 'Servicios' : 'Ambos'}
          </Badge>
        </div>
        
        {proveedor.dias_credito > 0 && (
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Crédito</p>
            <p className="text-sm font-semibold text-gray-800 dark:text-white">
              {proveedor.dias_credito} días
            </p>
          </div>
        )}
        
        {proveedor.calificacion > 0 && (
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Calificación</p>
            <div className="flex items-center">
              <Star size={14} className="text-yellow-500 mr-1" />
              <span className="text-sm font-semibold text-gray-800 dark:text-white">
                {parseFloat(proveedor.calificacion).toFixed(1)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="flex gap-2">
        <button
          onClick={() => onView(proveedor)}
          className="flex-1 py-2 px-3 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-lg transition-colors flex items-center justify-center gap-2 text-blue-700 dark:text-blue-400"
        >
          <Eye size={16} />
          <span className="text-sm">Ver</span>
        </button>
        <button
          onClick={() => onEdit(proveedor)}
          className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-dark-hover dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300"
        >
          <Edit size={16} />
          <span className="text-sm">Editar</span>
        </button>
        <button
          onClick={() => onDelete(proveedor)}
          className="py-2 px-3 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-lg transition-colors flex items-center justify-center text-red-700 dark:text-red-400"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </Card>
  );
};

export default Proveedores;
