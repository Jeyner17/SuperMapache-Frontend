import { AuthProvider } from './shared/context/AuthContext';
import { NotificationProvider } from './shared/context/NotificationContext';
import { ThemeProvider } from './shared/context/ThemeContext';
import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from './shared/components/Common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;