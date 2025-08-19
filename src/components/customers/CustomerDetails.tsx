import React, { useState, useEffect, useRef } from 'react';
import { Customer } from '../../types/customer';
import { Mail, Phone, Save, Loader2, Trash2, X, Edit2, File, Image, Download, Upload, X as XIcon } from 'lucide-react';
import { usePermissions } from '../../utils/permissions';
import { buildApiUrl, API_CONFIG } from '../../config/constants';
import { useSolicitanteCompleto } from '../../hooks/useSolicitanteCompleto';

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

  // Usar el nuevo hook para obtener datos completos del solicitante
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
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDeleteExistingFile = (fileUrl: string) => {
    setFilesToDelete(prev => [...prev, fileUrl]);
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

      // Primero, enviar los archivos si hay nuevos o para eliminar
      if (selectedFiles.length > 0 || filesToDelete.length > 0) {
        const fileFormData = new FormData();

        // Agregar los archivos a eliminar
        filesToDelete.forEach(fileUrl => {
          fileFormData.append('files_to_delete', fileUrl);
        });

        // Agregar los nuevos archivos
        selectedFiles.forEach(file => {
          fileFormData.append('archivos', file);
        });

        // Agregar el ID del solicitante
        fileFormData.append('solicitante_id', editedCustomer.id_solicitante.toString());

        // Agregar la cédula del asesor
        fileFormData.append('cedula', cedula);

        console.log('Enviando archivos:', {
          filesToDelete,
          selectedFiles: selectedFiles.map(f => f.name),
          solicitante_id: editedCustomer.id_solicitante,
          cedula: cedula
        });

        const fileResponse = await fetch(buildApiUrl('/update-files/'), {
          method: 'POST',
          body: fileFormData,
        });

        if (!fileResponse.ok) {
          const errorData = await fileResponse.json();
          throw new Error(errorData.message || errorData.error || 'Error al actualizar los archivos');
        }

        const fileResult = await fileResponse.json();
        console.log('Respuesta de archivos:', fileResult);
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
      // Combinar archivos existentes (excluyendo los marcados para eliminar) con los nuevos
      const existingFilesRaw = Array.isArray(value) ? value : (value ? [value] : []);
      const existingFiles = existingFilesRaw.filter((f: any): f is string => typeof f === 'string' && f.length > 0);
      const filteredExistingFiles = existingFiles.filter(file => !filesToDelete.includes(file));

      return (
        <div key={key} className="col-span-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Mostrar archivos existentes */}
            {filteredExistingFiles.map((fileUrl, index) => {
              const isImage = typeof fileUrl === 'string' && fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);
              const fileName = typeof fileUrl === 'string'
                ? (fileUrl.split('/').pop()?.split('?')[0] || `Archivo ${index + 1}`)
                : `Archivo ${index + 1}`;

              return (
                <div key={`existing-${index}`} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Archivo {index + 1}
                  </label>
                  <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800 flex items-center justify-between">
                    <div className="flex items-center">
                      {isImage ? (
                        <Image className="w-4 h-4 mr-2 text-gray-500" />
                      ) : (
                        <File className="w-4 h-4 mr-2 text-gray-500" />
                      )}
                      <span className="truncate max-w-[200px]">{fileName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700"
                        download
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      {isEditing && canEditCustomer() && (
                        <button
                          onClick={() => handleDeleteExistingFile(fileUrl)}
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
       <Section title="Archivos" keys={['archivos']} customer={editedCustomer} renderField={renderField} />

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
