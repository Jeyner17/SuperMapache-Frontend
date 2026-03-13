import { useState, useEffect } from 'react';
import Button from '../../../shared/components/UI/Button';
import Badge from '../../../shared/components/UI/Badge';
import { DollarSign, CreditCard, Smartphone } from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/formatters';

const ModalPago = ({ total, onPagar, onCancelar, procesando }) => {
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [notas, setNotas] = useState('');

  useEffect(() => {
    // Auto-llenar con el total si es tarjeta o transferencia
    if (metodoPago === 'tarjeta' || metodoPago === 'transferencia') {
      setMontoRecibido(total.toFixed(2));
    }
  }, [metodoPago, total]);

  const calcularCambio = () => {
    const monto = parseFloat(montoRecibido) || 0;
    return Math.max(0, monto - total);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const monto = parseFloat(montoRecibido) || 0;

    if (monto < total) {
      alert('El monto recibido es insuficiente');
      return;
    }

    onPagar({
      metodo_pago: metodoPago,
      monto_recibido: monto,
      notas
    });
  };

  const cambio = calcularCambio();
  const montoEsValido = parseFloat(montoRecibido) >= total;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Total a Pagar */}
      <div className="p-6 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total a Pagar</p>
        <p className="text-4xl font-bold text-primary-600">
          {formatCurrency(total)}
        </p>
      </div>

      {/* Método de Pago */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Método de Pago
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setMetodoPago('efectivo')}
            className={`p-4 rounded-lg border-2 transition-all ${
              metodoPago === 'efectivo'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-dark-border hover:border-primary-300'
            }`}
          >
            <DollarSign className={`w-8 h-8 mx-auto mb-2 ${
              metodoPago === 'efectivo' ? 'text-primary-600' : 'text-gray-400'
            }`} />
            <p className={`text-sm font-medium ${
              metodoPago === 'efectivo' ? 'text-primary-600' : 'text-gray-600 dark:text-gray-400'
            }`}>
              Efectivo
            </p>
          </button>

          <button
            type="button"
            onClick={() => setMetodoPago('tarjeta')}
            className={`p-4 rounded-lg border-2 transition-all ${
              metodoPago === 'tarjeta'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-dark-border hover:border-primary-300'
            }`}
          >
            <CreditCard className={`w-8 h-8 mx-auto mb-2 ${
              metodoPago === 'tarjeta' ? 'text-primary-600' : 'text-gray-400'
            }`} />
            <p className={`text-sm font-medium ${
              metodoPago === 'tarjeta' ? 'text-primary-600' : 'text-gray-600 dark:text-gray-400'
            }`}>
              Tarjeta
            </p>
          </button>

          <button
            type="button"
            onClick={() => setMetodoPago('transferencia')}
            className={`p-4 rounded-lg border-2 transition-all ${
              metodoPago === 'transferencia'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-dark-border hover:border-primary-300'
            }`}
          >
            <Smartphone className={`w-8 h-8 mx-auto mb-2 ${
              metodoPago === 'transferencia' ? 'text-primary-600' : 'text-gray-400'
            }`} />
            <p className={`text-sm font-medium ${
              metodoPago === 'transferencia' ? 'text-primary-600' : 'text-gray-600 dark:text-gray-400'
            }`}>
              Transferencia
            </p>
          </button>
        </div>
      </div>

      {/* Monto Recibido */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Monto Recibido
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-lg">
            $
          </span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={montoRecibido}
            onChange={(e) => setMontoRecibido(e.target.value)}
            className={`w-full pl-8 pr-4 py-3 text-xl font-semibold border-2 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 ${
              montoRecibido && !montoEsValido 
                ? 'border-red-500' 
                : 'border-gray-300 dark:border-dark-border'
            }`}
            placeholder="0.00"
            autoFocus
            required
          />
        </div>
        {montoRecibido && !montoEsValido && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            El monto recibido debe ser mayor o igual al total
          </p>
        )}
      </div>

      {/* Cambio */}
      {metodoPago === 'efectivo' && montoRecibido && (
        <div className={`p-4 rounded-lg ${
          cambio > 0 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-gray-50 dark:bg-dark-hover'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Cambio:
            </span>
            <span className={`text-2xl font-bold ${
              cambio > 0 ? 'text-green-600' : 'text-gray-600 dark:text-gray-400'
            }`}>
              {formatCurrency(cambio)}
            </span>
          </div>
        </div>
      )}

      {/* Atajos Rápidos (solo para efectivo) */}
      {metodoPago === 'efectivo' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Atajos Rápidos
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[5, 10, 20, 50].map(valor => (
              <button
                key={valor}
                type="button"
                onClick={() => setMontoRecibido(valor.toFixed(2))}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-dark-hover dark:hover:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
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
          className="w-full rounded-lg border px-4 py-2 bg-white dark:bg-dark-card border-gray-300 dark:border-dark-border text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-dark-border">
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
          disabled={!montoEsValido}
        >
          Confirmar Pago
        </Button>
      </div>
    </form>
  );
};

export default ModalPago;