import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, BarChart3, Bell, TrendingUp, CreditCard } from 'lucide-react';
import Card from '../../../shared/components/UI/Card';

const ACCIONES = [
  { label: 'Punto de Venta', icon: ShoppingCart, color: 'bg-green-500',  path: '/pos'       },
  { label: 'Productos',      icon: Package,      color: 'bg-indigo-500', path: '/productos'  },
  { label: 'Reportes',       icon: BarChart3,    color: 'bg-blue-500',   path: '/reportes'   },
  { label: 'Alertas',        icon: Bell,         color: 'bg-orange-500', path: '/alertas'    },
  { label: 'Compras',        icon: TrendingUp,   color: 'bg-purple-500', path: '/compras'    },
  { label: 'Créditos',       icon: CreditCard,   color: 'bg-pink-500',   path: '/creditos'   },
];

const AccesoRapido = () => {
  const navigate = useNavigate();

  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Acceso Rápido</h2>
      <div className="grid grid-cols-2 gap-3">
        {ACCIONES.map(({ label, icon: Icon, color, path }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
          >
            <div className={`${color} p-2 rounded-lg`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 text-center leading-tight">
              {label}
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
};

export default AccesoRapido;
