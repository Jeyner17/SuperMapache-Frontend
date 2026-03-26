import { useState, useEffect } from 'react';
import Button from '../../../shared/components/UI/Button';

const CATEGORIAS = [
  { value: 'servicios',    label: 'Servicios (luz, agua, internet)' },
  { value: 'mantenimiento',label: 'Mantenimiento y reparaciones' },
  { value: 'sueldos',      label: 'Sueldos y salarios' },
  { value: 'insumos',      label: 'Insumos y materiales' },
  { value: 'alquiler',     label: 'Alquiler' },
  { value: 'transporte',   label: 'Transporte y fletes' },
  { value: 'publicidad',   label: 'Publicidad y marketing' },
  { value: 'otros',        label: 'Otros' },
];

const METODOS = [
  { value: 'efectivo',      label: 'Efectivo' },
  { value: 'tarjeta',       label: 'Tarjeta' },
  { value: 'transferencia', label: 'Transferencia' },
];

const hoy = () => new Date().toISOString().split('T')[0];

const FormularioGasto = ({ gasto, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    categoria:   '',
    descripcion: '',
    monto:       '',
    fecha_gasto: hoy(),
    metodo_pago: 'efectivo',
    comprobante: '',
    notas:       '',
  });
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  useEffect(() => {
    if (gasto) {
      setFormData({
        categoria:   gasto.categoria   || '',
        descripcion: gasto.descripcion || '',
        monto:       gasto.monto       || '',
        fecha_gasto: gasto.fecha_gasto || hoy(),
        metodo_pago: gasto.metodo_pago || 'efectivo',
        comprobante: gasto.comprobante || '',
        notas:       gasto.notas       || '',
      });
    }
  }, [gasto]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.categoria)   newErrors.categoria   = 'Selecciona una categoría';
    if (!formData.descripcion.trim()) newErrors.descripcion = 'La descripción es requerida';
    if (!formData.monto || parseFloat(formData.monto) <= 0) newErrors.monto = 'Monto debe ser mayor a 0';
    if (!formData.fecha_gasto) newErrors.fecha_gasto  = 'La fecha es requerida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        monto: parseFloat(formData.monto),
        comprobante: formData.comprobante.trim() || undefined,
        notas:       formData.notas.trim()       || undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (field) =>
    `w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 ${
      errors[field] ? 'border-red-500' : 'border-gray-300 dark:border-dark-border'
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Categoría <span className="text-red-500">*</span>
          </label>
          <select name="categoria" value={formData.categoria} onChange={handleChange} className={inputCls('categoria')}>
            <option value="">Selecciona...</option>
            {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          {errors.categoria && <p className="mt-1 text-sm text-red-600">{errors.categoria}</p>}
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fecha <span className="text-red-500">*</span>
          </label>
          <input type="date" name="fecha_gasto" value={formData.fecha_gasto} onChange={handleChange} className={inputCls('fecha_gasto')} />
          {errors.fecha_gasto && <p className="mt-1 text-sm text-red-600">{errors.fecha_gasto}</p>}
        </div>

        {/* Monto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Monto <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
            <input type="number" name="monto" step="0.01" min="0.01"
              value={formData.monto} onChange={handleChange} placeholder="0.00"
              className={`${inputCls('monto')} pl-8`} />
          </div>
          {errors.monto && <p className="mt-1 text-sm text-red-600">{errors.monto}</p>}
        </div>

        {/* Método de pago */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Método de pago</label>
          <select name="metodo_pago" value={formData.metodo_pago} onChange={handleChange} className={inputCls('metodo_pago')}>
            {METODOS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Descripción <span className="text-red-500">*</span>
        </label>
        <input type="text" name="descripcion" value={formData.descripcion} onChange={handleChange}
          placeholder="Ej: Pago de factura de luz eléctrica — mayo 2026"
          className={inputCls('descripcion')} />
        {errors.descripcion && <p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>}
      </div>

      {/* Comprobante */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          N° Comprobante / Factura
        </label>
        <input type="text" name="comprobante" value={formData.comprobante} onChange={handleChange}
          placeholder="FAC-00123 (opcional)"
          className={inputCls('comprobante')} />
      </div>

      {/* Notas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas</label>
        <textarea name="notas" rows={2} value={formData.notas} onChange={handleChange}
          placeholder="Observaciones adicionales..."
          className={inputCls('notas')} />
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-dark-border">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>{gasto ? 'Actualizar' : 'Registrar Gasto'}</Button>
      </div>
    </form>
  );
};

export default FormularioGasto;
