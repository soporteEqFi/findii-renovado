import React, { useState, useRef } from 'react';
import { Upload, File, X as XIcon, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useEsquemasCompletos } from '../../hooks/useEsquemasCompletos';
import { FormularioCompleto } from '../ui/FormularioCompleto';
import { esquemaService } from '../../services/esquemaService';
import { DebugFormulario } from '../ui/DebugFormulario';

interface CustomerFormDinamicoProps {
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export const CustomerFormDinamico: React.FC<CustomerFormDinamicoProps> = ({
  onSubmit,
  onCancel,
  isLoading
}) => {
  // Estados para todos los campos (base + dinámicos)
  const [datosFormulario, setDatosFormulario] = useState<Record<string, any>>({});
  const [errores, setErrores] = useState<Record<string, string>>({});

  // Estados para archivos y checkboxes
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [aceptaAcuerdoFirma, setAceptaAcuerdoFirma] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);



  // Configuración de esquemas completos - consultar campos fijos + dinámicos
  const esquemasConfig = [
    { entidad: 'solicitante' },
    { entidad: 'ubicacion' },
    { entidad: 'actividad_economica' },
    { entidad: 'informacion_financiera' },
    { entidad: 'referencia' },
    { entidad: 'solicitud' }
  ];

  const { esquemas, loading: esquemasLoading, error: esquemasError } = useEsquemasCompletos(esquemasConfig);

  // Manejar cambios en todos los campos
  const handleFieldChange = (key: string, value: any) => {
    setDatosFormulario(prev => ({ ...prev, [key]: value }));
    // Limpiar error del campo
    if (errores[key]) {
      setErrores(prev => ({ ...prev, [key]: '' }));
    }
  };



  // Manejo de archivos
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar checkboxes
    if (!aceptaTerminos) {
      toast.error('Debes aceptar los términos y condiciones de uso para continuar');
      return;
    }

    if (!aceptaAcuerdoFirma) {
      toast.error('Debes aceptar el acuerdo de firma para continuar');
      return;
    }

