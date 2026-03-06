import { useState, useRef, useEffect } from 'react';
import { useScanner } from '../hooks/useScanner';
import Button from '../../../shared/components/UI/Button';
import Card from '../../../shared/components/UI/Card';
import Badge from '../../../shared/components/UI/Badge';
import { Scan, Keyboard, Zap, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const BarcodeScanner = ({ 
  onProductFound, 
  modulo = 'verificacion',
  showHistory = true,
  autoFocus = true 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [mode, setMode] = useState('scanner'); // 'scanner' | 'manual'
  const [history, setHistory] = useState([]);
  const inputRef = useRef(null);

  const { scanning, lastScan, escanearManual } = useScanner({
    modulo,
    enabled: mode === 'scanner',
    onScan: handleScanResult
  });

  useEffect(() => {
    if (autoFocus && mode === 'scanner' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [mode, autoFocus]);

  useEffect(() => {
    if (lastScan) {
      // Agregar al historial
      setHistory(prev => [lastScan, ...prev.slice(0, 9)]); // Mantener últimos 10
    }
  }, [lastScan]);

  function handleScanResult(resultado) {
    if (resultado.producto && onProductFound) {
      onProductFound(resultado.producto);
    }
  }

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;

    await escanearManual(inputValue.trim());
    setInputValue('');
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setInputValue('');
    
    if (newMode === 'scanner' && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  };

  return (
    <div className="space-y-4">
      {/* Selector de Modo */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === 'scanner' ? 'primary' : 'secondary'}
          onClick={() => handleModeChange('scanner')}
          className="flex-1"
        >
          <Scan size={18} />
          Escáner Físico
        </Button>
        <Button
          type="button"
          variant={mode === 'manual' ? 'primary' : 'secondary'}
          onClick={() => handleModeChange('manual')}
          className="flex-1"
        >
          <Keyboard size={18} />
          Entrada Manual
        </Button>
      </div>

      {/* Input de Escaneo */}
      <Card className="p-6">
        {mode === 'scanner' ? (
          <div className="text-center">
            <div className="mb-4">
              <Zap className={`w-16 h-16 mx-auto ${scanning ? 'text-primary-600 animate-pulse' : 'text-gray-400'}`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Listo para Escanear
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Escanea el código de barras del producto con tu lector
            </p>
            
            {/* Input invisible para capturar el escaneo */}
            <input
              ref={inputRef}
              type="text"
              data-scanner="true"
              className="w-full px-4 py-3 border-2 border-dashed border-primary-300 dark:border-primary-600 rounded-lg bg-transparent text-center text-lg font-mono focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
              placeholder="Escanea aquí o escribe el código..."
              autoFocus={autoFocus}
            />

            {scanning && (
              <div className="mt-4 flex items-center justify-center gap-2 text-primary-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                <span className="text-sm">Procesando...</span>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleManualSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Código de Barras
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white text-lg font-mono focus:ring-2 focus:ring-primary-500"
                placeholder="Ingresa el código manualmente"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" disabled={!inputValue.trim() || scanning}>
              {scanning ? 'Escaneando...' : 'Buscar Producto'}
            </Button>
          </form>
        )}
      </Card>

      {/* Último Resultado */}
      {lastScan && (
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              lastScan.resultado === 'exitoso' ? 'bg-green-100 dark:bg-green-900/30' :
              lastScan.resultado === 'no_encontrado' ? 'bg-orange-100 dark:bg-orange-900/30' :
              'bg-red-100 dark:bg-red-900/30'
            }`}>
              {lastScan.resultado === 'exitoso' ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : lastScan.resultado === 'no_encontrado' ? (
                <AlertCircle className="w-6 h-6 text-orange-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-gray-800 dark:text-white">
                  {lastScan.producto ? lastScan.producto.nombre : 'Producto no encontrado'}
                </p>
                <Badge variant={
                  lastScan.resultado === 'exitoso' ? 'success' :
                  lastScan.resultado === 'no_encontrado' ? 'warning' : 'danger'
                }>
                  {lastScan.resultado}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                {lastScan.codigo}
              </p>
              {lastScan.producto && (
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Precio: </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${lastScan.producto.precio_venta}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Stock: </span>
                    <span className={`font-semibold ${
                      lastScan.producto.stock_actual > lastScan.producto.stock_minimo 
                        ? 'text-green-600' 
                        : 'text-orange-600'
                    }`}>
                      {lastScan.producto.stock_actual}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Historial de Escaneos */}
      {showHistory && history.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">
            Historial Reciente
          </h4>
          <div className="space-y-2">
            {history.map((scan, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-dark-hover rounded"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                    {scan.producto ? scan.producto.nombre : scan.codigo}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(scan.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <Badge 
                  variant={scan.resultado === 'exitoso' ? 'success' : 'warning'} 
                  size="sm"
                >
                  {scan.resultado === 'exitoso' ? '✓' : '✗'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default BarcodeScanner;