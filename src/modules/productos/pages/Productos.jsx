import { useState, useEffect, useRef } from 'react';
import { useNotification } from '../../../shared/hooks/useNotification';
import productoService from '../services/producto.service';
import categoriaService from '../../categorias/services/categoria.service';
import Button from '../../../shared/components/UI/Button';
import Card from '../../../shared/components/UI/Card';
import Modal from '../../../shared/components/UI/Modal';
import Badge from '../../../shared/components/UI/Badge';
import Loading from '../../../shared/components/UI/Loading';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Package,
  Eye,
  BarChart3,
  AlertCircle,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import FormularioProducto from '../components/FormularioProducto';
import { formatCurrency } from '../../../shared/utils/formatters';

const Productos = () => {
  const { showSuccess, showError } = useNotification();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const searchTimer = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productoToDelete, setProductoToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [verificacion, setVerificacion] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    cargarCategorias();
  }, []);

  // Debounce: espera 300ms tras el último teclazo antes de buscar
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 300);
    return () => clearTimeout(searchTimer.current);
  }, [searchTerm]);

  useEffect(() => {
    cargarProductos();
  }, [pagination.page, filtroCategoria, debouncedSearch]);

  const cargarCategorias = async () => {
    try {
      const response = await categoriaService.getAll();
      setCategorias(response.data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const response = await productoService.getAll({
        page: pagination.page,
        limit: pagination.limit,
        categoria_id: filtroCategoria,
        search: debouncedSearch
      });
      
      setProductos(response.data.productos);
      setPagination(response.data.pagination);
    } catch (error) {
      showError(error.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setSelectedProducto(null);
    setModalOpen(true);
  };

  const handleEdit = (producto) => {
    setModalMode('edit');
    setSelectedProducto(producto);
    setModalOpen(true);
  };

  const handleView = (producto) => {
    setModalMode('view');
    setSelectedProducto(producto);
    setModalOpen(true);
  };

  const handleDelete = async (producto) => {
    setProductoToDelete(producto);
    setVerificacion(null);
    setDeleteModalOpen(true);
    setVerificando(true);
    try {
      const res = await productoService.verificarEliminacion(producto.id);
      setVerificacion(res.data);
    } catch {
      setVerificacion({ puedeEliminar: true, tieneStock: false, tieneVentas: false });
    } finally {
      setVerificando(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await productoService.delete(productoToDelete.id);
      showSuccess('Producto eliminado exitosamente');
      setDeleteModalOpen(false);
      setProductoToDelete(null);
      setVerificacion(null);
      await cargarProductos();
    } catch (error) {
      showError(error.message || 'Error al eliminar producto');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setProductoToDelete(null);
    setVerificacion(null);
  };

  const handleSubmit = async (data) => {
    try {
      if (modalMode === 'create') {
        await productoService.create(data);
        showSuccess('Producto creado exitosamente');
      } else if (modalMode === 'edit') {
        await productoService.update(selectedProducto.id, data);
        showSuccess('Producto actualizado exitosamente');
      }
      setModalOpen(false);
      cargarProductos();
    } catch (error) {
      showError(error.message || 'Error al guardar producto');
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (loading && productos.length === 0 && !searchTerm && !filtroCategoria) {
    return <Loading message="Cargando productos..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Productos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona el catálogo de productos de tu tienda
          </p>
        </div>

        <Button onClick={handleCreate} size="lg">
          <Plus size={20} />
          Nuevo Producto
        </Button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Productos</p>
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Categorías</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {categorias.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Stock Bajo</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                0
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Valor Total</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                $0.00
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
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, código o SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Filtro por categoría */}
          <div className="sm:w-64">
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Grid de productos */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : productos.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            No hay productos
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || filtroCategoria
              ? 'No se encontraron productos con los filtros aplicados'
              : 'Comienza agregando tu primer producto'}
          </p>
          <Button onClick={handleCreate}>
            <Plus size={20} />
            Crear Primer Producto
          </Button>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productos.map((producto) => (
              <ProductoCard
                key={producto.id}
                producto={producto}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
              />
            ))}
          </div>

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} productos
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Anterior
                  </Button>
                  
                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const pageNum = index + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === pagination.totalPages ||
                      (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                    ) {
                      return (
                        <Button
                          key={pageNum}
                          variant={pagination.page === pageNum ? 'primary' : 'secondary'}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    } else if (
                      pageNum === pagination.page - 2 ||
                      pageNum === pagination.page + 2
                    ) {
                      return <span key={pageNum} className="px-2">...</span>;
                    }
                    return null;
                  })}

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

      {/* Modal crear/editar/ver */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          modalMode === 'create'
            ? 'Nuevo Producto'
            : modalMode === 'edit'
            ? 'Editar Producto'
            : 'Detalle del Producto'
        }
        size="lg"
      >
        <FormularioProducto
          mode={modalMode}
          initialData={selectedProducto}
          categorias={categorias}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
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
          {/* Icono — rojo si puede eliminar, naranja si no */}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            verificacion && !verificacion.puedeEliminar
              ? 'bg-orange-100 dark:bg-orange-900/30'
              : 'bg-red-100 dark:bg-red-900/30'
          }`}>
            <AlertTriangle size={32} className={
              verificacion && !verificacion.puedeEliminar
                ? 'text-orange-500 dark:text-orange-400'
                : 'text-red-600 dark:text-red-400'
            } />
          </div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {verificacion && !verificacion.puedeEliminar
              ? 'No se puede eliminar'
              : '¿Eliminar producto?'}
          </h3>

          {/* Chip del producto */}
          {productoToDelete && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg mb-4 bg-gray-100 dark:bg-gray-800">
              {productoToDelete.imagen ? (
                <img
                  src={productoToDelete.imagen}
                  alt={productoToDelete.nombre}
                  className="w-8 h-8 object-contain rounded flex-shrink-0"
                />
              ) : (
                <Package size={20} className="text-gray-500 flex-shrink-0" />
              )}
              <span className="font-semibold text-base text-gray-800 dark:text-white">
                {productoToDelete.nombre}
              </span>
            </div>
          )}

          {/* Estado de verificación */}
          {verificando ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
              <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              Verificando condiciones...
            </div>
          ) : verificacion && !verificacion.puedeEliminar ? (
            /* Bloqueos */
            <div className="w-full mb-6 space-y-2 text-left">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3">
                Este producto no puede eliminarse por las siguientes razones:
              </p>
              {verificacion.tieneStock && (
                <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                  <AlertTriangle size={16} className="text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                      Tiene stock en inventario
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400">
                      {verificacion.stockTotal} unidades disponibles. Descuenta o ajusta el stock primero.
                    </p>
                  </div>
                </div>
              )}
              {verificacion.tieneVentas && (
                <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                  <AlertTriangle size={16} className="text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                      Tiene ventas registradas
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400">
                      {verificacion.totalVentas} {verificacion.totalVentas === 1 ? 'venta registrada' : 'ventas registradas'}. No se puede eliminar por integridad de datos.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Esta acción no se puede deshacer. Se eliminará el producto y toda su información.
            </p>
          )}

          <div className="flex gap-3 w-full">
            <button
              onClick={handleDeleteCancel}
              disabled={deleting}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors disabled:opacity-50"
            >
              {verificacion && !verificacion.puedeEliminar ? 'Cerrar' : 'Cancelar'}
            </button>
            {(!verificacion || verificacion.puedeEliminar) && (
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting || verificando}
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
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Componente para tarjeta de producto
const ProductoCard = ({ producto, onEdit, onDelete, onView }) => {
  const margen = parseFloat(producto.margen_ganancia) || 0;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all">
      {/* Imagen */}
      <div className="relative h-48 bg-gray-100 dark:bg-gray-800">
        {producto.imagen ? (
          <div className="w-full h-full flex items-center justify-center pt-10">
            <img
              src={producto.imagen}
              alt={producto.nombre}
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={64} className="text-gray-400" />
          </div>
        )}
        
        {/* Badge de caducidad */}
        {producto.requiere_caducidad && (
          <div className="absolute top-2 right-2">
            <Badge variant="warning" size="sm">
              Caducidad
            </Badge>
          </div>
        )}

        {/* Badge de categoría */}
        <div className="absolute top-2 left-2">
          <Badge 
            variant="primary" 
            size="sm"
            className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90"
          >
            {producto.categoria?.nombre}
          </Badge>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-1 truncate">
          {producto.nombre}
        </h3>
        
        {producto.descripcion && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {producto.descripcion}
          </p>
        )}

        {/* Precios */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Precio Venta</p>
            <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
              {formatCurrency(producto.precio_venta)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Margen</p>
            <p className={`text-sm font-semibold ${margen > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {margen.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Códigos */}
        <div className="space-y-1 mb-4">
          {producto.codigo_barras && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-medium">Código:</span> {producto.codigo_barras}
            </p>
          )}
          {producto.sku && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-medium">SKU:</span> {producto.sku}
            </p>
          )}
        </div>

        {/* Botones */}
        <div className="flex gap-2">
          <button
            onClick={() => onView(producto)}
            className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-dark-hover dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300"
          >
            <Eye size={16} />
            <span className="text-sm">Ver</span>
          </button>
          <button
            onClick={() => onEdit(producto)}
            className="flex-1 py-2 px-3 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-lg transition-colors flex items-center justify-center gap-2 text-blue-700 dark:text-blue-400"
          >
            <Edit size={16} />
            <span className="text-sm">Editar</span>
          </button>
          <button
            onClick={() => onDelete(producto)}
            className="py-2 px-3 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-lg transition-colors flex items-center justify-center text-red-700 dark:text-red-400"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default Productos;