import { useRef } from 'react';
import { useConfiguracion } from '../../../shared/hooks/useConfiguracion';
import Button from '../../../shared/components/UI/Button';
import Badge from '../../../shared/components/UI/Badge';
import { formatCurrency, formatDateTime } from '../../../shared/utils/formatters';
import { Receipt, Printer, ShoppingCart, CheckCircle } from 'lucide-react';

const ReciboVenta = ({ venta, onClose, onNuevaVenta }) => {
  const reciboRef = useRef(null);
  const { getDatosEmpresa, getConfig } = useConfiguracion();
  const datosEmpresa = getDatosEmpresa();

  const handlePrint = () => {
    window.print();
  };

  const mensajeHeader = getConfig('pos_mensaje_ticket_header', '¡Bienvenido!');
  const mensajeFooter = getConfig('pos_mensaje_ticket_footer', 'Gracias por su compra');

  return (
    <div className="space-y-6">
      {/* Éxito */}
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          ¡Venta Completada!
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          La venta se ha registrado exitosamente
        </p>
      </div>

      {/* Recibo */}
      <div 
        ref={reciboRef}
        className="p-6 bg-white dark:bg-dark-card border-2 border-dashed border-gray-300 dark:border-dark-border rounded-lg print:border-0"
      >
        {/* Header del Recibo */}
        <div className="text-center mb-6 pb-4 border-b border-gray-200 dark:border-dark-border">
          <Receipt className="w-12 h-12 mx-auto mb-2 text-primary-600" />
          <h4 className="text-xl font-bold text-gray-800 dark:text-white">
            {datosEmpresa.nombre || 'Supermercado'}
          </h4>
          {datosEmpresa.ruc && (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              RUC: {datosEmpresa.ruc}
            </p>
          )}
          {datosEmpresa.direccion && (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {datosEmpresa.direccion}
            </p>
          )}
          {datosEmpresa.telefono && (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Tel: {datosEmpresa.telefono}
            </p>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {mensajeHeader}
          </p>
        </div>

        {/* Información de la Venta */}
        <div className="mb-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">N° Venta:</span>
            <span className="font-semibold text-gray-900 dark:text-white font-mono">
              {venta.numero_venta}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Fecha:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatDateTime(venta.fecha_venta)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Cajero:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {venta.usuario?.nombre}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Método de Pago:</span>
            <Badge variant="info" size="sm">
              {venta.metodo_pago === 'efectivo' ? 'Efectivo' :
               venta.metodo_pago === 'tarjeta' ? 'Tarjeta' :
               venta.metodo_pago === 'transferencia' ? 'Transferencia' : 'Mixto'}
            </Badge>
          </div>
        </div>

        {/* Productos */}
        <div className="mb-6">
          <h5 className="font-semibold text-gray-800 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-dark-border">
            Productos
          </h5>
          <div className="space-y-3">
            {venta.detalles?.map((detalle, index) => (
              <div key={index} className="text-sm">
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {detalle.producto.nombre}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(detalle.total)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    {detalle.cantidad} x {formatCurrency(detalle.precio_unitario)}
                  </span>
                  <span className="font-mono">{detalle.producto.codigo_barras}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totales */}
        <div className="pt-4 border-t-2 border-gray-300 dark:border-dark-border space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(venta.subtotal)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">IVA (12%):</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(venta.impuestos)}
            </span>
          </div>
          {parseFloat(venta.descuento) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Descuento:</span>
              <span className="font-medium text-red-600">
                - {formatCurrency(venta.descuento)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-dark-border">
            <span className="text-gray-800 dark:text-white">TOTAL:</span>
            <span className="text-primary-600">
              {formatCurrency(venta.total)}
            </span>
          </div>
        </div>

        {/* Pago */}
        {venta.metodo_pago === 'efectivo' && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-border space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Recibido:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(venta.monto_recibido)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Cambio:</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(venta.cambio)}
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-dark-border text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {mensajeFooter}
          </p>
          {datosEmpresa.sitio_web && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {datosEmpresa.sitio_web}
            </p>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Conserve este recibo como comprobante
          </p>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3 print:hidden">
        <Button 
          variant="secondary" 
          onClick={handlePrint}
          className="flex-1"
        >
          <Printer size={20} />
          Imprimir
        </Button>
        <Button 
          onClick={onNuevaVenta}
          className="flex-1"
        >
          <ShoppingCart size={20} />
          Nueva Venta
        </Button>
      </div>

      {/* CSS para impresión */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:border-0,
          .print\\:border-0 * {
            visibility: visible;
          }
          .print\\:border-0 {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ReciboVenta;