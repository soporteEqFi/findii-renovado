import React from 'react';
import { CampoDinamico } from './CampoDinamico';
import { EsquemaCampo } from '../../types/esquemas';

interface FormularioDinamicoProps {
  esquema: EsquemaCampo[];
  valores: Record<string, any>;
  onChange: (key: string, value: any) => void;
  errores?: Record<string, string>;
  disabled?: boolean;
  titulo?: string;
  className?: string;
}

export const FormularioDinamico: React.FC<FormularioDinamicoProps> = ({
  esquema,
  valores,
  onChange,
  errores = {},
  disabled = false,
  titulo,
  className = ''
}) => {
  if (!esquema || esquema.length === 0) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        No hay campos dinámicos configurados
      </div>
    );
  }

  // Función para determinar si un campo debe mostrarse basado en condiciones
  const shouldShowField = (campo: any): boolean => {
    if (!campo.conditional_on) return true;

    const { field: triggerField, value: expectedValue } = campo.conditional_on;
    const actualValue = valores[triggerField];

    return actualValue === expectedValue;
  };

  // Filtrar campos según condiciones
  const camposVisibles = esquema.filter(shouldShowField);

  return (
    <div className={`space-y-4 ${className}`}>
      {titulo && (
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-3">
          {titulo}
        </h3>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {camposVisibles.map((campo) => (
          <CampoDinamico
            key={campo.key}
            campo={campo}
            value={valores[campo.key]}
            onChange={onChange}
            error={errores[campo.key]}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
};
