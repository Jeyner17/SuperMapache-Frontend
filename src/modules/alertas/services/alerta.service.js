import api from '../../../shared/services/api.service';

const alertaService = {
  getAlertas:      (params = {}) => api.get('/alertas', { params }),
  getResumen:      ()            => api.get('/alertas/resumen'),
  getNoLeidas:     (limit = 10)  => api.get('/alertas/no-leidas', { params: { limit } }),
  marcarLeida:     (id)          => api.put(`/alertas/${id}/leer`),
  marcarResuelta:  (id)          => api.put(`/alertas/${id}/resolver`),
  marcarTodasLeidas: ()          => api.put('/alertas/leer-todas'),
  generarAlertas:  ()            => api.post('/alertas/generar')
};

export default alertaService;
