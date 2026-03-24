import { useState } from 'react';
import Button from '../../../shared/components/UI/Button';
import Input from '../../../shared/components/UI/Input';
import { Wallet } from 'lucide-react';

const FormularioApertura = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({ saldo_inicial: '', notas: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const monto = parseFloat(formData.saldo_inicial);
    if (isNaN(monto) || monto < 0) {
      setError('Ingrese un saldo inicial válido (puede ser 0)');
      return;
    }
    setLoading(true);
    try {
      await onSubmit({ saldo_inicial: monto, notas: formData.notas || undefined });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <Wallet className="text-yellow-600 w-6 h-6 shrink-0" />
        <p className="text-sm text-yellow-800 dark:text-yellow-300">
          Al abrir la caja se registrará el saldo inicial en efectivo y comenzará el turno.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Saldo Inicial en Caja <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
          <input
            type="number"
            name="saldo_inicial"
            step="0.01"
            min="0"
            value={formData.saldo_inicial}
            onChange={handleChange}
            placeholder="0.00"
            className={`w-full pl-8 pr-4 py-2.5 border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 ${error ? 'border-red-500' : 'border-gray-300 dark:border-dark-border'}`}
            required
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notas de Apertura
        </label>
        <textarea
          name="notas"
          value={formData.notas}
          onChange={handleChange}
          rows={3}
          placeholder="Observaciones opcionales..."
          className="w-full rounded-lg border px-4 py-2.5 bg-white dark:bg-dark-card border-gray-300 dark:border-dark-border text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-dark-border">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>Abrir Caja</Button>
      </div>
    </form>
  );
};

export default FormularioApertura;
