import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { Menu, Sun, Moon, LogOut } from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border fixed top-0 right-0 left-0 lg:left-64 z-30">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {/* Menu button - SOLO EN MÓVIL */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
          >
            <Menu size={24} className="text-gray-600 dark:text-gray-400" />
          </button>

          {/* Logo y título - Solo en móvil */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              SM
            </div>
            {/* Ocultar texto en móvil pequeño, mostrar en tablet */}
            <div className="hidden sm:block">
              <h1 className="font-bold text-gray-800 dark:text-white text-lg">
                SuperMercado Mapache
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Sistema de Gestión
              </p>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            {theme === 'dark' ? (
              <Sun size={20} className="text-gray-600 dark:text-gray-400" />
            ) : (
              <Moon size={20} className="text-gray-600 dark:text-gray-400" />
            )}
          </button>

          {/* User menu */}
          <div className="flex items-center gap-3 ml-2 pl-2 border-l border-gray-200 dark:border-dark-border">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                {user?.nombre}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.rol?.nombre}
              </p>
            </div>

            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.nombre?.charAt(0).toUpperCase()}
            </div>

            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={20} className="text-red-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;