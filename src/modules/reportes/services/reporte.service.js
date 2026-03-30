import api from '../../../shared/services/api.service';

const reporteService = {
  // Dashboard KPIs
  getKPIs:               ()              => api.get('/reportes/dashboard/kpis').then(r => r.data),
  getVentasUltimos7Dias: ()              => api.get('/reportes/dashboard/ventas-semana').then(r => r.data),
  getTopProductosHoy:    (limit = 6)     => api.get('/reportes/dashboard/top-productos', { params: { limit } }).then(r => r.data),
  getUltimasVentas:      (limit = 6)     => api.get('/reportes/dashboard/ultimas-ventas', { params: { limit } }).then(r => r.data),

  // Reportes — Ventas
  getVentasPorPeriodo:     (desde, hasta, agrupacion) =>
    api.get('/reportes/ventas', { params: { desde, hasta, agrupacion } }).then(r => r.data),
  getProductosMasVendidos: (desde, hasta, limit = 10) =>
    api.get('/reportes/productos-vendidos', { params: { desde, hasta, limit } }).then(r => r.data),
  getVentasPorCategoria:   (desde, hasta) =>
    api.get('/reportes/ventas-categoria', { params: { desde, hasta } }).then(r => r.data),
  getVentasPorCajero:      (desde, hasta) =>
    api.get('/reportes/ventas-cajero', { params: { desde, hasta } }).then(r => r.data),

  // Reportes — Financiero
  getIngresosVsGastos: (desde, hasta) =>
    api.get('/reportes/ingresos-gastos', { params: { desde, hasta } }).then(r => r.data),

  // Reportes — Inventario
  getStockBajo:           () => api.get('/reportes/stock-bajo').then(r => r.data),
  getProductosPorVencer:  (dias = 30) => api.get('/reportes/por-vencer', { params: { dias } }).then(r => r.data),
  getValorInventario:     () => api.get('/reportes/valor-inventario').then(r => r.data),

  // Reportes — Créditos
  getCarteraCreditos: () => api.get('/reportes/cartera-creditos').then(r => r.data),

  // Exportar Excel (descarga directa con auth header)
  exportarExcel: (params) => {
    const qs = new URLSearchParams(params).toString();
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return fetch(`${import.meta.env.VITE_API_URL}/reportes/exportar/excel?${qs}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_${params.tipo}_${new Date().toISOString().split('T')[0]}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
      });
  },
};

export default reporteService;
