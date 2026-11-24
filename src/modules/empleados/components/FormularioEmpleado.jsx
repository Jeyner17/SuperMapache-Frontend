import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Input from '../../../shared/components/UI/Input';
import Button from '../../../shared/components/UI/Button';
import empleadoService from '../services/empleado.service';

const DEPARTAMENTOS = [
  { value: 'caja',          label: 'Caja' },
  { value: 'bodega',        label: 'Bodega' },
  { value: 'administracion',label: 'Administración' },
  { value: 'ventas',        label: 'Ventas' },
];

const CARGOS = [
  // Caja
  { value: 'Cajero/a',           label: 'Cajero/a' },
  { value: 'Cajero/a Senior',    label: 'Cajero/a Senior' },
  { value: 'Supervisor/a de Caja', label: 'Supervisor/a de Caja' },
  // Bodega
  { value: 'Bodeguero/a',        label: 'Bodeguero/a' },
  { value: 'Reponedor/a',        label: 'Reponedor/a' },
  { value: 'Auxiliar de Bodega', label: 'Auxiliar de Bodega' },
  // Administración
  { value: 'Supervisor/a de Tienda', label: 'Supervisor/a de Tienda' },
  { value: 'Gerente de Tienda',  label: 'Gerente de Tienda' },
  { value: 'Asistente Administrativo/a', label: 'Asistente Administrativo/a' },
  { value: 'Contador/a',         label: 'Contador/a' },
  { value: 'Recursos Humanos',   label: 'Recursos Humanos' },
  // Ventas
  { value: 'Vendedor/a',         label: 'Vendedor/a' },
  { value: 'Promotor/a',         label: 'Promotor/a' },
  { value: 'Asesor/a de Ventas', label: 'Asesor/a de Ventas' },
  // General
  { value: 'Guardia de Seguridad', label: 'Guardia de Seguridad' },
  { value: 'Personal de Limpieza', label: 'Personal de Limpieza' },
];

const TIPO_CONTRATO = [
  { value: 'indefinido', label: 'Indefinido' },
  { value: 'plazo_fijo', label: 'Plazo Fijo' },
  { value: 'pasantia',   label: 'Pasantía' },
];

const ESTADO_CIVIL = [
  { value: 'soltero',     label: 'Soltero/a' },
  { value: 'casado',      label: 'Casado/a' },
  { value: 'divorciado',  label: 'Divorciado/a' },
  { value: 'viudo',       label: 'Viudo/a' },
  { value: 'union_libre', label: 'Unión Libre' },
];

const EMPTY_FORM = {
  // Identificación
  nombres: '', apellidos: '',
  // Cuenta
  email: '', username: '', password: '', rol_id: '',
  // Laboral
  cargo: '', departamento: '', fecha_contratacion: '', sueldo: '', tipo_contrato: 'indefinido',
  // Personal
  cedula: '', telefono: '', celular: '', fecha_nacimiento: '', estado_civil: '',
  // Dirección
  direccion: '', ciudad: 'Quito',
  // Emergencia
  contacto_emergencia_nombre: '', contacto_emergencia_telefono: '',
  notas: '',
};

