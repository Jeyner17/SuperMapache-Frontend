import { useState } from 'react';
import Input from '../../../shared/components/UI/Input';
import Button from '../../../shared/components/UI/Button';
import Badge from '../../../shared/components/UI/Badge';

const FormularioAjuste = ({ lote, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nueva_cantidad: lote?.cantidad_actual || '',
    motivo: '',
    notas: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nueva_cantidad || parseFloat(formData.nueva_cantidad) < 0) {
      newErrors.nueva_cantidad = 'La cantidad debe ser mayor o igual a 0';
    }

    if (!formData.motivo.trim()) {
      newErrors.motivo = 'El motivo es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        nueva_cantidad: parseFloat(formData.nueva_cantidad),
        motivo: formData.motivo,
        notas: formData.notas
      };

      await onSubmit(dataToSend);
    } finally {
      setLoading(false);
    }
  };

  const diferencia = parseFloat(formData.nueva_cantidad || 0) - parseFloat(lote.cantidad_actual);
  const tipoAjuste = diferencia > 0 ? 'entrada' : diferencia < 0 ? 'salida' : 'sin_cambio';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Información del Lote */}
      <div className="p-4 bg-gray-50 dark:bg-dark-hover rounded-lg">
        <h4 className="font-semibold text-gray-800 dark:text-white mb-3">
          Información del Lote
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Producto:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {lote.producto.nombre}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Lote:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {lote.numero_lote}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Stock Actual:</span>
            <span className="text-lg font-bold text-primary-600">
              {lote.cantidad_actual} {lote.producto.unidad_medida}
            </span>
          </div>
        </div>
      </div>

      {/* Nueva Cantidad */}
      <Input
        label="Nueva Cantidad"
        name="nueva_cantidad"
        type="number"
        step="0.01"
        min="0"
        value={formData.nueva_cantidad}
        onChange={handleChange}
        error={errors.nueva_cantidad}
        required
        placeholder="0.00"
      />

      {/* Mostrar diferencia */}
      {diferencia !== 0 && formData.nueva_cantidad && (
        <div className={`p-4 rounded-lg border-l-4 ${
          tipoAjuste === 'entrada' 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-500' 
            : 'bg-red-50 dark:bg-red-900/20 border-red-500'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Ajuste:
            </span>
            <Badge variant={tipoAjuste === 'entrada' ? 'success' : 'danger'}>
              {tipoAjuste === 'entrada' ? '+' : ''}{Math.abs(diferencia).toFixed(2)} {lote.producto.unidad_medida}
            </Badge>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {tipoAjuste === 'entrada' 
              ? 'Se agregará stock al lote' 
              : 'Se descontará stock del lote'
            }
          </p>
        </div>
      )}

      {/* Motivo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Motivo del Ajuste <span className="text-red-500">*</span>
        </label>
        <select
          name="motivo"
          value={formData.motivo}
          onChange={handleChange}
          className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 ${
            errors.motivo ? 'border-red-500' : 'border-gray-300 dark:border-dark-border'
          }`}
          required
        >
          <option value="">Seleccionar motivo...</option>
          <option value="Corrección de inventario">Corrección de inventario</option>
          <option value="Producto dañado">Producto dañado</option>
          <option value="Merma">Merma</option>
          <option value="Error de registro">Error de registro</option>
          <option value="Devolución a proveedor">Devolución a proveedor</option>
          <option value="Transferencia">Transferencia</option>
          <option value="Otro">Otro</option>
        </select>
        {errors.motivo && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.motivo}
          </p>
        )}
      </div>

      {/* Notas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notas Adicionales
        </label>
        <textarea
          name="notas"
          value={formData.notas}
          onChange={handleChange}
          rows={3}
          placeholder="Describe el motivo del ajuste en detalle..."
          className="w-full rounded-lg border px-4 py-2.5 bg-white dark:bg-dark-card border-gray-300 dark:border-dark-border text-gray-900 dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Advertencia */}
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-400">
          ⚠️ <strong>Advertencia:</strong> Este ajuste modificará el stock del lote y quedará registrado en el historial de movimientos.
        </p>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-dark-border">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          Confirmar Ajuste
        </Button>
      </div>
    </form>
  );
};

export default FormularioAjuste;