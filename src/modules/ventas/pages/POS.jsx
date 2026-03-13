import { useState, useEffect } from 'react';
import { useNotification } from '../../../shared/hooks/useNotification';
import ventaService from '../services/venta.service';
import BarcodeScanner from '../../escaneo/components/BarcodeScanner';
import Card from '../../../shared/components/UI/Card';
import Button from '../../../shared/components/UI/Button';
import Badge from '../../../shared/components/UI/Badge';
import Modal from '../../../shared/components/UI/Modal';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus,
  DollarSign,
  CreditCard,
  Smartphone,
  Receipt,
  AlertCircle
} from 'lucide-react';
import ModalPago from '../components/ModalPago';
import ReciboVenta from '../components/ReciboVenta';
import { formatCurrency } from '../../../shared/utils/formatters';

const POS = () => {
  const { showSuccess, showError } = useNotification();
  const [carrito, setCarrito] = useState([]);
  const [descuento, setDescuento] = useState(0);
  const [modalPagoOpen, setModalPagoOpen] = useState(false);
  const [modalReciboOpen, setModalReciboOpen] = useState(false);
  const [ventaCompletada, setVentaCompletada] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const handleProductoEscaneado = (producto) => {
    agregarAlCarrito(producto);
  };

  const agregarAlCarrito = (producto) => {
    const itemExistente = carrito.find(item => item.producto_id === producto.id);

    if (itemExistente) {
      // Incrementar cantidad
      setCarrito(carrito.map(item =>
        item.producto_id === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      // Agregar nuevo item
      setCarrito([...carrito, {
        producto_id: producto.id,
        nombre: producto.nombre,
        codigo_barras: producto.codigo_barras,
        precio_unitario: producto.precio_venta,
        cantidad: 1,
        stock_disponible: producto.stock_actual
      }]);
    }

    showSuccess(`${producto.nombre} agregado al carrito`);
  };

  const actualizarCantidad = (productoId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      quitarDelCarrito(productoId);
      return;
    }

    const item = carrito.find(i => i.producto_id === productoId);
    if (item && nuevaCantidad > item.stock_disponible) {
      showError(`Stock insuficiente. Disponible: ${item.stock_disponible}`);
      return;
    }

    setCarrito(carrito.map(item =>
      item.producto_id === productoId
        ? { ...item, cantidad: nuevaCantidad }
        : item
    ));
  };

  const quitarDelCarrito = (productoId) => {
    setCarrito(carrito.filter(item => item.producto_id !== productoId));
  };

  const vaciarCarrito = () => {
    if (carrito.length === 0) return;
    
    if (window.confirm('¿Está seguro de vaciar el carrito?')) {
      setCarrito([]);
      setDescuento(0);
    }
  };

  const calcularTotales = () => {
    const subtotal = carrito.reduce((sum, item) => 
      sum + (item.precio_unitario * item.cantidad), 0
    );
    const impuestos = subtotal * 0.12; // IVA 12%
    const total = subtotal + impuestos - descuento;

    return { subtotal, impuestos, total };
  };

  const handleProcesarPago = async (datosPago) => {
    if (carrito.length === 0) {
      showError('El carrito está vacío');
      return;
    }

    const totales = calcularTotales();

    if (datosPago.monto_recibido < totales.total) {
      showError('El monto recibido es insuficiente');
      return;
    }

    setProcesando(true);
    try {
      const dataVenta = {
        productos: carrito.map(item => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad
        })),
        metodo_pago: datosPago.metodo_pago,
        monto_recibido: datosPago.monto_recibido,
        descuento,
        notas: datosPago.notas
      };

      const response = await ventaService.create(dataVenta);
      const venta = response.data;

      setVentaCompletada(venta);
      setModalPagoOpen(false);
      setModalReciboOpen(true);

      // Limpiar carrito
      setCarrito([]);
      setDescuento(0);

      showSuccess('Venta procesada exitosamente');
    } catch (error) {
      showError(error.message || 'Error al procesar venta');
    } finally {
      setProcesando(false);
    }
  };

  const totales = calcularTotales();

  return (
    <div className="h-[calc(100vh-80px)] flex gap-6 animate-fade-in">
      {/* Panel Izquierdo - Escáner y Productos */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Punto de Venta
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Escanea productos o agrégalos manualmente
          </p>
        </div>

        {/* Escáner */}
        <div className="flex-shrink-0">
          <BarcodeScanner
            onProductFound={handleProductoEscaneado}
            modulo="pos"
            showHistory={false}
            autoFocus={true}
          />
        </div>

        {/* Lista de Productos en Carrito */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-dark-border">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <ShoppingCart size={20} />
                Carrito ({carrito.length} productos)
              </h3>
              {carrito.length > 0 && (
                <Button variant="secondary" size="sm" onClick={vaciarCarrito}>
                  <Trash2 size={16} />
                  Vaciar
                </Button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {carrito.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  El carrito está vacío
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Escanea un producto para comenzar
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {carrito.map((item) => (
                  <div
                    key={item.producto_id}
                    className="p-4 bg-gray-50 dark:bg-dark-hover rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.nombre}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                          {item.codigo_barras}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Stock disponible: {item.stock_disponible}
                        </p>
                      </div>
                      <button
                        onClick={() => quitarDelCarrito(item.producto_id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => actualizarCantidad(item.producto_id, item.cantidad - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-white dark:bg-dark-card border border-gray-300 dark:border-dark-border rounded hover:bg-gray-100 dark:hover:bg-dark-hover"
                        >
                          <Minus size={16} />
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={item.stock_disponible}
                          value={item.cantidad}
                          onChange={(e) => actualizarCantidad(item.producto_id, parseInt(e.target.value) || 1)}
                          className="w-16 text-center px-2 py-1 border border-gray-300 dark:border-dark-border rounded bg-white dark:bg-dark-card text-gray-900 dark:text-white"
                        />
                        <button
                          onClick={() => actualizarCantidad(item.producto_id, item.cantidad + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-white dark:bg-dark-card border border-gray-300 dark:border-dark-border rounded hover:bg-gray-100 dark:hover:bg-dark-hover"
                          disabled={item.cantidad >= item.stock_disponible}
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatCurrency(item.precio_unitario)} c/u
                        </p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatCurrency(item.precio_unitario * item.cantidad)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Panel Derecho - Resumen y Pago */}
      <div className="w-96 flex flex-col gap-6">
        {/* Resumen de Totales */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
            Resumen de Venta
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(totales.subtotal)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">IVA (12%):</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(totales.impuestos)}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">Descuento:</span>
              <input
                type="number"
                step="0.01"
                min="0"
                max={totales.subtotal + totales.impuestos}
                value={descuento}
                onChange={(e) => setDescuento(parseFloat(e.target.value) || 0)}
                className="w-24 text-right px-2 py-1 border border-gray-300 dark:border-dark-border rounded bg-white dark:bg-dark-card text-gray-900 dark:text-white text-sm"
                placeholder="0.00"
              />
            </div>

            <div className="pt-3 border-t border-gray-200 dark:border-dark-border">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800 dark:text-white">Total:</span>
                <span className="text-3xl font-bold text-primary-600">
                  {formatCurrency(totales.total)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Botones de Pago */}
        <div className="flex-1 flex flex-col gap-3">
          <Button
            onClick={() => setModalPagoOpen(true)}
            disabled={carrito.length === 0}
            size="lg"
            className="h-16 text-lg"
          >
            <DollarSign size={24} />
            Efectivo
          </Button>

          <Button
            onClick={() => setModalPagoOpen(true)}
            disabled={carrito.length === 0}
            variant="secondary"
            size="lg"
            className="h-16 text-lg"
          >
            <CreditCard size={24} />
            Tarjeta
          </Button>

          <Button
            onClick={() => setModalPagoOpen(true)}
            disabled={carrito.length === 0}
            variant="secondary"
            size="lg"
            className="h-16 text-lg"
          >
            <Smartphone size={24} />
            Transferencia
          </Button>
        </div>

        {/* Advertencia de Stock */}
        {carrito.some(item => item.cantidad > item.stock_disponible) && (
          <Card className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800 dark:text-red-400">
                <p className="font-semibold">Stock insuficiente</p>
                <p>Algunos productos exceden el stock disponible</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Modal de Pago */}
      <Modal
        isOpen={modalPagoOpen}
        onClose={() => setModalPagoOpen(false)}
        title="Procesar Pago"
        size="md"
      >
        <ModalPago
          total={totales.total}
          onPagar={handleProcesarPago}
          onCancelar={() => setModalPagoOpen(false)}
          procesando={procesando}
        />
      </Modal>

      {/* Modal de Recibo */}
      <Modal
        isOpen={modalReciboOpen}
        onClose={() => setModalReciboOpen(false)}
        title="Venta Completada"
        size="md"
      >
        {ventaCompletada && (
          <ReciboVenta
            venta={ventaCompletada}
            onClose={() => setModalReciboOpen(false)}
            onNuevaVenta={() => {
              setModalReciboOpen(false);
              setVentaCompletada(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default POS;