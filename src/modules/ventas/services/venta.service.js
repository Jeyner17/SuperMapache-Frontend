import api from '../../../shared/services/api.service';

class VentaService {
  /**
   * Obtener todas las ventas
   */
  async getAll(filters = {}) {
    const params = new URLSearchParams();
    
    params.append('page', filters.page || 1);
    params.append('limit', filters.limit || 10);
    
    if (filters.estado) {
      params.append('estado', filters.estado);
    }
    
    if (filters.metodo_pago) {
      params.append('metodo_pago', filters.metodo_pago);
    }
    
    if (filters.search) {
      params.append('search', filters.search);
    }
    
    if (filters.fecha_inicio) {
      params.append('fecha_inicio', filters.fecha_inicio);
    }
    
    if (filters.fecha_fin) {
      params.append('fecha_fin', filters.fecha_fin);
    }

    return await api.get(`/ventas?${params.toString()}`);
  }

  /**
   * Obtener venta por ID
   */
  async getById(id) {
    return await api.get(`/ventas/${id}`);
  }

  /**
   * Crear nueva venta
   */
  async create(data) {
    return await api.post('/ventas', data);
  }

  /**
   * Cancelar venta
   */
  async cancelar(id, motivo) {
    return await api.post(`/ventas/${id}/cancelar`, { motivo });
  }

  /**
   * Obtener estadísticas
   */
  async getEstadisticas(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.fecha_inicio) {
      params.append('fecha_inicio', filters.fecha_inicio);
    }
    
    if (filters.fecha_fin) {
      params.append('fecha_fin', filters.fecha_fin);
    }

    return await api.get(`/ventas/estadisticas?${params.toString()}`);
  }

  /**
   * Obtener productos más vendidos
   */
  async getProductosMasVendidos(limit = 10, filters = {}) {
    const params = new URLSearchParams();
    
    params.append('limit', limit);
    
    if (filters.fecha_inicio) {
      params.append('fecha_inicio', filters.fecha_inicio);
    }
    
    if (filters.fecha_fin) {
      params.append('fecha_fin', filters.fecha_fin);
    }

    return await api.get(`/ventas/productos-mas-vendidos?${params.toString()}`);
  }
}

export default new VentaService();