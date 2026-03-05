import { useState, useEffect } from 'react';
import proveedorService from '../services/proveedor.service';
import Button from '../../../shared/components/UI/Button';
import Badge from '../../../shared/components/UI/Badge';
import Loading from '../../../shared/components/UI/Loading';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';
import { 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  DollarSign, 
  TrendingUp,
  Calendar,
  Star,
  Package
} from 'lucide-react';

const DetallesProveedor = ({ proveedor: proveedorInicial, onClose }) => {
  const [proveedor, setProveedor] = useState(proveedorInicial);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const response = await proveedorService.getEstadisticas(proveedorInicial.id);
      setEstadisticas(response.data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !estadisticas) {
    return <Loading message="Cargando detalles..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b border-gray-200 dark:border-dark-border">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
            {proveedor.razon_social}
          </h3>
          {proveedor.nombre_comercial && (
            <p className="text-gray-600 dark:text-gray-400">
              {proveedor.nombre_comercial}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Badge variant={proveedor.activo ? 'success' : 'danger'}>
            {proveedor.activo ? 'Activo' : 'Inactivo'}
          </Badge>
          <Badge variant="info">
            {proveedor.tipo_proveedor === 'productos' ? 'Productos' :
             proveedor.tipo_proveedor === 'servicios' ? 'Servicios' : 'Ambos'}
          </Badge>
        </div>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Package size={18} className="text-blue-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Compras</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {estadisticas.total_compras}
            </p>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={18} className="text-green-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Monto Total</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(estadisticas.monto_total)}
            </p>
          </div>

          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} className="text-orange-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Pendientes</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {estadisticas.compras_pendientes}
            </p>
          </div>

          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={18} className="text-red-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Deuda</span>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(estadisticas.deuda_total)}
            </p>
          </div>
        </div>
      )}

      {/* Información General */}
      <div>
        <h4 className="font-semibold text-gray-800 dark:text-white mb-4">
          Información General
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {proveedor.ruc && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-100 dark:bg-dark-hover rounded-lg flex items-center justify-center flex-shrink-0">
                <Package size={16} className="text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">RUC</p>
                <p className="font-medium text-gray-800 dark:text-white">{proveedor.ruc}</p>
              </div>
            </div>
          )}

          {proveedor.email && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-100 dark:bg-dark-hover rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail size={16} className="text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="font-medium text-gray-800 dark:text-white">{proveedor.email}</p>
              </div>
            </div>
          )}

          {proveedor.telefono && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-100 dark:bg-dark-hover rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone size={16} className="text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Teléfono</p>
                <p className="font-medium text-gray-800 dark:text-white">{proveedor.telefono}</p>
              </div>
            </div>
          )}

          {proveedor.celular && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-100 dark:bg-dark-hover rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone size={16} className="text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Celular</p>
                <p className="font-medium text-gray-800 dark:text-white">{proveedor.celular}</p>
              </div>
            </div>
          )}

          {(proveedor.ciudad || proveedor.direccion) && (
            <div className="flex items-start gap-3 md:col-span-2">
              <div className="w-8 h-8 bg-gray-100 dark:bg-dark-hover rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin size={16} className="text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ubicación</p>
                <p className="font-medium text-gray-800 dark:text-white">
                  {proveedor.direccion}
                  {proveedor.ciudad && ` - ${proveedor.ciudad}`}
                  {proveedor.pais && `, ${proveedor.pais}`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contacto Principal */}
      {proveedor.contacto_nombre && (
        <div>
          <h4 className="font-semibold text-gray-800 dark:text-white mb-4">
            Persona de Contacto
          </h4>
          <div className="p-4 bg-gray-50 dark:bg-dark-hover rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <User size={18} className="text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nombre</p>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {proveedor.contacto_nombre}
                  </p>
                </div>
              </div>

              {proveedor.contacto_telefono && (
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Teléfono</p>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {proveedor.contacto_telefono}
                    </p>
                  </div>
                </div>
              )}

              {proveedor.contacto_email && (
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {proveedor.contacto_email}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Términos Comerciales */}
      <div>
        <h4 className="font-semibold text-gray-800 dark:text-white mb-4">
          Términos Comerciales
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-dark-hover rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={18} className="text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Días de Crédito</span>
            </div>
            <p className="text-xl font-bold text-gray-800 dark:text-white">
              {proveedor.dias_credito} días
            </p>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-dark-hover rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={18} className="text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Límite de Crédito</span>
            </div>
            <p className="text-xl font-bold text-gray-800 dark:text-white">
              {formatCurrency(proveedor.limite_credito || 0)}
            </p>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-dark-hover rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Star size={18} className="text-yellow-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Calificación</span>
            </div>
            <p className="text-xl font-bold text-yellow-600">
              {parseFloat(proveedor.calificacion || 0).toFixed(1)} / 5.0
            </p>
          </div>
        </div>
      </div>

      {/* Notas */}
      {proveedor.notas && (
        <div>
          <h4 className="font-semibold text-gray-800 dark:text-white mb-4">
            Notas
          </h4>
          <div className="p-4 bg-gray-50 dark:bg-dark-hover rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {proveedor.notas}
            </p>
          </div>
        </div>
      )}

      {/* Últimas Compras */}
      {proveedor.compras && proveedor.compras.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-800 dark:text-white mb-4">
            Últimas Compras
          </h4>
          <div className="space-y-2">
            {proveedor.compras.map((compra) => (
              <div
                key={compra.id}
                className="p-3 bg-gray-50 dark:bg-dark-hover rounded-lg flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {compra.numero_compra}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(compra.fecha_compra)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800 dark:text-white">
                    {formatCurrency(compra.total)}
                  </p>
                  <Badge variant={
                    compra.estado === 'recibida' ? 'success' :
                    compra.estado === 'pendiente' ? 'warning' :
                    compra.estado === 'cancelada' ? 'danger' : 'info'
                  } size="sm">
                    {compra.estado}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Información Adicional */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Creado</p>
          <p className="font-medium text-gray-800 dark:text-white">
            {formatDate(proveedor.created_at)}
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Última actualización</p>
          <p className="font-medium text-gray-800 dark:text-white">
            {formatDate(proveedor.updated_at)}
          </p>
        </div>
      </div>

      {/* Botón de Cerrar */}
      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-dark-border">
        <Button onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </div>
  );
};

export default DetallesProveedor;