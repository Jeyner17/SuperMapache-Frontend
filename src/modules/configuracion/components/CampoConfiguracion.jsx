import Badge from '../../../shared/components/UI/Badge';

const CampoConfiguracion = ({ 
  config, 
  valor, 
  onChange, 
  modificado = false 
}) => {
  const renderInput = () => {
    switch (config.tipo) {
      case 'boolean':
        return (
          <select
            value={String(valor)}
            onChange={(e) => onChange(config.clave, e.target.value, config.tipo)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            <option value="true">Activado</option>
            <option value="false">Desactivado</option>
          </select>
        );

      case 'porcentaje':
        return (
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={valor || ''}
              onChange={(e) => onChange(config.clave, e.target.value, config.tipo)}
              className="w-full px-4 py-2 pr-12 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              placeholder="0.00"
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
              %
            </span>
          </div>
        );

      case 'numero':
        return (
          <input
            type="number"
            step="0.01"
            value={valor || ''}
            onChange={(e) => onChange(config.clave, e.target.value, config.tipo)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            placeholder="0"
          />
        );

      case 'email':
        return (
          <input
            type="email"
            value={valor || ''}
            onChange={(e) => onChange(config.clave, e.target.value, config.tipo)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            placeholder="correo@ejemplo.com"
          />
        );

      case 'imagen':
        return (
          <div className="space-y-2">
            <input
              type="text"
              value={valor || ''}
              onChange={(e) => onChange(config.clave, e.target.value, config.tipo)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              placeholder="Ruta de la imagen o URL"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Ingresa la ruta relativa o URL de la imagen
            </p>
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={valor || ''}
            onChange={(e) => onChange(config.clave, e.target.value, config.tipo)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            placeholder="Ingresa un valor"
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <label className="block">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {config.descripcion || config.clave}
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
              {config.clave}
            </p>
          </div>
          {modificado && (
            <Badge variant="warning" size="sm">Modificado</Badge>
          )}
        </div>
        {renderInput()}
      </label>
    </div>
  );
};

export default CampoConfiguracion;