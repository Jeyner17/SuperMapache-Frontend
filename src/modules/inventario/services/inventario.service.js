import api from '../../../shared/services/api.service';
import { normalizarLote } from '../utils/lotes';

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

    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await api.get(`/inventario/lotes?${params.toString()}`);
    const pagina = response?.data;
    if (pagina && Array.isArray(pagina.data)) {
      return { ...response, data: { ...pagina, data: pagina.data.map(normalizarLote) } };
    }
    return response;
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
    const response = await api.get(`/inventario/lotes/${id}`);
    return { ...response, data: normalizarLote(response?.data) };
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
    // El backend solo expone PATCH (antes se llamaba con PUT → 404)
    return await api.patch(`/inventario/lotes/${loteId}/ajustar`, data);
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
    const response = await api.get('/inventario/alertas');
    const a = response?.data;
    if (!a) return response;
    return {
      ...response,
      data: {
        ...a,
        por_vencer: (a.por_vencer || []).map(normalizarLote),
        vencidos: (a.vencidos || []).map(normalizarLote),
      },
    };
  }

  /**
   * Verificar estados de lotes
   */
  async verificarEstados() {
    return await api.post('/inventario/verificar-estados');
  }
}

export default new InventarioService();