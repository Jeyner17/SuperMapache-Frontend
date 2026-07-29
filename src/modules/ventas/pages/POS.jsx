import { useState, useEffect } from 'react';
import { useNotification } from '../../../shared/hooks/useNotification';
import ventaService from '../services/venta.service';
import cajaService from '../../caja/services/caja.service';
import BarcodeScanner from '../../escaneo/components/BarcodeScanner';
import Card from '../../../shared/components/UI/Card';
import Button from '../../../shared/components/UI/Button';
import Modal from '../../../shared/components/UI/Modal';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  AlertCircle,
  Receipt,
  History,
} from 'lucide-react';
import ModalPago from '../components/ModalPago';
import ReciboVenta from '../components/ReciboVenta';
import HistorialVentas from './HistorialVentas';
import { formatCurrency } from '../../../shared/utils/formatters';

const IVA_OPCIONES = [0, 5, 12, 15];

const POS = () => {
  const { showSuccess, showError } = useNotification();

  const [activeTab, setActiveTab] = useState('pos');
  const [carrito, setCarrito] = useState([]);
  const [descuento, setDescuento] = useState(0);
  const [modalPagoOpen, setModalPagoOpen] = useState(false);
  const [modalReciboOpen, setModalReciboOpen] = useState(false);
  const [modalConfirmVaciar, setModalConfirmVaciar] = useState(false);
  const [ventaCompletada, setVentaCompletada] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [scannerKey, setScannerKey] = useState(0);
  const [turnoActivo, setTurnoActivo] = useState(null);

  useEffect(() => {
    cajaService.getTurnoActivo()
      .then(res => { if (res.data) setTurnoActivo(res.data); })
      .catch(() => {});
  }, []);

  // ── Carrito ──────────────────────────────────────────────────────────────

  const agregarAlCarrito = (producto) => {
    const itemExistente = carrito.find(item => item.producto_id === producto.id);
    if (itemExistente) {
      setCarrito(carrito.map(item =>
        item.producto_id === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCarrito([...carrito, {
        producto_id: producto.id,
        nombre: producto.nombre,
        codigo_barras: producto.codigoBarras,
        precio_unitario: producto.precioVenta,
        cantidad: 1,
        stock_disponible: producto.stockActual ?? 0,
        iva_porcentaje: 0,
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

  const actualizarIVA = (productoId, ivaPorcentaje) => {
    setCarrito(carrito.map(item =>
      item.producto_id === productoId
        ? { ...item, iva_porcentaje: ivaPorcentaje }
        : item
    ));
  };

  const quitarDelCarrito = (productoId) => {
    setCarrito(carrito.filter(item => item.producto_id !== productoId));
  };

  // Muestra el modal de confirmación en vez de window.confirm
  const vaciarCarrito = () => {
    if (carrito.length === 0) return;
    setModalConfirmVaciar(true);
  };

  const confirmarVaciar = () => {
    setCarrito([]);
    setDescuento(0);
    setModalConfirmVaciar(false);
  };

  // ── Totales ───────────────────────────────────────────────────────────────

  const calcularTotales = () => {
    const subtotal = carrito.reduce(
      (sum, item) => sum + item.precio_unitario * item.cantidad, 0
    );
    const impuestos = carrito.reduce((sum, item) => {
      const itemSubtotal = item.precio_unitario * item.cantidad;
      return sum + itemSubtotal * ((item.iva_porcentaje ?? 0) / 100);
    }, 0);
    const total = Math.max(0, subtotal + impuestos - descuento);
    return { subtotal, impuestos, total };
  };

  // Label dinámico del IVA según las tasas en el carrito
  const getIVALabel = () => {
    if (carrito.length === 0) return 'IVA (12%)';
    const tasas = [...new Set(carrito.map(i => i.iva_porcentaje ?? 0))];
    if (tasas.length === 1) return `IVA (${tasas[0]}%)`;
    return 'IVA (mixto)';
  };

  // ── Pago ──────────────────────────────────────────────────────────────────

  const handleProcesarPago = async (datosPago) => {
    if (carrito.length === 0) {
      showError('El carrito está vacío');
      return;
    }

    const totales = calcularTotales();

    // Para crédito el monto recibido es 0, no aplicar la validación
    if (datosPago.metodo_pago !== 'credito' && datosPago.monto_recibido < totales.total) {
      showError('El monto recibido es insuficiente');
      return;
    }

    setProcesando(true);
    try {
      const dataVenta = {
        tipoPago: datosPago.metodo_pago,
        ...(turnoActivo?.id && { turnoId: turnoActivo.id }),
        detalles: carrito.map(item => ({
          productoId:      item.producto_id,
          cantidad:        item.cantidad,
          precioUnitario:  item.precio_unitario,
        })),
        notas: datosPago.notas,
        ...(datosPago.metodo_pago === 'efectivo' && {
          montoEfectivo: datosPago.monto_recibido,
        }),
        ...(datosPago.metodo_pago === 'transferencia' && {
          montoTransferencia: totales.total,
        }),
        ...(datosPago.metodo_pago === 'mixto' && {
          montoEfectivo:      datosPago.monto_efectivo,
          montoTransferencia: datosPago.monto_transferencia,
        }),
        ...(datosPago.metodo_pago === 'credito' && {
          clienteId: datosPago.cliente_id,
          diasPlazo: datosPago.dias_plazo,
        }),
      };

      const response = await ventaService.create(dataVenta);
      const venta = response.data;

      setVentaCompletada(venta);
      setModalPagoOpen(false);
      setModalReciboOpen(true);
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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col animate-fade-in">

      {/* ── Barra de pestañas ── */}
      <div className="flex-shrink-0 flex border-b border-gray-200 dark:border-dark-border mb-4">
        <TabBtn
          activo={activeTab === 'pos'}
          onClick={() => setActiveTab('pos')}
          icono={<ShoppingCart size={15} />}
          label="Punto de Venta"
        />
        <TabBtn
          activo={activeTab === 'historial'}
          onClick={() => setActiveTab('historial')}
          icono={<History size={15} />}
          label="Historial de Ventas"
        />
      </div>

      {/* ── Pestaña: Historial ── */}
      {activeTab === 'historial' && (
        <div>
          <HistorialVentas />
        </div>
      )}

      {/* ── Pestaña: POS ── */}
      {activeTab === 'pos' && (
      <div className="flex flex-col lg:flex-row gap-6">

      {/* ── Panel Izquierdo: Escáner + Carrito ── */}
      <div className="flex-1 flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Punto de Venta
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Escanea productos o agrégalos manualmente
          </p>
        </div>

        <div className="flex-shrink-0">
          <BarcodeScanner
            key={scannerKey}
            onProductFound={agregarAlCarrito}
            modulo="pos"
            showHistory={false}
            autoFocus={true}
          />
        </div>

        {/* Lista del carrito */}
        <Card className="flex flex-col">
          <div className="px-5 py-5 border-b border-gray-200 dark:border-dark-border">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <ShoppingCart size={20} />
                Carrito ({carrito.length} {carrito.length === 1 ? 'producto' : 'productos'})
              </h3>
              {carrito.length > 0 && (
                <Button variant="secondary" size="sm" onClick={vaciarCarrito}>
                  <Trash2 size={16} />
                  Vaciar
                </Button>
              )}
            </div>
          </div>

          <div className="p-4 lg:flex-1">
            {carrito.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">El carrito está vacío</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Escanea un producto para comenzar
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {carrito.map((item) => (
                  <div
                    key={item.producto_id}
                    className="rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card overflow-hidden"
                  >
                    {/* ── Cabecera: nombre + eliminar ── */}
                    <div className="flex items-start justify-between gap-2 px-4 pt-3 pb-2">
                      <p className="font-semibold text-gray-900 dark:text-white leading-snug">
                        {item.nombre}
                      </p>
                      <button
                        onClick={() => quitarDelCarrito(item.producto_id)}
                        className="flex-shrink-0 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors group"
                      >
                        <Trash2 size={15} className="text-gray-400 group-hover:text-red-500 transition-colors" />
                      </button>
                    </div>

                    {/* ── Chips: código + stock ── */}
                    <div className="flex items-center gap-2 px-4 pb-3">
                      <span className="text-xs font-mono text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-dark-hover px-2 py-0.5 rounded">
                        {item.codigo_barras}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        item.stock_disponible <= 5
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : item.stock_disponible <= 20
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      }`}>
                        Stock: {item.stock_disponible}
                      </span>
                    </div>

                    {/* ── Controles: cantidad + IVA + precio ── */}
                    <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 dark:bg-dark-hover border-t border-gray-100 dark:border-dark-border">

                      {/* Cantidad */}
                      <div className="flex items-center bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden">
                        <button
                          onClick={() => actualizarCantidad(item.producto_id, item.cantidad - 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
                        >
                          <Minus size={13} />
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={item.stock_disponible}
                          value={item.cantidad}
                          onChange={(e) =>
                            actualizarCantidad(item.producto_id, parseInt(e.target.value) || 1)
                          }
                          className="w-10 text-center text-sm font-bold bg-transparent text-gray-900 dark:text-white border-0 focus:ring-0 focus:outline-none"
                        />
                        <button
                          onClick={() => actualizarCantidad(item.producto_id, item.cantidad + 1)}
                          disabled={item.cantidad >= item.stock_disponible}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors disabled:opacity-30"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      {/* IVA */}
                      <div className="flex items-center gap-1.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg px-2.5 h-8">
                        <span className="text-xs font-medium text-gray-400 dark:text-gray-500 select-none">
                          IVA
                        </span>
                        <select
                          value={item.iva_porcentaje ?? 0}
                          onChange={(e) =>
                            actualizarIVA(item.producto_id, parseInt(e.target.value))
                          }
                          className="text-xs font-semibold bg-transparent text-primary-600 dark:text-primary-400 border-0 focus:ring-0 focus:outline-none cursor-pointer pr-1 dark:[color-scheme:dark]"
                        >
                          {IVA_OPCIONES.map(pct => (
                            <option key={pct} value={pct}>{pct}%</option>
                          ))}
                        </select>
                      </div>

                      {/* Precio (empuja a la derecha) */}
                      <div className="ml-auto text-right">
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {formatCurrency(item.precio_unitario)} × {item.cantidad}
                        </p>
                        <p className="text-base font-bold text-gray-900 dark:text-white">
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

      {/* ── Panel Derecho: Totales + Pago ── */}
      <div className="w-full lg:w-96 flex flex-col gap-6">
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
              <span className="text-gray-600 dark:text-gray-400">{getIVALabel()}:</span>
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

        {/* Botón de pago único — el método se elige dentro del ModalPago */}
        <div className="flex-1 flex flex-col gap-3">
          <Button
            onClick={() => setModalPagoOpen(true)}
            disabled={carrito.length === 0}
            size="lg"
            className="h-20 text-xl"
          >
            Procesar Pago
          </Button>
        </div>

        {/* Advertencia de stock */}
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
      {/* cierra flex-1 flex gap-6 (contenido del POS) */}
      </div>
      )}
      {/* fin pestaña POS */}

      {/* ── Modales — siempre montados para no perder estado ── */}
      {/* ── Modal: Confirmar vaciar carrito ── */}
      <Modal
        isOpen={modalConfirmVaciar}
        onClose={() => setModalConfirmVaciar(false)}
        title="Confirmar acción"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            ¿Está seguro de vaciar el carrito?
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setModalConfirmVaciar(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmarVaciar}
              className="flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              Vaciar Carrito
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Modal: Processar Pago ── */}
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

      {/* ── Modal: Recibo ── */}
      <Modal
        isOpen={modalReciboOpen}
        onClose={() => {
          setModalReciboOpen(false);
          setVentaCompletada(null);
        }}
        title="Comprobante de Venta"
        size="md"
      >
        {ventaCompletada && (
          <ReciboVenta
            venta={ventaCompletada}
            onNuevaVenta={() => {
              setModalReciboOpen(false);
              setVentaCompletada(null);
              setScannerKey(k => k + 1);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

// ── Subcomponente: botón de pestaña ──────────────────────────────────────────
const TabBtn = ({ activo, onClick, icono, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
      activo
        ? 'border-primary-600 text-primary-600 dark:text-primary-400'
        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-dark-border'
    }`}
  >
    {icono}
    {label}
  </button>
);

export default POS;
