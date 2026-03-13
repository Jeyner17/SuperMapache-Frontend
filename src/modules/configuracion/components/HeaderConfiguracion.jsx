import Button from '../../../shared/components/UI/Button';
import Badge from '../../../shared/components/UI/Badge';
import { Save, RotateCcw } from 'lucide-react';

const HeaderConfiguracion = ({ 
  totalCambios, 
  onGuardar, 
  onRestaurar,
  guardando = false 
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Configuración del Sistema
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Personaliza el comportamiento global del sistema
        </p>
      </div>

      {totalCambios > 0 && (
        <div className="flex gap-3">
          <Badge variant="warning" size="lg">
            {totalCambios} cambio(s) sin guardar
          </Badge>
          <Button variant="secondary" onClick={onRestaurar}>
            <RotateCcw size={18} />
            Descartar
          </Button>
          <Button onClick={onGuardar} loading={guardando}>
            <Save size={18} />
            Guardar Cambios
          </Button>
        </div>
      )}
    </div>
  );
};

export default HeaderConfiguracion;