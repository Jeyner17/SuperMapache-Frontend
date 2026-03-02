import { useState, useEffect } from 'react';
import inventarioService from '../services/inventario.service';
import Button from '../../../shared/components/UI/Button';
import Badge from '../../../shared/components/UI/Badge';
import Loading from '../../../shared/components/UI/Loading';
import { formatDate, formatDateTime } from '../../../shared/utils/formatters';
import { Package, Calendar, MapPin, FileText, History, TrendingUp, TrendingDown } from 'lucide-react';

const DetallesLote = ({ lote: loteInicial, onClose }) => {
  const [lote, setLote] = useState(loteInicial);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarDetalles();
  }, []);

  const cargarDetalles = async () => {
    try {
      setLoading(true);
      const response = await inventarioService.getLoteById(loteInicial.id);
      setLote(response.data);
    } catch (error) {
      console.error('Error al cargar detalles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Cargando detalles..." />;
  }

  const diasParaVencer = lote.fecha_caducidad 
    ? Math.ceil((new Date(lote.fecha_caducidad) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const porcentajeUsado = ((lote.cantidad_inicial - lote.cantidad_actual) / lote.cantidad_inicial * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b border-gray-200 dark:border-dark-border">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
            {lote.producto.nombre}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Lote: {lote.numero_lote}
          </p>
        </div>
        <div>
          <Badge variant={
            lote.estado === 'disponible' ? 'success' :
            lote.estado === 'por_vencer' ? 'warning' :
            lote.estado === 'vencido' ? 'danger' : 'default'
          }>
            {lote.estado === 'disponible' ? 'Disponible' :
             lote.estado === 'por_vencer' ? 'Por Vencer' :
             lote.estado === 'vencido' ? 'Vencido' :
             'Agotado'}
          </Badge>
        </div>
      </div>

      {/* Información Principal */}
      <div className="grid grid-cols-2 gap-6">
        {/* Stock */}
        <div className="col-span-2 p-4 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Stock Actual</span>
            <Package size={20} className="text-primary-600" />
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-primary-600">
                {lote.cantidad_actual}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                de {lote.cantidad_inicial} {lote.producto.unidad_medida}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                {porcentajeUsado}%
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                utilizado
              </p>
            </div>
          </div>
          {/* Barra de progreso */}
          <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-600 transition-all duration-300"
              style={{ width: `${porcentajeUsado}%` }}
            ></div>
          </div>
        </div>

        {/* Fecha de Ingreso */}
        <div className="p-4 bg-gray-50 dark:bg-dark-hover rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={18} className="text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Fecha de Ingreso</span>
          </div>
          <p className="text-lg font-semibold text-gray-800 dark:text-white">
            {formatDate(lote.fecha_ingreso)}
          </p>
        </div>

        {/* Fecha de Caducidad */}
        {lote.fecha_caducidad && (
          <div className={`p-4 rounded-lg ${
            lote.estado === 'vencido' ? 'bg-red-50 dark:bg-red-900/20' :
            lote.estado === 'por_vencer' ? 'bg-orange-50 dark:bg-orange-900/20' :
            'bg-gray-50 dark:bg-dark-hover'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={18} className={
                lote.estado === 'vencido' ? 'text-red-600' :
                lote.estado === 'por_vencer' ? 'text-orange-600' :
                'text-gray-600 dark:text-gray-400'
              } />
              <span className="text-sm text-gray-600 dark:text-gray-400">Caducidad</span>
            </div>
            <p className={`text-lg font-semibold ${
              lote.estado === 'vencido' ? 'text-red-600' :
              lote.estado === 'por_vencer' ? 'text-orange-600' :
              'text-gray-800 dark:text-white'
            }`}>
              {formatDate(lote.fecha_caducidad)}
            </p>
            {diasParaVencer !== null && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {lote.estado === 'vencido' 
                  ? `Venció hace ${Math.abs(diasParaVencer)} días`
                  : `Vence en ${diasParaVencer} días`
                }
              </p>
            )}
          </div>
        )}

        {/* Ubicación */}
        {lote.ubicacion && (
          <div className="col-span-2 p-4 bg-gray-50 dark:bg-dark-hover rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={18} className="text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Ubicación Física</span>
            </div>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">
              {lote.ubicacion}
            </p>
          </div>
        )}

        {/* Notas */}
        {lote.notas && (
          <div className="col-span-2 p-4 bg-gray-50 dark:bg-dark-hover rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={18} className="text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Notas</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {lote.notas}
            </p>
          </div>
        )}
      </div>

      {/* Historial de Movimientos */}
      {lote.movimientos && lote.movimientos.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <History size={20} className="text-gray-600 dark:text-gray-400" />
            <h4 className="font-semibold text-gray-800 dark:text-white">
              Últimos Movimientos
            </h4>
          </div>
          
          <div className="space-y-3">
            {lote.movimientos.map((movimiento) => (
              <div
                key={movimiento.id}
                className="p-3 bg-gray-50 dark:bg-dark-hover rounded-lg border-l-4"
                style={{
                  borderColor: 
                    movimiento.tipo_movimiento === 'entrada' ? '#10b981' :
                    movimiento.tipo_movimiento === 'salida' ? '#ef4444' :
                    '#f59e0b'
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {movimiento.tipo_movimiento === 'entrada' ? (
                        <TrendingUp size={16} className="text-green-600" />
                      ) : (
                        <TrendingDown size={16} className="text-red-600" />
                      )}
                      <span className="font-medium text-gray-800 dark:text-white capitalize">
                        {movimiento.tipo_movimiento}
                      </span>
                      <span className={`text-sm font-bold ${
                        movimiento.tipo_movimiento === 'entrada' ? 'text-green-600' :
                        movimiento.tipo_movimiento === 'salida' ? 'text-red-600' :
                        'text-orange-600'
                      }`}>
                        {movimiento.tipo_movimiento === 'entrada' ? '+' : '-'}
                        {movimiento.cantidad}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {movimiento.motivo}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {formatDateTime(movimiento.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Resultado</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                      {movimiento.cantidad_nueva}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botón de Cerrar */}
      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-dark-border">
        <Button onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </div>
  );
};

export default DetallesLote;