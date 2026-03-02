/**
 * Servicio para manejar localStorage
 */

const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user_data',
};

class StorageService {
  // Token
  static setToken(token) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  }

  static getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  static removeToken() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  }

  // Refresh Token
  static setRefreshToken(token) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  static getRefreshToken() {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  static removeRefreshToken() {
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  // Usuario
  static setUser(user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  static getUser() {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  }

  static removeUser() {
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  // Limpiar todo
  static clearAuth() {
    this.removeToken();
    this.removeRefreshToken();
    this.removeUser();
  }

  // Verificar si hay sesión
  static hasSession() {
    return !!this.getToken();
  }
}

export default StorageService;