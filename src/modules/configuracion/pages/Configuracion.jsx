import { useState, useEffect } from 'react';
import { useNotification } from '../../../shared/hooks/useNotification';
import configuracionService from '../services/configuracion.service';
import Loading from '../../../shared/components/UI/Loading';
import HeaderConfiguracion from '../components/HeaderConfiguracion';
import CategoriaSelector from '../components/CategoriaSelector';
import FormularioConfiguracion from '../components/FormularioConfiguracion';

const Configuracion = () => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configuraciones, setConfiguraciones] = useState({});
  const [cambiosPendientes, setCambiosPendientes] = useState({});
  const [categoriaActiva, setCategoriaActiva] = useState('empresa');

  useEffect(() => {
    cargarConfiguraciones();
  }, []);

  const cargarConfiguraciones = async () => {
    try {
      setLoading(true);
      const response = await configuracionService.getAll();
      setConfiguraciones(response.data);
      setCambiosPendientes({});
    } catch (error) {
      showError('Error al cargar configuraciones');
    } finally {
      setLoading(false);
    }
  };

  const handleCampoChange = (clave, valor, tipo) => {
    // Parsear valor según tipo
    let valorParseado = valor;
    
    if (tipo === 'numero' || tipo === 'porcentaje') {
      valorParseado = parseFloat(valor) || 0;
    } else if (tipo === 'boolean') {
      valorParseado = valor === 'true' || valor === true;
    }

    setCambiosPendientes({
      ...cambiosPendientes,
      [clave]: valorParseado
    });
  };

  const handleGuardar = async () => {
    const cambios = Object.keys(cambiosPendientes).map(clave => ({
      clave,
      valor: cambiosPendientes[clave]
    }));

    if (cambios.length === 0) {
      showError('No hay cambios para guardar');
      return;
    }

    try {
      setSaving(true);
      await configuracionService.updateMultiple(cambios);
      showSuccess('Configuraciones guardadas exitosamente');
      await cargarConfiguraciones();
    } catch (error) {
      showError('Error al guardar configuraciones');
    } finally {
      setSaving(false);
    }
  };

  const handleRestaurar = () => {
    if (Object.keys(cambiosPendientes).length === 0) {
      return;
    }

    if (window.confirm('¿Descartar todos los cambios no guardados?')) {
      setCambiosPendientes({});
    }
  };

  const handleCategoriaChange = (categoria) => {
    setCategoriaActiva(categoria);
  };

  // Calcular cambios por categoría
  const calcularCambiosPorCategoria = () => {
    const cambiosPorCategoria = {};
    
    Object.keys(configuraciones).forEach(categoria => {
      const configs = configuraciones[categoria] || [];
      cambiosPorCategoria[categoria] = configs.filter(config => 
        cambiosPendientes.hasOwnProperty(config.clave)
      ).length;
    });

    return cambiosPorCategoria;
  };

  if (loading) {
    return <Loading message="Cargando configuraciones..." />;
  }

  const configsCategoria = configuraciones[categoriaActiva] || [];
  const cambiosPorCategoria = calcularCambiosPorCategoria();

  return (
    <div className="space-y-6 animate-fade-in">
      <HeaderConfiguracion
        totalCambios={Object.keys(cambiosPendientes).length}
        onGuardar={handleGuardar}
        onRestaurar={handleRestaurar}
        guardando={saving}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Categorías */}
        <div className="lg:col-span-1">
          <CategoriaSelector
            categoriaActiva={categoriaActiva}
            onCategoriaChange={handleCategoriaChange}
            categoriasCambios={cambiosPorCategoria}
          />
        </div>

        {/* Contenido - Configuraciones */}
        <div className="lg:col-span-3">
          <FormularioConfiguracion
            categoria={categoriaActiva}
            configuraciones={configsCategoria}
            cambiosPendientes={cambiosPendientes}
            onCampoChange={handleCampoChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Configuracion;