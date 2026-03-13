import { 
  Building2, 
  Receipt, 
  Package, 
  Bell, 
  Monitor,
  ShoppingCart,
  Mail
} from 'lucide-react';
import Card from '../../../shared/components/UI/Card';

const CategoriaSelector = ({ 
  categoriaActiva, 
  onCategoriaChange, 
  categoriasCambios = {} 
}) => {
  const categorias = [
    { id: 'empresa', nombre: 'Empresa', icon: Building2, color: 'text-blue-600' },
    { id: 'impuestos', nombre: 'Impuestos', icon: Receipt, color: 'text-green-600' },
    { id: 'inventario', nombre: 'Inventario', icon: Package, color: 'text-purple-600' },
    { id: 'alertas', nombre: 'Alertas', icon: Bell, color: 'text-orange-600' },
    { id: 'sistema', nombre: 'Sistema', icon: Monitor, color: 'text-gray-600' },
    { id: 'pos', nombre: 'POS', icon: ShoppingCart, color: 'text-pink-600' },
    { id: 'notificaciones', nombre: 'Notificaciones', icon: Mail, color: 'text-indigo-600' }
  ];

  return (
    <Card className="p-4">
      <h3 className="font-semibold text-gray-800 dark:text-white mb-3">
        Categorías
      </h3>
      <nav className="space-y-1">
        {categorias.map((categoria) => {
          const Icon = categoria.icon;
          const activa = categoriaActiva === categoria.id;
          const tieneCambios = categoriasCambios[categoria.id] > 0;

          return (
            <button
              key={categoria.id}
              onClick={() => onCategoriaChange(categoria.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activa
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover'
              }`}
            >
              <Icon size={20} className={activa ? categoria.color : ''} />
              <span className="flex-1 text-left">{categoria.nombre}</span>
              {tieneCambios && (
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              )}
            </button>
          );
        })}
      </nav>
    </Card>
  );
};

export default CategoriaSelector;