import api from '../../../shared/services/api.service';

class InventarioService {
  /**
   * Obtener todos los lotes
   */
  async getLotes(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.estado) {
      params.append('estado', filters.estado);
    }
    
    if (filters.producto_id) {
      params.append('producto_id', filters.producto_id);
    }
    
    if (filters.categoria_id) {
      params.append('categoria_id', filters.categoria_id);
    }
    
    if (filters.search) {
      params.append('search', filters.search);
    }
    
    if (filters.solo_disponibles) {
      params.append('solo_disponibles', 'true');
    }

    return await api.get(`/inventario/lotes?${params.toString()}`);
  }

  /**
   * Obtener resumen de inventario
   */
  async getResumen(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.categoria_id) {
      params.append('categoria_id', filters.categoria_id);
    }
    
    if (filters.search) {
      params.append('search', filters.search);
    }

    return await api.get(`/inventario/resumen?${params.toString()}`);
  }

  /**
   * Obtener stock de un producto
   */
  async getStockProducto(productoId) {
    return await api.get(`/inventario/producto/${productoId}/stock`);
  }

  /**
   * Obtener lote por ID
   */
  async getLoteById(id) {
    return await api.get(`/inventario/lotes/${id}`);
  }

  /**
   * Crear nuevo lote
   */
  async crearLote(data) {
    return await api.post('/inventario/lotes', data);
  }

  /**
   * Descontar stock (FIFO automático)
   */
  async descontarStock(data) {
    return await api.post('/inventario/descontar', data);
  }

  /**
   * Ajustar stock de un lote
   */
  async ajustarStock(loteId, data) {
    return await api.put(`/inventario/lotes/${loteId}/ajustar`, data);
  }

  /**
   * Obtener movimientos de inventario
   */
  async getMovimientos(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.producto_id) {
      params.append('producto_id', filters.producto_id);
    }
    
    if (filters.lote_id) {
      params.append('lote_id', filters.lote_id);
    }
    
    if (filters.tipo_movimiento) {
      params.append('tipo_movimiento', filters.tipo_movimiento);
    }
    
    params.append('page', filters.page || 1);
    params.append('limit', filters.limit || 20);

    return await api.get(`/inventario/movimientos?${params.toString()}`);
  }

  /**
   * Obtener alertas
   */
  async getAlertas() {
    return await api.get('/inventario/alertas');
  }

  /**
   * Verificar estados de lotes
   */
  async verificarEstados() {
    return await api.post('/inventario/verificar-estados');
  }
}

export default new InventarioService();