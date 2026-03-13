import { createContext, useState, useEffect } from 'react';
import configuracionService from '../../modules/configuracion/services/configuracion.service';

export const ConfiguracionContext = createContext();

export const ConfiguracionProvider = ({ children }) => {
  const [configuraciones, setConfiguraciones] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarConfiguracionesPublicas();
  }, []);

  const cargarConfiguracionesPublicas = async () => {
    try {
      setLoading(true);
      const response = await configuracionService.getPublicas();
      setConfiguraciones(response.data);
    } catch (error) {
      console.error('Error al cargar configuraciones públicas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConfig = (clave, valorPorDefecto = null) => {
    return configuraciones[clave] ?? valorPorDefecto;
  };

  const getIVA = () => {
    return parseFloat(configuraciones.impuesto_iva) || 12;
  };

  const getDatosEmpresa = () => {
    return {
      nombre: configuraciones.empresa_nombre,
      razon_social: configuraciones.empresa_razon_social,
      ruc: configuraciones.empresa_ruc,
      direccion: configuraciones.empresa_direccion,
      ciudad: configuraciones.empresa_ciudad,
      pais: configuraciones.empresa_pais,
      telefono: configuraciones.empresa_telefono,
      celular: configuraciones.empresa_celular,
      email: configuraciones.empresa_email,
      sitio_web: configuraciones.empresa_sitio_web,
      logo: configuraciones.empresa_logo
    };
  };

  const getMoneda = () => {
    return {
      codigo: configuraciones.sistema_moneda || 'USD',
      simbolo: configuraciones.sistema_simbolo_moneda || '$'
    };
  };

  return (
    <ConfiguracionContext.Provider
      value={{
        configuraciones,
        loading,
        getConfig,
        getIVA,
        getDatosEmpresa,
        getMoneda,
        recargar: cargarConfiguracionesPublicas
      }}
    >
      {children}
    </ConfiguracionContext.Provider>
  );
};