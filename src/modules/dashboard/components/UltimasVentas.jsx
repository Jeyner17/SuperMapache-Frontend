import { useNavigate } from 'react-router-dom';
import Card from '../../../shared/components/UI/Card';
import { formatCurrency, formatDateTime } from '../../../shared/utils/formatters';

const UltimasVentas = ({ datos, loading }) => {
  const navigate = useNavigate();

  return (
    <Card className="p-5 lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Últimas Ventas</h2>
        <button
          onClick={() => navigate('/pos')}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Ir al POS
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          ))}
        </div>
      ) : datos.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">Sin ventas registradas hoy</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="text-left pb-2 text-xs text-gray-400 font-medium">N° Venta</th>
                <th className="text-left pb-2 text-xs text-gray-400 font-medium">Fecha</th>
                <th className="text-left pb-2 text-xs text-gray-400 font-medium">Pago</th>
                <th className="text-right pb-2 text-xs text-gray-400 font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {datos.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-2 font-mono text-xs text-indigo-600 dark:text-indigo-400">
                    {v.numero_venta}
                  </td>
                  <td className="py-2 text-xs text-gray-500">
                    {formatDateTime(v.created_at || v.createdAt)}
                  </td>
                  <td className="py-2">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 capitalize">
                      {v.metodo_pago}
                    </span>
                  </td>
                  <td className="py-2 text-right font-semibold text-gray-800 dark:text-white">
                    {formatCurrency(v.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default UltimasVentas;
