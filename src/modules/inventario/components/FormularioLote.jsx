import { useState, useEffect } from 'react';
import { useNotification } from '../../../shared/hooks/useNotification';
import productoService from '../../productos/services/producto.service';
import Input from '../../../shared/components/UI/Input';
import Button from '../../../shared/components/UI/Button';
import { Search } from 'lucide-react';

const FormularioLote = ({ onSubmit, onCancel }) => {
  const { showError } = useNotification();
  const [formData, setFormData] = useState({
    producto_id: '',
    numero_lote: '',
    cantidad_inicial: '',
    fecha_ingreso: new Date().toISOString().split('T')[0],
    fecha_caducidad: '',
    ubicacion: '',
    notas: '',
    motivo: 'Compra de inventario'
  });
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    cargarProductos();
  }, [searchTerm]);

  const cargarProductos = async () => {
    try {
      const response = await productoService.getAll({
        search: searchTerm,
        limit: 20,
        activo: true
      });
      setProductos(response.data.productos);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const handleProductoSelect = (producto) => {
    setProductoSeleccionado(producto);
    setFormData(prev => ({
      ...prev,
      producto_id: producto.id
    }));
    setSearchTerm('');
    
    if (errors.producto_id) {
      setErrors(prev => ({ ...prev, producto_id: '' }));
    }
  };

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

    if (!formData.producto_id) {
      newErrors.producto_id = 'Debe seleccionar un producto';
    }

    if (!formData.numero_lote.trim()) {
      newErrors.numero_lote = 'El número de lote es requerido';
    }

    if (!formData.cantidad_inicial || parseFloat(formData.cantidad_inicial) <= 0) {
      newErrors.cantidad_inicial = 'La cantidad debe ser mayor a 0';
    }

    if (productoSeleccionado?.requiere_caducidad && !formData.fecha_caducidad) {
      newErrors.fecha_caducidad = 'Este producto requiere fecha de caducidad';
    }

    if (formData.fecha_caducidad) {
      const fechaCad = new Date(formData.fecha_caducidad);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      if (fechaCad <= hoy) {
        newErrors.fecha_caducidad = 'La fecha de caducidad debe ser futura';
      }
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
        cantidad_inicial: parseFloat(formData.cantidad_inicial),
        fecha_caducidad: formData.fecha_caducidad || null
      };

      await onSubmit(dataToSend);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Selección de Producto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Producto <span className="text-red-500">*</span>
        </label>
        
        {productoSeleccionado ? (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {productoSeleccionado.nombre}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {productoSeleccionado.categoria?.nombre}
                  {productoSeleccionado.codigo_barras && ` • ${productoSeleccionado.codigo_barras}`}
                </p>
                {productoSeleccionado.requiere_caducidad && (
                  <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                    ⚠️ Requiere fecha de caducidad
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setProductoSeleccionado(null);
                  setFormData(prev => ({ ...prev, producto_id: '' }));
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Cambiar
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar producto por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 ${
                  errors.producto_id ? 'border-red-500' : 'border-gray-300 dark:border-dark-border'
                }`}
              />
            </div>
            
            {searchTerm && productos.length > 0 && (
              <div className="mt-2 max-h-60 overflow-y-auto border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card">
                {productos.map(producto => (
                  <button
                    key={producto.id}
                    type="button"
                    onClick={() => handleProductoSelect(producto)}
                    className="w-full p-3 text-left hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors border-b border-gray-200 dark:border-dark-border last:border-0"
                  >
                    <p className="font-medium text-gray-900 dark:text-white">
                      {producto.nombre}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {producto.categoria?.nombre}
                      {producto.codigo_barras && ` • ${producto.codigo_barras}`}
                    </p>
                  </button>
                ))}
              </div>
            )}
            
            {errors.producto_id && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.producto_id}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Número de Lote */}
      <Input
        label="Número de Lote"
        name="numero_lote"
        value={formData.numero_lote}
        onChange={handleChange}
        error={errors.numero_lote}
        required
        placeholder="LOTE-2026-001"
      />

      {/* Cantidad Inicial */}
      <Input
        label="Cantidad Inicial"
        name="cantidad_inicial"
        type="number"
        step="0.01"
        min="0"
        value={formData.cantidad_inicial}
        onChange={handleChange}
        error={errors.cantidad_inicial}
        required
        placeholder="0.00"
      />

      {/* Fechas */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Fecha de Ingreso"
          name="fecha_ingreso"
          type="date"
          value={formData.fecha_ingreso}
          onChange={handleChange}
          required
        />

        <Input
          label={
            <span>
              Fecha de Caducidad
              {productoSeleccionado?.requiere_caducidad && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </span>
          }
          name="fecha_caducidad"
          type="date"
          value={formData.fecha_caducidad}
          onChange={handleChange}
          error={errors.fecha_caducidad}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      {/* Ubicación */}
      <Input
        label="Ubicación Física (opcional)"
        name="ubicacion"
        value={formData.ubicacion}
        onChange={handleChange}
        placeholder="Ej: Estante A-1, Refrigerador 2"
      />

      {/* Motivo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Motivo de Entrada
        </label>
        <select
          name="motivo"
          value={formData.motivo}
          onChange={handleChange}
          className="w-full px-4 py-2.5 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
        >
          <option value="Compra de inventario">Compra de inventario</option>
          <option value="Devolución de cliente">Devolución de cliente</option>
          <option value="Ajuste de inventario">Ajuste de inventario</option>
          <option value="Transferencia">Transferencia</option>
          <option value="Otro">Otro</option>
        </select>
      </div>

      {/* Notas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notas (opcional)
        </label>
        <textarea
          name="notas"
          value={formData.notas}
          onChange={handleChange}
          rows={3}
          placeholder="Observaciones adicionales sobre este lote..."
          className="w-full rounded-lg border px-4 py-2.5 bg-white dark:bg-dark-card border-gray-300 dark:border-dark-border text-gray-900 dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-dark-border">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          Crear Lote
        </Button>
      </div>
    </form>
  );
};

export default FormularioLote;