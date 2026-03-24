import Badge from '../../../shared/components/UI/Badge';
import { formatCurrency, formatDateTime } from '../../../shared/utils/formatters';
import {
  Wallet, ShoppingCart, ArrowDownCircle, ArrowUpCircle,
  CheckCircle2, TrendingDown, TrendingUp, User, Clock
} from 'lucide-react';

const tipoConfig = {
  apertura:           { label: 'Apertura',          variant: 'info',    icon: Wallet,          color: 'text-blue-600' },
  venta_efectivo:     { label: 'Venta (efectivo)',   variant: 'success', icon: ShoppingCart,    color: 'text-green-600' },
  venta_tarjeta:      { label: 'Venta (tarjeta)',    variant: 'info',    icon: ShoppingCart,    color: 'text-blue-600' },
  venta_transferencia:{ label: 'Venta (transfer.)',  variant: 'primary', icon: ShoppingCart,    color: 'text-primary-600' },
  ingreso:            { label: 'Ingreso',            variant: 'success', icon: ArrowDownCircle, color: 'text-green-600' },
  egreso:             { label: 'Egreso',             variant: 'danger',  icon: ArrowUpCircle,   color: 'text-red-600' },
  cierre:             { label: 'Cierre',             variant: 'warning', icon: Wallet,          color: 'text-orange-600' }
};

const FilaMovimiento = ({ mov }) => {
  const cfg = tipoConfig[mov.tipo] || tipoConfig.ingreso;
  const Icono = cfg.icon;
  const esEgreso = mov.tipo === 'egreso';

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-dark-hover">
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <Icono size={16} className={cfg.color} />
          <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{mov.descripcion}</td>
      <td className={`px-4 py-3 text-right font-semibold whitespace-nowrap ${esEgreso ? 'text-red-600' : 'text-green-600'}`}>
        {esEgreso ? '-' : '+'}{formatCurrency(mov.monto)}
      </td>
      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
        {formatDateTime(mov.created_at)}
      </td>
    </tr>
  );
};

const DetallesTurno = ({ turno, onClose }) => {
  if (!turno) return null;

  const diferencia = turno.diferencia !== null && turno.diferencia !== undefined ? parseFloat(turno.diferencia) : null;

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Turno</p>
          <p className="font-bold text-gray-900 dark:text-white">{turno.numero_turno}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Cajero</p>
          <div className="flex items-center gap-1">
            <User size={14} className="text-gray-400" />
            <p className="font-medium text-gray-900 dark:text-white">{turno.usuario?.nombre}</p>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Estado</p>
          <Badge variant={turno.estado === 'abierta' ? 'success' : 'default'}>
            {turno.estado === 'abierta' ? 'Abierta' : 'Cerrada'}
          </Badge>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Apertura</p>
          <div className="flex items-center gap-1">
            <Clock size={14} className="text-gray-400" />
            <p className="text-sm text-gray-900 dark:text-white">{formatDateTime(turno.fecha_apertura)}</p>
          </div>
        </div>
        {turno.fecha_cierre && (
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Cierre</p>
            <p className="text-sm text-gray-900 dark:text-white">{formatDateTime(turno.fecha_cierre)}</p>
          </div>
        )}
      </div>

      {/* Resumen financiero */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Saldo Inicial',     value: turno.saldo_inicial,              color: 'text-gray-700 dark:text-gray-300' },
          { label: 'Ventas Efectivo',   value: turno.total_ventas_efectivo,      color: 'text-green-600' },
          { label: 'Ingresos',          value: turno.total_ingresos,             color: 'text-blue-600' },
          { label: 'Egresos',           value: turno.total_egresos,              color: 'text-red-600' },
          { label: 'Ventas Tarjeta',    value: turno.total_ventas_tarjeta,       color: 'text-purple-600' },
          { label: 'Ventas Transfer.',  value: turno.total_ventas_transferencia, color: 'text-indigo-600' },
          { label: 'Total Esperado',    value: turno.total_esperado,             color: 'text-primary-600 font-bold' },
          { label: 'Total Real',        value: turno.total_real,                 color: 'text-primary-600 font-bold' },
        ].map(({ label, value, color }) => value !== null && value !== undefined && (
          <div key={label} className="p-3 bg-gray-50 dark:bg-dark-hover rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            <p className={`text-base font-semibold ${color}`}>{formatCurrency(value)}</p>
          </div>
        ))}
      </div>

      {/* Diferencia */}
      {diferencia !== null && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          diferencia === 0 ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
          : diferencia > 0 ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
          : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          {diferencia === 0
            ? <CheckCircle2 className="text-green-600 w-5 h-5 shrink-0" />
            : diferencia > 0
            ? <TrendingUp className="text-blue-600 w-5 h-5 shrink-0" />
            : <TrendingDown className="text-red-600 w-5 h-5 shrink-0" />}
          <div>
            <p className={`font-semibold ${diferencia === 0 ? 'text-green-700 dark:text-green-400' : diferencia > 0 ? 'text-blue-700 dark:text-blue-400' : 'text-red-700 dark:text-red-400'}`}>
              Diferencia: {diferencia >= 0 ? '+' : ''}{formatCurrency(diferencia)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {diferencia === 0 ? 'Caja cuadrada' : diferencia > 0 ? 'Sobrante' : 'Faltante'}
            </p>
          </div>
        </div>
      )}

      {/* Movimientos */}
      {turno.movimientos?.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Movimientos del turno</h4>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-dark-border">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              <thead className="bg-gray-50 dark:bg-dark-hover">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tipo</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Descripción</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Monto</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Hora</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-100 dark:divide-gray-700">
                {turno.movimientos.map(mov => <FilaMovimiento key={mov.id} mov={mov} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-dark-border">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-hover rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default DetallesTurno;
