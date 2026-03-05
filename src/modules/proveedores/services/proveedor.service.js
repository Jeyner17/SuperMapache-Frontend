import api from '../../../shared/services/api.service';

class ProveedorService {
  /**
   * Obtener todos los proveedores
   */
  async getAll(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.activo !== undefined) {
      params.append('activo', filters.activo);
    }
    
    if (filters.tipo_proveedor) {
      params.append('tipo_proveedor', filters.tipo_proveedor);
    }
    
    if (filters.search) {
      params.append('search', filters.search);
    }

    return await api.get(`/proveedores?${params.toString()}`);
  }

  /**
   * Obtener proveedor por ID
   */
  async getById(id) {
    return await api.get(`/proveedores/${id}`);
  }

  /**
   * Obtener estadísticas de un proveedor
   */
  async getEstadisticas(id) {
    return await api.get(`/proveedores/${id}/estadisticas`);
  }

  /**
   * Crear nuevo proveedor
   */
  async create(data) {
    return await api.post('/proveedores', data);
  }

  /**
   * Actualizar proveedor
   */
  async update(id, data) {
    return await api.put(`/proveedores/${id}`, data);
  }

  /**
   * Eliminar proveedor
   */
  async delete(id) {
    return await api.delete(`/proveedores/${id}`);
  }
}

export default new ProveedorService();