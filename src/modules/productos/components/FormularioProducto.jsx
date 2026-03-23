import { useState, useEffect, useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';
import Input from '../../../shared/components/UI/Input';
import Button from '../../../shared/components/UI/Button';

const IMAGE_SIZE = 400;
const IMAGE_QUALITY = 0.8;

const processImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Imagen inválida'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = IMAGE_SIZE;
        canvas.height = IMAGE_SIZE;
        const ctx = canvas.getContext('2d');
        // Fondo blanco para imágenes con transparencia
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, IMAGE_SIZE, IMAGE_SIZE);
        // Contain fit: escalar manteniendo proporción, centrado
        const scale = Math.min(IMAGE_SIZE / img.width, IMAGE_SIZE / img.height);
        const x = (IMAGE_SIZE - img.width * scale) / 2;
        const y = (IMAGE_SIZE - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        const preview = canvas.toDataURL('image/jpeg', IMAGE_QUALITY);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Error al procesar imagen'));
            resolve({ blob, preview });
          },
          'image/jpeg',
          IMAGE_QUALITY
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

const FormularioProducto = ({ mode, initialData, categorias, onSubmit, onCancel }) => {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria_id: '',
    codigo_barras: '',
    sku: '',
    precio_costo: '',
    precio_venta: '',
    stock_minimo: 10,
    stock_maximo: 100,
    requiere_caducidad: false,
    dias_alerta_caducidad: 21,
    unidad_medida: 'unidad',
    activo: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [margenGanancia, setMargenGanancia] = useState(0);
  const [imageBlob, setImageBlob] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageRemoved, setImageRemoved] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        descripcion: initialData.descripcion || '',
        categoria_id: initialData.categoria_id || '',
        codigo_barras: initialData.codigo_barras || '',
        sku: initialData.sku || '',
        precio_costo: initialData.precio_costo || '',
        precio_venta: initialData.precio_venta || '',
        stock_minimo: initialData.stock_minimo || 10,
        stock_maximo: initialData.stock_maximo || 100,
        requiere_caducidad: initialData.requiere_caducidad || false,
        dias_alerta_caducidad: initialData.dias_alerta_caducidad || 21,
        unidad_medida: initialData.unidad_medida || 'unidad',
        activo: initialData.activo !== undefined ? initialData.activo : true,
      });
      setImagePreview(initialData.imagen || '');
      setImageBlob(null);
      setImageRemoved(false);
    }
  }, [initialData]);

  useEffect(() => {
    const costo = parseFloat(formData.precio_costo) || 0;
    const venta = parseFloat(formData.precio_venta) || 0;
    if (costo > 0 && venta > 0) {
      setMargenGanancia(((venta - costo) / costo * 100).toFixed(2));
    } else {
      setMargenGanancia(0);
    }
  }, [formData.precio_costo, formData.precio_venta]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageLoading(true);
    try {
      const { blob, preview } = await processImage(file);
      setImageBlob(blob);
      setImagePreview(preview);
      setImageRemoved(false);
      setErrors(prev => ({ ...prev, imagen: '' }));
    } catch {
      setErrors(prev => ({ ...prev, imagen: 'No se pudo procesar la imagen' }));
    } finally {
      setImageLoading(false);
      e.target.value = '';
    }
  };

  const handleImageRemove = () => {
    setImageBlob(null);
    setImagePreview('');
    setImageRemoved(true);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }
    if (!formData.categoria_id) {
      newErrors.categoria_id = 'La categoría es requerida';
    }
    if (!formData.precio_costo || parseFloat(formData.precio_costo) <= 0) {
      newErrors.precio_costo = 'El precio de costo debe ser mayor a 0';
    }
    if (!formData.precio_venta || parseFloat(formData.precio_venta) <= 0) {
      newErrors.precio_venta = 'El precio de venta debe ser mayor a 0';
    }
    if (parseFloat(formData.precio_venta) < parseFloat(formData.precio_costo)) {
      newErrors.precio_venta = 'El precio de venta debe ser mayor al precio de costo';
    }
    if (formData.codigo_barras && formData.codigo_barras.length < 8) {
      newErrors.codigo_barras = 'El código de barras debe tener al menos 8 caracteres';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = new FormData();
      data.append('nombre', formData.nombre);
      data.append('descripcion', formData.descripcion || '');
      data.append('categoria_id', formData.categoria_id);
      data.append('codigo_barras', formData.codigo_barras || '');
      data.append('sku', formData.sku || '');
      data.append('precio_costo', parseFloat(formData.precio_costo));
      data.append('precio_venta', parseFloat(formData.precio_venta));
      data.append('stock_minimo', parseInt(formData.stock_minimo));
      data.append('stock_maximo', parseInt(formData.stock_maximo));
      data.append('requiere_caducidad', formData.requiere_caducidad);
      data.append('dias_alerta_caducidad', parseInt(formData.dias_alerta_caducidad));
      data.append('unidad_medida', formData.unidad_medida);
      data.append('activo', formData.activo);

      if (imageBlob) {
        data.append('imagen', imageBlob, 'producto.jpg');
      } else if (imageRemoved) {
        data.append('imagen', '');
      }

      await onSubmit(data);
    } finally {
      setLoading(false);
    }
  };

  const isViewMode = mode === 'view';

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
              label="Nombre del Producto"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              error={errors.nombre}
              disabled={isViewMode}
              required
              placeholder="Ej: Cerveza Pilsener 330ml"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              disabled={isViewMode}
              rows={3}
              placeholder="Descripción detallada del producto..."
              className="w-full rounded-lg border px-4 py-2.5 bg-white dark:bg-dark-card border-gray-300 dark:border-dark-border text-gray-900 dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categoría <span className="text-red-500">*</span>
            </label>
            <select
              name="categoria_id"
              value={formData.categoria_id}
              onChange={handleChange}
              disabled={isViewMode}
              className={`w-full rounded-lg border px-4 py-2.5 bg-white dark:bg-dark-card border-gray-300 dark:border-dark-border text-gray-900 dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 ${
                errors.categoria_id ? 'border-red-500' : ''
              }`}
              required
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
            {errors.categoria_id && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.categoria_id}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Unidad de Medida
            </label>
            <select
              name="unidad_medida"
              value={formData.unidad_medida}
              onChange={handleChange}
              disabled={isViewMode}
              className="w-full rounded-lg border px-4 py-2.5 bg-white dark:bg-dark-card border-gray-300 dark:border-dark-border text-gray-900 dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="unidad">Unidad</option>
              <option value="kg">Kilogramo (kg)</option>
              <option value="g">Gramo (g)</option>
              <option value="l">Litro (l)</option>
              <option value="ml">Mililitro (ml)</option>
              <option value="caja">Caja</option>
              <option value="paquete">Paquete</option>
            </select>
          </div>
        </div>
      </div>

      {/* Imagen */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Imagen del Producto
        </h3>
        <div className="flex items-start gap-4">
          {/* Preview */}
          <div className="w-32 h-32 flex-shrink-0 rounded-lg border-2 border-dashed border-gray-300 dark:border-dark-border overflow-hidden bg-gray-50 dark:bg-dark-card flex items-center justify-center">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Vista previa"
                className="w-full h-full object-cover"
              />
            ) : (
              <ImagePlus size={32} className="text-gray-400" />
            )}
          </div>

          {/* Controles */}
          {!isViewMode && (
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                loading={imageLoading}
                disabled={imageLoading}
              >
                <ImagePlus size={16} />
                {imagePreview ? 'Cambiar imagen' : 'Subir imagen'}
              </Button>
              {imagePreview && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleImageRemove}
                >
                  <X size={16} />
                  Eliminar
                </Button>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Se redimensionará a 400×400 px.<br />
                Formatos: JPG, PNG, WEBP.
              </p>
              {errors.imagen && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.imagen}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Códigos */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Códigos de Identificación
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Código de Barras"
            name="codigo_barras"
            value={formData.codigo_barras}
            onChange={handleChange}
            error={errors.codigo_barras}
            disabled={isViewMode}
            placeholder="7891234567890"
          />

          <Input
            label="SKU (Stock Keeping Unit)"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            disabled={isViewMode}
            placeholder="CER-PIL-330"
          />
        </div>
      </div>

      {/* Precios */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Precios y Márgenes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Precio de Costo"
            name="precio_costo"
            type="number"
            step="0.01"
            min="0"
            value={formData.precio_costo}
            onChange={handleChange}
            error={errors.precio_costo}
            disabled={isViewMode}
            required
            placeholder="0.00"
          />

          <Input
            label="Precio de Venta"
            name="precio_venta"
            type="number"
            step="0.01"
            min="0"
            value={formData.precio_venta}
            onChange={handleChange}
            error={errors.precio_venta}
            disabled={isViewMode}
            required
            placeholder="0.00"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Margen de Ganancia
            </label>
            <div className={`
              w-full rounded-lg border px-4 py-2.5
              ${margenGanancia > 0 ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-dark-border'}
            `}>
              <p className={`text-lg font-bold ${
                margenGanancia > 0
                  ? 'text-green-700 dark:text-green-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {margenGanancia}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Inventario */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Control de Inventario
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Stock Mínimo"
            name="stock_minimo"
            type="number"
            min="0"
            value={formData.stock_minimo}
            onChange={handleChange}
            disabled={isViewMode}
            placeholder="10"
          />

          <Input
            label="Stock Máximo"
            name="stock_maximo"
            type="number"
            min="0"
            value={formData.stock_maximo}
            onChange={handleChange}
            disabled={isViewMode}
            placeholder="100"
          />
        </div>
      </div>

      {/* Caducidad */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Control de Caducidad
        </h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="requiere_caducidad"
              checked={formData.requiere_caducidad}
              onChange={handleChange}
              disabled={isViewMode}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Este producto requiere control de fecha de caducidad
            </label>
          </div>

          {formData.requiere_caducidad && (
            <div className="ml-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <Input
                label="Días de alerta antes de caducidad"
                name="dias_alerta_caducidad"
                type="number"
                min="1"
                value={formData.dias_alerta_caducidad}
                onChange={handleChange}
                disabled={isViewMode}
                placeholder="21"
              />
              <p className="mt-2 text-sm text-orange-700 dark:text-orange-400">
                ⚠️ Se generará una alerta {formData.dias_alerta_caducidad} días antes de que el producto caduque
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Estado */}
      {!isViewMode && (
        <div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="activo"
              checked={formData.activo}
              onChange={handleChange}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Producto activo (disponible para la venta)
            </label>
          </div>
        </div>
      )}

      {/* Vista de detalles adicionales en modo view */}
      {isViewMode && initialData && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Información Adicional
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Estado</p>
              <p className="font-medium text-gray-800 dark:text-white">
                {initialData.activo ? '✅ Activo' : '❌ Inactivo'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Creado</p>
              <p className="font-medium text-gray-800 dark:text-white">
                {new Date(initialData.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Última actualización</p>
              <p className="font-medium text-gray-800 dark:text-white">
                {new Date(initialData.updated_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">ID</p>
              <p className="font-medium text-gray-800 dark:text-white">
                #{initialData.id}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-dark-border">
        <Button type="button" variant="secondary" onClick={onCancel}>
          {isViewMode ? 'Cerrar' : 'Cancelar'}
        </Button>
        {!isViewMode && (
          <Button type="submit" loading={loading}>
            {mode === 'create' ? 'Crear Producto' : 'Guardar Cambios'}
          </Button>
        )}
      </div>
    </form>
  );
};

export default FormularioProducto;
