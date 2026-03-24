import api from '../../../shared/services/api.service';

class CompraService {
  /**
   * Obtener todas las compras
   */
  async getAll(filters = {}) {
    const params = new URLSearchParams();
    
    params.append('page', filters.page || 1);
    params.append('limit', filters.limit || 10);
    
    if (filters.estado) {
      params.append('estado', filters.estado);
    }
    
    if (filters.proveedor_id) {
      params.append('proveedor_id', filters.proveedor_id);
    }
    
    if (filters.estado_pago) {
      params.append('estado_pago', filters.estado_pago);
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

    return await api.get(`/compras?${params.toString()}`);
  }

  /**
   * Obtener resumen de compras
   */
  async getResumen(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.fecha_inicio) {
      params.append('fecha_inicio', filters.fecha_inicio);
    }
    
    if (filters.fecha_fin) {
      params.append('fecha_fin', filters.fecha_fin);
    }

    return await api.get(`/compras/resumen?${params.toString()}`);
  }

  /**
   * Obtener compra por ID
   */
  async getById(id) {
    return await api.get(`/compras/${id}`);
  }

  /**
   * Crear nueva compra
   */
  async create(data) {
    return await api.post('/compras', data);
  }

  /**
   * Recibir mercancía
   */
  async recibir(id, data) {
    return await api.post(`/compras/${id}/recibir`, data);
  }

  /**
   * Cancelar compra
   */
  async cancelar(id, motivo) {
    return await api.post(`/compras/${id}/cancelar`, { motivo });
  }

  /**
   * Registrar pago
   */
  async registrarPago(id, monto) {
    return await api.post(`/compras/${id}/pagar`, { monto });
  }

  /**
   * Eliminar compra (solo pendiente)
   */
  async delete(id) {
    return await api.delete(`/compras/${id}`);
  }
}

export default new CompraService();