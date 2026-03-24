import { useState } from 'react';
import Button from '../../../shared/components/UI/Button';
import { formatCurrency } from '../../../shared/utils/formatters';
import { CreditCard, Banknote, ArrowLeftRight } from 'lucide-react';

const METODOS = [
  { value: 'efectivo',      label: 'Efectivo',      icon: Banknote },
  { value: 'tarjeta',       label: 'Tarjeta',        icon: CreditCard },
  { value: 'transferencia', label: 'Transferencia',  icon: ArrowLeftRight },
];

const FormularioPago = ({ credito, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({ monto: '', metodo_pago: 'efectivo', notas: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const saldoPendiente = parseFloat(credito?.saldo_pendiente || 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    const monto = parseFloat(formData.monto);
    if (!formData.monto || isNaN(monto) || monto <= 0) {
      newErrors.monto = 'El monto debe ser mayor a 0';
    } else if (monto > saldoPendiente) {
      newErrors.monto = `No puede superar el saldo pendiente (${formatCurrency(saldoPendiente)})`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({
        monto: parseFloat(formData.monto),
        metodo_pago: formData.metodo_pago,
        notas: formData.notas.trim() || undefined
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Info del crédito */}
      <div className="p-3 bg-gray-50 dark:bg-dark-hover rounded-lg text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Crédito</span>
          <span className="font-medium text-gray-900 dark:text-white">{credito?.numero_credito}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Cliente</span>
          <span className="font-medium text-gray-900 dark:text-white">{credito?.cliente?.nombre}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Saldo pendiente</span>
          <span className="font-bold text-red-600">{formatCurrency(saldoPendiente)}</span>
        </div>
      </div>

      {/* Monto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Monto a pagar <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2 mb-2">
          <button type="button" onClick={() => setFormData(prev => ({ ...prev, monto: saldoPendiente.toString() }))}
            className="text-xs px-2 py-1 rounded bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 hover:bg-primary-200 transition-colors">
            Pago total
          </button>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
          <input type="number" name="monto" step="0.01" min="0.01"
            value={formData.monto} onChange={handleChange} placeholder="0.00"
            className={`w-full pl-8 pr-4 py-2.5 border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 ${errors.monto ? 'border-red-500' : 'border-gray-300 dark:border-dark-border'}`} />
        </div>
        {errors.monto && <p className="mt-1 text-sm text-red-600">{errors.monto}</p>}
        {formData.monto && !errors.monto && (() => {
          const resto = saldoPendiente - parseFloat(formData.monto || 0);
          return resto > 0
            ? <p className="mt-1 text-xs text-gray-400">Quedará pendiente: {formatCurrency(resto)}</p>
            : <p className="mt-1 text-xs text-green-600">Crédito saldado completamente</p>;
        })()}
      </div>

      {/* Método de pago */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Método de pago
        </label>
        <div className="grid grid-cols-3 gap-2">
          {METODOS.map(({ value, label, icon: Icon }) => (
            <button key={value} type="button" onClick={() => setFormData(prev => ({ ...prev, metodo_pago: value }))}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all text-sm ${
                formData.metodo_pago === value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                  : 'border-gray-200 dark:border-dark-border text-gray-500 dark:text-gray-400 hover:border-gray-300'
              }`}>
              <Icon size={18} />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notas</label>
        <input type="text" name="notas" value={formData.notas} onChange={handleChange}
          placeholder="Observaciones opcionales..."
          className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-dark-card border-gray-300 dark:border-dark-border text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500" />
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-dark-border">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>Registrar Pago</Button>
      </div>
    </form>
  );
};

export default FormularioPago;
