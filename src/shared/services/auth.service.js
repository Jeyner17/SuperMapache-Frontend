import api from './api.service';

class AuthService {
  /**
   * Login
   */
  static async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response;
  }

  /**
   * Logout
   */
  static async logout() {
    const response = await api.post('/auth/logout');
    return response;
  }

  /**
   * Refresh token
   */
  static async refreshToken(refreshToken) {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response;
  }

  /**
   * Obtener perfil del usuario
   */
  static async getProfile() {
    const response = await api.get('/auth/profile');
    return response;
  }

  /**
   * Cambiar contraseña
   */
  static async changePassword(data) {
    const response = await api.put('/auth/change-password', data);
    return response;
  }
}

export default AuthService;