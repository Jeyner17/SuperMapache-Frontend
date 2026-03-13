import { useAuth } from '../../../shared/hooks/useAuth';
import Card from '../../../shared/components/UI/Card';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  CheckCircle,
  Users,
  DollarSign,
  ShoppingCart,
  BarChart3
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  // Datos de ejemplo (luego vendrán del backend)
  const stats = [
    {
      icon: DollarSign,
      label: 'Ventas Hoy',
      value: '$320.00',
      change: '+15%',
      changeType: 'positive',
      color: 'bg-green-500',
    },
    {
      icon: ShoppingCart,
      label: 'Productos Vendidos',
      value: '45',
      change: '+8%',
      changeType: 'positive',
      color: 'bg-blue-500',
    },
    {
      icon: AlertTriangle,
      label: 'Stock Bajo',
      value: '5',
      change: '-2',
      changeType: 'warning',
      color: 'bg-orange-500',
    },
    {
      icon: Package,
      label: 'Productos',
      value: '1,234',
      change: '+12',
      changeType: 'positive',
      color: 'bg-purple-500',
    },
  ];

  const sprints = [
    {
      number: 1,
      title: 'Sistema de Login',
      description: 'Autenticación y autorización básica',
      status: 'completado',
      icon: CheckCircle,
      color: 'border-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      number: '1.5',
      title: 'Configuración',
      description: 'Parámetros globales del sistema',
      status: 'completado',
      icon: CheckCircle,
      color: 'border-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      number: 2,
      title: 'CRUD de Productos',
      description: 'Crear, editar, eliminar y listar productos',
      status: 'completado',
      icon: CheckCircle,
      color: 'border-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      number: 3,
      title: 'Sistema de Inventario',
      description: 'Control de stock y alertas',
      status: 'completado',
      icon: CheckCircle,
      color: 'border-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      number: 4,
      title: 'Escaneo de Códigos',
      description: 'Lectura de códigos de barras',
      status: 'completado',
      icon: CheckCircle,
      color: 'border-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      number: 5,
      title: 'Proveedores y Compras',
      description: 'Órdenes de compra y recepción',
      status: 'completado',
      icon: CheckCircle,
      color: 'border-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      number: 6,
      title: 'Punto de Venta (POS)',
      description: 'Sistema de ventas en tiempo real',
      status: 'completado',
      icon: CheckCircle,
      color: 'border-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          ¡Hola , {user?.nombre?.split(' ')[0] || 'Usuario'}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Bienvenido al sistema de gestión del Supermercado Mapache. Desde aquí puedes administrar tu tienda de manera eficiente.
        </p>
      </div>

      {/* Cards de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6" hover>
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span
                  className={`text-sm font-medium ${stat.changeType === 'positive'
                    ? 'text-green-600 dark:text-green-400'
                    : stat.changeType === 'warning'
                      ? 'text-orange-600 dark:text-orange-400'
                      : 'text-red-600 dark:text-red-400'
                    }`}
                >
                  {stat.change}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {stat.value}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Estado del sistema */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-medium text-gray-800 dark:text-white">
              Sistema Activo
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Todos los servicios funcionando correctamente
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Users className="w-5 h-5 text-green-500" />
            <span className="font-medium text-gray-800 dark:text-white">
              Sprint 2
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            En Progreso - 40% completado
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-2">
            <BarChart3 className="w-5 h-5 text-orange-500" />
            <span className="font-medium text-gray-800 dark:text-white">
              Online
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Estado del servidor
          </p>
        </Card>
      </div>

      {/* Próximos pasos del desarrollo */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Próximos Pasos del Desarrollo
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sprints.map((sprint) => {
            const Icon = sprint.icon;
            return (
              <Card
                key={sprint.number}
                className={`p-6 border-l-4 ${sprint.color}`}
                hover={sprint.status !== 'completado'}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`${sprint.bgColor} p-2 rounded-lg`}>
                    <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                      {sprint.number}
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${sprint.status === 'completado'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : sprint.status === 'en-desarrollo'
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                  >
                    {sprint.status === 'completado'
                      ? '✓ Completado'
                      : sprint.status === 'en-desarrollo'
                        ? '🔨 En Desarrollo'
                        : '⏳ Pendiente'}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                  {sprint.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {sprint.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Acciones rápidas */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Acciones Rápidas
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card
            className="p-6 text-center cursor-pointer hover:scale-105"
            hover
          >
            <Package className="w-8 h-8 mx-auto mb-3 text-primary-600" />
            <p className="text-sm font-medium text-gray-800 dark:text-white">
              Nuevo Producto
            </p>
          </Card>

          <Card
            className="p-6 text-center cursor-pointer hover:scale-105"
            hover
          >
            <ShoppingCart className="w-8 h-8 mx-auto mb-3 text-green-600" />
            <p className="text-sm font-medium text-gray-800 dark:text-white">
              Nueva Venta
            </p>
          </Card>

          <Card
            className="p-6 text-center cursor-pointer hover:scale-105"
            hover
          >
            <BarChart3 className="w-8 h-8 mx-auto mb-3 text-blue-600" />
            <p className="text-sm font-medium text-gray-800 dark:text-white">
              Ver Reportes
            </p>
          </Card>

          <Card
            className="p-6 text-center cursor-pointer hover:scale-105"
            hover
          >
            <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-orange-600" />
            <p className="text-sm font-medium text-gray-800 dark:text-white">
              Ver Alertas
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;