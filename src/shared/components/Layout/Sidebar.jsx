import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Warehouse,
  Truck,
  Store,
  Wallet,
  CreditCard,
  Receipt,
  Bell,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'text-blue-500' },
    { path: '/empleados', icon: Users, label: 'Empleados', color: 'text-purple-500' },
    { path: '/categorias', icon: Package, label: 'Categorías', color: 'text-green-500' },
    { path: '/productos', icon: Package, label: 'Productos', color: 'text-orange-500' },
    { path: '/inventario', icon: Warehouse, label: 'Inventario', color: 'text-cyan-500' },
    { path: '/proveedores', icon: Truck, label: 'Proveedores', color: 'text-indigo-500' },
    { path: '/compras', icon: ShoppingCart, label: 'Compras', color: 'text-pink-500' },
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
    <aside
      className={`
        bg-white dark:bg-dark-card
        border-r border-gray-200 dark:border-dark-border
        transition-all duration-300 ease-in-out
        flex flex-col
        ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Header del sidebar */}
      <div className="p-6 border-b border-gray-200 dark:border-dark-border flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <span className="text-lg font-bold text-gray-800 dark:text-white">
              Mapache
            </span>
          </div>
        )}
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors"
        >
          {collapsed ? (
            <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Menú */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg
                transition-all duration-200
                ${isActive
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
              title={collapsed ? item.label : ''}
            >
              <Icon
                size={20}
                className={isActive ? item.color : ''}
              />
              {!collapsed && (
                <span className="text-sm">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer del sidebar */}
      <div className="p-4 border-t border-gray-200 dark:border-dark-border">
        {!collapsed && (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            v1.0.0 - Sprint 1
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;