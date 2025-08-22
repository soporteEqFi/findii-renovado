import React from 'react';
import { EsquemaCompleto } from '../../hooks/useEsquemaCompleto';
import { CampoDinamico } from './CampoDinamico';

interface FormularioCompletoProps {
  esquemaCompleto: EsquemaCompleto;
  valores: Record<string, any>;
  onChange: (key: string, value: any) => void;
  errores?: Record<string, string>;
  titulo?: string;
  disabled?: boolean;
}

export const FormularioCompleto: React.FC<FormularioCompletoProps> = ({
  esquemaCompleto,
  valores,
  onChange,
  errores = {},
  titulo,
  disabled = false
}) => {
  const handleFieldChange = (key: string, value: any) => {
    onChange(key, value);
  };

  // Función para determinar si un campo debe mostrarse basado en condiciones
  const shouldShowField = (campo: any): boolean => {
    // Debug: Mostrar TODOS los campos para ver su estructura
    console.log('🔍 DEBUG CAMPO:', {
      campo: campo.key,
      conditional_on: campo.conditional_on,
      tiene_conditional_on: !!campo.conditional_on,
      titulo: titulo
    });

    if (!campo.conditional_on) return true;

    const { field: triggerField, value: expectedValue } = campo.conditional_on;
    const actualValue = valores[triggerField];

    console.log('🔍 DEBUG CONDICIONAL FormularioCompleto:', {
      campo: campo.key,
      conditional_on: campo.conditional_on,
      triggerField,
      expectedValue,
      actualValue,
      shouldShow: actualValue === expectedValue,
      titulo: titulo
    });

    return actualValue === expectedValue;
  };

  // Filtrar campos fijos y dinámicos según condiciones
  const camposFijosVisibles = esquemaCompleto.campos_fijos.filter(shouldShowField);
  const camposDinamicosVisibles = esquemaCompleto.campos_dinamicos.filter(shouldShowField);

  return (
    <div className="space-y-6">
      {titulo && (
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
          {titulo}
        </h3>
      )}

      {/* SECCIÓN: CAMPOS FIJOS */}
      {camposFijosVisibles.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-800">Información Básica</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {camposFijosVisibles.map(campo => (
              <CampoDinamico
                key={campo.key}
                campo={campo}
                value={valores[campo.key]}
                onChange={handleFieldChange}
                error={errores[campo.key]}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      )}

      {/* SECCIÓN: CAMPOS DINÁMICOS */}
      {camposDinamicosVisibles.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-800">Información Adicional</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {camposDinamicosVisibles.map(campo => (
              <CampoDinamico
                key={campo.key}
                campo={campo}
                value={valores[campo.key]}
                onChange={handleFieldChange}
                error={errores[campo.key]}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      )}

      {/* Información de debug */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs">
          <p><strong>Debug:</strong> {esquemaCompleto.total_campos} campos totales</p>
          <p>Fijos: {esquemaCompleto.campos_fijos.length} | Dinámicos: {esquemaCompleto.campos_dinamicos.length}</p>
          <p>Tabla: {esquemaCompleto.tabla} | JSON Column: {esquemaCompleto.json_column}</p>
        </div>
      )}
    </div>
  );
};
