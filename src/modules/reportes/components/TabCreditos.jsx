import { useState, useEffect } from 'react';
import Card from '../../../shared/components/UI/Card';
import reporteService from '../services/reporte.service';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';

const TabCreditos = () => {
  const [loading, setLoading] = useState(false);
  const [resumen, setResumen] = useState(null);
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const data = await reporteService.getCarteraCreditos();
        setResumen(data.resumen);
        setClientes(data.clientes);
      } catch (err) {
        console.error('Error cargando tab créditos:', err);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  const kpis = resumen
    ? [
        { label: 'Total Créditos Activos', value: Number(resumen.total_creditos), color: 'text-gray-800 dark:text-white' },
        { label: 'Monto Total Otorgado', value: formatCurrency(resumen.monto_total), color: 'text-indigo-600' },
        { label: 'Saldo Pendiente', value: formatCurrency(resumen.monto_pendiente), color: 'text-orange-600' },
        { label: 'Créditos Vencidos', value: Number(resumen.creditos_vencidos), color: 'text-red-600' },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <Card key={i} className="p-5 text-center">
            <p className="text-xs text-gray-500 mb-2">{k.label}</p>
            <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
          </Card>
        ))}
      </div>

      {/* Tabla de clientes con saldo pendiente */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Cartera de Clientes ({clientes.length})
        </h2>
        {clientes.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Sin créditos activos</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left pb-2 text-gray-400 font-medium">Cliente</th>
                  <th className="text-left pb-2 text-gray-400 font-medium">Cédula</th>
                  <th className="text-left pb-2 text-gray-400 font-medium">Teléfono</th>
                  <th className="text-right pb-2 text-gray-400 font-medium">Créditos</th>
                  <th className="text-right pb-2 text-gray-400 font-medium">Total Otorgado</th>
                  <th className="text-right pb-2 text-gray-400 font-medium">Saldo Pendiente</th>
                  <th className="text-right pb-2 text-gray-400 font-medium">Próx. Vencimiento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {clientes.map((c, i) => (
                  <tr key={i}>
                    <td className="py-2 font-medium text-gray-700 dark:text-gray-300">{c.nombre}</td>
                    <td className="py-2 text-gray-500">{c.cedula || '—'}</td>
                    <td className="py-2 text-gray-500">{c.telefono || '—'}</td>
                    <td className="py-2 text-right text-gray-600 dark:text-gray-400">{c.num_creditos}</td>
                    <td className="py-2 text-right text-gray-600 dark:text-gray-400">{formatCurrency(c.total_otorgado)}</td>
                    <td className="py-2 text-right font-semibold text-orange-600">{formatCurrency(c.saldo_pendiente)}</td>
                    <td className="py-2 text-right text-gray-500">{c.proxima_vencimiento ? formatDate(c.proxima_vencimiento) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TabCreditos;
