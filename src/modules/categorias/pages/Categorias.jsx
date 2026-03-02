import { useState, useEffect } from 'react';
import { useNotification } from '../../../shared/hooks/useNotification';
import categoriaService from '../services/categoria.service';
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
  Package,
  Eye,
  LayoutGrid,
  List
} from 'lucide-react';
import FormularioCategoria from '../components/FormularioCategoria';

const Categorias = () => {
  const { showSuccess, showError } = useNotification();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      const response = await categoriaService.getAll();
      setCategorias(response.data);
    } catch (error) {
      showError(error.message || 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setSelectedCategoria(null);
    setModalOpen(true);
  };

  const handleEdit = (categoria) => {
    setModalMode('edit');
    setSelectedCategoria(categoria);
    setModalOpen(true);
  };

  const handleView = (categoria) => {
    setModalMode('view');
    setSelectedCategoria(categoria);
    setModalOpen(true);
  };

  const handleDelete = async (categoria) => {
    if (!window.confirm(`¿Estás seguro de eliminar la categoría "${categoria.nombre}"?`)) {
      return;
    }

    try {
      await categoriaService.delete(categoria.id);
      showSuccess('Categoría eliminada exitosamente');
      cargarCategorias();
    } catch (error) {
      showError(error.message || 'Error al eliminar categoría');
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (modalMode === 'create') {
        await categoriaService.create(data);
        showSuccess('Categoría creada exitosamente');
      } else if (modalMode === 'edit') {
        await categoriaService.update(selectedCategoria.id, data);
        showSuccess('Categoría actualizada exitosamente');
      }
      setModalOpen(false);
      cargarCategorias();
    } catch (error) {
      console.error('Error completo:', error);
      if (error.errors && Array.isArray(error.errors)) {
        const errores = error.errors.map(e => e.msg).join(', ');
        showError(`Errores de validación: ${errores}`);
      } else {
        showError(error.message || 'Error al guardar categoría');
      }
    }
  };

  const handleChangeView = async (newView) => {
    setViewMode(newView);
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setLoading(false);
  };

  const filteredCategorias = categorias.filter(cat =>
    cat.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loading message="Cargando categorías..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Categorías
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Organiza tus productos por categorías
          </p>
        </div>

        <Button onClick={handleCreate} size="lg">
          <Plus size={20} />
          Nueva Categoría
        </Button>
      </div>

      {/* Barra de herramientas */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar categorías..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Botones de vista */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'secondary'}
              onClick={() => handleChangeView('grid')}
            >
              <LayoutGrid size={20} />
              Tarjetas
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'secondary'}
              onClick={() => handleChangeView('list')}
            >
              <List size={20} />
              Lista
            </Button>
          </div>
        </div>
      </Card>

      {/* Contenido */}
      {filteredCategorias.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            No hay categorías
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm
              ? 'No se encontraron categorías con ese término de búsqueda'
              : 'Comienza agregando tu primera categoría'}
          </p>
          <Button onClick={handleCreate}>
            <Plus size={20} />
            Crear Primera Categoría
          </Button>
        </Card>
      ) : viewMode === 'grid' ? (
        // Vista de Tarjetas
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategorias.map((categoria) => (
            <CategoriaCard
              key={categoria.id}
              categoria={categoria}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
        </div>
      ) : (
        // Vista de Lista
        <Card>
          <div className="divide-y divide-gray-200 dark:divide-dark-border">
            {filteredCategorias.map((categoria) => (
              <CategoriaListItem
                key={categoria.id}
                categoria={categoria}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          modalMode === 'create'
            ? 'Nueva Categoría'
            : modalMode === 'edit'
            ? 'Editar Categoría'
            : 'Detalle de Categoría'
        }
        size="md"
      >
        <FormularioCategoria
          mode={modalMode}
          initialData={selectedCategoria}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

// Componente de tarjeta (vista grid)
const CategoriaCard = ({ categoria, onEdit, onDelete, onView }) => {
  return (
    <Card className="p-6 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: categoria.color + '20' }}
        >
          <Package size={24} style={{ color: categoria.color }} />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onView(categoria)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors"
            title="Ver detalle"
          >
            <Eye size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => onEdit(categoria)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors"
            title="Editar"
          >
            <Edit size={18} className="text-blue-600 dark:text-blue-400" />
          </button>
          <button
            onClick={() => onDelete(categoria)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors"
            title="Eliminar"
          >
            <Trash2 size={18} className="text-red-600 dark:text-red-400" />
          </button>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
        {categoria.nombre}
      </h3>

      {categoria.descripcion && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {categoria.descripcion}
        </p>
      )}

      <div className="flex items-center justify-between">
        <Badge variant="primary">
          {categoria.productos?.length || 0} productos
        </Badge>

        <Badge variant={categoria.activo ? 'success' : 'danger'}>
          {categoria.activo ? 'Activa' : 'Inactiva'}
        </Badge>
      </div>
    </Card>
  );
};

// Componente de lista (vista list)
const CategoriaListItem = ({ categoria, onEdit, onDelete, onView }) => {
  return (
    <div className="p-4 hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: categoria.color + '20' }}
          >
            <Package size={24} style={{ color: categoria.color }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h4 className="text-base font-semibold text-gray-800 dark:text-white">
                {categoria.nombre}
              </h4>
              <Badge variant={categoria.activo ? 'success' : 'danger'} size="sm">
                {categoria.activo ? 'Activa' : 'Inactiva'}
              </Badge>
            </div>
            
            {categoria.descripcion && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                {categoria.descripcion}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="primary">
              {categoria.productos?.length || 0} productos
            </Badge>
          </div>
        </div>

        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onView(categoria)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors"
            title="Ver detalle"
          >
            <Eye size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => onEdit(categoria)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors"
            title="Editar"
          >
            <Edit size={18} className="text-blue-600 dark:text-blue-400" />
          </button>
          <button
            onClick={() => onDelete(categoria)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors"
            title="Eliminar"
          >
            <Trash2 size={18} className="text-red-600 dark:text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Categorias;