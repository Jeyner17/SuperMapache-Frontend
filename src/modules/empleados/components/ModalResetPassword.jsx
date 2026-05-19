import { useState, useEffect } from 'react';
import { RefreshCw, Copy, Check, Eye, EyeOff, KeyRound, AlertTriangle } from 'lucide-react';
import Button from '../../../shared/components/UI/Button';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!';

const generarPassword = () => {
  let pwd = '';
  for (let i = 0; i < 10; i++) {
    pwd += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return pwd;
};

const ModalResetPassword = ({ empleado, onConfirm, onCancel }) => {
  const [password, setPassword]     = useState('');
  const [showPwd, setShowPwd]       = useState(true);
  const [copied, setCopied]         = useState(false);
  const [loading, setLoading]       = useState(false);

  // Generar password al abrir el modal
  useEffect(() => {
    setPassword(generarPassword());
    setCopied(false);
    setShowPwd(true);
  }, [empleado]);

  const handleRegenerar = () => {
    setPassword(generarPassword());
    setCopied(false);
  };

  const handleCopiar = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback manual para navegadores sin permisos de clipboard
      const el = document.createElement('textarea');
      el.value = password;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleConfirmar = async () => {
    setLoading(true);
    try {
      await onConfirm(password);
    } finally {
      setLoading(false);
    }
  };

  const nombre = empleado?.usuario?.nombre || 'Empleado';
  const username = empleado?.usuario?.username || '';

  return (
    <div className="space-y-5">
      {/* Aviso */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
        <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800 dark:text-amber-300">
          <p className="font-semibold mb-0.5">Reseteo de contraseña</p>
          <p>Se generará una nueva contraseña temporal para <span className="font-semibold">{nombre}</span> (<span className="font-mono">{username}</span>). Cópiala y envíasela de forma segura antes de confirmar.</p>
        </div>
      </div>

      {/* Contraseña generada */}
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Contraseña temporal generada
        </p>
        <div className="flex items-center gap-2">
          {/* Caja de contraseña */}
          <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-100 dark:bg-dark-hover border border-gray-200 dark:border-dark-border font-mono text-base tracking-widest text-gray-800 dark:text-white select-all">
            {showPwd ? password : '•'.repeat(password.length)}
          </div>

          {/* Mostrar/ocultar */}
          <button
            type="button"
            onClick={() => setShowPwd(p => !p)}
            title={showPwd ? 'Ocultar' : 'Mostrar'}
            className="p-2.5 rounded-lg border border-gray-200 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-500 dark:text-gray-400 transition-colors"
          >
            {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>

          {/* Regenerar */}
          <button
            type="button"
            onClick={handleRegenerar}
            title="Generar nueva contraseña"
            className="p-2.5 rounded-lg border border-gray-200 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-500 dark:text-gray-400 transition-colors"
          >
            <RefreshCw size={18} />
          </button>

          {/* Copiar */}
          <button
            type="button"
            onClick={handleCopiar}
            title="Copiar contraseña"
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
              copied
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700'
                : 'bg-primary-600 hover:bg-primary-700 text-white border border-transparent'
            }`}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>

        {copied && (
          <p className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
            <Check size={12} />
            Contraseña copiada al portapapeles
          </p>
        )}
      </div>

      {/* Instrucciones */}
      <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
        <li>Copia la contraseña con el botón <span className="font-semibold">Copiar</span>.</li>
        <li>Envíasela al empleado por WhatsApp, email u otro medio seguro.</li>
        <li>Haz clic en <span className="font-semibold">Confirmar reseteo</span> para aplicar el cambio.</li>
        <li>El empleado deberá cambiarla después de su primer ingreso.</li>
      </ol>

      {/* Botones */}
      <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-dark-border">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleConfirmar}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors disabled:opacity-70"
        >
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Aplicando...</>
          ) : (
            <><KeyRound size={16} /> Confirmar reseteo</>
          )}
        </button>
      </div>
    </div>
  );
};

export default ModalResetPassword;
