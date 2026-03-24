import api from '../../../shared/services/api.service';

class CajaService {
  async getTurnoActivo() {
    return await api.get('/caja/turno-activo');
  }

  async getTurnos(filters = {}) {
    const params = new URLSearchParams();
    params.append('page', filters.page || 1);
    params.append('limit', filters.limit || 10);
    if (filters.estado) params.append('estado', filters.estado);
    if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
    return await api.get(`/caja/turnos?${params.toString()}`);
  }

  async getTurnoById(id) {
    return await api.get(`/caja/turnos/${id}`);
  }

  async getMovimientos(turnoId) {
    return await api.get(`/caja/turnos/${turnoId}/movimientos`);
  }

  async abrirTurno(data) {
    return await api.post('/caja/abrir', data);
  }

  async cerrarTurno(data) {
    return await api.post('/caja/cerrar', data);
  }

  async registrarMovimiento(data) {
    return await api.post('/caja/movimientos', data);
  }
}

export default new CajaService();
