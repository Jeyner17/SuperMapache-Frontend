import axios from 'axios';
import { API_URL } from '../utils/constants';
import StorageService from './storage.service';

// Crear instancia de Axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de request - Agregar token
api.interceptors.request.use(
  (config) => {
    const token = StorageService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de response - Manejar errores
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // El servidor respondió con un código de error
      const { status, data } = error.response;

      if (status === 401) {
        // Token expirado o inválido
        StorageService.clearAuth();
        window.location.href = '/login';
      }

      return Promise.reject(data);
    } else if (error.request) {
      // La petición fue hecha pero no hubo respuesta
      return Promise.reject({
        message: 'No se pudo conectar con el servidor',
      });
    } else {
      // Error al configurar la petición
      return Promise.reject({
        message: 'Error al realizar la petición',
      });
    }
  }
);

export default api;