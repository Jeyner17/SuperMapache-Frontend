import Card from '../../../shared/components/UI/Card';
import CampoConfiguracion from './CampoConfiguracion';
import { Settings } from 'lucide-react';

const FormularioConfiguracion = ({ 
  categoria, 
  configuraciones = [], 
  cambiosPendientes = {},
  onCampoChange 
}) => {
  const iconosCategoria = {
    empresa: { icon: 'Building2', color: 'text-blue-600' },
    impuestos: { icon: 'Receipt', color: 'text-green-600' },
    inventario: { icon: 'Package', color: 'text-purple-600' },
    alertas: { icon: 'Bell', color: 'text-orange-600' },
    sistema: { icon: 'Monitor', color: 'text-gray-600' },
    pos: { icon: 'ShoppingCart', color: 'text-pink-600' },
    notificaciones: { icon: 'Mail', color: 'text-indigo-600' }
  };

  const nombresCategoria = {
    empresa: 'Empresa',
    impuestos: 'Impuestos',
    inventario: 'Inventario',
    alertas: 'Alertas',
    sistema: 'Sistema',
    pos: 'POS',
    notificaciones: 'Notificaciones'
  };

  const categoriaInfo = iconosCategoria[categoria] || {};

  const getValorActual = (config) => {
    return cambiosPendientes.hasOwnProperty(config.clave) 
      ? cambiosPendientes[config.clave] 
      : config.valor;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-dark-border">
        <div className={`w-12 h-12 rounded-lg bg-gray-100 dark:bg-dark-hover flex items-center justify-center`}>
          <Settings size={24} className={categoriaInfo.color} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {nombresCategoria[categoria] || categoria}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {configuraciones.length} configuración(es)
          </p>
        </div>
      </div>

      {configuraciones.length === 0 ? (
        <div className="text-center py-12">
          <Settings className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 dark:text-gray-400">
            No hay configuraciones en esta categoría
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {configuraciones.map((config) => (
            <CampoConfiguracion
              key={config.id}
              config={config}
              valor={getValorActual(config)}
              onChange={onCampoChange}
              modificado={cambiosPendientes.hasOwnProperty(config.clave)}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

export default FormularioConfiguracion;