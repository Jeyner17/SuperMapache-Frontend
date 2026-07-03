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

const FormularioEmpleado = ({ mode, initialData, onSubmit, onCancel }) => {
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
        rol_id:                        initialData.usuario?.rolId || initialData.usuario?.rol?.id || '',
        cargo:                         initialData.cargo || '',
        departamento:                  initialData.departamento || '',
        fecha_contratacion:            initialData.fechaContratacion
                                         ? new Date(initialData.fechaContratacion).toISOString().split('T')[0]
                                         : '',
        sueldo:                        initialData.sueldo || '',
        tipo_contrato:                 initialData.tipoContrato || 'indefinido',
        cedula:                        initialData.cedula || '',
        telefono:                      initialData.telefono || '',
        celular:                       initialData.celular || '',
        fecha_nacimiento:              initialData.fechaNacimiento
                                         ? new Date(initialData.fechaNacimiento).toISOString().split('T')[0]
                                         : '',
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
    if (mode === 'create' && formData.password && formData.password.length < 6) e.password = 'Mínimo 6 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        cedulaIdentidad: formData.cedula,
        fechaIngreso: formData.fecha_contratacion,
        ...(formData.cargo && { cargo: formData.cargo }),
        ...(formData.departamento && { departamento: formData.departamento }),
        ...(formData.sueldo && { sueldo: Number(formData.sueldo) }),
        ...(formData.tipo_contrato && { tipoContrato: formData.tipo_contrato }),
        ...(formData.telefono && { telefono: formData.telefono }),
        ...(formData.celular && { celular: formData.celular }),
        ...(formData.fecha_nacimiento && { fechaNacimiento: formData.fecha_nacimiento }),
        ...(formData.estado_civil && { estadoCivil: formData.estado_civil }),
        ...(formData.direccion && { direccion: formData.direccion }),
        ...(formData.ciudad && { ciudad: formData.ciudad }),
        ...(formData.contacto_emergencia_nombre && { contactoEmergenciaNombre: formData.contacto_emergencia_nombre }),
        ...(formData.contacto_emergencia_telefono && { contactoEmergenciaTelefono: formData.contacto_emergencia_telefono }),
        ...(formData.notas && { notas: formData.notas }),
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
            onChange={handleChange} error={errors.nombres} required placeholder="Ej: Jeyner Andrés" />

          <Input label="Apellidos" name="apellidos" value={formData.apellidos}
            onChange={handleChange} error={errors.apellidos} required placeholder="Ej: Manzaba Torres" />
        </div>
      </div>

      {/* ── Cuenta de acceso ── */}
      <div>
        <SectionTitle>Cuenta de acceso (opcional)</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Email" name="email" type="email" value={formData.email}
            onChange={handleChange} error={errors.email} placeholder="jmanzaba@supermapache.com" />

          <Input label="Username" name="username" value={formData.username}
            onChange={handleChange} error={errors.username} placeholder="jmanzaba" />

          {mode === 'create' && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contraseña <span className="text-red-500">*</span>
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
            onChange={handleChange} required error={errors.rol_id}
            options={roles.map(r => ({ value: r.id, label: r.nombre.charAt(0).toUpperCase() + r.nombre.slice(1) }))}
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
            value={formData.fecha_nacimiento} onChange={handleChange} />

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
