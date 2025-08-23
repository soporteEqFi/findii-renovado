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
    // Ocultar el campo de estado en el formulario de solicitud
    if (campo.key === 'estado') {
      return false;
    }

    if (!campo.conditional_on) return true;

    const { field: triggerField, value: expectedValue } = campo.conditional_on;
    const actualValue = valores[triggerField];

    return actualValue === expectedValue;
  };

  // Filtrar campos fijos y dinámicos según condiciones
  const camposFijosVisibles = esquemaCompleto.campos_fijos.filter(shouldShowField);
  const camposDinamicosVisibles = esquemaCompleto.campos_dinamicos.filter(shouldShowField);

  // Crear un array ordenado insertando los campos dinámicos después de sus campos activadores
  const todosLosCampos: any[] = [];

  // Primero agregar todos los campos fijos
  camposFijosVisibles.forEach(campoFijo => {
    todosLosCampos.push(campoFijo);

    // Buscar campos dinámicos que se activen con este campo fijo
    const camposDinamicosRelacionados = camposDinamicosVisibles.filter(campoDinamico =>
      campoDinamico.conditional_on?.field === campoFijo.key
    );

    // Insertar los campos dinámicos relacionados justo después del campo fijo
    todosLosCampos.push(...camposDinamicosRelacionados);
  });

  // Agregar campos dinámicos que no tienen campo activador específico al final
  const camposDinamicosSinActivador = camposDinamicosVisibles.filter(campoDinamico =>
    !camposFijosVisibles.some(campoFijo => campoFijo.key === campoDinamico.conditional_on?.field)
  );

  todosLosCampos.push(...camposDinamicosSinActivador);

  return (
    <div className="space-y-6">
      {titulo && (
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
          {titulo}
        </h3>
      )}

      {/* TODOS LOS CAMPOS JUNTOS (FIJOS Y DINÁMICOS) */}
      {todosLosCampos.length > 0 && (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem'}}>
          {todosLosCampos.map(campo => (
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
      )}
    </div>
  );
};
