import api from '../../../shared/services/api.service';

class EmpleadoService {
  async getAll(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search)        params.append('search', filters.search);
    if (filters.departamento)  params.append('departamento', filters.departamento);
    if (filters.mostrarInactivos) params.append('estado', 'todos');
    // Sin paginación en la UI: antes solo llegaban los primeros 20 (y las estadísticas salían mal)
    params.append('limit', filters.limit || 500);
    return await api.get(`/empleados?${params.toString()}`);
  }

  async getById(id) {
    return await api.get(`/empleados/${id}`);
  }

  async create(data) {
    return await api.post('/empleados', data);
  }

  async update(id, data) {
    return await api.put(`/empleados/${id}`, data);
  }

  async cambiarPassword(id, password) {
    return await api.put(`/empleados/${id}/cambiar-password`, { password });
  }

  async activar(id) {
    return await api.put(`/empleados/${id}/activar`);
  }

  async delete(id) {
    return await api.delete(`/empleados/${id}`);
  }

  async getRoles() {
    return await api.get('/auth/roles');
  }
}

export default new EmpleadoService();
