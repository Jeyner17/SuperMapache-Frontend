import { useState, useEffect } from 'react';
import Button from '../../../shared/components/UI/Button';
import Badge from '../../../shared/components/UI/Badge';
import { PackageCheck, AlertTriangle } from 'lucide-react';

const FormularioRecepcion = ({ compra, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    fecha_recepcion: new Date().toISOString().split('T')[0],
    productos: [],
    notas: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!compra?.detalles?.length) return;

    const productosIniciales = compra.detalles.map(detalle => ({
      detalle_id: detalle.id,
      producto_nombre: detalle.producto?.nombre || `Producto #${detalle.producto_id}`,
      cantidad_pedida: parseFloat(detalle.cantidad_pedida),
      cantidad_recibida_anterior: parseFloat(detalle.cantidad_recibida),
      cantidad_recibida: parseFloat(detalle.cantidad_pedida) - parseFloat(detalle.cantidad_recibida),
      numero_lote_proveedor: detalle.numero_lote_proveedor || '',
      fecha_caducidad: detalle.fecha_caducidad || '',
      ubicacion: ''
    }));

    setFormData(prev => ({
      ...prev,
      productos: productosIniciales
    }));
  }, [compra]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProductoChange = (index, field, value) => {
    const newProductos = [...formData.productos];
    newProductos[index][field] = value;
    setFormData(prev => ({
      ...prev,
      productos: newProductos
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const dataToSend = {
        fecha_recepcion: formData.fecha_recepcion,
        notas: formData.notas,
        productos: formData.productos.map(item => ({
          detalle_id: item.detalle_id,
          cantidad_recibida: parseFloat(item.cantidad_recibida) || 0,
          numero_lote_proveedor: item.numero_lote_proveedor || null,
          fecha_caducidad: item.fecha_caducidad || null,
          ubicacion: item.ubicacion || null
        }))
      };

      await onSubmit(dataToSend);
    } finally {
      setLoading(false);
    }
  };

  const totalRecibido = formData.productos.reduce((sum, item) => 
    sum + (parseFloat(item.cantidad_recibida) || 0), 0
  );

  const totalPendiente = formData.productos.reduce((sum, item) => 
    sum + (item.cantidad_pedida - item.cantidad_recibida_anterior - (parseFloat(item.cantidad_recibida) || 0)), 0
  );

  if (!compra?.detalles) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
        Cargando detalles de la compra...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información de la Recepción */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Información de Recepción
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Orden de Compra:</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {compra.numero_compra}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Proveedor:</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {compra.proveedor?.razon_social}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha de Recepción
            </label>
            <input
              type="date"
              name="fecha_recepcion"
              value={formData.fecha_recepcion}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
        </div>
      </div>

      {/* Productos a Recibir */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Productos
        </h3>
        
        <div className="space-y-4">
          {formData.productos.map((item, index) => {
            const cantidadPendiente = item.cantidad_pedida - item.cantidad_recibida_anterior;
            const cantidadActual = parseFloat(item.cantidad_recibida) || 0;
            
            return (
              <div
                key={index}
                className="p-4 bg-gray-50 dark:bg-dark-hover rounded-lg border-l-4 border-primary-500"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.producto_nombre}
                    </p>
                    <div className="flex gap-3 mt-1">
                      <Badge variant="info" size="sm">
                        Pedido: {item.cantidad_pedida}
                      </Badge>
                      {item.cantidad_recibida_anterior > 0 && (
                        <Badge variant="success" size="sm">
                          Ya recibido: {item.cantidad_recibida_anterior}
                        </Badge>
                      )}
                      <Badge variant="warning" size="sm">
                        Pendiente: {cantidadPendiente}
                      </Badge>
                    </div>
                  </div>
                  
                  {cantidadActual > cantidadPendiente && (
                    <div className="flex items-center gap-1 text-orange-600">
                      <AlertTriangle size={16} />
                      <span className="text-xs">Excede pedido</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Cantidad Recibida *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={cantidadPendiente}
                      value={item.cantidad_recibida}
                      onChange={(e) => handleProductoChange(index, 'cantidad_recibida', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white text-sm"
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

                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Ubicación
                    </label>
                    <input
                      type="text"
                      value={item.ubicacion}
                      onChange={(e) => handleProductoChange(index, 'ubicacion', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white text-sm"
                      placeholder="Ej: Estante A-1"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resumen */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <PackageCheck size={20} className="text-blue-600" />
          <h4 className="font-semibold text-gray-800 dark:text-white">
            Resumen de Recepción
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Total a recibir ahora:</p>
            <p className="text-lg font-bold text-blue-600">{totalRecibido.toFixed(2)} unidades</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Quedará pendiente:</p>
            <p className="text-lg font-bold text-orange-600">{totalPendiente.toFixed(2)} unidades</p>
          </div>
        </div>
      </div>

      {/* Notas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notas de Recepción
        </label>
        <textarea
          name="notas"
          value={formData.notas}
          onChange={handleChange}
          rows={3}
          placeholder="Observaciones sobre la recepción..."
          className="w-full rounded-lg border px-4 py-2.5 bg-white dark:bg-dark-card border-gray-300 dark:border-dark-border text-gray-900 dark:text-dark-text focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Advertencia */}
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-400">
          ⚠️ <strong>Importante:</strong> Al recibir la mercancía se crearán automáticamente los lotes de inventario correspondientes.
        </p>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-dark-border">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          Confirmar Recepción
        </Button>
      </div>
    </form>
  );
};

export default FormularioRecepcion;