        try {
      // 1. Crear solicitante completo (campos fijos + dinámicos)
      const solicitanteData = {
        ...datosFormulario,
        created_by_user_id: parseInt(localStorage.getItem('user_id') || '1')
      };

      const solicitante = await esquemaService.crearRegistroCompleto(
        'solicitante',
        solicitanteData,
        esquemas.solicitante?.esquema,
        1
      );
      const solicitanteId = solicitante.id;

      // 2. Crear ubicación completa
      const ubicacionData = {
        ...datosFormulario,
        solicitante_id: solicitanteId
      };

      const ubicacion = await esquemaService.crearRegistroCompleto(
        'ubicacion',
        ubicacionData,
        esquemas.ubicacion?.esquema,
        1
      );
      const ubicacionId = ubicacion.id;

      // 3. Crear actividad económica completa
      const actividadData = {
        ...datosFormulario,
        solicitante_id: solicitanteId
      };

      const actividad = await esquemaService.crearRegistroCompleto(
        'actividad_economica',
        actividadData,
        esquemas.actividad_economica?.esquema,
        1
      );
      const actividadId = actividad.id;

      // 4. Crear información financiera completa
      const financieraData = {
        ...datosFormulario,
        solicitante_id: solicitanteId
      };

      const financiera = await esquemaService.crearRegistroCompleto(
        'informacion_financiera',
        financieraData,
        esquemas.informacion_financiera?.esquema,
        1
      );
      const financieraId = financiera.id;

      // 5. Crear referencia completa
      const referenciaData = {
        ...datosFormulario,
        solicitante_id: solicitanteId
      };

      const referencia = await esquemaService.crearRegistroCompleto(
        'referencia',
        referenciaData,
        esquemas.referencia?.esquema,
        1
      );
      const referenciaId = referencia.id;

      // 6. Crear solicitud completa
      const solicitudData = {
        ...datosFormulario,
        solicitante_id: solicitanteId,
        created_by_user_id: parseInt(localStorage.getItem('user_id') || '1'),
        assigned_to_user_id: parseInt(localStorage.getItem('user_id') || '1'),
        estado: 'abierta'
      };

      const solicitud = await esquemaService.crearRegistroCompleto(
        'solicitud',
        solicitudData,
        esquemas.solicitud?.esquema,
        1
      );
      const solicitudId = solicitud.id;

      toast.success('Solicitud creada exitosamente');
      await onSubmit(e);

    } catch (error) {
      console.error('Error creando solicitud:', error);
      toast.error(error instanceof Error ? error.message : 'Error al crear la solicitud');
    }
  };

  if (esquemasLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2">Cargando formulario dinámico...</span>
      </div>
    );
  }

  if (esquemasError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">Error al cargar esquemas: {esquemasError}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-8">
        {/* Formulario Completo - Solicitante */}
        {esquemas.solicitante?.esquema && (
          <FormularioCompleto
            esquemaCompleto={esquemas.solicitante.esquema}
            valores={datosFormulario}
            onChange={handleFieldChange}
            errores={errores}
            titulo="Información del Solicitante"
          />
        )}

        {/* Formulario Completo - Ubicación */}
        {esquemas.ubicacion?.esquema && (
          <FormularioCompleto
            esquemaCompleto={esquemas.ubicacion.esquema}
            valores={datosFormulario}
            onChange={handleFieldChange}
            errores={errores}
            titulo="Información de Ubicación"
          />
        )}

        {/* Formulario Completo - Actividad Económica */}
        {esquemas.actividad_economica?.esquema && (
          <FormularioCompleto
            esquemaCompleto={esquemas.actividad_economica.esquema}
            valores={datosFormulario}
            onChange={handleFieldChange}
            errores={errores}
            titulo="Información Laboral"
          />
        )}

        {/* Formulario Completo - Información Financiera */}
        {esquemas.informacion_financiera?.esquema && (
          <FormularioCompleto
            esquemaCompleto={esquemas.informacion_financiera.esquema}
            valores={datosFormulario}
            onChange={handleFieldChange}
            errores={errores}
            titulo="Información Financiera"
          />
        )}

        {/* Formulario Completo - Referencia */}
        {esquemas.referencia?.esquema && (
          <FormularioCompleto
            esquemaCompleto={esquemas.referencia.esquema}
            valores={datosFormulario}
            onChange={handleFieldChange}
            errores={errores}
            titulo="Información de Referencias"
          />
        )}

        {/* Formulario Completo - Solicitud */}
        {esquemas.solicitud?.esquema && (
          <FormularioCompleto
            esquemaCompleto={esquemas.solicitud.esquema}
            valores={datosFormulario}
            onChange={handleFieldChange}
            errores={errores}
            titulo="Información del Crédito"
          />
        )}

                 {/* Archivos Adjuntos */}
         <div>
           <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-3">Archivos Adjuntos</h3>
          <div className="mt-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <div className="flex flex-col space-y-2">
              <button
                type="button"
                onClick={triggerFileInput}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Upload className="w-4 h-4 mr-2" />
                Seleccionar Archivos
              </button>

              {selectedFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Archivos seleccionados: ({selectedFiles.length})
                  </h4>
                  <ul className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <li key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                        <div className="flex items-center">
                          <File className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-sm text-gray-800">{file.name}</span>
                          <span className="ml-2 text-xs text-gray-500">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Checkboxes de Términos y Condiciones */}
      <div className="mt-6 space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="acepta-terminos"
              checked={aceptaTerminos}
              onChange={(e) => setAceptaTerminos(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              required
            />
            <div className="flex-1">
              <label htmlFor="acepta-terminos" className="text-sm text-gray-700">
                <a href="/terminos-condiciones" target="_blank" rel="noopener noreferrer" className="text-sm font-medium underline">
                  Acepto los Términos y Condiciones de Uso
                </a>
              </label>
            </div>
          </div>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="acepta-acuerdo-firma"
              checked={aceptaAcuerdoFirma}
              onChange={(e) => setAceptaAcuerdoFirma(e.target.checked)}
              className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              required
            />
            <div className="flex-1">
              <label htmlFor="acepta-acuerdo-firma" className="text-sm text-gray-700">
                <a href="/acuerdo-firma" target="_blank" rel="noopener noreferrer" className="text-sm font-medium underline">
                  Acepto el Acuerdo de Firma
                </a>
              </label>
            </div>
          </div>
        </div>
      </div>

             {/* Debug de Esquemas (solo en desarrollo) */}
       {process.env.NODE_ENV === 'development' && (
         <div className="mt-6">
           <h3 className="text-lg font-medium text-gray-900 mb-4">Debug de Esquemas Completos</h3>
           {Object.entries(esquemas).map(([key, esquemaData]) => (
             esquemaData.esquema && (
               <div key={key} className="mb-4">
                 <h4 className="text-md font-medium text-gray-800 mb-2">Esquema: {key}</h4>
                 <div className="text-sm text-gray-600">
                   <p>Total campos: {esquemaData.esquema.total_campos}</p>
                   <p>Campos fijos: {esquemaData.esquema.campos_fijos.length}</p>
                   <p>Campos dinámicos: {esquemaData.esquema.campos_dinamicos.length}</p>
                   <p>Tabla: {esquemaData.esquema.tabla}</p>
                   <p>JSON Column: {esquemaData.esquema.json_column}</p>
                 </div>
               </div>
             )
           ))}
         </div>
       )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Guardar
        </button>
      </div>
    </form>
  );
};