const SelectField = ({ label, name, value, onChange, options, required, error }) => (
  <div className="w-full">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 ${
        error ? 'border-red-500' : 'border-gray-300 dark:border-dark-border'
      }`}
    >
      <option value="">— Seleccionar —</option>
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
  </div>
);

const SectionTitle = ({ children }) => (
  <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400 border-b border-gray-200 dark:border-dark-border pb-2 mb-4">
    {children}
  </h3>
);

// Las fechas DATE llegan como 'YYYY-MM-DD' o ISO; se toma solo el día sin convertir de zona
const soloFecha = (v) => (v ? String(v).split('T')[0] : '');

const FormularioEmpleado = ({ mode, initialData, onSubmit, onCancel, isAdmin }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    empleadoService.getRoles()
      .then(res => setRoles(res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        nombres:                       initialData.nombres || '',
        apellidos:                     initialData.apellidos || '',
        email:                         initialData.usuario?.email || '',
        username:                      initialData.usuario?.username || '',
        password:                      '',
        rol_id:                        String(initialData.usuario?.rolId || initialData.usuario?.rol?.id || ''),
        cargo:                         initialData.cargo || '',
        departamento:                  initialData.departamento || '',
        fecha_contratacion:            soloFecha(initialData.fechaContratacion),
        sueldo:                        initialData.sueldo || '',
        tipo_contrato:                 initialData.tipoContrato || 'indefinido',
        cedula:                        initialData.cedula || '',
        telefono:                      initialData.telefono || '',
        celular:                       initialData.celular || '',
        fecha_nacimiento:              soloFecha(initialData.fechaNacimiento),
        estado_civil:                  initialData.estadoCivil || '',
        direccion:                     initialData.direccion || '',
        ciudad:                        initialData.ciudad || 'Quito',
        contacto_emergencia_nombre:    initialData.contactoEmergenciaNombre || '',
        contacto_emergencia_telefono:  initialData.contactoEmergenciaTelefono || '',
        notas:                         initialData.notas || '',
      });
    } else {
      setFormData(EMPTY_FORM);
    }
    setErrors({});
  }, [initialData, mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitized = value;
    if (name === 'cedula') sanitized = value.replace(/\D/g, '').slice(0, 10);
    setFormData(prev => ({ ...prev, [name]: sanitized }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Sin cuenta existente (alta, o empleado sin usuario) se puede crear una
  const tieneCuenta  = mode === 'edit' && !!initialData?.usuario;
  const pideCuenta   = !tieneCuenta;
  const quiereCuenta = !!(formData.email || formData.username || formData.password || formData.rol_id);

  // Un supervisor no puede asignar el rol de administrador (el backend también lo bloquea)
  const rolesDisponibles = roles.filter(r => isAdmin || r.nombre !== 'administrador'
    || String(r.id) === String(formData.rol_id));

  const validate = () => {
    const e = {};
    if (!formData.nombres.trim())      e.nombres  = 'Los nombres son requeridos';
    if (!formData.apellidos.trim())    e.apellidos = 'Los apellidos son requeridos';
    if (!formData.cedula)              e.cedula   = 'La cédula es requerida';
    else if (formData.cedula.length !== 10) e.cedula = 'La cédula debe tener 10 dígitos';
    if (!formData.fecha_contratacion)  e.fecha_contratacion = 'La fecha de contratación es requerida';
    if (!formData.cargo.trim())        e.cargo       = 'El cargo es requerido';
    if (!formData.departamento)        e.departamento = 'El departamento es requerido';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Email inválido';
    if (formData.username && !/^[a-zA-Z0-9._-]{3,50}$/.test(formData.username)) {
      e.username = '3 a 50 caracteres: letras, números, punto, guion o guion bajo';
    }
    // Cuenta de acceso: opcional, pero si se llena algo deben ir todos los campos
    if (pideCuenta && quiereCuenta) {
      if (!formData.email)    e.email    = 'Requerido para crear la cuenta';
      if (!formData.username) e.username = 'Requerido para crear la cuenta';
      if (!formData.rol_id)   e.rol_id   = 'Selecciona un rol';
      if (!formData.password) e.password = 'Requerida para crear la cuenta';
    }
    if (formData.password && formData.password.length < 6) e.password = 'Mínimo 6 caracteres';
    if (formData.fecha_nacimiento && formData.fecha_contratacion
        && formData.fecha_nacimiento >= formData.fecha_contratacion) {
      e.fecha_nacimiento = 'Debe ser anterior a la fecha de contratación';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // Campos opcionales vacíos van como null para poder borrarlos al editar
      // (antes se omitían y el valor anterior nunca se podía quitar)
      const opcional = (v) => (v === '' || v === undefined ? null : v);
      const data = {
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        cedulaIdentidad: formData.cedula,
        fechaIngreso: formData.fecha_contratacion,
        cargo: formData.cargo,
        departamento: formData.departamento,
        sueldo: formData.sueldo === '' ? null : Number(formData.sueldo),
        tipoContrato: formData.tipo_contrato || 'indefinido',
        telefono: opcional(formData.telefono),
        celular: opcional(formData.celular),
        fechaNacimiento: opcional(formData.fecha_nacimiento),
        estadoCivil: opcional(formData.estado_civil),
        direccion: opcional(formData.direccion),
        ciudad: opcional(formData.ciudad),
        contactoEmergenciaNombre: opcional(formData.contacto_emergencia_nombre),
        contactoEmergenciaTelefono: opcional(formData.contacto_emergencia_telefono),
        notas: opcional(formData.notas),
        // Antes la cuenta de acceso nunca se enviaba al backend
        ...((tieneCuenta || quiereCuenta) && {
          ...(formData.email && { email: formData.email.trim() }),
          ...(formData.username && { username: formData.username.trim() }),
          ...(formData.rol_id && { rolId: Number(formData.rol_id) }),
          ...(formData.password && { password: formData.password }),
        }),
      };
      await onSubmit(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── Identificación ── */}
      <div>
        <SectionTitle>Identificación</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Nombres" name="nombres" value={formData.nombres}
            onChange={handleChange} error={errors.nombres} required placeholder="Ej: Jeyner" />

          <Input label="Apellidos" name="apellidos" value={formData.apellidos}
            onChange={handleChange} error={errors.apellidos} required placeholder="Ej: Manzaba" />
        </div>
      </div>

      {/* ── Cuenta de acceso ── */}
      <div>
        <SectionTitle>{tieneCuenta ? 'Cuenta de acceso' : 'Cuenta de acceso (opcional)'}</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Email" name="email" type="email" value={formData.email}
            onChange={handleChange} error={errors.email} placeholder="jmanzaba@supermapache.com" />

          <Input label="Username" name="username" value={formData.username}
            onChange={handleChange} error={errors.username} placeholder="jmanzaba" />

          {pideCuenta && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contraseña {quiereCuenta && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  className={`w-full px-4 py-2.5 pr-10 border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300 dark:border-dark-border'
                  }`}
                />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
            </div>
          )}

          <SelectField
            label="Rol del sistema" name="rol_id" value={formData.rol_id}
            onChange={handleChange} required={tieneCuenta || quiereCuenta} error={errors.rol_id}
            options={rolesDisponibles.map(r => ({ value: String(r.id), label: r.nombre.charAt(0).toUpperCase() + r.nombre.slice(1) }))}
          />
        </div>
      </div>

      {/* ── Datos laborales ── */}
      <div>
        <SectionTitle>Datos laborales</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Cargo" name="cargo" value={formData.cargo}
            onChange={handleChange} error={errors.cargo} required options={CARGOS} />

          <SelectField
            label="Departamento" name="departamento" value={formData.departamento}
            onChange={handleChange} required error={errors.departamento} options={DEPARTAMENTOS} />

          <Input label="Fecha de contratación" name="fecha_contratacion" type="date"
            value={formData.fecha_contratacion} onChange={handleChange}
            error={errors.fecha_contratacion} required />

          <Input label="Sueldo (USD)" name="sueldo" type="number" min="0" step="0.01"
            value={formData.sueldo} onChange={handleChange} placeholder="450.00" />

          <SelectField
            label="Tipo de contrato" name="tipo_contrato" value={formData.tipo_contrato}
            onChange={handleChange} options={TIPO_CONTRATO} />
        </div>
      </div>

      {/* ── Datos personales ── */}
      <div>
        <SectionTitle>Datos personales</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Cédula" name="cedula" value={formData.cedula}
            onChange={handleChange} error={errors.cedula} required placeholder="0900000000" maxLength={10} />

          <Input label="Teléfono" name="telefono" value={formData.telefono}
            onChange={handleChange} placeholder="02-2345678" />

          <Input label="Celular" name="celular" value={formData.celular}
            onChange={handleChange} placeholder="0998765432" />

          <Input label="Fecha de nacimiento" name="fecha_nacimiento" type="date"
            value={formData.fecha_nacimiento} onChange={handleChange} error={errors.fecha_nacimiento} />

          <SelectField
            label="Estado civil" name="estado_civil" value={formData.estado_civil}
            onChange={handleChange} options={ESTADO_CIVIL} />
        </div>
      </div>

      {/* ── Dirección ── */}
      <div>
        <SectionTitle>Dirección</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Ciudad" name="ciudad" value={formData.ciudad}
            onChange={handleChange} placeholder="Quito" />
          <div className="md:col-span-2">
            <Input label="Dirección" name="direccion" value={formData.direccion}
              onChange={handleChange} placeholder="Av. Principal y Calle Secundaria" />
          </div>
        </div>
      </div>

      {/* ── Contacto de emergencia ── */}
      <div>
        <SectionTitle>Contacto de emergencia</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Nombre" name="contacto_emergencia_nombre"
            value={formData.contacto_emergencia_nombre} onChange={handleChange}
            placeholder="María Pérez" />
          <Input label="Teléfono" name="contacto_emergencia_telefono"
            value={formData.contacto_emergencia_telefono} onChange={handleChange}
            placeholder="0987654321" />
        </div>
      </div>

      {/* ── Notas ── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notas</label>
        <textarea
          name="notas" value={formData.notas} onChange={handleChange} rows={3}
          placeholder="Observaciones adicionales..."
          className="w-full rounded-lg border px-4 py-2.5 bg-white dark:bg-dark-card border-gray-300 dark:border-dark-border text-gray-900 dark:text-dark-text focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-dark-border">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>
          {mode === 'create' ? 'Registrar Empleado' : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  );
};

export default FormularioEmpleado;
