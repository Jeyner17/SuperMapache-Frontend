import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // En desktop (>= 1024px), SIEMPRE abierto
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        // En móvil, cerrado por defecto
        setSidebarOpen(false);
      }
    };

    // Ejecutar al montar
    handleResize();

    // Escuchar cambios de tamaño
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <Sidebar isOpen={sidebarOpen} onToggle={handleToggleSidebar} />
      <Navbar onToggleSidebar={handleToggleSidebar} />
      
      <main className="pt-16 lg:ml-64">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;