import { useContext } from 'react';
import { ConfiguracionContext } from '../context/ConfiguracionContext';

export const useConfiguracion = () => {
  const context = useContext(ConfiguracionContext);
  
  if (!context) {
    throw new Error('useConfiguracion debe usarse dentro de ConfiguracionProvider');
  }
  
  return context;
};