import { createContext, useState, useEffect } from 'react';
import StorageService from '../services/storage.service';
import AuthService from '../services/auth.service';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar sesión al cargar la app
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = StorageService.getToken();
    const userData = StorageService.getUser();

    if (token && userData) {
      setUser(userData);
      setIsAuthenticated(true);
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    try {
      const response = await AuthService.login(credentials);
      
      // Guardar token y usuario
      StorageService.setToken(response.data.token);
      StorageService.setRefreshToken(response.data.refreshToken);
      StorageService.setUser(response.data.user);

      setUser(response.data.user);
      setIsAuthenticated(true);

      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      StorageService.clearAuth();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    StorageService.setUser(userData);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};