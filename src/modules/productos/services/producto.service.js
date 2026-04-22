import api from '../../../shared/services/api.service';

class ProductoService {
  /**
   * Obtener todos los productos
   */
  async getAll(filters = {}) {
    const params = new URLSearchParams();
    
    params.append('page', filters.page || 1);
    params.append('limit', filters.limit || 10);
    
    if (filters.activo !== undefined) {
      params.append('activo', filters.activo);
    }
    
    if (filters.categoria_id) {
      params.append('categoria_id', filters.categoria_id);
    }
    
    if (filters.search) {
      params.append('search', filters.search);
    }

    return await api.get(`/productos?${params.toString()}`);
  }

  /**
   * Obtener producto por ID
   */
  async getById(id) {
    return await api.get(`/productos/${id}`);
  }

  /**
   * Buscar por código de barras
   */
  async getByCodigoBarras(codigoBarras) {
    return await api.get(`/productos/codigo/${codigoBarras}`);
  }

  /**
   * Crear nuevo producto
   */
  async create(data) {
    return await api.post('/productos', data);
  }

  /**
   * Actualizar producto
   */
  async update(id, data) {
    return await api.put(`/productos/${id}`, data);
  }

  /**
   * Verificar si un producto puede eliminarse
   */
  async verificarEliminacion(id) {
    return await api.get(`/productos/${id}/verificar-eliminacion`);
  }

  /**
   * Eliminar producto
   */
  async delete(id) {
    return await api.delete(`/productos/${id}`);
  }
}

export default new ProductoService();