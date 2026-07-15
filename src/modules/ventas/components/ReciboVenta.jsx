import { useEffect } from 'react';
import Button from '../../../shared/components/UI/Button';
import Badge from '../../../shared/components/UI/Badge';
import { formatCurrency, formatDateTime } from '../../../shared/utils/formatters';
import { Printer, ShoppingCart, CheckCircle } from 'lucide-react';

const METODO_LABELS = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
  mixto: 'Mixto',
  credito: 'Crédito',
};

const ReciboVenta = ({ venta, onNuevaVenta, sinAcciones = false }) => {
  const datosEmpresa = {
    nombre: 'SuperMapache',
  };
  const mensajeHeader = '¡Bienvenido a SuperMapache!';
  const mensajeFooter = 'Gracias por su compra. ¡Vuelva pronto!';

  // CSS de impresión: oculta todo excepto el clon del ticket que se pega directo en <body>
  // Usamos un clon en vez de position:fixed porque fixed se repite en cada página al imprimir
  useEffect(() => {
    const STYLE_ID = 'recibo-ticket-print-styles';
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = `
      @media print {
        @page {
          size: 80mm auto;
          margin: 4mm 3mm;
        }
        body > *:not(#recibo-print-clone) {
          display: none !important;
        }
        #recibo-print-clone {
          display: block !important;
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 74mm !important;
          background: #fff !important;
          font-size: 11px !important;
          color: #000 !important;
          padding: 0 !important;
          margin: 0 !important;
          border: none !important;
          box-shadow: none !important;
          border-radius: 0 !important;
        }
      }
    `;
    return () => {
      document.getElementById(STYLE_ID)?.remove();
    };
  }, []);

  const handlePrint = () => {
    const source = document.getElementById('recibo-imprimible');
    if (!source) return;

    // Clonar el ticket directo en <body> para que position:absolute funcione
    // sin repetirse en cada página (como haría position:fixed)
    const clone = document.createElement('div');
    clone.id = 'recibo-print-clone';
    clone.innerHTML = source.innerHTML;
    document.body.appendChild(clone);

    window.print();

    // Limpiar el clon tras cerrar el diálogo de impresión
    setTimeout(() => clone.remove(), 500);
  };

  // Calcula el IVA real como porcentaje aproximado para el label del recibo
  const ivaLabel = () => {
    if (!venta.subtotal || parseFloat(venta.subtotal) === 0) return 'IVA';
    const pct = (parseFloat(venta.impuestos) / parseFloat(venta.subtotal)) * 100;
    const known = [0, 5, 12, 15];
    const closest = known.reduce((prev, curr) =>
      Math.abs(curr - pct) < Math.abs(prev - pct) ? curr : prev
    );
    return Math.abs(closest - pct) < 0.5 ? `IVA (${closest}%)` : 'IVA';
  };

  return (
    <div className="space-y-4">
      {/* Indicador de éxito */}
      <div className="text-center py-4">
        <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-9 h-9 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
          ¡Venta Completada!
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          La venta se ha registrado exitosamente
        </p>
      </div>

      {/* Ticket imprimible */}
      <div
        id="recibo-imprimible"
        className="p-4 bg-white dark:bg-dark-card border border-dashed border-gray-300 dark:border-dark-border rounded-lg text-sm"
      >
        {/* Cabecera empresa */}
        <div className="text-center mb-4 pb-3 border-b border-gray-200 dark:border-dark-border">
          <p className="font-bold text-base text-gray-900 dark:text-white">
            {datosEmpresa.nombre || 'Supermercado'}
          </p>
          {datosEmpresa.ruc && (
            <p className="text-xs text-gray-600 dark:text-gray-400">RUC: {datosEmpresa.ruc}</p>
          )}
          {datosEmpresa.direccion && (
            <p className="text-xs text-gray-600 dark:text-gray-400">{datosEmpresa.direccion}</p>
          )}
          {datosEmpresa.telefono && (
            <p className="text-xs text-gray-600 dark:text-gray-400">Tel: {datosEmpresa.telefono}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{mensajeHeader}</p>
        </div>

        {/* Info de la venta */}
        <div className="mb-4 space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">N° Venta:</span>
            <span className="font-semibold font-mono text-gray-900 dark:text-white text-xs">
              {venta.numeroVenta}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
            <span className="text-gray-900 dark:text-white text-xs">
              {formatDateTime(venta.fechaVenta ?? venta.createdAt)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Cajero:</span>
            <span className="text-gray-900 dark:text-white text-xs">
              {venta.usuario?.nombre}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400">Pago:</span>
            <Badge variant="info" size="sm">
              {METODO_LABELS[venta.tipoPago] ?? venta.tipoPago}
            </Badge>
          </div>

          {/* Desglose efectivo + transferencia para pago mixto */}
          {venta.tipoPago === 'mixto' &&
            (parseFloat(venta.montoEfectivo) > 0 || parseFloat(venta.montoTransferencia) > 0) && (
            <div className="ml-2 pl-2 border-l-2 border-gray-200 dark:border-dark-border space-y-0.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 dark:text-gray-500">└ Efectivo:</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {formatCurrency(venta.montoEfectivo)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 dark:text-gray-500">└ Transferencia:</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {formatCurrency(venta.montoTransferencia)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Productos */}
        <div className="mb-4 pt-2 border-t border-gray-200 dark:border-dark-border">
          <p className="font-semibold text-gray-800 dark:text-white mb-2">Productos</p>
          <div className="space-y-2">
            {venta.detalles?.map((detalle, index) => (
              <div key={index}>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900 dark:text-white leading-tight">
                    {detalle.producto?.nombre}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white whitespace-nowrap ml-2">
                    {formatCurrency(detalle.total)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    {detalle.cantidad} × {formatCurrency(detalle.precioUnitario)}
                  </span>
                  <span className="font-mono">{detalle.producto?.codigoBarras}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totales */}
        <div className="pt-2 border-t-2 border-gray-400 dark:border-dark-border space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Subtotal:</span>
            <span className="text-gray-900 dark:text-white">{formatCurrency(venta.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">{ivaLabel()}:</span>
            <span className="text-gray-900 dark:text-white">{formatCurrency(venta.impuestos)}</span>
          </div>
          {parseFloat(venta.descuento) > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Descuento:</span>
              <span className="text-red-600">−{formatCurrency(venta.descuento)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-300 dark:border-dark-border">
            <span className="text-gray-900 dark:text-white">TOTAL:</span>
            <span className="text-primary-600">{formatCurrency(venta.total)}</span>
          </div>
        </div>

        {/* Cambio (solo efectivo) */}
        {venta.tipoPago === 'efectivo' && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-dark-border space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Recibido:</span>
              <span className="text-gray-900 dark:text-white">{formatCurrency(venta.montoRecibido)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-gray-500 dark:text-gray-400">Cambio:</span>
              <span className="text-green-600">{formatCurrency(venta.montoCambio)}</span>
            </div>
          </div>
        )}

        {/* Pie */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-dark-border text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">{mensajeFooter}</p>
          {datosEmpresa.sitio_web && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{datosEmpresa.sitio_web}</p>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Conserve este recibo como comprobante
          </p>
        </div>
      </div>

      {/* Botones — ocultos al imprimir y opcionales según el contexto */}
      {!sinAcciones ? (
        <div className="flex gap-3 print:hidden">
          <Button variant="secondary" onClick={handlePrint} className="flex-1">
            <Printer size={18} />
            Imprimir
          </Button>
          <Button onClick={onNuevaVenta} className="flex-1">
            <ShoppingCart size={18} />
            Nueva Venta
          </Button>
        </div>
      ) : (
        <div className="flex justify-center print:hidden">
          <Button variant="secondary" onClick={handlePrint}>
            <Printer size={18} />
            Imprimir comprobante
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReciboVenta;
