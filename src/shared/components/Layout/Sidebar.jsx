import { NavLink } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Scan,
  Warehouse,
  Truck,
  ShoppingBag,
  Store,
  Wallet,
  CreditCard,
  Receipt,
  Bell,
  FileText,
  BarChart3,
  Settings,
  Tag,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onToggle }) => {
  const { theme } = useTheme();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'text-blue-500' },
    { path: '/categorias', icon: Tag, label: 'Categorías', color: 'text-green-500' },
    { path: '/productos', icon: Package, label: 'Productos', color: 'text-orange-500' },
    { path: '/inventario', icon: Warehouse, label: 'Inventario', color: 'text-cyan-500' },
    { path: '/proveedores', icon: Truck, label: 'Proveedores', color: 'text-indigo-500' },
    { path: '/compras', icon: ShoppingBag, label: 'Compras', color: 'text-pink-500' },
    { path: '/escaneo', icon: Scan, label:'Escaner', color: 'text-teal-500' },
    { path: '/pos', icon: Store, label: 'Punto de Venta', color: 'text-emerald-500' },
    { path: '/caja', icon: Wallet, label: 'Caja', color: 'text-yellow-500' },
    { path: '/creditos', icon: CreditCard, label: 'Créditos', color: 'text-red-500' },
    { path: '/gastos', icon: Receipt, label: 'Gastos', color: 'text-amber-500' },
    { path: '/alertas', icon: Bell, label: 'Alertas', color: 'text-rose-500' },
    { path: '/auditoria', icon: FileText, label: 'Auditoría', color: 'text-slate-500' },
    { path: '/reportes', icon: BarChart3, label: 'Reportes', color: 'text-teal-500' },
    { path: '/configuracion', icon: Settings, label: 'Configuración', color: 'text-gray-500' },
  ];

  return (
    <>
      {/* Backdrop/Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full
          bg-white dark:bg-dark-card
          border-r border-gray-200 dark:border-dark-border
          transition-all duration-300 ease-in-out
          z-50
          lg:w-64
          ${isOpen ? 'w-64' : 'w-0'}
          overflow-hidden
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-dark-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                SM
              </div>
              <div className="overflow-hidden">
                <h1 className="font-bold text-gray-800 dark:text-white whitespace-nowrap">
                  Mapache
                </h1>
              </div>
            </div>

            {/* Botón cerrar en móvil */}
            <button
              onClick={onToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
            >
              <X size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-2">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    // Cerrar sidebar en móvil al hacer clic
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon 
                        size={20} 
                        className={`flex-shrink-0 ${isActive ? 'text-white' : item.color}`}
                      />
                      <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-dark-border">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              v1.0.0 - Sprint 4
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;