import { useState, useEffect, useRef } from 'react';
import Button from '../../../shared/components/UI/Button';
import creditoService from '../services/credito.service';
import { Search, User } from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/formatters';

const FormularioCredito = ({ clienteInicial, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    cliente_id: clienteInicial?.id || '',
    monto_total: '',
    dias_plazo: '30',
    notas: ''
  });
  const [clienteSeleccionado, setClienteSeleccionado] = useState(clienteInicial || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientes, setClientes] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const debounceRef = useRef(null);

  useEffect(() => {
    if (searchTerm.length < 2) { setClientes([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await creditoService.getClientes({ search: searchTerm, activo: true, limit: 10 });
        setClientes(res.data.clientes || []);
        setShowDropdown(true);
      } catch { setClientes([]); }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  const seleccionarCliente = (c) => {
    setClienteSeleccionado(c);
    setFormData(prev => ({ ...prev, cliente_id: c.id }));
    setSearchTerm('');
    setShowDropdown(false);
    if (errors.cliente_id) setErrors(prev => ({ ...prev, cliente_id: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.cliente_id) newErrors.cliente_id = 'Selecciona un cliente';
    const monto = parseFloat(formData.monto_total);
    if (!formData.monto_total || isNaN(monto) || monto <= 0) newErrors.monto_total = 'El monto debe ser mayor a 0';
    const dias = parseInt(formData.dias_plazo);
    if (!formData.dias_plazo || isNaN(dias) || dias < 1) newErrors.dias_plazo = 'Los días deben ser al menos 1';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({
        cliente_id: formData.cliente_id,
        monto_total: parseFloat(formData.monto_total),
        dias_plazo: parseInt(formData.dias_plazo),
        notas: formData.notas || undefined
      });
    } finally {
      setLoading(false);
    }
  };

  const fechaVencimiento = formData.dias_plazo
    ? new Date(Date.now() + parseInt(formData.dias_plazo) * 86400000).toLocaleDateString('es-EC')
    : '';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Búsqueda de cliente */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Cliente <span className="text-red-500">*</span>
        </label>

        {clienteSeleccionado ? (
          <div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-700">
            <div className="flex items-center gap-2">
              <User size={16} className="text-primary-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{clienteSeleccionado.nombre}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {clienteSeleccionado.cedula && `CI: ${clienteSeleccionado.cedula} · `}
                  Saldo pendiente: {formatCurrency(clienteSeleccionado.saldo_pendiente)}
                  {parseFloat(clienteSeleccionado.limite_credito) > 0 && ` · Límite: ${formatCurrency(clienteSeleccionado.limite_credito)}`}
                </p>
              </div>
            </div>
            <button type="button" onClick={() => { setClienteSeleccionado(null); setFormData(prev => ({ ...prev, cliente_id: '' })); }}
              className="text-xs text-gray-500 hover:text-red-600 transition-colors">Cambiar</button>
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar cliente por nombre o cédula..."
              className={`w-full pl-9 pr-4 py-2.5 border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 ${errors.cliente_id ? 'border-red-500' : 'border-gray-300 dark:border-dark-border'}`} />
            {showDropdown && clientes.length > 0 && (
              <div className="absolute z-50 mt-1 w-full bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {clientes.map(c => (
                  <button key={c.id} type="button" onClick={() => seleccionarCliente(c)}
                    className="w-full px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-dark-hover border-b border-gray-100 dark:border-dark-border last:border-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{c.nombre}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {c.cedula || 'Sin cédula'} · Saldo: {formatCurrency(c.saldo_pendiente)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {errors.cliente_id && <p className="mt-1 text-sm text-red-600">{errors.cliente_id}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Monto <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input type="number" step="0.01" min="0.01" value={formData.monto_total}
              onChange={(e) => setFormData(prev => ({ ...prev, monto_total: e.target.value }))}
              placeholder="0.00"
              className={`w-full pl-8 pr-4 py-2.5 border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 ${errors.monto_total ? 'border-red-500' : 'border-gray-300 dark:border-dark-border'}`} />
          </div>
          {errors.monto_total && <p className="mt-1 text-sm text-red-600">{errors.monto_total}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Días de Plazo <span className="text-red-500">*</span>
          </label>
          <input type="number" min="1" max="365" value={formData.dias_plazo}
            onChange={(e) => setFormData(prev => ({ ...prev, dias_plazo: e.target.value }))}
            className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 ${errors.dias_plazo ? 'border-red-500' : 'border-gray-300 dark:border-dark-border'}`} />
          {errors.dias_plazo
            ? <p className="mt-1 text-sm text-red-600">{errors.dias_plazo}</p>
            : fechaVencimiento && <p className="mt-1 text-xs text-gray-400">Vence el {fechaVencimiento}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notas</label>
        <textarea value={formData.notas} onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
          rows={2} placeholder="Descripción de la deuda..."
          className="w-full rounded-lg border px-4 py-2.5 bg-white dark:bg-dark-card border-gray-300 dark:border-dark-border text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500" />
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-dark-border">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>Registrar Crédito</Button>
      </div>
    </form>
  );
};

export default FormularioCredito;
