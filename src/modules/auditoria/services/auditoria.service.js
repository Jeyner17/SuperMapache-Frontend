import api from '../../../shared/services/api.service';

const auditoriaService = {
  getAuditorias: (params = {}) => api.get('/auditoria', { params }),
  getModulos:    ()            => api.get('/auditoria/modulos'),
  getUsuarios:   ()            => api.get('/auditoria/usuarios'),
};

export default auditoriaService;
