import { useState, useEffect } from 'react';
import compraService from '../services/compra.service';
import Button from '../../../shared/components/UI/Button';
import Badge from '../../../shared/components/UI/Badge';
import Loading from '../../../shared/components/UI/Loading';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';
import { 
  Package, 
  User, 
  Calendar,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Truck
} from 'lucide-react';

const DetallesCompra = ({ compra: compraInicial, onClose, onRecibir }) => {
  const [compra, setCompra] = useState(compraInicial);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarDetalles();
  }, []);

  const cargarDetalles = async () => {
    try {
      setLoading(true);
      const response = await compraService.getById(compraInicial.id);
      setCompra(response.data);
    } catch (error) {
      console.error('Error al cargar detalles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Cargando detalles..." />;
  }

  const totalProductos = compra.detalles?.length || 0;
  const totalCantidad = compra.detalles?.reduce((sum, d) => sum + parseFloat(d.cantidad_pedida), 0) || 0;
  const totalRecibido = compra.detalles?.reduce((sum, d) => sum + parseFloat(d.cantidad_recibida), 0) || 0;
  const porcentajeRecibido = totalCantidad > 0 ? (totalRecibido / totalCantidad * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b border-gray-200 dark:border-dark-border">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
            {compra.numero_compra}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Proveedor: {compra.proveedor?.razon_social}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant={
            compra.estado === 'recibida' ? 'success' :
            compra.estado === 'pendiente' ? 'warning' :
            compra.estado === 'confirmada' ? 'info' :
            compra.estado === 'cancelada' ? 'danger' : 'default'
          }>
            {compra.estado}
          </Badge>
          <Badge variant={
            compra.estado_pago === 'pagado' ? 'success' :
            compra.estado_pago === 'pendiente' ? 'warning' :
            compra.estado_pago === 'vencido' ? 'danger' : 'info'
          }>
            {compra.estado_pago}
          </Badge>
        </div>
      </div>

      {/* Información General */}
      <div>
        <h4 className="font-semibold text-gray-800 dark:text-white mb-4">
          Información General
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gray-100 dark:bg-dark-hover rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar size={16} className="text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Fecha de Compra</p>
              <p className="font-medium text-gray-800 dark:text-white">
                {formatDate(compra.fecha_compra)}
              </p>
            </div>
          </div>

          {compra.fecha_entrega_estimada && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-100 dark:bg-dark-hover rounded-lg flex items-center justify-center flex-shrink-0">
                <Truck size={16} className="text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Entrega Estimada</p>
                <p className="font-medium text-gray-800 dark:text-white">
                  {formatDate(compra.fecha_entrega_estimada)}
                </p>
              </div>
            </div>
          )}

          {compra.fecha_entrega_real && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-100 dark:bg-dark-hover rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle size={16} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Entrega Real</p>
                <p className="font-medium text-gray-800 dark:text-white">
                  {formatDate(compra.fecha_entrega_real)}
                </p>
              </div>
            </div>
          )}

          {compra.numero_factura && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-100 dark:bg-dark-hover rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText size={16} className="text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Número de Factura</p>
                <p className="font-medium text-gray-800 dark:text-white">
                  {compra.numero_factura}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gray-100 dark:bg-dark-hover rounded-lg flex items-center justify-center flex-shrink-0">
              <User size={16} className="text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Registrado por</p>
              <p className="font-medium text-gray-800 dark:text-white">
                {compra.usuario?.nombre}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gray-100 dark:bg-dark-hover rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign size={16} className="text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tipo de Pago</p>
              <p className="font-medium text-gray-800 dark:text-white">
                {compra.tipo_pago === 'contado' ? 'Contado' : `Crédito ${compra.dias_credito} días`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progreso de Recepción */}
      {compra.estado !== 'cancelada' && (
        <div>
          <h4 className="font-semibold text-gray-800 dark:text-white mb-4">
            Progreso de Recepción
          </h4>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Recibido: {totalRecibido.toFixed(2)} de {totalCantidad.toFixed(2)} unidades
              </span>
              <span className="text-sm font-bold text-blue-600">
                {porcentajeRecibido}%
              </span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${porcentajeRecibido}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Detalles de Productos */}
      <div>
        <h4 className="font-semibold text-gray-800 dark:text-white mb-4">
          Productos ({totalProductos})
        </h4>
        <div className="space-y-3">
          {compra.detalles?.map((detalle) => {
            const cantidadPendiente = parseFloat(detalle.cantidad_pedida) - parseFloat(detalle.cantidad_recibida);
            const porcentaje = (parseFloat(detalle.cantidad_recibida) / parseFloat(detalle.cantidad_pedida) * 100).toFixed(0);
            
            return (
              <div
                key={detalle.id}
                className="p-4 bg-gray-50 dark:bg-dark-hover rounded-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {detalle.producto.nombre}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="info" size="sm">
                        Pedido: {detalle.cantidad_pedida}
                      </Badge>
                      <Badge variant="success" size="sm">
                        Recibido: {detalle.cantidad_recibida}
                      </Badge>
                      {cantidadPendiente > 0 && (
                        <Badge variant="warning" size="sm">
                          Pendiente: {cantidadPendiente.toFixed(2)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Precio Unit.</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {formatCurrency(detalle.precio_unitario)}
                    </p>
                  </div>
                </div>

                {/* Barra de progreso por producto */}
                <div className="mt-3">
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        porcentaje === '100' ? 'bg-green-600' : 'bg-blue-600'
                      }`}
                      style={{ width: `${porcentaje}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Subtotal</p>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {formatCurrency(detalle.subtotal)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Total</p>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {formatCurrency(detalle.total)}
                    </p>
                  </div>
                </div>

                {detalle.numero_lote_proveedor && (
                  <div className="mt-2 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Lote: </span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {detalle.numero_lote_proveedor}
                    </span>
                  </div>
                )}

                {detalle.fecha_caducidad && (
                  <div className="mt-1 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Caducidad: </span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {formatDate(detalle.fecha_caducidad)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Resumen Financiero */}
      <div>
        <h4 className="font-semibold text-gray-800 dark:text-white mb-4">
          Resumen Financiero
        </h4>
        <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(compra.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">IVA (12%):</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(compra.impuestos)}
              </span>
            </div>
            {parseFloat(compra.descuento) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Descuento:</span>
                <span className="font-medium text-red-600">
                  - {formatCurrency(compra.descuento)}
                </span>
              </div>
            )}
            <div className="pt-2 border-t border-gray-300 dark:border-gray-600">
              <div className="flex justify-between">
                <span className="text-lg font-bold text-gray-800 dark:text-white">Total:</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(compra.total)}
                </span>
              </div>
            </div>

            {compra.tipo_pago === 'credito' && (
              <>
                <div className="pt-2 border-t border-gray-300 dark:border-gray-600">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Pagado:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(compra.monto_pagado)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600 dark:text-gray-400">Saldo:</span>
                    <span className="font-medium text-orange-600">
                      {formatCurrency(parseFloat(compra.total) - parseFloat(compra.monto_pagado))}
                    </span>
                  </div>
                </div>

                {compra.fecha_vencimiento_pago && (
                  <div className="flex items-center gap-2 mt-2 p-2 bg-orange-100 dark:bg-orange-900/30 rounded">
                    <Clock size={16} className="text-orange-600" />
                    <span className="text-sm text-orange-700 dark:text-orange-400">
                      Vencimiento: {formatDate(compra.fecha_vencimiento_pago)}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Notas */}
      {compra.notas && (
        <div>
          <h4 className="font-semibold text-gray-800 dark:text-white mb-4">
            Notas
          </h4>
          <div className="p-4 bg-gray-50 dark:bg-dark-hover rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {compra.notas}
            </p>
          </div>
        </div>
      )}

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-dark-border">
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
        {(compra.estado === 'pendiente' || compra.estado === 'confirmada' || compra.estado === 'parcial') && onRecibir && (
          <Button onClick={onRecibir}>
            <Package size={20} />
            Recibir Mercancía
          </Button>
        )}
      </div>
    </div>
  );
};

export default DetallesCompra;