import { useState } from 'react';
import { BarChart3, DollarSign, Package, CreditCard, Filter } from 'lucide-react';
import Button from '../../../shared/components/UI/Button';
import Card from '../../../shared/components/UI/Card';
import TabVentas     from '../components/TabVentas';
import TabFinanciero from '../components/TabFinanciero';
import TabInventario from '../components/TabInventario';
import TabCreditos   from '../components/TabCreditos';
import reporteService from '../services/reporte.service';

const today         = new Date().toISOString().split('T')[0];
const firstOfMonth  = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

const TABS = [
  { id: 'ventas',      label: 'Ventas',      icon: BarChart3  },
  { id: 'financiero',  label: 'Financiero',  icon: DollarSign },
  { id: 'inventario',  label: 'Inventario',  icon: Package    },
  { id: 'creditos',    label: 'Créditos',    icon: CreditCard },
];

const AGRUPACIONES = [
  { value: 'dia',    label: 'Por día'    },
  { value: 'semana', label: 'Por semana' },
  { value: 'mes',    label: 'Por mes'    },
];

const Reportes = () => {
  const [activeTab,  setActiveTab]  = useState('ventas');
  const [desde,      setDesde]      = useState(firstOfMonth);
  const [hasta,      setHasta]      = useState(today);
  const [agrupacion, setAgrupacion] = useState('dia');
  const [exporting,  setExporting]  = useState(false);

  // Filtros aplicados (se actualizan solo al presionar "Aplicar")
  const [filtros, setFiltros] = useState({ desde: firstOfMonth, hasta: today, agrupacion: 'dia' });

  const aplicar = () => setFiltros({ desde, hasta, agrupacion });

  const exportar = async (tipo) => {
    setExporting(true);
    try {
      await reporteService.exportarExcel({ tipo, desde: filtros.desde, hasta: filtros.hasta });
    } catch (err) {
      console.error('Error exportando:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Reportes</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Análisis y estadísticas del negocio</p>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Filtros:</span>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Desde</label>
            <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Hasta</label>
            <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white" />
          </div>
          {activeTab === 'ventas' && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Agrupación</label>
              <select value={agrupacion} onChange={(e) => setAgrupacion(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white">
                {AGRUPACIONES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
          )}
          <Button onClick={aplicar} size="sm">Aplicar</Button>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}>
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido del tab activo */}
      {activeTab === 'ventas'     && <TabVentas     desde={filtros.desde} hasta={filtros.hasta} agrupacion={filtros.agrupacion} onExportar={exportar} exporting={exporting} />}
      {activeTab === 'financiero' && <TabFinanciero desde={filtros.desde} hasta={filtros.hasta} onExportar={exportar} exporting={exporting} />}
      {activeTab === 'inventario' && <TabInventario onExportar={exportar} exporting={exporting} />}
      {activeTab === 'creditos'   && <TabCreditos />}
    </div>
  );
};

export default Reportes;
