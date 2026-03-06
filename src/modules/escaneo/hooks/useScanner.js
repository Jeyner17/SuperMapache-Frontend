import { useState, useEffect, useRef } from 'react';
import { useNotification } from '../../../shared/hooks/useNotification';
import escaneoService from '../services/escaneo.service';

/**
 * Hook personalizado para manejar escaneo de códigos de barras
 * Funciona con lectores físicos y entrada manual
 */
export const useScanner = (config = {}) => {
  const {
    onScan,
    onError,
    modulo = 'verificacion',
    enabled = true,
    minLength = 3,
    maxLength = 50,
    timeout = 100 // ms entre teclas para considerar escaneo
  } = config;

  const { showError } = useNotification();
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const bufferRef = useRef('');
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyPress = async (e) => {
      // Ignorar si está en un input/textarea (excepto si es el input del escáner)
      const isInputElement = ['INPUT', 'TEXTAREA'].includes(e.target.tagName);
      const isScannerInput = e.target.dataset?.scanner === 'true';
      
      if (isInputElement && !isScannerInput) return;

      // Limpiar timeout anterior
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Si es Enter, procesar buffer
      if (e.key === 'Enter') {
        e.preventDefault();
        const codigo = bufferRef.current.trim();
        
        if (codigo.length >= minLength && codigo.length <= maxLength) {
          await procesarEscaneo(codigo);
        }
        
        bufferRef.current = '';
        return;
      }

      // Agregar tecla al buffer
      if (e.key.length === 1) {
        bufferRef.current += e.key;
        
        // Auto-procesar después del timeout (para escáneres rápidos)
        timeoutRef.current = setTimeout(async () => {
          const codigo = bufferRef.current.trim();
          
          if (codigo.length >= minLength && codigo.length <= maxLength) {
            await procesarEscaneo(codigo);
          }
          
          bufferRef.current = '';
        }, timeout);
      }
    };

    window.addEventListener('keypress', handleKeyPress);

    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, minLength, maxLength, timeout, modulo]);

  const procesarEscaneo = async (codigo) => {
    try {
      setScanning(true);
      
      const response = await escaneoService.escanear(codigo, modulo);
      const resultado = response.data;
      
      setLastScan({
        codigo,
        timestamp: new Date(),
        ...resultado
      });

      if (onScan) {
        onScan(resultado);
      }

      // Sonido de éxito (opcional)
      if (resultado.resultado === 'exitoso') {
        playBeep('success');
      } else {
        playBeep('error');
      }

    } catch (error) {
      console.error('Error al escanear:', error);
      
      if (onError) {
        onError(error);
      } else {
        showError('Error al procesar código de barras');
      }
      
      playBeep('error');
    } finally {
      setScanning(false);
    }
  };

  const escanearManual = async (codigo) => {
    await procesarEscaneo(codigo);
  };

  const playBeep = (type = 'success') => {
    // Crear sonido de beep usando Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = type === 'success' ? 800 : 400;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  return {
    scanning,
    lastScan,
    escanearManual
  };
};