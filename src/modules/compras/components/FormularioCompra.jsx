import { useState, useEffect } from 'react';
import { useNotification } from '../../../shared/hooks/useNotification';
import productoService from '../../productos/services/producto.service';
import Input from '../../../shared/components/UI/Input';
import Button from '../../../shared/components/UI/Button';
import { Search, Plus, Trash2, Calculator } from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/formatters';

const FormularioCompra = ({ proveedores, onSubmit, onCancel }) => {
  const { showError } = useNotification();
  const [formData, setFormData] = useState({
    proveedor_id: '',
    fecha_compra: new Date().toISOString().split('T')[0],
    fecha_entrega_estimada: '',
    tipo_pago: 'contado',
    dias_credito: 0,
    descuento: 0,
    notas: ''
  });
  const [productos, setProductos] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showProductSearch, setShowProductSearch] = useState(false);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const term = searchTerm;
      const timer = setTimeout(() => {
        buscarProductos(term);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setProductos([]);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (formData.proveedor_id && formData.tipo_pago === 'credito') {
      const proveedor = proveedores.find(p => p.id === parseInt(formData.proveedor_id));
      if (proveedor) {
        setFormData(prev => ({
          ...prev,
          dias_credito: proveedor.dias_credito || 0
        }));
      }
    }
  }, [formData.proveedor_id, formData.tipo_pago, proveedores]);

  const buscarProductos = async (term) => {
    try {
      const response = await productoService.getAll({
        search: term,
        page: 1,
        limit: 20
      });

      let productosEncontrados = [];

      if (response.data) {
        if (response.data.productos && Array.isArray(response.data.productos)) {
          productosEncontrados = response.data.productos;
        } else if (Array.isArray(response.data)) {
          productosEncontrados = response.data;
        }
      }

      setProductos(productosEncontrados);

    } catch (error) {
      showError('Error al buscar productos');
      setProductos([]);
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

  const handleAgregarProducto = (producto) => {
    const yaExiste = productosSeleccionados.find(p => p.producto_id === producto.id);

    if (yaExiste) {
      showError('El producto ya está agregado');
      return;
    }

    setProductosSeleccionados([...productosSeleccionados, {
      producto_id: producto.id,
      producto_nombre: producto.nombre,
      cantidad: 1,
      precio_unitario: producto.precio_costo || 0,
      numero_lote_proveedor: '',
      fecha_caducidad: ''
    }]);

    setSearchTerm('');
    setShowProductSearch(false);
  };

  const handleQuitarProducto = (index) => {
    setProductosSeleccionados(productosSeleccionados.filter((_, i) => i !== index));
  };

  const handleProductoChange = (index, field, value) => {
    const newProductos = [...productosSeleccionados];
    newProductos[index][field] = value;
    setProductosSeleccionados(newProductos);
  };

  const calcularTotales = () => {
    let subtotal = 0;

    productosSeleccionados.forEach(item => {
      const cantidad = parseFloat(item.cantidad) || 0;
      const precio = parseFloat(item.precio_unitario) || 0;
      subtotal += cantidad * precio;
    });

    const impuestos = subtotal * 0.12; // IVA 12%
    const descuento = parseFloat(formData.descuento) || 0;
    const total = subtotal + impuestos - descuento;

    return { subtotal, impuestos, descuento, total };
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.proveedor_id) {
      newErrors.proveedor_id = 'Debe seleccionar un proveedor';
    }

    if (productosSeleccionados.length === 0) {
      newErrors.productos = 'Debe agregar al menos un producto';
    }

    // Validar cada producto
    productosSeleccionados.forEach((item, index) => {
      if (!item.cantidad || parseFloat(item.cantidad) <= 0) {
        newErrors[`producto_${index}_cantidad`] = 'Cantidad inválida';
      }
      if (!item.precio_unitario || parseFloat(item.precio_unitario) <= 0) {
        newErrors[`producto_${index}_precio`] = 'Precio inválido';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      showError('Por favor corrija los errores en el formulario');
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        proveedor_id: parseInt(formData.proveedor_id),
        descuento: parseFloat(formData.descuento) || 0,
        dias_credito: parseInt(formData.dias_credito) || 0,
        productos: productosSeleccionados.map(item => ({
          producto_id: item.producto_id,
          cantidad: parseFloat(item.cantidad),
          precio_unitario: parseFloat(item.precio_unitario),
          numero_lote_proveedor: item.numero_lote_proveedor || null,
          fecha_caducidad: item.fecha_caducidad || null
        }))
      };

      await onSubmit(dataToSend);
    } finally {
      setLoading(false);
    }
  };

  const totales = calcularTotales();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información de la Compra */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Información de la Compra
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Proveedor <span className="text-red-500">*</span>
            </label>
            <select
              name="proveedor_id"
              value={formData.proveedor_id}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 ${errors.proveedor_id ? 'border-red-500' : 'border-gray-300 dark:border-dark-border'
                }`}
              required
            >
              <option value="">Seleccionar proveedor...</option>
              {proveedores.map(prov => (
                <option key={prov.id} value={prov.id}>
                  {prov.razon_social}
                </option>
              ))}
            </select>
            {errors.proveedor_id && (
              <p className="mt-1 text-sm text-red-600">{errors.proveedor_id}</p>
            )}
          </div>

          <Input
            label="Fecha de Compra"
            name="fecha_compra"
            type="date"
            value={formData.fecha_compra}
            onChange={handleChange}
            required
          />

          <Input
            label="Fecha Estimada de Entrega"
            name="fecha_entrega_estimada"
            type="date"
            value={formData.fecha_entrega_estimada}
            onChange={handleChange}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Pago
            </label>
            <select
              name="tipo_pago"
              value={formData.tipo_pago}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="contado">Contado</option>
              <option value="credito">Crédito</option>
            </select>
          </div>

          {formData.tipo_pago === 'credito' && (
            <Input
              label="Días de Crédito"
              name="dias_credito"
              type="number"
              min="0"
              value={formData.dias_credito}
              onChange={handleChange}
            />
          )}
        </div>
      </div>

      {/* Productos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Productos
          </h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setShowProductSearch(!showProductSearch)}
          >
            <Plus size={16} />
            Agregar Producto
          </Button>
        </div>

        {/* Búsqueda de productos */}
        {showProductSearch && (
          <div className="mb-4 p-4 bg-gray-50 dark:bg-dark-hover rounded-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar producto por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {searchTerm && productos.length > 0 && (
              <div className="mt-2 max-h-60 overflow-y-auto border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card">
                {productos.map(producto => (
                  <button
                    key={producto.id}
                    type="button"
                    onClick={() => handleAgregarProducto(producto)}
                    className="w-full p-3 text-left hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors border-b border-gray-200 dark:border-dark-border last:border-0"
                  >
                    <p className="font-medium text-gray-900 dark:text-white">
                      {producto.nombre}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {producto.codigo_barras} • Precio: {formatCurrency(producto.precio_costo)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {errors.productos && (
          <p className="mb-2 text-sm text-red-600">{errors.productos}</p>
        )}

        {/* Lista de productos seleccionados */}
        {productosSeleccionados.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 dark:bg-dark-hover rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <p className="text-gray-500 dark:text-gray-400">
              No hay productos agregados. Haz clic en "Agregar Producto" para comenzar.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {productosSeleccionados.map((item, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 dark:bg-dark-hover rounded-lg border border-gray-200 dark:border-dark-border"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 dark:text-white">
                      {item.producto_nombre}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuitarProducto(index)}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                  >
                    <Trash2 size={18} className="text-red-600" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Cantidad *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={item.cantidad}
                      onChange={(e) => handleProductoChange(index, 'cantidad', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white text-sm ${errors[`producto_${index}_cantidad`] ? 'border-red-500' : 'border-gray-300 dark:border-dark-border'
                        }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Precio Unitario *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={item.precio_unitario}
                      onChange={(e) => handleProductoChange(index, 'precio_unitario', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white text-sm ${errors[`producto_${index}_precio`] ? 'border-red-500' : 'border-gray-300 dark:border-dark-border'
                        }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Lote Proveedor
                    </label>
                    <input
                      type="text"
                      value={item.numero_lote_proveedor}
                      onChange={(e) => handleProductoChange(index, 'numero_lote_proveedor', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white text-sm"
                      placeholder="Opcional"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Fecha Caducidad
                    </label>
                    <input
                      type="date"
                      value={item.fecha_caducidad}
                      onChange={(e) => handleProductoChange(index, 'fecha_caducidad', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                </div>

                <div className="mt-2 text-right">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal: </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency((parseFloat(item.cantidad) || 0) * (parseFloat(item.precio_unitario) || 0))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Totales */}
      <div className="p-6 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg border-2 border-primary-200 dark:border-primary-700">
        <div className="flex items-center gap-2 mb-4">
          <Calculator size={20} className="text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Resumen de Totales
          </h3>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(totales.subtotal)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">IVA (12%):</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(totales.impuestos)}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Descuento:</span>
            <input
              type="number"
              name="descuento"
              step="0.01"
              min="0"
              value={formData.descuento}
              onChange={handleChange}
              className="w-32 px-3 py-1 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white text-sm text-right"
              placeholder="0.00"
            />
          </div>

          <div className="pt-2 border-t border-gray-300 dark:border-gray-600">
            <div className="flex justify-between">
              <span className="text-lg font-bold text-gray-800 dark:text-white">Total:</span>
              <span className="text-2xl font-bold text-primary-600">
                {formatCurrency(totales.total)}
              </span>
            </div>
          </div>
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

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-dark-border">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          Crear Orden de Compra
        </Button>
      </div>
    </form>
  );
};

export default FormularioCompra;