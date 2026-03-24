import api from '../../../shared/services/api.service';

class CreditoService {
  // ─── RESUMEN ──────────────────────────────────────────────────────────────────
  async getResumen() {
    return await api.get('/creditos/resumen');
  }

  // ─── CLIENTES ─────────────────────────────────────────────────────────────────
  async getClientes(filters = {}) {
    const params = new URLSearchParams();
    params.append('page', filters.page || 1);
    params.append('limit', filters.limit || 20);
    if (filters.search) params.append('search', filters.search);
    if (filters.activo !== undefined) params.append('activo', filters.activo);
    return await api.get(`/creditos/clientes?${params.toString()}`);
  }

  async getClienteById(id) {
    return await api.get(`/creditos/clientes/${id}`);
  }

  async crearCliente(data) {
    return await api.post('/creditos/clientes', data);
  }

  async actualizarCliente(id, data) {
    return await api.put(`/creditos/clientes/${id}`, data);
  }

  // ─── CRÉDITOS ─────────────────────────────────────────────────────────────────
  async getCreditos(filters = {}) {
    const params = new URLSearchParams();
    params.append('page', filters.page || 1);
    params.append('limit', filters.limit || 10);
    if (filters.estado) params.append('estado', filters.estado);
    if (filters.cliente_id) params.append('cliente_id', filters.cliente_id);
    if (filters.vencidos) params.append('vencidos', filters.vencidos);
    if (filters.search) params.append('search', filters.search);
    return await api.get(`/creditos?${params.toString()}`);
  }

  async getCreditoById(id) {
    return await api.get(`/creditos/${id}`);
  }

  async crearCredito(data) {
    return await api.post('/creditos', data);
  }

  async registrarPago(id, data) {
    return await api.post(`/creditos/${id}/pagar`, data);
  }
}

export default new CreditoService();
