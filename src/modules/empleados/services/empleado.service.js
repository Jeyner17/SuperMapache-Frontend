import api from '../../../shared/services/api.service';

class EmpleadoService {
  async getAll(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search)        params.append('search', filters.search);
    if (filters.departamento)  params.append('departamento', filters.departamento);
    if (filters.mostrarInactivos) params.append('estado', 'todos');
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

  async delete(id) {
    return await api.delete(`/empleados/${id}`);
  }

  async getRoles() {
    return await api.get('/auth/roles');
  }
}

export default new EmpleadoService();
