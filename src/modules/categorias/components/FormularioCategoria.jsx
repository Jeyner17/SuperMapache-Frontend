import { useState, useEffect } from 'react';
import Input from '../../../shared/components/UI/Input';
import Button from '../../../shared/components/UI/Button';

const FormularioCategoria = ({ mode, initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    icono: 'Package',
    color: '#3b82f6',
    activo: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        descripcion: initialData.descripcion || '',
        icono: initialData.icono || 'Package',
        color: initialData.color || '#3b82f6',
        activo: initialData.activo !== undefined ? initialData.activo : true,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
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
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  const isViewMode = mode === 'view';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nombre */}
      <Input
        label="Nombre"
        name="nombre"
        value={formData.nombre}
        onChange={handleChange}
        error={errors.nombre}
        disabled={isViewMode}
        required
      />

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Descripción
        </label>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          disabled={isViewMode}
          rows={3}
          className="w-full rounded-lg border px-4 py-2.5 bg-white dark:bg-dark-card border-gray-300 dark:border-dark-border text-gray-900 dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
        />
      </div>

      {/* Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Color
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            name="color"
            value={formData.color}
            onChange={handleChange}
            disabled={isViewMode}
            className="h-10 w-20 rounded border border-gray-300 dark:border-dark-border cursor-pointer disabled:opacity-50"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {formData.color}
          </span>
        </div>
      </div>

      {/* Activo */}
      {!isViewMode && (
        <div className="flex items-center">
          <input
            type="checkbox"
            name="activo"
            checked={formData.activo}
            onChange={handleChange}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Categoría activa
          </label>
        </div>
      )}

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          {isViewMode ? 'Cerrar' : 'Cancelar'}
        </Button>
        {!isViewMode && (
          <Button type="submit" loading={loading}>
            {mode === 'create' ? 'Crear Categoría' : 'Guardar Cambios'}
          </Button>
        )}
      </div>
    </form>
  );
};

export default FormularioCategoria;