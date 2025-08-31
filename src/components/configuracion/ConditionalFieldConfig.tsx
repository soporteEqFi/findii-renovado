import React, { useState } from 'react';
import { EsquemaCampo } from '../../types/esquemas';

interface ConditionalFieldConfigProps {
  campo: EsquemaCampo;
  camposDisponibles: EsquemaCampo[];
  onSave: (campoKey: string, conditionalConfig: any) => void;
  onCancel: () => void;
}

export const ConditionalFieldConfig: React.FC<ConditionalFieldConfigProps> = ({
  campo,
  camposDisponibles,
  onSave,
  onCancel
}) => {
  const [campoActivador, setCampoActivador] = useState(campo.conditional_on?.field || '');
  const [valorEsperado, setValorEsperado] = useState(campo.conditional_on?.value || '');

  // Filtrar campos que pueden ser activadores (excluir el campo actual)
  const camposActivadores = camposDisponibles.filter(c => c.key !== campo.key);

  // Obtener valores posibles del campo activador seleccionado
  const campoActivadorSeleccionado = camposActivadores.find(c => c.key === campoActivador);
  const valoresPosibles = Array.isArray(campoActivadorSeleccionado?.list_values)
    ? campoActivadorSeleccionado?.list_values
    : (campoActivadorSeleccionado?.list_values as any)?.enum || [];

  const handleSave = () => {
    const conditionalConfig = {
      field: campoActivador,
      value: valorEsperado
    };

    onSave(campo.key, conditionalConfig);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Configurar Condición para: <span className="text-blue-600">{campo.description || campo.key}</span>
      </h3>

      <div className="space-y-4">
        {/* Campo Activador */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campo Activador
          </label>
          <select
            value={campoActivador}
            onChange={(e) => setCampoActivador(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sin condición (siempre visible)</option>
            {camposActivadores.map(c => (
              <option key={c.key} value={c.key}>
                {c.description || c.key}
              </option>
            ))}
          </select>
        </div>

        {/* Valor Esperado */}
        {campoActivador && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor Esperado
            </label>
            {valoresPosibles.length > 0 ? (
              <select
                value={valorEsperado}
                onChange={(e) => setValorEsperado(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar valor...</option>
                {valoresPosibles.map((valor: string) => (
                  <option key={valor} value={valor}>{valor}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={valorEsperado}
                onChange={(e) => setValorEsperado(e.target.value)}
                placeholder="Ingrese el valor esperado"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        )}

        {/* Vista previa de la condición */}
        {campoActivador && (
          <div className="bg-gray-50 p-3 rounded-md">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Vista previa de la condición:</h4>
            <p className="text-sm text-gray-600">
              Mostrar "{campo.description || campo.key}" cuando "{campoActivadorSeleccionado?.description || campoActivador}" sea igual a "{valorEsperado}"
            </p>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
        >
          Guardar Condición
        </button>
      </div>
    </div>
  );
};
