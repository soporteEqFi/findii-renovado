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
  // Estados disponibles para el campo estado
  estadosDisponibles?: string[];
}

export const FormularioDinamico: React.FC<FormularioDinamicoProps> = ({
  esquema,
  valores,
  onChange,
  errores = {},
  disabled = false,
  titulo,
  className = '',
  estadosDisponibles = []
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

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem'}}>
        {camposVisibles.map((campo) => (
          <CampoDinamico
            key={campo.key}
            campo={campo}
            value={valores[campo.key]}
            onChange={onChange}
            error={errores[campo.key]}
            disabled={disabled}
            estadosDisponibles={estadosDisponibles}
          />
        ))}
      </div>
    </div>
  );
};
