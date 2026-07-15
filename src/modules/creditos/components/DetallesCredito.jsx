import Badge from '../../../shared/components/UI/Badge';
import { formatCurrency, formatDate, formatDateTime } from '../../../shared/utils/formatters';
import { User, Calendar, CreditCard, Banknote, ArrowLeftRight } from 'lucide-react';

const estadoConfig = {
  pendiente: { label: 'Pendiente', variant: 'warning' },
  parcial:   { label: 'Parcial',   variant: 'info' },
  pagado:    { label: 'Pagado',    variant: 'success' },
  vencido:   { label: 'Vencido',   variant: 'danger' },
};

const metodoPagoIcon = { efectivo: Banknote, tarjeta: CreditCard, transferencia: ArrowLeftRight };

const DetallesCredito = ({ credito, onClose }) => {
  if (!credito) return null;

  const cfg = estadoConfig[credito.estado] || estadoConfig.pendiente;
  const progreso = credito.montoTotal > 0
    ? Math.min(100, (parseFloat(credito.montoPagado) / parseFloat(credito.montoTotal)) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Número</p>
          <p className="font-bold text-gray-900 dark:text-white">{credito.numeroCredito}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Estado</p>
          <Badge variant={cfg.variant}>{cfg.label}</Badge>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Cliente</p>
          <div className="flex items-center gap-1">
            <User size={14} className="text-gray-400" />
            <p className="font-medium text-gray-900 dark:text-white">{credito.cliente?.nombre}</p>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Fecha crédito</p>
          <div className="flex items-center gap-1">
            <Calendar size={14} className="text-gray-400" />
            <p className="text-sm text-gray-900 dark:text-white">{formatDate(credito.fechaCredito)}</p>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Vencimiento</p>
          <p className="text-sm text-gray-900 dark:text-white">{credito.fechaVencimiento ? formatDate(credito.fechaVencimiento) : '—'}</p>
        </div>
        {credito.notas && (
          <div className="md:col-span-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Notas</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{credito.notas}</p>
          </div>
        )}
      </div>

      {/* Resumen financiero */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total',    value: credito.montoTotal,    color: 'text-gray-700 dark:text-gray-300' },
          { label: 'Pagado',   value: credito.montoPagado,   color: 'text-green-600' },
          { label: 'Pendiente', value: credito.montoPendiente, color: 'text-red-600 font-bold' },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-3 bg-gray-50 dark:bg-dark-hover rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            <p className={`text-base font-semibold ${color}`}>{formatCurrency(value)}</p>
          </div>
        ))}
      </div>

      {/* Barra de progreso */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>Progreso de pago</span>
          <span>{progreso.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-dark-hover rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${progreso >= 100 ? 'bg-green-500' : progreso > 0 ? 'bg-primary-500' : 'bg-gray-300'}`}
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>

      {/* Historial de pagos */}
      {credito.pagos?.length > 0 ? (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Historial de pagos</h4>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-dark-border">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              <thead className="bg-gray-50 dark:bg-dark-hover">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Fecha</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Método</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Monto</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Notas</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-100 dark:divide-gray-700">
                {credito.pagos.map(pago => {
                  const MetodoIcon = metodoPagoIcon[pago.metodoPago] || Banknote;
                  return (
                    <tr key={pago.id} className="hover:bg-gray-50 dark:hover:bg-dark-hover">
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                        {formatDateTime(pago.fechaPago)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 capitalize">
                          <MetodoIcon size={14} />
                          {pago.metodoPago}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-green-600 whitespace-nowrap">
                        +{formatCurrency(pago.monto)}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                        {pago.notas || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Sin pagos registrados</p>
      )}

      <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-dark-border">
        <button onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-hover rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default DetallesCredito;
