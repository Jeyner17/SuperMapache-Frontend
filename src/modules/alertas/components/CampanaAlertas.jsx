import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import alertaService from '../services/alerta.service';

const prioridadConfig = {
  critica: { color: 'text-red-600',    bg: 'bg-red-50 dark:bg-red-900/20',    dot: 'bg-red-500' },
  alta:    { color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', dot: 'bg-orange-500' },
  media:   { color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20', dot: 'bg-yellow-500' },
  baja:    { color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-900/20',   dot: 'bg-blue-400' },
};

const POLL_INTERVAL_MS = 60_000; // re-fetch every minute

const CampanaAlertas = () => {
  const [open, setOpen]         = useState(false);
  const [alertas, setAlertas]   = useState([]);
  const [total, setTotal]       = useState(0);
  const dropdownRef             = useRef(null);
  const navigate                = useNavigate();

  const cargar = useCallback(async () => {
    try {
      const res = await alertaService.getNoLeidas(8);
      setAlertas(res.data.alertas || []);
      setTotal(res.data.total || 0);
    } catch { /* silencioso */ }
  }, []);

  useEffect(() => {
    cargar();
    const timer = setInterval(cargar, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [cargar]);

  // Cerrar al click fuera
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarcarTodas = async (e) => {
    e.stopPropagation();
    try {
      await alertaService.marcarTodasLeidas();
      setTotal(0);
      setAlertas([]);
    } catch { /* silencioso */ }
  };

  const handleVerTodas = () => {
    setOpen(false);
    navigate('/alertas');
  };

  const handleClickAlerta = async (alerta) => {
    if (!alerta.leida) {
      try {
        await alertaService.marcarLeida(alerta.id);
        setAlertas(prev => prev.map(a => a.id === alerta.id ? { ...a, leida: true } : a));
        setTotal(prev => Math.max(0, prev - 1));
      } catch { /* silencioso */ }
    }
    setOpen(false);
    navigate('/alertas');
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Botón campana */}
      <button onClick={() => setOpen(v => !v)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
        title="Alertas">
        <Bell size={20} className="text-gray-600 dark:text-gray-400" />
        {total > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {total > 99 ? '99+' : total}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl shadow-xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-dark-border">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-gray-500" />
              <span className="font-semibold text-gray-900 dark:text-white text-sm">Alertas</span>
              {total > 0 && (
                <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-1.5 py-0.5 rounded-full">
                  {total} sin leer
                </span>
              )}
            </div>
            {total > 0 && (
              <button onClick={handleMarcarTodas}
                className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
                <CheckCheck size={13} /> Leer todas
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="max-h-72 overflow-y-auto">
            {alertas.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                No hay alertas pendientes
              </div>
            ) : (
              alertas.map(a => {
                const cfg = prioridadConfig[a.prioridad] || prioridadConfig.media;
                return (
                  <button key={a.id} onClick={() => handleClickAlerta(a)}
                    className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-gray-50 dark:hover:bg-dark-hover border-b border-gray-50 dark:border-dark-border last:border-0 ${!a.leida ? cfg.bg : ''}`}>
                    <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!a.leida ? cfg.dot : 'bg-gray-300 dark:bg-gray-600'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${!a.leida ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                        {a.titulo}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{a.mensaje}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <button onClick={handleVerTodas}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm text-primary-600 hover:bg-gray-50 dark:hover:bg-dark-hover border-t border-gray-100 dark:border-dark-border transition-colors">
            <ExternalLink size={13} /> Ver todas las alertas
          </button>
        </div>
      )}
    </div>
  );
};

export default CampanaAlertas;
