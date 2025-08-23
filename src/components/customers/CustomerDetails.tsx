import React, { useState, useEffect, useRef } from 'react';
import { Customer } from '../../types/customer';
import { Mail, Phone, Save, Loader2, Trash2, X, Edit2, File, Image, Download, Upload, X as XIcon } from 'lucide-react';
import { usePermissions } from '../../utils/permissions';
import { buildApiUrl, API_CONFIG } from '../../config/constants';
import { useSolicitanteCompleto } from '../../hooks/useSolicitanteCompleto';
import { documentService } from '../../services/documentService';

interface CustomerDetailsProps {
  customer: Customer;
  editedCustomer: Customer;
  isEditing: boolean;
  isLoading: boolean;
  error: string | null;
  canEdit: () => boolean;
  canDelete: () => boolean;
  onEdit: () => void;
  onSave: () => void;
  onCustomerDelete: (solicitanteId: string) => void;
  onInputChange: (field: keyof Customer, value: string) => void;
}

export const CustomerDetails: React.FC<CustomerDetailsProps> = ({
  customer,
  editedCustomer: initialEditedCustomer,
  isEditing: initialIsEditing,
  isLoading,
  error,
  canEdit,
  canDelete,
  onEdit,
  onSave,
  onCustomerDelete,
  onInputChange,
}) => {
  const { canEditCustomer, canDeleteCustomer } = usePermissions();

  // Extraer el solicitante_id del cliente seleccionado para editar
  const solicitanteId = customer.id_solicitante || customer.solicitante_id || customer.id;
  const solicitanteIdNumber = typeof solicitanteId === 'number' ? solicitanteId : parseInt(solicitanteId as string, 10);

  const { datos: datosCompletos, datosMapeados, loading: loadingCompletos, error: errorCompletos } = useSolicitanteCompleto(
    isNaN(solicitanteIdNumber) || solicitanteIdNumber <= 0 ? null : solicitanteIdNumber
  );
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [editedCustomer, setEditedCustomer] = useState<Customer>(initialEditedCustomer);
  const [loading, setLoading] = useState(isLoading);
  const [apiError, setApiError] = useState<string | null>(error);
  // const [productInfo, setProductInfo] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filesToDelete, setFilesToDelete] = useState<number[]>([]);
  const [customerDocuments, setCustomerDocuments] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar documentos del cliente cuando se obtiene el solicitante_id
  useEffect(() => {
    const loadCustomerDocuments = async () => {
      if (solicitanteIdNumber && !isNaN(solicitanteIdNumber) && solicitanteIdNumber > 0) {
        setLoadingDocuments(true);
        try {
          console.log('📥 === CARGANDO DOCUMENTOS DEL CLIENTE SELECCIONADO ===');
          console.log('🆔 Solicitante ID del cliente seleccionado para editar:', solicitanteIdNumber);
          console.log('🌐 URL que se llamará: GET /documentos/?solicitante_id=' + solicitanteIdNumber);

          const documents = await documentService.getDocuments(solicitanteIdNumber);
          setCustomerDocuments(documents);

          console.log('✅ Documentos cargados para el cliente:', documents);
          console.log('📊 Total documentos encontrados:', documents.length);
        } catch (error) {
          console.error('❌ Error al cargar documentos del cliente:', error);
          setCustomerDocuments([]);
        } finally {
          setLoadingDocuments(false);
        }
      } else {
        console.warn('⚠️ No se puede cargar documentos - solicitante_id inválido:', solicitanteIdNumber);
      }
    };

    loadCustomerDocuments();
  }, [solicitanteIdNumber]);

  // Mostrar loading si se están cargando los datos completos
  // MOVER ESTO DESPUÉS DE TODOS LOS HOOKS

  useEffect(() => {
    console.log('🔍 === DIAGNÓSTICO DE DATOS DEL CLIENTE ===');
    console.log('📦 Customer data received:', customer);
    console.log('📋 All customer keys:', Object.keys(customer));

    // Si tenemos datos completos del solicitante, usarlos
    if (datosMapeados) {
      console.log('📊 Datos completos disponibles:', datosMapeados);
      const mappedCustomer = {
        ...customer,
                 ...datosMapeados, // Usar los datos mapeados del servicio
         id_solicitante: solicitanteIdNumber,
      };
      setEditedCustomer(mappedCustomer);
    } else {
      console.log('📊 Campos específicos del customer:');
      console.log('  - nombre_completo:', customer.nombre_completo);
      console.log('  - tipo_documento:', customer.tipo_documento);
      console.log('  - numero_documento:', customer.numero_documento);
      console.log('  - fecha_nacimiento:', customer.fecha_nacimiento);
      console.log('  - numero_celular:', customer.numero_celular);
      console.log('  - correo_electronico:', customer.correo_electronico);
      console.log('  - tipo_credito:', customer.tipo_credito);
      console.log('  - banco:', customer.banco);
      console.log('  - estado:', customer.estado);
      console.log('  - plazo_meses:', customer.plazo_meses);
      console.log('  - ingresos:', customer.ingresos);
      console.log('  - valor_inmueble:', customer.valor_inmueble);
      console.log('  - cuota_inicial:', customer.cuota_inicial);
      console.log('  - archivos:', customer.archivos);

      // Mapear los campos del customer al formato correcto cuando se recibe
      const mappedCustomer = {
        ...customer,
        id_solicitante: customer.id_solicitante || customer.solicitante_id || customer.id,
        // Mapear nombres alternativos para compatibilidad
        nombre_completo: customer.nombre_completo || customer.nombre || '',
        correo_electronico: customer.correo_electronico || customer.correo || '',
        tipo_credito: customer.tipo_credito || customer.tipo_de_credito || '',
        // Normalizar campos numéricos
        ingresos: customer.ingresos || 0,
        valor_inmueble: customer.valor_inmueble || 0,
        cuota_inicial: customer.cuota_inicial || 0,
        plazo_meses: customer.plazo_meses || 0,
      };
      setEditedCustomer(mappedCustomer);
    }

         console.log('🔍 === FIN DIAGNÓSTICO ===');
   }, [customer, datosMapeados, solicitanteIdNumber]);

  const handleInputChange = (field: keyof Customer, value: string) => {
    setEditedCustomer(prev => {
      const newCustomer = { ...prev, [field]: value };
      // console.log('Campo actualizado:', field, 'Nuevo valor:', value);
      return newCustomer;
    });
  };

  // const handleProductInfoChange = (field: string, value: string) => {
  //   setProductInfo(prev => {
  //     const newInfo = { ...prev, [field]: value };
  //     setEditedCustomer(prev => ({
  //       ...prev,
  //       informacion_producto: JSON.stringify(newInfo)
  //     }));
  //     return newInfo;
  //   });
  // };

  const handleEdit = () => {
    setEditedCustomer({ ...customer }); // Reset to current customer data when starting edit
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedCustomer(customer);
  };

  const handleDelete = async () => {
    if (!canDeleteCustomer()) return;

    setLoading(true);
    setApiError(null);
    // http://127.0.0.A:5000
    // https://aapi-findii.onrender.com/
    console.log('Eliminando cliente:', customer.id_solicitante);
    console.log('Customer:', customer);

    try {
      // Obtener la cédula del asesor
      const cedula = localStorage.getItem('cedula') || '';

      if (!cedula) {
        throw new Error('No se encontró la información del asesor');
      }

      const response = await fetch(buildApiUrl('/delete-record'), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          solicitante_id: customer.id_solicitante,
          cedula: cedula
        }),
      });

      console.log('Respuesta de eliminación:', response);

      if (!response.ok) {
        throw new Error('Error al eliminar el registro');
      }

      onCustomerDelete(customer.id_solicitante?.toString() || '');
    } catch (error: any) {
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingFile = (documentId: number) => {
    setFilesToDelete(prev => [...prev, documentId]);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSave = async () => {
    if (!canEditCustomer()) return;

    setLoading(true);
    setApiError(null);

    try {
      console.log('Enviando datos actualizados:', editedCustomer);

      // Verificar que tengamos un ID válido
      if (!editedCustomer.id_solicitante) {
        throw new Error('ID del solicitante no encontrado');
      }

      // Obtener la cédula del asesor al inicio de la función
      const cedula = localStorage.getItem('cedula') || '';

      if (!cedula) {
        throw new Error('No se encontró la información del asesor');
      }

      // Gestionar archivos: eliminar y subir nuevos
      if (filesToDelete.length > 0 || selectedFiles.length > 0) {
        console.log('🔄 === GESTIONANDO ARCHIVOS ===');

        // Eliminar archivos marcados para eliminación
        if (filesToDelete.length > 0) {
          console.log('🗑️ Eliminando archivos:', filesToDelete);
          for (const documentId of filesToDelete) {
            try {
              await documentService.deleteDocument(documentId);
              console.log('✅ Documento eliminado:', documentId);
            } catch (error) {
              console.error('❌ Error al eliminar documento:', documentId, error);
            }
          }
        }

        // Subir nuevos archivos
        if (selectedFiles.length > 0) {
          console.log('📤 Subiendo nuevos archivos:', selectedFiles.map(f => f.name));
          try {
            const uploadResults = await documentService.uploadMultipleDocuments(
              selectedFiles,
              editedCustomer.id_solicitante
            );
            console.log('✅ Archivos subidos exitosamente:', uploadResults);
          } catch (error) {
            console.error('❌ Error al subir archivos:', error);
            throw new Error('Error al subir los nuevos archivos');
          }
        }

        // Recargar documentos después de los cambios
        try {
          const updatedDocuments = await documentService.getDocuments(editedCustomer.id_solicitante);
          setCustomerDocuments(updatedDocuments);
        } catch (error) {
          console.error('❌ Error al recargar documentos:', error);
        }
      }

      // Los campos JSON ya no son necesarios para la versión simplificada

      // Estructurar los datos simplificados
      const mappedCustomer = {
        solicitante_id: editedCustomer.id_solicitante,
        SOLICITANTES: {
          nombre_completo: editedCustomer.nombre_completo,
          tipo_documento: editedCustomer.tipo_documento || '',
          numero_documento: editedCustomer.numero_documento || '',
          fecha_nacimiento: editedCustomer.fecha_nacimiento || '',
          numero_celular: editedCustomer.numero_celular || '',
          correo_electronico: editedCustomer.correo_electronico
        },
        INFORMACION_FINANCIERA: {
          ingresos: Number(editedCustomer.ingresos) || 0,
          valor_inmueble: Number(editedCustomer.valor_inmueble) || 0,
          cuota_inicial: Number(editedCustomer.cuota_inicial) || 0
        },
        PRODUCTO_SOLICITADO: {
          tipo_de_credito: editedCustomer.tipo_credito,
          plazo_meses: Number(editedCustomer.plazo_meses) || 0,
          estado: editedCustomer.estado
        },
        SOLICITUDES: {
          banco: editedCustomer.banco
        }
      };

      // Luego, enviar los datos del cliente
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.EDIT_RECORD), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...mappedCustomer,
          cedula: cedula
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Error al actualizar el registro');
      }

      const updatedCustomer = await response.json();
      console.log('Respuesta exitosa:', updatedCustomer);

      onSave();

      setIsEditing(false);
      setSelectedFiles([]);
      setFilesToDelete([]);
    } catch (error: any) {
      console.error('Error en la actualización:', error);
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading si se están cargando los datos completos
  if (loadingCompletos) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2">Cargando datos completos del cliente...</span>
      </div>
    );
  }

  const renderField = (key: keyof Customer, value: any) => {
    if (key === 'id' || key === 'created_at' || key === 'asesor_usuario') return null;

    // Log específico para los campos que nos interesan
    if (key === 'estado_civil' || key === 'tipo_credito') {
      console.log(`Rendering ${key}:`, value, 'from editedCustomer:', editedCustomer[key]);
    }

    if (key === 'archivos') {
      // Usar documentos del servicio de documentos en lugar de customer.archivos
      // Asegurar que customerDocuments sea siempre un array
      const documentsArray = Array.isArray(customerDocuments) ? customerDocuments : [];
      const filteredDocuments = documentsArray.filter(doc => !filesToDelete.includes(doc.id));

      console.log('🗂️ === DEBUG ARCHIVOS FIELD ===');
      console.log('📊 customerDocuments:', customerDocuments);
      console.log('📋 documentsArray:', documentsArray);
      console.log('🔍 filteredDocuments:', filteredDocuments);
      console.log('⏳ loadingDocuments:', loadingDocuments);
      console.log('🗑️ filesToDelete:', filesToDelete);

      return (
        <div key={key} className="col-span-full">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Archivos</h3>

          {loadingDocuments && (
            <div className="flex items-center mb-4">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span className="text-sm text-gray-600">Cargando documentos...</span>
            </div>
          )}

          {!loadingDocuments && documentsArray.length === 0 && (
            <div className="text-gray-500 text-sm mb-4">
              No hay documentos disponibles para este cliente.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Mostrar documentos existentes desde el API */}
            {filteredDocuments.map((document, index) => {
              const isImage = document.filename && document.filename.match(/\.(jpg|jpeg|png|gif|webp)$/i);
              const fileName = document.filename || document.original_filename || `Documento ${index + 1}`;
              const fileUrl = document.url || document.file_path;

              return (
                <div key={`document-${document.id}`} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {fileName}
                  </label>
                  <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800 flex items-center justify-between">
                    <div className="flex items-center">
                      {isImage ? (
                        <Image className="w-4 h-4 mr-2 text-gray-500" />
                      ) : (
                        <File className="w-4 h-4 mr-2 text-gray-500" />
                      )}
                      <span className="truncate max-w-[200px]">{fileName}</span>
                      {document.file_size && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({(document.file_size / 1024).toFixed(1)} KB)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {fileUrl && (
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700"
                          download
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                      {isEditing && canEditCustomer() && (
                        <button
                          onClick={() => handleDeleteExistingFile(document.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Mostrar archivos nuevos seleccionados */}
            {selectedFiles.map((file, index) => (
              <div key={`new-${index}`} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nuevo Archivo {index + 1}
                </label>
                <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800 flex items-center justify-between">
                  <div className="flex items-center">
                    <File className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="truncate max-w-[200px]">{file.name}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {isEditing && canEditCustomer() && (
            <div className="mt-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <button
                type="button"
                onClick={triggerFileInput}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Upload className="w-4 h-4 mr-2" />
                Agregar Archivos
              </button>

              {(customerDocuments.length > 0 || selectedFiles.length > 0) && (
                <div className="ml-4 text-sm text-gray-600">
                  Total: {customerDocuments.length} documento(s) + {selectedFiles.length} nuevo(s)
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    if (key === 'informacion_producto') {
      return null; // Ya no mostramos esta información en la versión simplificada
    }

    // Mostrar el valor actual en consola para depuración
    // console.log(`Renderizando campo ${key}:`, value);

    const label = key
      .charAt(0)
      .toUpperCase()
      .concat(key.slice(1).replace(/_/g, ' '));

    return (
      <div key={key} className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        {isEditing && canEditCustomer() ? (
          key === 'tipo_credito' ? (
            <select
              value={editedCustomer[key] || ''}
              onChange={(e) => handleInputChange(key, e.target.value)}
              className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
              disabled={loading}
            >
              <option value="">Seleccionar...</option>
              <option value="hipotecario">Hipotecario</option>
              <option value="consumo">Consumo</option>
              <option value="libre_inversion">Libre Inversión</option>
              <option value="vehiculo">Vehículo</option>
            </select>
          ) : key === 'estado' ? (
            <select
              value={editedCustomer[key] || ''}
              onChange={(e) => handleInputChange(key, e.target.value)}
              className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
              disabled={loading}
            >
              <option value="">Seleccionar...</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En estudio">En estudio</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Negado">Negado</option>
              <option value="Desembolsado">Desembolsado</option>
            </select>
          ) : (
            <input
              type={key.includes('date') || key.includes('fecha') ? 'date' : 'text'}
              value={editedCustomer[key] || ''}
              onChange={(e) => handleInputChange(key, e.target.value)}
              className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
              disabled={loading}
            />
          )
        ) : (
          <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800">
            {key.includes('correo') ? (
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-gray-500" />
                {value || '-'}
              </div>
            ) : key.includes('celular') || key.includes('telefono') ? (
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-gray-500" />
                {value || '-'}
              </div>
            ) : (
              <span>{value || '-'}</span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
             {/* Debug info - solo en desarrollo */}
       {process.env.NODE_ENV === 'development' && datosCompletos && (
         <div className="bg-blue-50 p-2 text-xs text-blue-700 border rounded">
           ✅ Datos completos cargados del endpoint /solicitantes/{solicitanteIdNumber}/traer-todos-registros
         </div>
       )}

      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-600">{apiError}</p>
        </div>
      )}

             {/* TODOS LOS CAMPOS DISPONIBLES */}
       {/* Información Básica del Solicitante */}
       <Section title="Información Básica del Solicitante" keys={[
         'nombre_completo', 'tipo_documento', 'numero_documento',
         'fecha_nacimiento', 'genero', 'correo_electronico'
       ]} customer={editedCustomer} renderField={renderField} />

       {/* Información Adicional del Solicitante */}
       <Section title="Información Adicional del Solicitante" keys={[
         'personas_a_cargo', 'telefono', 'nacionalidad', 'estado_civil'
       ]} customer={editedCustomer} renderField={renderField} />

       {/* Información de Ubicación */}
       <Section title="Información de Ubicación" keys={[
         'direccion', 'ciudad', 'departamento'
       ]} customer={editedCustomer} renderField={renderField} />

       {/* Información de Actividad Económica */}
       <Section title="Actividad Económica" keys={[
         'tipo_actividad', 'sector_economico', 'empresa', 'tipo_contrato'
       ]} customer={editedCustomer} renderField={renderField} />

       {/* Detalles de Actividad Económica */}
       <Section title="Detalles de Actividad Económica" keys={[
         'codigo_ciiu', 'departamento_empresa', 'ciudad_empresa', 'telefono_empresa', 'correo_oficina', 'nit'
       ]} customer={editedCustomer} renderField={renderField} />

       {/* Información del Negocio */}
       <Section title="Información del Negocio" keys={[
         'direccion_empresa', 'tiene_negocio_propio', 'nombre_negocio', 'direccion_negocio', 'departamento_negocio', 'ciudad_negocio', 'numero_empleados'
       ]} customer={editedCustomer} renderField={renderField} />

       {/* Información Financiera */}
       <Section title="Información Financiera" keys={[
         'ingresos_mensuales', 'gastos_mensuales', 'total_activos', 'total_pasivos'
       ]} customer={editedCustomer} renderField={renderField} />

       {/* Detalles Financieros */}
       <Section title="Detalles Financieros" keys={[
         'ingreso_basico_mensual', 'ingreso_variable_mensual', 'otros_ingresos_mensuales', 'gastos_financieros_mensuales', 'gastos_personales_mensuales'
       ]} customer={editedCustomer} renderField={renderField} />

       {/* Otros Ingresos */}
       <Section title="Otros Ingresos" keys={[
         'ingresos_fijos_pension', 'ingresos_por_ventas', 'ingresos_varios', 'honorarios', 'arriendos', 'ingresos_actividad_independiente', 'declara_renta'
       ]} customer={editedCustomer} renderField={renderField} />

       {/* Información de Referencias */}
       <Section title="Información de Referencias" keys={[
         'tipo_referencia', 'nombre_referencia', 'relacion_referencia', 'direccion_referencia', 'ciudad_referencia'
       ]} customer={editedCustomer} renderField={renderField} />

       {/* Información de Crédito */}
       <Section title="Información de Crédito" keys={[
         'estado_credito'
       ]} customer={editedCustomer} renderField={renderField} />

       {/* Archivos */}
      <div className="md:col-span-2">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-3 mt-4">Archivos</h3>

        {loadingDocuments && (
          <div className="flex items-center mb-4">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            <span className="text-sm text-gray-600">Cargando documentos...</span>
          </div>
        )}

        {(() => {
          // Parsear customerDocuments si es string
          let documentsArray = [];
          try {
            if (typeof customerDocuments === 'string') {
              const parsed = JSON.parse(customerDocuments);
              documentsArray = parsed.data || [];
            } else if (Array.isArray(customerDocuments)) {
              documentsArray = customerDocuments;
            }
          } catch (error) {
            console.error('Error parsing customerDocuments:', error);
            documentsArray = [];
          }

          console.log('📋 Documentos procesados:', documentsArray);

          if (!loadingDocuments && documentsArray.length === 0) {
            return (
              <div className="text-gray-500 text-sm mb-4">
                No hay documentos disponibles para este cliente.
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documentsArray.map((doc, index) => {
                const fileName = doc.filename || doc.original_filename || `Documento ${index + 1}`;
                const fileUrl = doc.documento_url || doc.url || doc.file_path;
                const isImage = fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i);

                return (
                  <div key={doc.id || index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {isImage ? (
                          <Image className="w-8 h-8 text-blue-500" />
                        ) : (
                          <File className="w-8 h-8 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {fileName}
                        </h4>
                        {doc.file_size && (
                          <p className="text-xs text-gray-500 mt-1">
                            {(doc.file_size / 1024).toFixed(1)} KB
                          </p>
                        )}
                        {fileUrl && (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center mt-2 text-sm text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Abrir archivo
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {isEditing && canEditCustomer() && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <button
              type="button"
              onClick={triggerFileInput}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Upload className="w-4 h-4 mr-2" />
              Agregar Archivos
            </button>

            {selectedFiles.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Archivos seleccionados:</h5>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                      <div className="flex items-center">
                        <File className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="ml-2 text-xs text-gray-500">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

       {/* Datos Completos (Solo en desarrollo) */}
       {process.env.NODE_ENV === 'development' && datosCompletos && (
         <div className="md:col-span-2">
           <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-3 mt-4">
             Datos Completos (Debug)
           </h3>
           <div className="bg-gray-50 p-4 rounded-md">
             <pre className="text-xs overflow-auto max-h-96">
               {JSON.stringify(datosCompletos, null, 2)}
             </pre>
           </div>
         </div>
       )}
      <div className="flex justify-end space-x-2">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="flex items-center bg-green-500 text-white px-3 py-2 rounded-md shadow hover:bg-green-600"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
              Guardar
            </button>
            <button
              onClick={handleCancelEdit}
              className="flex items-center bg-gray-500 text-white px-3 py-2 rounded-md shadow hover:bg-gray-600"
              disabled={loading}
            >
              <X className="mr-2" />
              Cancelar
            </button>
          </>
        ) : (
          <>
            {canEditCustomer() && (
              <button
                onClick={handleEdit}
                className="flex items-center bg-blue-500 text-white px-3 py-2 rounded-md shadow hover:bg-blue-600"
              >
                <Edit2 className="mr-2" />
                Editar
              </button>
            )}
            {canDeleteCustomer() && (
              <button
                onClick={handleDelete}
                className="flex items-center bg-red-500 text-white px-3 py-2 rounded-md shadow hover:bg-red-600"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : <Trash2 className="mr-2" />}
                Eliminar
              </button>
            )}
          </>
        )}
      </div>
    </div>

  );
};

// Componente para secciones reutilizable
const Section: React.FC<{
  title: string;
  keys: string[];
  customer: Customer;
  renderField: (key: keyof Customer, value: any) => JSX.Element | null;
}> = ({ title, keys, customer, renderField }) => (
  <div className="md:col-span-2">
    <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-3 mt-4">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
      {keys.map((key) => renderField(key as keyof Customer, customer[key as keyof Customer]))}
    </div>
  </div>
);
