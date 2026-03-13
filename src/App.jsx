import { AuthProvider } from './shared/context/AuthContext';
import { NotificationProvider } from './shared/context/NotificationContext';
import { ThemeProvider } from './shared/context/ThemeContext';
import { ConfiguracionProvider } from './shared/context/ConfiguracionContext';
import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from './shared/components/Common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <ConfiguracionProvider>
              <AppRoutes />
            </ConfiguracionProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;