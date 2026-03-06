import { useState } from 'react';
import BarcodeScanner from '../components/BarcodeScanner';
import Card from '../../../shared/components/UI/Card';
import Badge from '../../../shared/components/UI/Badge';
import Button from '../../../shared/components/UI/Button';
import { 
  Package, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Tag,
  Layers
} from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/formatters';

const VerificacionProductos = () => {
  const [productoActual, setProductoActual] = useState(null);

  const handleProductFound = (producto) => {
    setProductoActual(producto);
  };

  const getStockStatus = () => {
    if (!productoActual) return null;

    const { stock_actual, stock_minimo, stock_maximo } = productoActual;

    if (stock_actual <= 0) {
      return {
        label: 'Agotado',
        variant: 'danger',
        icon: AlertTriangle,
        color: 'text-red-600'
      };
    } else if (stock_actual <= stock_minimo) {
      return {
        label: 'Stock Bajo',
        variant: 'warning',
        icon: AlertTriangle,
        color: 'text-orange-600'
      };
    } else if (stock_actual >= stock_maximo) {
      return {
        label: 'Stock Exceso',
        variant: 'info',
        icon: TrendingUp,
        color: 'text-blue-600'
      };
    } else {
      return {
        label: 'Stock Normal',
        variant: 'success',
        icon: CheckCircle,
        color: 'text-green-600'
      };
    }
  };

  const stockStatus = getStockStatus();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Verificación de Productos
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Escanea productos para verificar precio y disponibilidad
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Escáner */}
        <div>
          <BarcodeScanner 
            onProductFound={handleProductFound}
            modulo="verificacion"
            showHistory={true}
          />
        </div>

        {/* Información del Producto */}
        <div>
          {productoActual ? (
            <div className="space-y-4">
              {/* Card Principal */}
              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                      {productoActual.nombre}
                    </h2>
                    {productoActual.categoria && (
                      <Badge variant="primary">
                        {productoActual.categoria.nombre}
                      </Badge>
                    )}
                  </div>
                  {productoActual.imagen && (
                    <img
                      src={productoActual.imagen}
                      alt={productoActual.nombre}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                </div>

                {/* Precio */}
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Precio de Venta</p>
                      <p className="text-4xl font-bold text-green-600">
                        {formatCurrency(productoActual.precio_venta)}
                      </p>
                    </div>
                    <DollarSign className="w-12 h-12 text-green-600 opacity-50" />
                  </div>
                </div>

                {/* Códigos */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Tag size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Código de Barras</p>
                      <p className="font-mono font-semibold text-gray-900 dark:text-white">
                        {productoActual.codigo_barras}
                      </p>
                    </div>
                  </div>

                  {productoActual.sku && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Layers size={20} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">SKU</p>
                        <p className="font-mono font-semibold text-gray-900 dark:text-white">
                          {productoActual.sku}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stock */}
                <div className={`p-4 rounded-lg border-l-4 ${
                  stockStatus?.variant === 'danger' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
                  stockStatus?.variant === 'warning' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500' :
                  stockStatus?.variant === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-500' :
                  'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Stock Disponible</p>
                      <div className="flex items-center gap-2 mt-1">
                        {stockStatus && <stockStatus.icon size={24} className={stockStatus.color} />}
                        <span className={`text-3xl font-bold ${stockStatus?.color}`}>
                          {productoActual.stock_actual}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {productoActual.unidad_medida}
                        </span>
                      </div>
                    </div>
                    {stockStatus && (
                      <Badge variant={stockStatus.variant}>
                        {stockStatus.label}
                      </Badge>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Mínimo: </span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {productoActual.stock_minimo}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Máximo: </span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {productoActual.stock_maximo}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Información Adicional */}
              <Card className="p-4">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-3">
                  Información Adicional
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Precio Costo:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(productoActual.precio_costo)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Margen:</span>
                    <span className="font-semibold text-green-600">
                      {productoActual.margen_ganancia}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Requiere Caducidad:</span>
                    <Badge variant={productoActual.requiere_caducidad ? 'warning' : 'default'} size="sm">
                      {productoActual.requiere_caducidad ? 'Sí' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                    <Badge variant={productoActual.activo ? 'success' : 'danger'} size="sm">
                      {productoActual.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                Escanea un Producto
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Utiliza el escáner o ingresa manualmente el código de barras para ver la información del producto
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificacionProductos;