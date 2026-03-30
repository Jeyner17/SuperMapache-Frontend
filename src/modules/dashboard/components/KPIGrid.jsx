import {
  TrendingUp, TrendingDown, DollarSign, BarChart3,
  Wallet, Package, AlertTriangle, Bell, CreditCard
} from 'lucide-react';
import Card from '../../../shared/components/UI/Card';
import { formatCurrency } from '../../../shared/utils/formatters';

const KPICard = ({ icon: Icon, label, value, change, changeType, color, loading }) => (
  <Card className="p-5" hover>
    <div className="flex items-center justify-between mb-3">
      <div className={`${color} p-3 rounded-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      {change && (
        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
          changeType === 'up'   ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
          changeType === 'down' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
        }`}>
          {changeType === 'up'   && <TrendingUp  className="w-3 h-3" />}
          {changeType === 'down' && <TrendingDown className="w-3 h-3" />}
          {change}
        </span>
      )}
    </div>
    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
    {loading
      ? <div className="h-7 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      : <p className="text-xl font-bold text-gray-800 dark:text-white">{value}</p>
    }
  </Card>
);

const pctChange = (val, prev) => {
  if (!prev || prev === 0) return null;
  const pct = ((val - prev) / prev * 100).toFixed(1);
  return { label: `${pct > 0 ? '+' : ''}${pct}%`, type: pct >= 0 ? 'up' : 'down' };
};

const KPIGrid = ({ kpis, loading }) => {
  const ventasHoyChange = kpis ? pctChange(kpis.ventas_hoy, kpis.ventas_ayer) : null;

  const cards = [
    {
      icon: DollarSign, label: 'Ventas Hoy',
      value: kpis ? formatCurrency(kpis.ventas_hoy) : '-',
      change: ventasHoyChange?.label, changeType: ventasHoyChange?.type,
      color: 'bg-green-500',
    },
    {
      icon: TrendingUp, label: 'Ventas del Mes',
      value: kpis ? formatCurrency(kpis.ventas_mes) : '-',
      color: 'bg-indigo-500',
    },
    {
      icon: BarChart3, label: 'Ganancia del Mes',
      value: kpis ? formatCurrency(kpis.ganancia_mes) : '-',
      color: 'bg-blue-500',
    },
    {
      icon: Wallet, label: 'Efectivo en Caja',
      value: kpis ? formatCurrency(kpis.efectivo_caja) : '-',
      color: 'bg-teal-500',
    },
    {
      icon: Package, label: 'Gastos del Mes',
      value: kpis ? formatCurrency(kpis.gastos_mes) : '-',
      color: 'bg-red-500',
    },
    {
      icon: AlertTriangle, label: 'Stock Bajo',
      value: kpis ? `${kpis.stock_bajo} productos` : '-',
      changeType: kpis?.stock_bajo > 0 ? 'warn' : undefined,
      color: 'bg-orange-500',
    },
    {
      icon: Bell, label: 'Alertas Activas',
      value: kpis ? `${kpis.alertas_pendientes} alertas` : '-',
      color: 'bg-yellow-500',
    },
    {
      icon: CreditCard, label: 'Créditos Pendientes',
      value: kpis ? formatCurrency(kpis.creditos_pendientes) : '-',
      color: 'bg-pink-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <KPICard key={i} {...card} loading={loading} />
      ))}
    </div>
  );
};

export default KPIGrid;
