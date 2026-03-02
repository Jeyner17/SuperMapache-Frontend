import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { Bell, User, LogOut, Moon, Sun, Settings } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de cerrar sesión?')) {
      logout();
    }
  };

  return (
    <nav className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border shadow-sm">
      <div className="px-6 py-4 flex justify-between items-center">
        {/* Logo y título */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">SM</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              SuperMercado Mapache
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Sistema de Gestión
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Botón de tema */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors"
            title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
          >
            {theme === 'light' ? (
              <Moon size={20} className="text-gray-600" />
            ) : (
              <Sun size={20} className="text-yellow-400" />
            )}
          </button>

          {/* Notificaciones */}
          <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors">
            <Bell size={20} className="text-gray-600 dark:text-gray-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          {/* Usuario */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.nombre?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {user?.nombre || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.rol || 'Rol'}
                </p>
              </div>
            </button>

            {/* Menú desplegable */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-card rounded-lg shadow-xl border border-gray-200 dark:border-dark-border py-2 z-50 animate-fade-in">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-dark-border">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.nombre}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                </div>

                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover flex items-center space-x-2">
                  <User size={16} />
                  <span>Mi Perfil</span>
                </button>

                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover flex items-center space-x-2">
                  <Settings size={16} />
                  <span>Configuración</span>
                </button>

                <hr className="my-2 border-gray-200 dark:border-dark-border" />

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                >
                  <LogOut size={16} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;