import React from 'react';
import { EsquemaCampo } from '../../types/esquemas';

interface DebugFormularioProps {
  esquema: EsquemaCampo[];
  title?: string;
}

export const DebugFormulario: React.FC<DebugFormularioProps> = ({
  esquema,
  title = "🔍 Debug Esquema"
}) => {
  return (
    <div style={{background: '#f0f0f0', padding: '10px', margin: '10px', borderRadius: '8px'}}>
      <h4 style={{margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold'}}>{title}:</h4>
      {esquema.map(campo => (
        <div key={campo.key} style={{marginBottom: '8px', fontSize: '12px'}}>
          <strong>{campo.key}</strong> ({campo.type})
          {campo.required && <span style={{color: 'red'}}> *</span>}
          {campo.description && (
            <div style={{color: '#666', marginLeft: '10px'}}>
              {campo.description}
            </div>
          )}
          {campo.list_values && (
            <div style={{fontSize: '11px', marginLeft: '20px', color: '#333'}}>
              <strong>list_values:</strong>
              <div style={{marginLeft: '10px', background: '#fff', padding: '5px', borderRadius: '4px', border: '1px solid #ddd'}}>
                {/* Tipos válidos específicos */}
                {campo.type === 'array' && campo.list_values && typeof campo.list_values === 'object' && 'enum' in campo.list_values && (
                  <div style={{color: '#ff9900'}}>
                    <strong>Array con enum:</strong> {((campo.list_values as any).enum as string[]).join(', ')}
                  </div>
                )}
                {campo.type === 'object' && campo.list_values && typeof campo.list_values === 'object' && 'object_structure' in campo.list_values && (
                  <div style={{color: '#0066cc'}}>
                    <strong>Object con estructura:</strong>
                    {((campo.list_values as any).object_structure as any[]).map((subcampo: any) => (
                      <div key={subcampo.key} style={{marginLeft: '10px', fontSize: '10px'}}>
                        • {subcampo.key} ({subcampo.type}) {subcampo.required && '*'}
                      </div>
                    ))}
                  </div>
                )}

                {/* Formatos de compatibilidad para strings */}
                {campo.type === 'string' && campo.list_values && typeof campo.list_values === 'object' && 'enum' in campo.list_values && (
                  <div style={{color: '#009900'}}>
                    <strong>String con enum (compatibilidad):</strong> {((campo.list_values as any).enum as string[]).join(', ')}
                  </div>
                )}
                {campo.type === 'string' && Array.isArray(campo.list_values) && (
                  <div style={{color: '#009900'}}>
                    <strong>String con array (compatibilidad):</strong> {(campo.list_values as string[]).join(', ')}
                  </div>
                )}

                {/* Mostrar tipos no válidos como advertencia */}
                {campo.type === 'array' && campo.list_values && typeof campo.list_values === 'object' && !('enum' in campo.list_values) && (
                  <div style={{color: '#cc0000'}}>
                    <strong>⚠️ Array inválido:</strong> No tiene formato enum
                  </div>
                )}
                {campo.type === 'object' && campo.list_values && typeof campo.list_values === 'object' && !('object_structure' in campo.list_values) && (
                  <div style={{color: '#cc0000'}}>
                    <strong>⚠️ Object inválido:</strong> No tiene object_structure
                  </div>
                )}
                <pre style={{fontSize: '10px', color: '#666', margin: '5px 0'}}>{JSON.stringify(campo.list_values, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// // Función de diagnóstico para usar en consola
// export const diagnosticarEsquema = async (entidad: string, campoJson: string, empresaId: number = 1) => {
//   try {
//     const response = await fetch(`http://localhost:5000/json/schema/${entidad}/${campoJson}?empresa_id=${empresaId}`);
//     const result = await response.json();

//     if (result.data) {
//       result.data.forEach((campo: EsquemaCampo) => {
//         console.log(`\n${campo.key} (${campo.type}):`);
//         console.log('  list_values:', campo.list_values);
//         console.log('  tipo de list_values:', typeof campo.list_values);

//         if (campo.type === 'object' && campo.list_values) {
//           console.log('  ✓ Es array?', Array.isArray(campo.list_values));
//           if (Array.isArray(campo.list_values)) {
//             console.log('  ✓ Primer item:', campo.list_values[0]);
//           }
//         }

//         if (campo.type === 'array' && campo.list_values) {
//           console.log('  ✓ Tiene item_structure?', !!(campo.list_values as any).item_structure);
//           if ((campo.list_values as any).item_structure) {
//             console.log('  ✓ Item structure:', (campo.list_values as any).item_structure);
//           }
//         }
//       });
//     }
//   } catch (error) {
//     console.error('Error en diagnóstico:', error);
//   }
// };
