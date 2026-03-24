import { useState } from 'react';
import Button from '../../../shared/components/UI/Button';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

const FormularioMovimiento = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({ tipo: 'ingreso', monto: '', descripcion: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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
    }
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
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
        tipo: formData.tipo,
        monto: parseFloat(formData.monto),
        descripcion: formData.descripcion.trim()
      });
    } finally {
      setLoading(false);
    }
  };

  const esIngreso = formData.tipo === 'ingreso';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Selector de tipo */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, tipo: 'ingreso' }))}
          className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
            esIngreso
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
              : 'border-gray-200 dark:border-dark-border text-gray-500 dark:text-gray-400 hover:border-gray-300'
          }`}
        >
          <ArrowDownCircle size={20} />
          <span className="font-semibold">Ingreso</span>
        </button>
        <button
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, tipo: 'egreso' }))}
          className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
            !esIngreso
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
              : 'border-gray-200 dark:border-dark-border text-gray-500 dark:text-gray-400 hover:border-gray-300'
          }`}
        >
          <ArrowUpCircle size={20} />
          <span className="font-semibold">Egreso</span>
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Monto <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
          <input
            type="number"
            name="monto"
            step="0.01"
            min="0.01"
            value={formData.monto}
            onChange={handleChange}
            placeholder="0.00"
            className={`w-full pl-8 pr-4 py-2.5 border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 ${errors.monto ? 'border-red-500' : 'border-gray-300 dark:border-dark-border'}`}
          />
        </div>
        {errors.monto && <p className="mt-1 text-sm text-red-600">{errors.monto}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Descripción <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          placeholder={esIngreso ? 'Ej: Fondo para cambio' : 'Ej: Compra de bolsas'}
          className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 ${errors.descripcion ? 'border-red-500' : 'border-gray-300 dark:border-dark-border'}`}
        />
        {errors.descripcion && <p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-dark-border">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button
          type="submit"
          variant={esIngreso ? 'success' : 'danger'}
          loading={loading}
        >
          Registrar {esIngreso ? 'Ingreso' : 'Egreso'}
        </Button>
      </div>
    </form>
  );
};

export default FormularioMovimiento;
