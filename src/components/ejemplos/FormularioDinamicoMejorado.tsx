import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Save, Loader2, RefreshCw } from 'lucide-react';
import { useCamposDinamicos } from '../../hooks/useCamposDinamicos';
import { FormularioDinamico } from '../ui/FormularioDinamico';
import { Button } from '../ui/Button';

interface FormularioDinamicoMejoradoProps {
  entidad: string;
  campoJson: string;
  recordId?: number; // Si existe, es edición; si no, es creación
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
}

/**
 * Componente de ejemplo que usa el nuevo servicio optimizado
 * basado en la guía de campos dinámicos
 */
export const FormularioDinamicoMejorado: React.FC<FormularioDinamicoMejoradoProps> = ({
  entidad,
  campoJson,
  recordId,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Usar el hook optimizado con esquema completo
  const {
    esquemaCompleto,
    esquemaJSON,
    loading,
    error,
    refetch,
    leerDatos,
    guardarDatos,
    filtrarDatos,
    validarDatos
  } = useCamposDinamicos(entidad, campoJson, true);

  // Cargar datos existentes si es edición
  React.useEffect(() => {
    if (recordId && esquemaJSON.length > 0) {
      cargarDatosExistentes();
    }
  }, [recordId, esquemaJSON]);

  const cargarDatosExistentes = async () => {
    try {
      const datos = await leerDatos(recordId!);
      setFormData(datos || {});
    } catch (err) {
      console.error('Error cargando datos existentes:', err);
      toast.error('Error al cargar los datos existentes');
    }
  };

  const handleFieldChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));

    // Limpiar errores del campo
    if (errores[key]) {
      setErrores(prev => ({ ...prev, [key]: '' }));
    }
  };

  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    // Validar campos requeridos
    esquemaJSON.forEach(campo => {
      if (campo.required && (!formData[campo.key] || formData[campo.key] === '')) {
        nuevosErrores[campo.key] = `${campo.description || campo.key} es requerido`;
      }
    });

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      toast.error('Por favor, corrige los errores en el formulario');
      return;
    }

    setSaving(true);

    try {
      // Filtrar solo campos con valor
      const datosLimpios = filtrarDatos(formData);

      // Validar tipos según esquema
      const datosValidados = validarDatos(datosLimpios);

      let resultado;

      if (recordId) {
        // Actualizar registro existente
        resultado = await guardarDatos(recordId, datosValidados, true);
        toast.success('Datos actualizados correctamente');
      } else {
        // Para crear nuevo registro, necesitaríamos primero crear el registro base
        // y luego guardar los campos dinámicos
        toast.error('Creación de nuevos registros no implementada en este ejemplo');
        return;
      }

      if (onSuccess) {
        onSuccess(resultado);
      }
    } catch (err) {
      console.error('Error guardando formulario:', err);
      toast.error(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Cargando esquema...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="text-red-800 font-medium mb-2">Error al cargar el esquema</div>
        <div className="text-red-600 text-sm mb-4">{error}</div>
        <Button
          onClick={refetch}
          variant="outline"
          size="sm"
          className="border-red-300 text-red-700 hover:bg-red-50"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  if (!esquemaJSON || esquemaJSON.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <div className="text-gray-600">No hay campos dinámicos configurados para esta entidad</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      Información del esquema para debug
      {process.env.NODE_ENV === 'development' && esquemaCompleto && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm font-medium text-blue-800 mb-2">
            Debug - Esquema Completo
          </div>
          <div className="text-xs text-blue-600">
            <div>Entidad: {esquemaCompleto.entidad}</div>
            <div>Tabla: {esquemaCompleto.tabla}</div>
            <div>Campo JSON: {esquemaCompleto.json_column}</div>
            <div>Campos fijos: {esquemaCompleto.campos_fijos?.length || 0}</div>
            <div>Campos dinámicos: {esquemaCompleto.campos_dinamicos?.length || 0}</div>
          </div>
        </div>
      )}

      {/* Campos Fijos (si existen) */}
      {esquemaCompleto?.campos_fijos && esquemaCompleto.campos_fijos.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
            Información Básica
          </h3>
          <FormularioDinamico
            esquema={esquemaCompleto.campos_fijos}
            valores={formData}
            onChange={handleFieldChange}
            errores={errores}
            disabled={saving}
          />
        </div>
      )}

      {/* Campos Dinámicos */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          Información Adicional
        </h3>
        <FormularioDinamico
          esquema={esquemaJSON}
          valores={formData}
          onChange={handleFieldChange}
          errores={errores}
          disabled={saving}
        />
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={saving}
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {recordId ? 'Actualizar' : 'Guardar'}
            </>
          )}
        </Button>
      </div>

      {/* Debug de datos para desarrollo */}
      {process.env.NODE_ENV === 'development' && Object.keys(formData).length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-800 mb-2">
            Debug - Datos del Formulario
          </div>
          <pre className="text-xs text-gray-600 overflow-auto">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      )}
    </form>
  );
};

export default FormularioDinamicoMejorado;
