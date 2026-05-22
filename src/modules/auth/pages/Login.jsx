import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/hooks/useAuth';
import { useNotification } from '../../../shared/hooks/useNotification';
import { useTheme } from '../../../shared/hooks/useTheme';
import Button from '../../../shared/components/UI/Button';
import Input from '../../../shared/components/UI/Input';
import { User, Lock, Moon, Sun, Eye, EyeOff } from 'lucide-react';
import logo from '../../../assets/images/logo_supermapache.png';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { theme, toggleTheme } = useTheme();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'El usuario es requerido';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El usuario debe tener al menos 3 caracteres';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData);

      if (result.success) {
        showSuccess('¡Bienvenido! Inicio de sesión exitoso');
        navigate('/dashboard');
      } else {
        showError(result.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      showError('Error de conexión. Intenta nuevamente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-dark-bg dark:to-dark-card p-4">
      {/* Botón de tema */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-3 rounded-full bg-white dark:bg-dark-card shadow-lg hover:shadow-xl transition-all duration-200"
        title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
      >
        {theme === 'light' ? (
          <Moon className="w-5 h-5 text-gray-700" />
        ) : (
          <Sun className="w-5 h-5 text-yellow-400" />
        )}
      </button>

      {/* Contenedor principal */}
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <img
              src={logo}
              alt="SuperMercado Mapache"
              className="h-40 w-auto object-contain drop-shadow-lg"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            SuperMapache
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sistema de Gestión Integral
          </p>
        </div>

        {/* Card de login */}
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-8 animate-slide-in">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            Iniciar Sesión
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Usuario */}
            <Input
              label="Usuario"
              name="username"
              type="text"
              placeholder="Ingresa tu usuario"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              icon={User}
              autoFocus
            />

            {/* Contraseña */}
            <Input
              label="Contraseña"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Ingresa tu contraseña"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              icon={Lock}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              }
            />

            {/* Recordar sesión (opcional) */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:border-gray-600 dark:bg-dark-bg"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  Recordar sesión
                </span>
              </label>
            </div>

            {/* Botón de login */}
            <Button
              type="submit"
              fullWidth
              loading={loading}
              size="lg"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © 2026 SuperMercado Mapache. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;