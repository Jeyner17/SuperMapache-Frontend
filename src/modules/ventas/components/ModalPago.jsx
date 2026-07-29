import { useState, useEffect, useCallback } from 'react';
import Button from '../../../shared/components/UI/Button';
import { DollarSign, CreditCard, Smartphone, Layers, FileText, Search, User, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/formatters';
import api from '../../../shared/services/api.service';

const METODOS = [
  { value: 'efectivo',       label: 'Efectivo',       Icon: DollarSign  },
  { value: 'tarjeta',        label: 'Tarjeta',        Icon: CreditCard  },
  { value: 'transferencia',  label: 'Transferencia',  Icon: Smartphone  },
  { value: 'mixto',          label: 'Mixto',          Icon: Layers      },
  { value: 'credito',        label: 'Crédito',        Icon: FileText    },
];

const ModalPago = ({ total, onPagar, onCancelar, procesando }) => {
  const [metodoPago, setMetodoPago]           = useState('efectivo');
  const [montoRecibido, setMontoRecibido]     = useState('');
  const [notas, setNotas]                     = useState('');

  // Estados exclusivos de crédito
  const [searchCliente, setSearchCliente]       = useState('');
  const [clienteResultados, setClienteResultados] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [buscandoClientes, setBuscandoClientes] = useState(false);
  const [diasPlazo, setDiasPlazo]             = useState(30);

  // Estado exclusivo de mixto
  const [montoEfectivo, setMontoEfectivo] = useState('');

  // Auto-llenar monto para métodos que no requieren cambio
  useEffect(() => {
    if (['tarjeta', 'transferencia'].includes(metodoPago)) {
      setMontoRecibido(total.toFixed(2));
    } else if (metodoPago === 'credito') {
      setMontoRecibido('0');
    } else {
      setMontoRecibido('');
    }
    // Limpiar efectivo mixto al cambiar de método
    if (metodoPago !== 'mixto') setMontoEfectivo('');
    // Limpiar cliente al cambiar de método
    if (metodoPago !== 'credito') {
      setClienteSeleccionado(null);
      setSearchCliente('');
      setClienteResultados([]);
    }
  }, [metodoPago, total]);

  // Búsqueda de clientes
  const buscarClientes = useCallback(async (query) => {
    if (query.length < 2) {
      setClienteResultados([]);
      return;
    }
    setBuscandoClientes(true);
    try {
      const res = await api.get('/creditos/clientes', { params: { search: query, limit: 5, activo: 'true' } });
      setClienteResultados(res?.data?.data ?? []);
    } catch {
      setClienteResultados([]);
    } finally {
      setBuscandoClientes(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => buscarClientes(searchCliente), 300);
    return () => clearTimeout(timer);
  }, [searchCliente, buscarClientes]);

  // Cálculo de cambio (solo efectivo)
  const cambio = metodoPago === 'efectivo'
    ? Math.max(0, (parseFloat(montoRecibido) || 0) - total)
    : 0;

  // Validación de límite de crédito (0 = sin límite)
  const limiteCredito   = parseFloat(clienteSeleccionado?.limiteCredito  ?? 0);
  const saldoPendiente  = parseFloat(clienteSeleccionado?.saldoPendiente ?? 0);
  const tieneLimite     = limiteCredito > 0;
  const creditoDisponible = tieneLimite ? limiteCredito - saldoPendiente : null; // null = sin límite
  const excedeLimite = metodoPago === 'credito' && clienteSeleccionado !== null && tieneLimite && total > (creditoDisponible ?? 0);

  // Desglose mixto
  const efectivoMixto      = Math.min(parseFloat(montoEfectivo) || 0, total);
  const montoTransferencia = Math.max(0, total - efectivoMixto);

  const montoEsValido = metodoPago === 'credito'
    ? clienteSeleccionado !== null && !excedeLimite && clienteSeleccionado.activo !== false
    : metodoPago === 'mixto'
      ? montoEfectivo !== '' && parseFloat(montoEfectivo) >= 0 && parseFloat(montoEfectivo) <= total
      : (parseFloat(montoRecibido) || 0) >= total;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!montoEsValido) return;

    onPagar({
      metodo_pago:     metodoPago,
      monto_recibido:  metodoPago === 'credito' ? 0
                     : metodoPago === 'mixto'   ? total
                     : (parseFloat(montoRecibido) || 0),
      notas,
      cliente_id:  clienteSeleccionado?.id ?? null,
      dias_plazo:  diasPlazo,
      ...(metodoPago === 'mixto' && {
        monto_efectivo:      efectivoMixto,
        monto_transferencia: montoTransferencia,
      }),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Total */}
      <div className="p-5 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total a Pagar</p>
        <p className="text-4xl font-bold text-primary-600">{formatCurrency(total)}</p>
      </div>

      {/* Método de pago — fila 1: 3 opciones, fila 2: 2 opciones */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Método de Pago
        </label>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {METODOS.slice(0, 3).map(({ value, label, Icon }) => (
            <MetodoBtn
              key={value}
              value={value}
              label={label}
              Icon={Icon}
              selected={metodoPago === value}
              onClick={() => setMetodoPago(value)}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {METODOS.slice(3).map(({ value, label, Icon }) => (
            <MetodoBtn
              key={value}
              value={value}
              label={label}
              Icon={Icon}
              selected={metodoPago === value}
              onClick={() => setMetodoPago(value)}
            />
          ))}
        </div>
      </div>

      {/* Selector de cliente — solo para crédito */}
      {metodoPago === 'credito' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cliente <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchCliente}
                onChange={(e) => {
                  setSearchCliente(e.target.value);
                  setClienteSeleccionado(null);
                }}
                placeholder="Buscar por nombre o cédula..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Resultados de búsqueda */}
            {(clienteResultados.length > 0 || buscandoClientes) && !clienteSeleccionado && (
              <div className="mt-1 border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden shadow-md">
                {buscandoClientes ? (
                  <p className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                    Buscando...
                  </p>
                ) : (
                  clienteResultados.map((cliente) => (
                    <button
                      key={cliente.id}
                      type="button"
                      onClick={() => {
                        setClienteSeleccionado(cliente);
                        setSearchCliente(cliente.nombre);
                        setClienteResultados([]);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-dark-hover border-b last:border-0 border-gray-100 dark:border-dark-border"
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {cliente.nombre}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {cliente.cedula || '—'} — Límite: {parseFloat(cliente.limiteCredito) > 0 ? formatCurrency(cliente.limiteCredito) : 'Sin límite'}
                      </p>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Cliente seleccionado */}
            {clienteSeleccionado && (
              <div className="space-y-2 mt-2">
                <div className={`p-3 rounded-lg border flex items-center gap-2 ${
                  excedeLimite
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                    : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                }`}>
                  <User size={16} className={`flex-shrink-0 ${excedeLimite ? 'text-red-500' : 'text-green-600'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      excedeLimite ? 'text-red-800 dark:text-red-300' : 'text-green-800 dark:text-green-300'
                    }`}>
                      {clienteSeleccionado.nombre}
                    </p>
                    <p className={`text-xs ${excedeLimite ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      Límite: {tieneLimite ? formatCurrency(limiteCredito) : 'Sin límite'} &nbsp;·&nbsp;
                      Pendiente: {formatCurrency(saldoPendiente)} &nbsp;·&nbsp;
                      <span className="font-semibold">
                        Disponible: {creditoDisponible !== null ? formatCurrency(creditoDisponible) : '∞'}
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setClienteSeleccionado(null); setSearchCliente(''); }}
                    className={`text-xs hover:underline ${
                      excedeLimite ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'
                    }`}
                  >
                    Cambiar
                  </button>
                </div>

                {/* Alerta de cliente inactivo */}
                {clienteSeleccionado?.activo === false && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
                    <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                        Cliente inactivo
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                        Este cliente está desactivado y no puede recibir crédito.
                        Selecciona otro cliente o cambia el método de pago.
                      </p>
                    </div>
                  </div>
                )}

                {/* Alerta de límite excedido */}
                {excedeLimite && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
                    <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                        Límite de crédito excedido
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                        Esta venta ({formatCurrency(total)}) supera el crédito disponible
                        del cliente ({formatCurrency(creditoDisponible)}). No se puede
                        procesar hasta reducir el carrito o elegir otro método de pago.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Días de plazo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Días de plazo
            </label>
            <select
              value={diasPlazo}
              onChange={(e) => setDiasPlazo(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
            >
              {[7, 15, 30, 45, 60, 90].map(d => (
                <option key={d} value={d}>{d} días</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Monto recibido — efectivo, tarjeta y transferencia */}
      {['efectivo', 'tarjeta', 'transferencia'].includes(metodoPago) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Monto Recibido
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-lg">
              $
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={montoRecibido}
              onChange={(e) => setMontoRecibido(e.target.value)}
              readOnly={['tarjeta', 'transferencia'].includes(metodoPago)}
              className={`w-full pl-8 pr-4 py-3 text-xl font-semibold border-2 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500
                ${['tarjeta', 'transferencia'].includes(metodoPago)
                  ? 'bg-gray-50 dark:bg-dark-hover cursor-not-allowed opacity-70'
                  : ''}
                ${montoRecibido && !montoEsValido ? 'border-red-500' : 'border-gray-300 dark:border-dark-border'}`}
              placeholder="0.00"
              autoFocus={metodoPago === 'efectivo'}
              required
            />
          </div>
          {montoRecibido && !montoEsValido && metodoPago === 'efectivo' && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              El monto recibido debe ser mayor o igual al total
            </p>
          )}
        </div>
      )}

      {/* Pago mixto — desglose efectivo + transferencia */}
      {metodoPago === 'mixto' && (
        <div className="space-y-3">
          {/* Input efectivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Monto en Efectivo
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-lg">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                max={total}
                value={montoEfectivo}
                onChange={(e) => setMontoEfectivo(e.target.value)}
                placeholder="0.00"
                autoFocus
                className={`w-full pl-8 pr-4 py-3 text-xl font-semibold border-2 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 ${
                  montoEfectivo !== '' && parseFloat(montoEfectivo) > total
                    ? 'border-red-500'
                    : 'border-gray-300 dark:border-dark-border'
                }`}
              />
            </div>
            {montoEfectivo !== '' && parseFloat(montoEfectivo) > total && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                El efectivo no puede superar el total a pagar
              </p>
            )}
          </div>

          {/* Desglose */}
          <div className="rounded-lg border border-gray-200 dark:border-dark-border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-white dark:bg-dark-card">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <DollarSign size={14} className="text-emerald-500" />
                Efectivo
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatCurrency(efectivoMixto)}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5 bg-white dark:bg-dark-card border-t border-gray-100 dark:border-dark-border">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Smartphone size={14} className="text-blue-500" />
                Transferencia
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatCurrency(montoTransferencia)}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-dark-hover border-t-2 border-gray-300 dark:border-dark-border">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Total</span>
              <span className="text-sm font-bold text-emerald-600">
                {formatCurrency(total)} ✓
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Cambio — solo efectivo */}
      {metodoPago === 'efectivo' && montoRecibido && (
        <div className={`p-4 rounded-lg ${
          cambio > 0
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-gray-50 dark:bg-dark-hover'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cambio:</span>
            <span className={`text-2xl font-bold ${
              cambio > 0 ? 'text-green-600' : 'text-gray-600 dark:text-gray-400'
            }`}>
              {formatCurrency(cambio)}
            </span>
          </div>
        </div>
      )}

      {/* Atajos de efectivo */}
      {metodoPago === 'efectivo' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Atajos rápidos
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 5, 10, 20, 50, 100].map(valor => (
              <button
                key={valor}
                type="button"
                onClick={() => setMontoRecibido(valor.toFixed(2))}
                className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-dark-hover dark:hover:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
              >
                ${valor}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Notas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notas (opcional)
        </label>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={2}
          placeholder="Observaciones adicionales..."
          className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-dark-card border-gray-300 dark:border-dark-border text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Acciones */}
      <div className="flex gap-3 pt-3 border-t border-gray-200 dark:border-dark-border">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancelar}
          className="flex-1"
          disabled={procesando}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="flex-1"
          loading={procesando}
          disabled={!montoEsValido || procesando}
        >
          Confirmar Pago
        </Button>
      </div>
    </form>
  );
};

// ── Subcomponente: botón de método de pago ──────────────────────────────────
const MetodoBtn = ({ value, label, Icon, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
      selected
        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
        : 'border-gray-200 dark:border-dark-border hover:border-primary-300 dark:hover:border-primary-700'
    }`}
  >
    <Icon className={`w-6 h-6 ${selected ? 'text-primary-600' : 'text-gray-400'}`} />
    <p className={`text-xs font-medium ${
      selected ? 'text-primary-600' : 'text-gray-600 dark:text-gray-400'
    }`}>
      {label}
    </p>
  </button>
);

export default ModalPago;
