import { useState, useEffect } from 'react';
import Input from '../../../shared/components/UI/Input';
import Button from '../../../shared/components/UI/Button';

const FormularioProveedor = ({ mode, initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    razon_social: '',
    nombre_comercial: '',
    ruc: '',
    email: '',
    telefono: '',
    celular: '',
    direccion: '',
    ciudad: '',
    pais: 'Ecuador',
    contacto_nombre: '',
    contacto_telefono: '',
    contacto_email: '',
    tipo_proveedor: 'productos',
    calificacion: 0,
    dias_credito: 0,
    limite_credito: 0,
    notas: '',
    activo: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        razon_social: initialData.razon_social || '',
        nombre_comercial: initialData.nombre_comercial || '',
        ruc: initialData.ruc || '',
        email: initialData.email || '',
        telefono: initialData.telefono || '',
        celular: initialData.celular || '',
        direccion: initialData.direccion || '',
        ciudad: initialData.ciudad || '',
        pais: initialData.pais || 'Ecuador',
        contacto_nombre: initialData.contacto_nombre || '',
        contacto_telefono: initialData.contacto_telefono || '',
        contacto_email: initialData.contacto_email || '',
        tipo_proveedor: initialData.tipo_proveedor || 'productos',
        calificacion: initialData.calificacion || 0,
        dias_credito: initialData.dias_credito || 0,
        limite_credito: initialData.limite_credito || 0,
        notas: initialData.notas || '',
        activo: initialData.activo !== undefined ? initialData.activo : true
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let sanitized = value;
    if (name === 'ruc') {
      sanitized = value.replace(/\D/g, '').slice(0, 13);
    } else if (name === 'calificacion') {
      const num = parseFloat(value);
      if (value !== '' && !isNaN(num)) {
        sanitized = Math.min(5, Math.max(0, num)).toString();
      } else {
        sanitized = value === '' ? '' : value;
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : sanitized
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.razon_social.trim()) {
      newErrors.razon_social = 'La razón social es requerida';
    } else if (formData.razon_social.length < 3) {
      newErrors.razon_social = 'La razón social debe tener al menos 3 caracteres';
    }

    if (formData.ruc) {
      if (!/^\d+$/.test(formData.ruc)) {
        newErrors.ruc = 'El RUC solo puede contener números';
      } else if (formData.ruc.length !== 13) {
        newErrors.ruc = 'El RUC debe tener exactamente 13 dígitos';
      }
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    const cal = parseFloat(formData.calificacion);
    if (isNaN(cal) || cal < 0 || cal > 5) {
      newErrors.calificacion = 'La calificación debe ser entre 0 y 5';
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
        ...formData,
        calificacion: parseFloat(formData.calificacion) || 0,
        dias_credito: parseInt(formData.dias_credito) || 0,
        limite_credito: parseFloat(formData.limite_credito) || 0
      };

      await onSubmit(dataToSend);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información Básica */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Información Básica
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Razón Social"
              name="razon_social"
              value={formData.razon_social}
              onChange={handleChange}
              error={errors.razon_social}
              required
              placeholder="Ej: Distribuidora Nacional S.A."
            />
          </div>

          <Input
            label="Nombre Comercial"
            name="nombre_comercial"
            value={formData.nombre_comercial}
            onChange={handleChange}
            placeholder="Ej: DistNacional"
          />

          <Input
            label="RUC"
            name="ruc"
            value={formData.ruc}
            onChange={handleChange}
            error={errors.ruc}
            maxLength={13}
            placeholder="1791234567001"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Proveedor
            </label>
            <select
              name="tipo_proveedor"
              value={formData.tipo_proveedor}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="productos">Productos</option>
              <option value="servicios">Servicios</option>
              <option value="ambos">Ambos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Calificación (0-5)
            </label>
            <input
              type="number"
              name="calificacion"
              value={formData.calificacion}
              onChange={handleChange}
              min="0"
              max="5"
              step="0.1"
              className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 ${
                errors.calificacion ? 'border-red-500' : 'border-gray-300 dark:border-dark-border'
              }`}
            />
            {errors.calificacion && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.calificacion}</p>
            )}
          </div>
        </div>
      </div>

      {/* Información de Contacto */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Información de Contacto
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="ventas@proveedor.com"
          />

          <Input
            label="Teléfono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="02-2345678"
          />

          <Input
            label="Celular"
            name="celular"
            value={formData.celular}
            onChange={handleChange}
            placeholder="0998765432"
          />

          <Input
            label="Ciudad"
            name="ciudad"
            value={formData.ciudad}
            onChange={handleChange}
            placeholder="Quito"
          />

          <div className="md:col-span-2">
            <Input
              label="Dirección"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              placeholder="Av. Principal y Calle Secundaria"
            />
          </div>
        </div>
      </div>

      {/* Persona de Contacto */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Persona de Contacto
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Nombre del Contacto"
            name="contacto_nombre"
            value={formData.contacto_nombre}
            onChange={handleChange}
            placeholder="Juan Pérez"
          />

          <Input
            label="Teléfono del Contacto"
            name="contacto_telefono"
            value={formData.contacto_telefono}
            onChange={handleChange}
            placeholder="0998765432"
          />

          <Input
            label="Email del Contacto"
            name="contacto_email"
            type="email"
            value={formData.contacto_email}
            onChange={handleChange}
            placeholder="jperez@proveedor.com"
          />
        </div>
      </div>

      {/* Términos Comerciales */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Términos Comerciales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Días de Crédito"
            name="dias_credito"
            type="number"
            min="0"
            value={formData.dias_credito}
            onChange={handleChange}
            placeholder="0"
          />

          <Input
            label="Límite de Crédito (USD)"
            name="limite_credito"
            type="number"
            step="0.01"
            min="0"
            value={formData.limite_credito}
            onChange={handleChange}
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Notas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notas
        </label>
        <textarea
          name="notas"
          value={formData.notas}
          onChange={handleChange}
          rows={3}
          placeholder="Observaciones adicionales..."
          className="w-full rounded-lg border px-4 py-2.5 bg-white dark:bg-dark-card border-gray-300 dark:border-dark-border text-gray-900 dark:text-dark-text focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Estado */}
      <div className="flex items-center">
        <input
          type="checkbox"
          name="activo"
          checked={formData.activo}
          onChange={handleChange}
          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
        <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
          Proveedor activo
        </label>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-dark-border">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          {mode === 'create' ? 'Crear Proveedor' : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  );
};

export default FormularioProveedor;