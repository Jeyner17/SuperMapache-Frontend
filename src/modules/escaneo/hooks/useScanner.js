import { useState, useEffect, useRef, useCallback } from 'react';
import { useNotification } from '../../../shared/hooks/useNotification';
import escaneoService from '../services/escaneo.service';

/**
 * Hook para manejar escaneo de códigos de barras.
 * Compatible con lectores físicos (HID) y entrada manual.
 */
export const useScanner = (config = {}) => {
  const {
    onScan,
    onError,
    modulo = 'escaneo',
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
  // AudioContext reutilizable — los navegadores limitan a ~6 instancias simultáneas
  const audioCtxRef = useRef(null);

  const getAudioContext = () => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  const playBeep = useCallback((type = 'success') => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = type === 'success' ? 800 : 400;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    } catch {
      // Audio no disponible — continuar sin sonido
    }
  }, []);

  const procesarEscaneo = useCallback(async (codigo) => {
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

      playBeep(resultado.resultado === 'exitoso' ? 'success' : 'error');
    } catch (error) {
      if (onError) {
        onError(error);
      } else {
        showError('Error al procesar código de barras');
      }

      playBeep('error');
    } finally {
      setScanning(false);
    }
  }, [modulo, onScan, onError, showError, playBeep]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = async (e) => {
      const isInputElement = ['INPUT', 'TEXTAREA'].includes(e.target.tagName);
      const isScannerInput = e.target.dataset?.scanner === 'true';

      if (isInputElement && !isScannerInput) return;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        const codigo = bufferRef.current.trim();

        if (codigo.length >= minLength && codigo.length <= maxLength) {
          await procesarEscaneo(codigo);
        }

        bufferRef.current = '';
        return;
      }

      if (e.key.length === 1) {
        // Evitar que el carácter se escriba en el input del escáner
        if (isScannerInput) {
          e.preventDefault();
        }

        bufferRef.current += e.key;

        timeoutRef.current = setTimeout(async () => {
          const codigo = bufferRef.current.trim();

          if (codigo.length >= minLength && codigo.length <= maxLength) {
            await procesarEscaneo(codigo);
          }

          bufferRef.current = '';
        }, timeout);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, minLength, maxLength, timeout, procesarEscaneo]);

  // Cerrar AudioContext al desmontar
  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const escanearManual = useCallback(async (codigo) => {
    await procesarEscaneo(codigo);
  }, [procesarEscaneo]);

  return {
    scanning,
    lastScan,
    escanearManual
  };
};
