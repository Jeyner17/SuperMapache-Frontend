import api from '../../../shared/services/api.service';

class CategoriaService {
  /**
   * Obtener todas las categorías
   */
  async getAll(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.activo !== undefined) {
      params.append('activo', filters.activo);
    }
    
    if (filters.search) {
      params.append('search', filters.search);
    }

    return await api.get(`/categorias?${params.toString()}`);
  }

  /**
   * Obtener categoría por ID
   */
  async getById(id) {
    return await api.get(`/categorias/${id}`);
  }

  /**
   * Crear nueva categoría
   */
  async create(data) {
    return await api.post('/categorias', data);
  }

  /**
   * Actualizar categoría
   */
  async update(id, data) {
    return await api.put(`/categorias/${id}`, data);
  }

  /**
   * Eliminar categoría
   */
  async delete(id) {
    return await api.delete(`/categorias/${id}`);
  }
}

export default new CategoriaService();