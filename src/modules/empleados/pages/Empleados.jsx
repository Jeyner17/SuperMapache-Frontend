import { useState, useEffect, useRef } from 'react';
import {
  Plus, Search, Edit, Trash2, KeyRound, Users,
  UserCheck, UserPlus, Briefcase, Mail, Phone, ShieldCheck, AlertTriangle
} from 'lucide-react';
import { useNotification } from '../../../shared/hooks/useNotification';
import { useAuth } from '../../../shared/hooks/useAuth';
import empleadoService from '../services/empleado.service';
import Button from '../../../shared/components/UI/Button';
import Card from '../../../shared/components/UI/Card';
import Modal from '../../../shared/components/UI/Modal';
import Badge from '../../../shared/components/UI/Badge';
import Loading from '../../../shared/components/UI/Loading';
import FormularioEmpleado from '../components/FormularioEmpleado';
import ModalResetPassword from '../components/ModalResetPassword';

// ── Helpers ──────────────────────────────────────────────────────────────────

const DEPTO_COLORS = {
  caja:          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  bodega:        'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  administracion:'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  ventas:        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

const AVATAR_BG = {
  caja:          'bg-yellow-500',
  bodega:        'bg-cyan-500',
  administracion:'bg-purple-500',
  ventas:        'bg-green-500',
};

const DEPTO_LABEL = {
  caja: 'Caja', bodega: 'Bodega', administracion: 'Administración', ventas: 'Ventas',
};

const ROL_VARIANT = {
  administrador: 'danger',
  supervisor:    'warning',
  cajero:        'info',
  empleado:      'default',
};

const initials = (nombre = '') =>
  nombre.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

// ── Tarjeta de empleado ───────────────────────────────────────────────────────

const EmpleadoCard = ({ empleado, isAdmin, onEdit, onReset, onActivar, onDelete }) => {
  const { usuario, cargo, departamento } = empleado;
  const avatarBg = AVATAR_BG[departamento] || 'bg-gray-400';

  return (
    <Card className="p-5 hover:shadow-lg transition-all flex flex-col gap-4">
      {/* Cabecera */}
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full ${avatarBg} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
          {initials(usuario?.nombre)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 dark:text-white truncate">{usuario?.nombre}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{cargo}</p>
        </div>
        <Badge variant={empleado.activo ? 'success' : 'danger'} size="sm">
          {empleado.activo ? 'Activo' : 'Inactivo'}
        </Badge>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${DEPTO_COLORS[departamento]}`}>
          {DEPTO_LABEL[departamento] || departamento}
        </span>
        <Badge variant={ROL_VARIANT[usuario?.rol?.nombre] || 'default'} size="sm">
          <ShieldCheck size={11} className="mr-1" />
          {usuario?.rol?.nombre || '—'}
        </Badge>
      </div>

      {/* Contacto */}
      <div className="space-y-1.5">
        {usuario?.email && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Mail size={13} className="flex-shrink-0" />
            <span className="truncate">{usuario.email}</span>
          </div>
        )}
        {empleado.celular && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Phone size={13} className="flex-shrink-0" />
            <span>{empleado.celular}</span>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-dark-border">
        <button
          onClick={() => onEdit(empleado)}
          className="flex-1 py-2 px-3 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-dark-hover dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm flex items-center justify-center gap-1.5 transition-colors"
        >
          <Edit size={14} /> Editar
        </button>

        {isAdmin && (
          <>
            {empleado.activo && (
              <button
                onClick={() => onReset(empleado)}
                title="Resetear contraseña"
                className="py-2 px-3 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-400 transition-colors"
              >
                <KeyRound size={14} />
              </button>
            )}
            {empleado.activo ? (
              <button
                onClick={() => onDelete(empleado)}
                title="Desactivar empleado"
                className="py-2 px-3 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            ) : (
              <button
                onClick={() => onActivar(empleado)}
                title="Activar empleado"
                className="py-2 px-3 rounded-lg bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 transition-colors"
              >
                <UserPlus size={14} />
              </button>
            )}
          </>
        )}
      </div>
    </Card>
  );
};

// ── Página principal ──────────────────────────────────────────────────────────

const Empleados = () => {
  const { showSuccess, showError } = useNotification();
  const { user, hasPermission } = useAuth();
  const isAdmin   = user?.rol === 'administrador';
  const canManage = hasPermission('gestionar_empleados');

  const [empleados, setEmpleados]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filtroDpto, setFiltroDpto]         = useState('');
  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  const searchTimer                         = useRef(null);

  // Modales
  const [formModal, setFormModal]       = useState({ open: false, mode: 'create', data: null });
  const [resetModal, setResetModal]     = useState({ open: false, empleado: null });
  const [deleteModal, setDeleteModal]   = useState({ open: false, empleado: null, loading: false });

  // Debounce búsqueda
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(searchTimer.current);
  }, [searchTerm]);

  useEffect(() => { cargar(); }, [debouncedSearch, filtroDpto, mostrarInactivos]);

  const cargar = async () => {
    try {
      setLoading(true);
      const res = await empleadoService.getAll({
        search: debouncedSearch,
        departamento: filtroDpto,
        activo: mostrarInactivos ? undefined : true,
      });
      setEmpleados(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch (err) {
      showError(err.message || 'Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  };

  // ── CRUD handlers ─────────────────────────────────────────────────────────

  const handleFormSubmit = async (data) => {
    try {
      if (formModal.mode === 'create') {
        await empleadoService.create(data);
        showSuccess('Empleado registrado exitosamente');
      } else {
        await empleadoService.update(formModal.data.id, data);
        showSuccess('Empleado actualizado exitosamente');
      }
      setFormModal({ open: false, mode: 'create', data: null });
      cargar();
    } catch (err) {
      showError(err.message || 'Error al guardar empleado');
      throw err; // para que el formulario no limpie loading antes
    }
  };

  const handleActivar = async (empleado) => {
    try {
      await empleadoService.update(empleado.id, { activo: true });
      showSuccess(`${empleado.usuario?.nombre} reactivado exitosamente`);
      cargar();
    } catch (err) {
      showError(err.message || 'Error al activar empleado');
    }
  };

  const handleResetConfirm = async (password) => {
    try {
      await empleadoService.cambiarPassword(resetModal.empleado.id, password);
      showSuccess(`Contraseña de ${resetModal.empleado.usuario?.nombre} actualizada`);
      setResetModal({ open: false, empleado: null });
    } catch (err) {
      showError(err.message || 'Error al resetear contraseña');
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteModal(p => ({ ...p, loading: true }));
    try {
      await empleadoService.delete(deleteModal.empleado.id);
      showSuccess('Empleado desactivado exitosamente');
      setDeleteModal({ open: false, empleado: null, loading: false });
      cargar();
    } catch (err) {
      showError(err.message || 'Error al desactivar empleado');
      setDeleteModal(p => ({ ...p, loading: false }));
    }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────

  const totalActivos = empleados.filter(e => e.activo).length;
  const porDpto = ['caja', 'bodega', 'administracion', 'ventas'].map(d => ({
    label: DEPTO_LABEL[d],
    count: empleados.filter(e => e.departamento === d && e.activo).length,
    color: DEPTO_COLORS[d],
  }));

  if (loading && empleados.length === 0 && !searchTerm && !filtroDpto) {
    return <Loading message="Cargando empleados..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Empleados</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestión de personal y accesos al sistema
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setFormModal({ open: true, mode: 'create', data: null })} size="lg">
            <Plus size={20} /> Nuevo Empleado
          </Button>
        )}
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4 col-span-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{empleados.length}</p>
          <Users size={18} className="text-blue-500 mt-1" />
        </Card>
        <Card className="p-4 col-span-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">Activos</p>
          <p className="text-2xl font-bold text-green-600">{totalActivos}</p>
          <UserCheck size={18} className="text-green-500 mt-1" />
        </Card>
        {porDpto.map(d => (
          <Card key={d.label} className="p-4 col-span-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">{d.label}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{d.count}</p>
            <Briefcase size={18} className="text-gray-400 mt-1" />
          </Card>
        ))}
      </div>

      {/* ── Filtros ────────────────────────────────────────────────────────── */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre, email o username..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={filtroDpto}
            onChange={e => setFiltroDpto(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Todos los departamentos</option>
            <option value="caja">Caja</option>
            <option value="bodega">Bodega</option>
            <option value="administracion">Administración</option>
            <option value="ventas">Ventas</option>
          </select>

          <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg cursor-pointer select-none">
            <input
              type="checkbox"
              checked={mostrarInactivos}
              onChange={e => setMostrarInactivos(e.target.checked)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Ver inactivos
            </span>
          </label>
        </div>
      </Card>

      {/* ── Grid de empleados ──────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      ) : empleados.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            No hay empleados
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || filtroDpto
              ? 'No se encontraron empleados con los filtros aplicados'
              : 'Registra el primer empleado del sistema'}
          </p>
          {canManage && (
            <Button onClick={() => setFormModal({ open: true, mode: 'create', data: null })}>
              <Plus size={18} /> Registrar Empleado
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {empleados.map(emp => (
            <EmpleadoCard
              key={emp.id}
              empleado={emp}
              isAdmin={isAdmin}
              onEdit={e => setFormModal({ open: true, mode: 'edit', data: e })}
              onReset={e => setResetModal({ open: true, empleado: e })}
              onActivar={handleActivar}
              onDelete={e => setDeleteModal({ open: true, empleado: e, loading: false })}
            />
          ))}
        </div>
      )}

      {/* ── Modal formulario crear/editar ──────────────────────────────────── */}
      <Modal
        isOpen={formModal.open}
        onClose={() => setFormModal({ open: false, mode: 'create', data: null })}
        title={formModal.mode === 'create' ? 'Registrar Empleado' : 'Editar Empleado'}
        size="lg"
      >
        <FormularioEmpleado
          mode={formModal.mode}
          initialData={formModal.data}
          onSubmit={handleFormSubmit}
          onCancel={() => setFormModal({ open: false, mode: 'create', data: null })}
        />
      </Modal>

      {/* ── Modal resetear contraseña ──────────────────────────────────────── */}
      <Modal
        isOpen={resetModal.open}
        onClose={() => setResetModal({ open: false, empleado: null })}
        title="Resetear contraseña"
        size="sm"
      >
        <ModalResetPassword
          empleado={resetModal.empleado}
          onConfirm={handleResetConfirm}
          onCancel={() => setResetModal({ open: false, empleado: null })}
        />
      </Modal>

      {/* ── Modal confirmar desactivar ─────────────────────────────────────── */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, empleado: null, loading: false })}
        title=""
        showCloseButton={false}
        size="sm"
      >
        <div className="flex flex-col items-center text-center px-2 pb-2">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <AlertTriangle size={32} className="text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            ¿Desactivar empleado?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-1">Vas a desactivar a</p>
          {deleteModal.empleado && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg mb-4 mt-1 bg-gray-100 dark:bg-gray-800">
              <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-sm font-bold">
                {initials(deleteModal.empleado.usuario?.nombre)}
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800 dark:text-white leading-tight">
                  {deleteModal.empleado.usuario?.nombre}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {deleteModal.empleado.cargo} · {DEPTO_LABEL[deleteModal.empleado.departamento]}
                </p>
              </div>
            </div>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            El empleado perderá acceso al sistema. El registro se conserva (soft delete).
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={() => setDeleteModal({ open: false, empleado: null, loading: false })}
              disabled={deleteModal.loading}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleteModal.loading}
              className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {deleteModal.loading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Desactivando...</>
              ) : (
                <><Trash2 size={16} /> Sí, desactivar</>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Empleados;
