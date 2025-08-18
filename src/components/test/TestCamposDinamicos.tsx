import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { diagnostico } from '../../utils/diagnosticoCamposDinamicos';
import { camposDinamicosAPI } from '../../services/camposDinamicosService';
import { useCamposDinamicos } from '../../hooks/useCamposDinamicos';

/**
 * Componente de prueba para diagnosticar problemas con campos dinámicos
 */
export const TestCamposDinamicos: React.FC = () => {
  const [entidad, setEntidad] = useState('solicitante');
  const [recordId, setRecordId] = useState(1);
  const [campoJson, setCampoJson] = useState('info_extra');
  const [resultado, setResultado] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const {
    esquemaCompleto,
    esquemaJSON,
    loading: hookLoading,
    error: hookError,
    guardarDatos
  } = useCamposDinamicos(entidad, campoJson);

  const ejecutarDiagnostico = async () => {
    setLoading(true);
    setResultado('Ejecutando diagnóstico... (revisa la consola del navegador)');

    try {
      console.clear();
      await diagnostico.ejecutarDiagnosticoCompleto(entidad, recordId, campoJson);
      setResultado('✅ Diagnóstico completado. Revisa la consola del navegador para ver los resultados detallados.');
    } catch (error) {
      setResultado(`❌ Error ejecutando diagnóstico: ${error instanceof Error ? error.message : 'desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const probarActualizacion = async () => {
    setLoading(true);
    setResultado('Probando actualización...');

    try {
      const datosTest = {
        test_campo: 'Valor de prueba',
        timestamp: new Date().toISOString(),
        test_numero: 42
      };

      const resultado = await guardarDatos(recordId, datosTest, true);
      setResultado(`✅ Actualización exitosa: ${JSON.stringify(resultado, null, 2)}`);
    } catch (error) {
      setResultado(`❌ Error en actualización: ${error instanceof Error ? error.message : 'desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const probarEsquema = async () => {
    setLoading(true);
    setResultado('Probando carga de esquema...');

    try {
      const esquema = await camposDinamicosAPI.obtenerEsquemaCompleto(entidad);
      setResultado(`✅ Esquema cargado exitosamente: ${JSON.stringify(esquema, null, 2)}`);
    } catch (error) {
      setResultado(`❌ Error cargando esquema: ${error instanceof Error ? error.message : 'desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        🧪 Test de Campos Dinámicos
      </h2>

      {/* Configuración */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Entidad
          </label>
          <select
            value={entidad}
            onChange={(e) => setEntidad(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full"
            disabled={loading}
          >
            <option value="solicitante">Solicitante</option>
            <option value="ubicacion">Ubicación</option>
            <option value="actividad_economica">Actividad Económica</option>
            <option value="informacion_financiera">Información Financiera</option>
            <option value="referencia">Referencia</option>
            <option value="solicitud">Solicitud</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Record ID
          </label>
          <input
            type="number"
            value={recordId}
            onChange={(e) => setRecordId(parseInt(e.target.value) || 1)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full"
            min="1"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Campo JSON
          </label>
          <input
            type="text"
            value={campoJson}
            onChange={(e) => setCampoJson(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full"
            placeholder="info_extra"
            disabled={loading}
          />
        </div>
      </div>

      {/* Estado del Hook */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-800 mb-2">Estado del Hook:</h3>
        <div className="text-sm text-gray-600">
          <div>Loading: {hookLoading ? '⏳' : '✅'}</div>
          <div>Error: {hookError || 'None'}</div>
          <div>Esquema completo: {esquemaCompleto ? '✅' : '❌'}</div>
          <div>Campos dinámicos: {esquemaJSON.length}</div>
        </div>
      </div>

      {/* Botones de prueba */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Button
          onClick={ejecutarDiagnostico}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          🔍 Diagnóstico Completo
        </Button>

        <Button
          onClick={probarEsquema}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700"
        >
          📋 Probar Esquema
        </Button>

        <Button
          onClick={probarActualizacion}
          disabled={loading}
          className="bg-orange-600 hover:bg-orange-700"
        >
          💾 Probar Actualización
        </Button>
      </div>

      {/* Resultado */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-800 mb-2">Resultado:</h3>
        <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-96 whitespace-pre-wrap">
          {loading ? '⏳ Procesando...' : resultado || 'No hay resultados aún'}
        </pre>
      </div>

      {/* Información útil */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">ℹ️ Información de Diagnóstico:</h3>
        <div className="text-sm text-blue-700">
          <p>• <strong>Diagnóstico Completo:</strong> Prueba todos los endpoints y métodos HTTP</p>
          <p>• <strong>Probar Esquema:</strong> Verifica que se puede cargar la configuración de campos</p>
          <p>• <strong>Probar Actualización:</strong> Intenta guardar datos de prueba</p>
          <p>• Los resultados detallados aparecen en la <strong>consola del navegador</strong> (F12)</p>
        </div>
      </div>

      {/* Comandos de consola */}
      <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-800 mb-2">🖥️ Comandos de Consola:</h3>
        <div className="text-sm text-gray-600 font-mono">
          <p>diagnostico.ejecutarDiagnosticoCompleto('{entidad}', {recordId}, '{campoJson}')</p>
          <p>diagnostico.verificarConfiguracion()</p>
          <p>diagnostico.probarEndpoints('{entidad}', {recordId}, '{campoJson}')</p>
        </div>
      </div>
    </div>
  );
};

export default TestCamposDinamicos;
