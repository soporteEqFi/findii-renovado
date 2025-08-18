import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Save, Loader2, RefreshCw } from 'lucide-react';
import { useUnifiedCamposDinamicos } from '../../hooks/useUnifiedCamposDinamicos';
import { FormularioDinamico } from '../ui/FormularioDinamico';
import Button from '../ui/Button';

interface FormularioUnificadoProps {
  entidad: string;
  campoJson: string;
  recordId?: number;
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
  titulo?: string;
}

/**
 * 🎯 FORMULARIO UNIFICADO SIMPLIFICADO
 *
 * ✅ Usa SOLO el hook unificado
 * ✅ Sin llamados duplicados
 * ✅ Manejo de errores simplificado
 * ✅ Cache automático
 *
 * REEMPLAZA: FormularioDinamicoMejorado y otros componentes similares
 */
export const FormularioUnificado: React.FC<FormularioUnificadoProps> = ({
  entidad,
  campoJson,
  recordId,
  onSuccess,
  onCancel,
  titulo
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [datosIniciales, setDatosIniciales] = useState<Record<string, any>>({});

  // 🎯 UN SOLO HOOK - Sin duplicados
  const {
    camposDinamicos,
    loading,
    error,
    leerDatos,
    guardarDatosInteligente,
    refetch
  } = useUnifiedCamposDinamicos(entidad, campoJson);

  // Cargar datos existentes si es edición
  useEffect(() => {
    if (recordId && camposDinamicos.length > 0) {
      cargarDatosExistentes();
    }
  }, [recordId, camposDinamicos]);

  const cargarDatosExistentes = async () => {
    try {
      const datos = await leerDatos(recordId!);
      setDatosIniciales(datos);
      setFormData(datos);
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
    camposDinamicos.forEach(campo => {
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

    if (!recordId) {
      toast.error('ID de registro requerido para guardar');
      return;
    }

    setSaving(true);

    try {
      // 🚀 UNA SOLA LLAMADA con validación inteligente
      const resultado = await guardarDatosInteligente(recordId, formData);

      toast.success(recordId ? 'Datos actualizados correctamente' : 'Datos guardados correctamente');

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

  const handleReset = () => {
    setFormData(datosIniciales);
    setErrores({});
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Cargando esquema...</span>
      </div>
    );
  }

  // Error state
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

  // No fields state
  if (!camposDinamicos || camposDinamicos.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <div className="text-gray-600">No hay campos dinámicos configurados para esta entidad</div>
        <div className="text-sm text-gray-500 mt-2">
          Entidad: {entidad} | Campo: {campoJson}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Título */}
      {titulo && (
        <div className="border-b pb-4">
          <h3 className="text-lg font-medium text-gray-900">{titulo}</h3>
          <div className="text-sm text-gray-500 mt-1">
            {entidad} → {campoJson}
          </div>
        </div>
      )}

      {/* Campos Dinámicos */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-800 border-b pb-2">
          Campos Dinámicos
          <span className="text-sm text-gray-500 font-normal ml-2">
            ({camposDinamicos.length} campos)
          </span>
        </h4>
        <FormularioDinamico
          esquema={camposDinamicos}
          valores={formData}
          onChange={handleFieldChange}
          errores={errores}
          disabled={saving}
        />
      </div>

      {/* Botones de acción */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div className="flex space-x-2">
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
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={saving || !recordId}
          >
            Restablecer
          </Button>
        </div>

        <Button
          type="submit"
          disabled={saving || !recordId}
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

      {/* Debug info en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <details className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <summary className="text-sm font-medium text-gray-800 cursor-pointer">
            🐛 Debug Info (Solo desarrollo)
          </summary>
          <div className="mt-2 space-y-2 text-xs">
            <div><strong>Entidad:</strong> {entidad}</div>
            <div><strong>Campo JSON:</strong> {campoJson}</div>
            <div><strong>Record ID:</strong> {recordId || 'No definido'}</div>
            <div><strong>Campos dinámicos:</strong> {camposDinamicos.length}</div>
            <div><strong>Datos actuales:</strong></div>
            <pre className="bg-white p-2 rounded border text-xs overflow-auto max-h-32">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>
        </details>
      )}
    </form>
  );
};

export default FormularioUnificado;
