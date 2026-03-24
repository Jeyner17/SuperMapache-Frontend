import { useState, useEffect } from 'react';
import Button from '../../../shared/components/UI/Button';
import Input from '../../../shared/components/UI/Input';

const FormularioCliente = ({ cliente, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: '', cedula: '', telefono: '', email: '', direccion: '', limite_credito: '', notas: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const esEdicion = !!cliente;

  useEffect(() => {
    if (cliente) {
      setFormData({
        nombre: cliente.nombre || '',
        cedula: cliente.cedula || '',
        telefono: cliente.telefono || '',
        email: cliente.email || '',
        direccion: cliente.direccion || '',
        limite_credito: cliente.limite_credito ?? '',
        notas: cliente.notas || ''
      });
    }
  }, [cliente]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    if (formData.limite_credito && parseFloat(formData.limite_credito) < 0) newErrors.limite_credito = 'El límite no puede ser negativo';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({
        nombre: formData.nombre.trim(),
        cedula: formData.cedula.trim() || undefined,
        telefono: formData.telefono.trim() || undefined,
        email: formData.email.trim() || undefined,
        direccion: formData.direccion.trim() || undefined,
        limite_credito: formData.limite_credito !== '' ? parseFloat(formData.limite_credito) : 0,
        notas: formData.notas.trim() || undefined
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Input label="Nombre completo *" name="nombre" value={formData.nombre}
            onChange={handleChange} error={errors.nombre} placeholder="Ej: Carlos López" />
        </div>
        <Input label="Cédula / RUC" name="cedula" value={formData.cedula}
          onChange={handleChange} placeholder="Opcional" />
        <Input label="Teléfono" name="telefono" value={formData.telefono}
          onChange={handleChange} placeholder="Ej: 0991234567" />
        <Input label="Email" name="email" type="email" value={formData.email}
          onChange={handleChange} error={errors.email} placeholder="Opcional" />
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Límite de Crédito
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input type="number" name="limite_credito" step="0.01" min="0"
              value={formData.limite_credito} onChange={handleChange} placeholder="0 = sin límite"
              className={`w-full pl-8 pr-4 py-2.5 border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 ${errors.limite_credito ? 'border-red-500' : 'border-gray-300 dark:border-dark-border'}`} />
          </div>
          {errors.limite_credito && <p className="mt-1 text-sm text-red-600">{errors.limite_credito}</p>}
          <p className="mt-1 text-xs text-gray-400">Deja en 0 para no establecer límite</p>
        </div>
        <div className="md:col-span-2">
          <Input label="Dirección" name="direccion" value={formData.direccion}
            onChange={handleChange} placeholder="Opcional" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notas</label>
          <textarea name="notas" value={formData.notas} onChange={handleChange} rows={2}
            placeholder="Observaciones opcionales..."
            className="w-full rounded-lg border px-4 py-2.5 bg-white dark:bg-dark-card border-gray-300 dark:border-dark-border text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500" />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-dark-border">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>{esEdicion ? 'Guardar Cambios' : 'Crear Cliente'}</Button>
      </div>
    </form>
  );
};

export default FormularioCliente;
