import api from '../../../shared/services/api.service';

class EscaneoService {
  /**
   * Escanear código de barras
   */
  async escanear(codigoBarras, modulo = 'verificacion', metadata = {}) {
    return await api.post('/escaneo/scan', {
      codigo_barras: codigoBarras,
      modulo,
      metadata
    });
  }

  /**
   * Verificar disponibilidad
   */
  async verificarDisponibilidad(codigoBarras) {
    return await api.post('/escaneo/verificar', {
      codigo_barras: codigoBarras
    });
  }

  /**
   * Buscar productos por código parcial
   */
  async buscarPorCodigo(codigo, limit = 10) {
    return await api.get(`/escaneo/buscar/${codigo}?limit=${limit}`);
  }

  /**
   * Obtener historial
   */
  async getHistorial(filters = {}) {
    const params = new URLSearchParams();
    
    params.append('page', filters.page || 1);
    params.append('limit', filters.limit || 20);
    
    if (filters.modulo) {
      params.append('modulo', filters.modulo);
    }
    
    if (filters.resultado) {
      params.append('resultado', filters.resultado);
    }

    return await api.get(`/escaneo/historial?${params.toString()}`);
  }

  /**
   * Obtener estadísticas
   */
  async getEstadisticas(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.fecha_inicio) {
      params.append('fecha_inicio', filters.fecha_inicio);
    }
    
    if (filters.fecha_fin) {
      params.append('fecha_fin', filters.fecha_fin);
    }

    return await api.get(`/escaneo/estadisticas?${params.toString()}`);
  }
}

export default new EscaneoService();