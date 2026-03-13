import api from '../../../shared/services/api.service';

class ConfiguracionService {
  /**
   * Obtener todas las configuraciones
   */
  async getAll() {
    return await api.get('/configuracion');
  }

  /**
   * Obtener configuraciones públicas
   */
  async getPublicas() {
    return await api.get('/configuracion/publicas');
  }

  /**
   * Obtener configuraciones por categoría
   */
  async getByCategoria(categoria) {
    return await api.get(`/configuracion/categoria/${categoria}`);
  }

  /**
   * Obtener configuración por clave
   */
  async getByClave(clave) {
    return await api.get(`/configuracion/clave/${clave}`);
  }

  /**
   * Actualizar configuración
   */
  async update(clave, valor) {
    return await api.put(`/configuracion/${clave}`, { valor });
  }

  /**
   * Actualizar múltiples configuraciones
   */
  async updateMultiple(configuraciones) {
    return await api.put('/configuracion/multiple', { configuraciones });
  }

  /**
   * Obtener datos de la empresa
   */
  async getDatosEmpresa() {
    return await api.get('/configuracion/empresa');
  }

  /**
   * Obtener IVA
   */
  async getIVA() {
    return await api.get('/configuracion/iva');
  }
}

export default new ConfiguracionService();