import { useState } from 'react';
import Button from '../../../shared/components/UI/Button';
import { AlertTriangle, CheckCircle2, TrendingDown, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/formatters';

const FormularioCierre = ({ turno, resumen, onSubmit, onCancel }) => {
  const [totalReal, setTotalReal] = useState('');
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalEsperado = resumen?.total_esperado ?? 0;
  const totalRealNum = parseFloat(totalReal) || 0;
  const diferencia = totalReal !== '' ? totalRealNum - totalEsperado : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const monto = parseFloat(totalReal);
    if (isNaN(monto) || monto < 0) {
      setError('Ingrese el total real contado');
      return;
    }
    setLoading(true);
    try {
      await onSubmit({ total_real: monto, notas: notas || undefined });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Resumen del turno */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-gray-50 dark:bg-dark-hover rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400">Saldo Inicial</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(resumen?.saldo_inicial ?? 0)}</p>
        </div>
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400">Ventas Efectivo</p>
          <p className="text-lg font-bold text-green-700 dark:text-green-400">{formatCurrency(resumen?.total_ventas_efectivo ?? 0)}</p>
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400">Ingresos Manuales</p>
          <p className="text-lg font-bold text-blue-700 dark:text-blue-400">{formatCurrency(resumen?.total_ingresos ?? 0)}</p>
        </div>
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400">Egresos</p>
          <p className="text-lg font-bold text-red-700 dark:text-red-400">{formatCurrency(resumen?.total_egresos ?? 0)}</p>
        </div>
      </div>

      <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border-2 border-primary-200 dark:border-primary-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">Total Esperado en Caja</p>
        <p className="text-3xl font-bold text-primary-600">{formatCurrency(totalEsperado)}</p>
      </div>

      {/* Conteo real */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Total Real Contado <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={totalReal}
            onChange={(e) => { setTotalReal(e.target.value); setError(''); }}
            placeholder="0.00"
            className={`w-full pl-8 pr-4 py-2.5 border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 text-lg ${error ? 'border-red-500' : 'border-gray-300 dark:border-dark-border'}`}
            required
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      {/* Diferencia en tiempo real */}
      {diferencia !== null && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          diferencia === 0
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : diferencia > 0
            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          {diferencia === 0
            ? <CheckCircle2 className="text-green-600 w-6 h-6 shrink-0" />
            : diferencia > 0
            ? <TrendingUp className="text-blue-600 w-6 h-6 shrink-0" />
            : <TrendingDown className="text-red-600 w-6 h-6 shrink-0" />}
          <div>
            <p className={`font-semibold ${diferencia === 0 ? 'text-green-700 dark:text-green-400' : diferencia > 0 ? 'text-blue-700 dark:text-blue-400' : 'text-red-700 dark:text-red-400'}`}>
              Diferencia: {diferencia >= 0 ? '+' : ''}{formatCurrency(diferencia)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {diferencia === 0 ? 'Caja cuadrada perfectamente' : diferencia > 0 ? 'Sobrante en caja' : 'Faltante en caja'}
            </p>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notas de Cierre
        </label>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={2}
          placeholder="Observaciones del cierre..."
          className="w-full rounded-lg border px-4 py-2.5 bg-white dark:bg-dark-card border-gray-300 dark:border-dark-border text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-start gap-2">
          <AlertTriangle className="text-yellow-600 w-4 h-4 mt-0.5 shrink-0" />
          <p className="text-xs text-yellow-800 dark:text-yellow-300">Esta acción cerrará el turno. No podrás registrar más ventas ni movimientos en él.</p>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-dark-border">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" variant="danger" loading={loading}>Cerrar Caja</Button>
      </div>
    </form>
  );
};

export default FormularioCierre;
