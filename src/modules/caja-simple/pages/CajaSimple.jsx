import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/hooks/useAuth';
import { formatCurrency } from '../../../shared/utils/formatters';
import escaneoService from '../../escaneo/services/escaneo.service';
import ventaService from '../../ventas/services/venta.service';
import cajaService from '../../caja/services/caja.service';

// ─── Pantalla de caja cerrada / abrir turno ──────────────────────────────────
const PantallaSinTurno = ({ onLogout, onAbrioTurno }) => {
  const [monto, setMonto] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAbrir = async () => {
    const m = parseFloat(monto);
    if (isNaN(m) || m < 0) {
      setError('Ingresa un monto válido (puede ser 0)');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await cajaService.abrirTurno({ montoInicial: m });
      onAbrioTurno(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al abrir la caja. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header igual al POS */}
      <header className="bg-indigo-700 text-white px-6 py-3 flex items-center shrink-0">
        <span className="text-xl font-black tracking-tight">🏪 SuperMapache</span>
      </header>

      {/* Contenido centrado */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="text-8xl select-none">🔒</div>
        <h1 className="text-4xl font-black text-gray-800">La caja está cerrada</h1>
        <p className="text-xl text-gray-500 max-w-md leading-relaxed">
          No hay un turno activo. Ingresa el efectivo inicial para abrir la caja.
        </p>

        <div className="w-full max-w-xs">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
            Efectivo inicial en caja ($)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={monto}
            onChange={e => { setMonto(e.target.value); setError(''); }}
            onKeyDown={e => { if (e.key === 'Enter') handleAbrir(); }}
            autoFocus
            className="w-full text-center text-3xl font-black py-4 px-4 border-2 border-indigo-300 focus:border-indigo-600 rounded-2xl outline-none bg-white transition-colors"
          />
          {error && <p className="mt-2 text-red-600 font-semibold text-sm">{error}</p>}
        </div>

        <button
          onClick={handleAbrir}
          disabled={loading}
          className="px-12 py-5 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-2xl font-black rounded-2xl transition-colors shadow-lg"
        >
          {loading ? '⏳ Abriendo...' : '🔓 Abrir Caja'}
        </button>

        <button
          onClick={onLogout}
          className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 text-base font-semibold rounded-xl transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

// ─── Pantalla post-venta ─────────────────────────────────────────────────────
const PantallaVentaLista = ({ venta, cambio, metodoPago, onNuevaVenta }) => (
  <div className="min-h-screen bg-gray-100 flex flex-col">
    <header className="bg-indigo-700 text-white px-6 py-3 flex items-center shrink-0">
      <span className="text-xl font-black tracking-tight">🏪 SuperMapache</span>
    </header>
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-green-500 p-10 text-center">
          <div className="text-8xl mb-4 select-none">✅</div>
          <h1 className="text-4xl font-black text-white">¡Venta Lista!</h1>
          {venta?.numeroVenta && (
            <p className="mt-1 text-green-100 text-base">{venta.numeroVenta}</p>
          )}
          {metodoPago === 'efectivo' && (
            <div className="mt-6 bg-white/20 rounded-2xl p-5">
              <p className="text-green-100 text-lg">Cambio a entregar</p>
              <p className="text-6xl font-black text-white mt-1">
                {formatCurrency(venta?.montoCambio ?? cambio)}
              </p>
            </div>
          )}
          {metodoPago === 'transferencia' && (
            <p className="mt-5 text-green-100 text-xl">Pago por transferencia confirmado</p>
          )}
        </div>
        <div className="p-6">
          <button
            onClick={onNuevaVenta}
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white text-2xl font-black rounded-2xl transition-colors"
          >
            ＋ Nueva Venta
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ─── Componente principal ────────────────────────────────────────────────────
const CajaSimple = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const dineroRef = useRef(null);

  // Turno
  const [turno, setTurno]           = useState(null);
  const [loadingTurno, setLoadingTurno] = useState(true);
  const [sinTurno, setSinTurno]     = useState(false);

  // Carrito y pago
  const [codigo, setCodigo]         = useState('');
  const [carrito, setCarrito]       = useState([]);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [dineroRecibido, setDineroRecibido] = useState('');

  // Estados de UI
  const [scanMsg, setScanMsg]       = useState({ texto: '', tipo: '' }); // tipo: 'error' | 'ok'
  const [ventaError, setVentaError] = useState('');
  const [loadingScan, setLoadingScan]   = useState(false);
  const [loadingVenta, setLoadingVenta] = useState(false);
  const [ventaCompletada, setVentaCompletada] = useState(null);

  // ─── Cargar turno activo al montar ─────────────────────────────────────
  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await cajaService.getTurnoActivo();
        if (res.data) {
          setTurno(res.data);
        } else {
          setSinTurno(true);
        }
      } catch {
        setSinTurno(true);
      } finally {
        setLoadingTurno(false);
      }
    };
    cargar();
  }, []);

  // ─── Enfocar input de escaneo ───────────────────────────────────────────
  const enfocarScan = useCallback(() => {
    setTimeout(() => inputRef.current?.focus(), 60);
  }, []);

  useEffect(() => {
    if (!loadingTurno && !sinTurno && !ventaCompletada) {
      enfocarScan();
    }
  }, [loadingTurno, sinTurno, ventaCompletada, carrito, enfocarScan]);

  // ─── Cálculos ───────────────────────────────────────────────────────────
  const total = carrito.reduce((s, i) => s + i.precioUnitario * i.cantidad, 0);
  const cantidadItems = carrito.reduce((s, i) => s + i.cantidad, 0);
  const montoRecibido = parseFloat(dineroRecibido || '0');
  const cambio = montoRecibido - total;
  const pagoCompleto =
    metodoPago === 'transferencia' || (metodoPago === 'efectivo' && montoRecibido >= total && dineroRecibido !== '');

  // ─── Escanear código ────────────────────────────────────────────────────
  const escanear = async () => {
    const cod = codigo.trim();
    setCodigo('');
    if (!cod) { enfocarScan(); return; }

    setScanMsg({ texto: '', tipo: '' });
    setLoadingScan(true);
    try {
      const res = await escaneoService.escanear(cod, 'pos');
      const prod = res.data?.producto;

      if (!res.data?.encontrado || !prod) {
        setScanMsg({ texto: `Producto no encontrado: "${cod}"`, tipo: 'error' });
        enfocarScan();
        return;
      }

      setCarrito(prev => {
        const idx = prev.findIndex(i => i.id === prod.id);
        if (idx >= 0) {
          const stock = prev[idx].stockDisponible;
          if (prev[idx].cantidad >= stock) {
            setScanMsg({ texto: `Sin stock suficiente para "${prod.nombre}"`, tipo: 'error' });
            return prev;
          }
          const next = [...prev];
          next[idx] = { ...next[idx], cantidad: next[idx].cantidad + 1 };
          setScanMsg({ texto: `+1 ${prod.nombre}`, tipo: 'ok' });
          return next;
        }
        setScanMsg({ texto: `Agregado: ${prod.nombre}`, tipo: 'ok' });
        return [...prev, {
          id: prod.id,
          nombre: prod.nombre,
          codigoBarras: prod.codigoBarras,
          precioUnitario: parseFloat(prod.precioVenta),
          cantidad: 1,
          stockDisponible: prod.stockActual ?? 9999,
        }];
      });
    } catch {
      setScanMsg({ texto: `Producto no encontrado: "${cod}"`, tipo: 'error' });
    } finally {
      setLoadingScan(false);
      enfocarScan();
    }
  };

  // ─── Carrito: cambiar cantidad ──────────────────────────────────────────
  const cambiarCantidad = (id, delta) => {
    setScanMsg({ texto: '', tipo: '' });
    setCarrito(prev =>
      prev
        .map(i => {
          if (i.id !== id) return i;
          const nueva = i.cantidad + delta;
          if (nueva <= 0) return null;
          if (nueva > i.stockDisponible) return i;
          return { ...i, cantidad: nueva };
        })
        .filter(Boolean)
    );
    enfocarScan();
  };

  // ─── Carrito: eliminar ítem ─────────────────────────────────────────────
  const eliminarItem = (id) => {
    setScanMsg({ texto: '', tipo: '' });
    setCarrito(prev => prev.filter(i => i.id !== id));
    enfocarScan();
  };

  // ─── Cancelar venta ─────────────────────────────────────────────────────
  const cancelarVenta = () => {
    setCarrito([]);
    setDineroRecibido('');
    setMetodoPago('efectivo');
    setScanMsg({ texto: '', tipo: '' });
    setVentaError('');
    enfocarScan();
  };

  // ─── Finalizar venta ────────────────────────────────────────────────────
  const finalizarVenta = async () => {
    setVentaError('');

    if (carrito.length === 0) {
      setVentaError('Agrega al menos un producto antes de finalizar.');
      return;
    }
    if (metodoPago === 'efectivo' && !pagoCompleto) {
      setVentaError('El dinero recibido es insuficiente para cubrir el total.');
      return;
    }

    setLoadingVenta(true);
    try {
      const payload = {
        tipoPago: metodoPago,
        ...(turno?.id ? { turnoId: turno.id } : {}),
        detalles: carrito.map(i => ({
          productoId: i.id,
          cantidad: i.cantidad,
          precioUnitario: i.precioUnitario,
        })),
        ...(metodoPago === 'efectivo'       && { montoEfectivo:      montoRecibido }),
        ...(metodoPago === 'transferencia'  && { montoTransferencia: total }),
      };

      const res = await ventaService.create(payload);
      setVentaCompletada(res.data);
    } catch (err) {
      setVentaError(
        err?.response?.data?.message ||
        'Error al registrar la venta. Revisa el stock y vuelve a intentarlo.'
      );
    } finally {
      setLoadingVenta(false);
    }
  };

  // ─── Nueva venta (reset) ────────────────────────────────────────────────
  const nuevaVenta = () => {
    setVentaCompletada(null);
    setCarrito([]);
    setDineroRecibido('');
    setMetodoPago('efectivo');
    setScanMsg({ texto: '', tipo: '' });
    setVentaError('');
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  // ─── Renders condicionales ──────────────────────────────────────────────
  if (loadingTurno) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-2xl text-gray-500 animate-pulse">Cargando caja...</p>
      </div>
    );
  }

  if (sinTurno || !turno) {
    return (
      <PantallaSinTurno
        onLogout={handleLogout}
        onAbrioTurno={t => { setTurno(t); setSinTurno(false); }}
      />
    );
  }

  if (ventaCompletada) {
    return (
      <PantallaVentaLista
        venta={ventaCompletada}
        cambio={cambio}
        metodoPago={metodoPago}
        onNuevaVenta={nuevaVenta}
      />
    );
  }

  // ─── Pantalla principal ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col select-none">

      {/* Header */}
      <header className="bg-indigo-700 text-white px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-xl font-black tracking-tight">🏪 SuperMapache</span>
          <span className="text-indigo-300 text-sm hidden sm:block">
            Turno #{turno.id} · {user?.nombre}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="px-5 py-2 bg-indigo-900 hover:bg-red-600 rounded-xl text-sm font-bold transition-colors"
        >
          Salir
        </button>
      </header>

      {/* Campo de escaneo */}
      <div className="bg-white border-b-4 border-indigo-200 px-4 py-4 shrink-0">
        <div className="flex gap-3 max-w-3xl mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={codigo}
            onChange={e => { setCodigo(e.target.value); setScanMsg({ texto: '', tipo: '' }); }}
            onKeyDown={e => { if (e.key === 'Enter') escanear(); }}
            placeholder={loadingScan ? 'Buscando producto...' : '📷  Escanea el código de barras aquí...'}
            disabled={loadingScan}
            autoFocus
            autoComplete="off"
            className="flex-1 text-xl px-5 py-4 border-2 border-indigo-300 focus:border-indigo-600 rounded-xl outline-none bg-indigo-50 placeholder-indigo-300 font-mono transition-colors disabled:opacity-60"
          />
          <button
            onClick={escanear}
            disabled={loadingScan}
            className="px-7 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xl font-black rounded-xl transition-colors"
          >
            OK
          </button>
        </div>

        {/* Mensaje de escaneo */}
        {scanMsg.texto && (
          <p className={`text-center mt-3 text-lg font-semibold ${
            scanMsg.tipo === 'error' ? 'text-red-600' : 'text-green-600'
          }`}>
            {scanMsg.tipo === 'error' ? '❌' : '✅'} {scanMsg.texto}
          </p>
        )}
      </div>

      {/* Cuerpo principal */}
      <div className="flex-1 flex overflow-hidden">

        {/* Lista de productos */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {carrito.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 pointer-events-none">
              <div className="text-9xl mb-4">🛒</div>
              <p className="text-2xl font-semibold">Escanea un producto para empezar</p>
            </div>
          ) : (
            carrito.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4"
              >
                {/* Nombre y precio unitario */}
                <div className="flex-1 min-w-0">
                  <p className="text-xl font-bold text-gray-900 truncate">{item.nombre}</p>
                  <p className="text-base text-gray-400 mt-0.5">{formatCurrency(item.precioUnitario)} por unidad</p>
                </div>

                {/* Controles de cantidad */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => cambiarCantidad(item.id, -1)}
                    className="w-11 h-11 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-xl text-2xl font-bold text-gray-700 transition-colors flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-2xl font-black text-gray-800">{item.cantidad}</span>
                  <button
                    onClick={() => cambiarCantidad(item.id, 1)}
                    className="w-11 h-11 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-xl text-2xl font-bold text-gray-700 transition-colors flex items-center justify-center"
                  >
                    +
                  </button>
                </div>

                {/* Subtotal */}
                <div className="w-28 text-right shrink-0">
                  <p className="text-2xl font-black text-indigo-700">
                    {formatCurrency(item.precioUnitario * item.cantidad)}
                  </p>
                </div>

                {/* Eliminar */}
                <button
                  onClick={() => eliminarItem(item.id)}
                  title="Quitar producto"
                  className="w-10 h-10 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-500 rounded-xl flex items-center justify-center text-xl font-bold transition-colors shrink-0"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* Panel de pago */}
        <aside className="w-80 bg-white border-l-2 border-gray-200 flex flex-col p-5 gap-5 shrink-0 overflow-y-auto">

          {/* Total */}
          <div className="bg-indigo-600 rounded-2xl p-5 text-center">
            <p className="text-indigo-200 text-sm font-semibold uppercase tracking-widest mb-1">Total</p>
            <p className="text-5xl font-black text-white">{formatCurrency(total)}</p>
            {cantidadItems > 0 && (
              <p className="text-indigo-300 text-sm mt-2">
                {cantidadItems} {cantidadItems === 1 ? 'producto' : 'productos'}
              </p>
            )}
          </div>

          {/* Método de pago */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Forma de pago</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'efectivo',      emoji: '💵', label: 'Efectivo' },
                { value: 'transferencia', emoji: '📲', label: 'Transferencia' },
              ].map(({ value, emoji, label }) => (
                <button
                  key={value}
                  onClick={() => {
                    setMetodoPago(value);
                    setDineroRecibido('');
                    setVentaError('');
                    enfocarScan();
                  }}
                  className={`py-4 px-2 rounded-xl font-bold text-sm transition-all border-2 ${
                    metodoPago === value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{emoji}</div>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Dinero recibido — solo efectivo */}
          {metodoPago === 'efectivo' && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Dinero recibido</p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-400 font-bold pointer-events-none">
                  $
                </span>
                <input
                  ref={dineroRef}
                  type="number"
                  step="0.01"
                  min="0"
                  value={dineroRecibido}
                  onChange={e => { setDineroRecibido(e.target.value); setVentaError(''); }}
                  onKeyDown={e => { if (e.key === 'Enter') finalizarVenta(); }}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-4 text-3xl font-black border-2 border-gray-300 focus:border-indigo-500 rounded-xl outline-none bg-gray-50 transition-colors"
                />
              </div>

              {/* Cambio */}
              {dineroRecibido !== '' && (
                <div className={`mt-3 p-4 rounded-xl text-center ${
                  cambio >= 0 ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
                }`}>
                  {cambio >= 0 ? (
                    <>
                      <p className="text-sm font-semibold text-green-700">Cambio a entregar</p>
                      <p className="text-4xl font-black text-green-700">{formatCurrency(cambio)}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-red-700">Falta cobrar</p>
                      <p className="text-4xl font-black text-red-700">{formatCurrency(Math.abs(cambio))}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Transferencia: monto a cobrar */}
          {metodoPago === 'transferencia' && total > 0 && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
              <p className="text-sm font-semibold text-blue-700">Monto a cobrar por transferencia</p>
              <p className="text-3xl font-black text-blue-800 mt-1">{formatCurrency(total)}</p>
            </div>
          )}

          <div className="flex-1" />

          {/* Error de venta */}
          {ventaError && (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 text-center">
              <p className="text-red-700 font-bold text-sm">❌ {ventaError}</p>
            </div>
          )}

          {/* Botón Finalizar */}
          <button
            onClick={finalizarVenta}
            disabled={loadingVenta || carrito.length === 0 || !pagoCompleto}
            className="w-full py-6 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-2xl font-black rounded-2xl transition-colors shadow-lg"
          >
            {loadingVenta ? '⏳ Registrando...' : '✓  FINALIZAR VENTA'}
          </button>

          {/* Botón Cancelar */}
          <button
            onClick={cancelarVenta}
            disabled={loadingVenta || carrito.length === 0}
            className="w-full py-4 bg-red-50 hover:bg-red-100 active:bg-red-200 disabled:opacity-30 disabled:cursor-not-allowed text-red-600 text-lg font-bold rounded-xl transition-colors border-2 border-red-100"
          >
            ✕  Cancelar venta
          </button>
        </aside>
      </div>
    </div>
  );
};

export default CajaSimple;
