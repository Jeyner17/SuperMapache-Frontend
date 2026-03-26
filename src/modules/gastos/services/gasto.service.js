import api from '../../../shared/services/api.service';

const gastoService = {
  getGastos:    (params = {}) => api.get('/gastos', { params }),
  getResumen:   (params = {}) => api.get('/gastos/resumen', { params }),
  getGastoById: (id)          => api.get(`/gastos/${id}`),
  crearGasto:   (data)        => api.post('/gastos', data),
  actualizarGasto: (id, data) => api.put(`/gastos/${id}`, data),
  eliminarGasto:   (id)       => api.delete(`/gastos/${id}`),
};

export default gastoService;
