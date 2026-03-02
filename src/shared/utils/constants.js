export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'SuperMercado Sistema';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';
export const ITEMS_PER_PAGE = parseInt(import.meta.env.VITE_ITEMS_PER_PAGE) || 10;
export const MAX_FILE_SIZE = parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 5242880;

// Roles
export const ROLES = {
  ADMIN: 'administrador',
  SUPERVISOR: 'supervisor',
  CAJERO: 'cajero',
  EMPLEADO: 'empleado',
};

// Estados
export const STATUS = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
  PENDIENTE: 'pendiente',
  COMPLETADO: 'completado',
};

// Rutas de navegación
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  EMPLEADOS: '/empleados',
  CATEGORIAS: '/categorias',
  PRODUCTOS: '/productos',
  INVENTARIO: '/inventario',
  PROVEEDORES: '/proveedores',
  COMPRAS: '/compras',
  POS: '/pos',
  CAJA: '/caja',
  CREDITOS: '/creditos',
  GASTOS: '/gastos',
  ALERTAS: '/alertas',
  AUDITORIA: '/auditoria',
  REPORTES: '/reportes',
  CONFIGURACION: '/configuracion',
};