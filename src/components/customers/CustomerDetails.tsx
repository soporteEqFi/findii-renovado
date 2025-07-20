import React, { useState, useEffect, useRef } from 'react';
import { Customer } from '../../types/customer';
import { Mail, Phone, Save, Loader2, Trash2, X, Edit2, File, Image, Download, Upload, X as XIcon } from 'lucide-react';
import { usePermissions } from '../../utils/permissions';

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
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [editedCustomer, setEditedCustomer] = useState<Customer>(initialEditedCustomer);
  const [loading, setLoading] = useState(isLoading);
  const [apiError, setApiError] = useState<string | null>(error);
  const [productInfo, setProductInfo] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log('Customer data received:', customer);
    console.log('Estado civil:', customer.estado_civil);
    console.log('Tipo crédito:', customer.tipo_credito);
    console.log('All customer keys:', Object.keys(customer));
    // Mapear los campos del customer al formato correcto cuando se recibe
    const mappedCustomer = {
      ...customer,
      id_solicitante: customer.id_solicitante || customer.solicitante_id || customer.id,
      // Mapear nombres alternativos para compatibilidad
      nombre: customer.nombre || customer.nombre_completo || '',
      nombre_completo: customer.nombre_completo || customer.nombre || '',
      correo: customer.correo || customer.correo_electronico || '',
      correo_electronico: customer.correo_electronico || customer.correo || '',
      direccion: customer.direccion || customer.direccion_residencia || '',
      direccion_residencia: customer.direccion_residencia || customer.direccion || '',
      tipo_de_contrato: customer.tipo_de_contrato || customer.tipo_contrato || '',
      tipo_contrato: customer.tipo_contrato || customer.tipo_de_contrato || '',
      tipo_credito: customer.tipo_credito || customer.tipo_de_credito || '',
      estado_civil: customer.estado_civil || '',
      // Mapear campos financieros
      total_egresos: customer.total_egresos || customer.egresos || '',
      egresos: customer.egresos || customer.total_egresos || '',
    };

    // Parsear información_producto si existe
    try {
      const productInfoData = typeof customer.informacion_producto === 'string' 
        ? JSON.parse(customer.informacion_producto)
        : customer.informacion_producto || {};
      setProductInfo(productInfoData);
      mappedCustomer.informacion_producto = productInfoData;
    } catch (error) {
      console.error('Error al parsear información_producto:', error);
      setProductInfo({});
    }
   
    setEditedCustomer(mappedCustomer);
  }, [customer]);

  const handleInputChange = (field: keyof Customer, value: string) => {
    setEditedCustomer(prev => {
      const newCustomer = { ...prev, [field]: value };
      // console.log('Campo actualizado:', field, 'Nuevo valor:', value);
      return newCustomer;
    });
  };

  const handleProductInfoChange = (field: string, value: string) => {
    setProductInfo(prev => {
      const newInfo = { ...prev, [field]: value };
      setEditedCustomer(prev => ({
        ...prev,
        informacion_producto: JSON.stringify(newInfo)
      }));
      return newInfo;
    });
  };

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

    console.log('Eliminando cliente:', customer.id_solicitante);
    console.log('Customer:', customer);

    try {
      const response = await fetch('http://127.0.0.1:5000/delete-record', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ solicitante_id: customer.id_solicitante }),
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

        console.log('Enviando archivos:', {
          filesToDelete,
          selectedFiles: selectedFiles.map(f => f.name),
          solicitante_id: editedCustomer.id_solicitante
        });
        
        const fileResponse = await fetch('http://127.0.0.1:5000/update-files/', {
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

      // Estructurar los datos según las tablas de la API
      const mappedCustomer = {
        solicitante_id: editedCustomer.id_solicitante,
        SOLICITANTES: {
          nombre_completo: editedCustomer.nombre_completo || editedCustomer.nombre,
          tipo_documento: editedCustomer.tipo_documento || '',
          numero_documento: editedCustomer.numero_documento || '',
          fecha_nacimiento: editedCustomer.fecha_nacimiento || '',
          numero_celular: editedCustomer.numero_celular || '',
          correo_electronico: editedCustomer.correo_electronico || editedCustomer.correo,
          nivel_estudio: editedCustomer.nivel_estudio || '',
          profesion: editedCustomer.profesion || '',
          estado_civil: editedCustomer.estado_civil || '',
          personas_a_cargo: editedCustomer.personas_a_cargo || ''
        },
        UBICACION: {
          direccion_residencia: editedCustomer.direccion_residencia,
          tipo_vivienda: editedCustomer.tipo_vivienda,
          barrio: editedCustomer.barrio,
          departamento: editedCustomer.departamento,
          estrato: Number(editedCustomer.estrato) || 0,
          ciudad_gestion: editedCustomer.ciudad_gestion
        },
        ACTIVIDAD_ECONOMICA: {
          actividad_economica: editedCustomer.actividad_economica,
          empresa_labora: editedCustomer.empresa_labora,
          fecha_vinculacion: editedCustomer.fecha_vinculacion,
          direccion_empresa: editedCustomer.direccion_empresa,
          telefono_empresa: editedCustomer.telefono_empresa,
          tipo_contrato: editedCustomer.tipo_contrato,
          cargo_actual: editedCustomer.cargo_actual
        },
        INFORMACION_FINANCIERA: {
          ingresos: Number(editedCustomer.ingresos) || 0,
          valor_inmueble: Number(editedCustomer.valor_inmueble) || 0,
          cuota_inicial: Number(editedCustomer.cuota_inicial) || 0,
          porcentaje_financiar: Number(editedCustomer.porcentaje_financiar) || 0,
          total_egresos: Number(editedCustomer.total_egresos) || 0,
          total_activos: Number(editedCustomer.total_activos) || 0,
          total_pasivos: Number(editedCustomer.total_pasivos) || 0
        },
        PRODUCTO_SOLICITADO: {
          tipo_de_credito: editedCustomer.tipo_credito,
          plazo_meses: Number(editedCustomer.plazo_meses) || 0,
          segundo_titular: typeof editedCustomer.segundo_titular === 'boolean' 
            ? (editedCustomer.segundo_titular ? 'si' : 'no')
            : (editedCustomer.segundo_titular || 'no'),
          observacion: editedCustomer.observacion,
          estado: editedCustomer.estado,
          informacion_producto: editedCustomer.informacion_producto
        },
        SOLICITUDES: {
          banco: editedCustomer.banco
        }
      };

      // Luego, enviar los datos del cliente
      const response = await fetch('http://127.0.0.1:5000/edit-record/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mappedCustomer),
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

  const renderField = (key: keyof Customer, value: any) => {
    if (key === 'id' || key === 'created_at' || key === 'asesor_usuario') return null;
    
    // Log específico para los campos que nos interesan
    if (key === 'estado_civil' || key === 'tipo_credito') {
      console.log(`Rendering ${key}:`, value, 'from editedCustomer:', editedCustomer[key]);
    }

    if (key === 'archivos') {
      // Combinar archivos existentes (excluyendo los marcados para eliminar) con los nuevos
      const existingFiles = Array.isArray(value) ? value : [value];
      const filteredExistingFiles = existingFiles.filter(file => !filesToDelete.includes(file));
      
      return (
        <div key={key} className="col-span-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Mostrar archivos existentes */}
            {filteredExistingFiles.map((fileUrl, index) => {
              const isImage = fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);
              const fileName = fileUrl.split('/').pop()?.split('?')[0] || `Archivo ${index + 1}`;
              
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
      return (
        <div key={key} className="col-span-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(productInfo).map(([field, value]) => (
              <div key={field} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ')}
                </label>
                {isEditing && canEditCustomer() ? (
                  <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => handleProductInfoChange(field, e.target.value)}
                    className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
                    disabled={loading}
                  />
                ) : (
                  <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800">
                    <span>{value || '-'}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Mostrar el valor actual en consola para depuración
    console.log(`Renderizando campo ${key}:`, value);

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
          key === 'estado_civil' ? (
            <select
              value={editedCustomer[key] || ''}
              onChange={(e) => handleInputChange(key, e.target.value)}
              className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
              disabled={loading}
            >
              <option value="">Seleccionar...</option>
              <option value="soltero">Soltero(a)</option>
              <option value="casado">Casado(a)</option>
              <option value="divorciado">Divorciado(a)</option>
              <option value="viudo">Viudo(a)</option>
              <option value="union_libre">Unión Libre</option>
            </select>
          ) : key === 'tipo_credito' ? (
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
      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-600">{apiError}</p>
        </div>
      )}

      {/* Secciones */}
      {/* Información Personal */}
      <Section title="Información Personal" keys={[
        'nombre', 'tipo_documento', 'numero_documento',
        'fecha_nacimiento', 'numero_celular', 'correo',
        'nivel_estudio', 'profesion', 'estado_civil', 'personas_a_cargo'
      ]} customer={editedCustomer} renderField={renderField} />

      {/* Ubicación */}
      <Section title="Ubicación" keys={[
        'direccion', 'tipo_vivienda', 'barrio',
        'departamento', 'estrato', 'ciudad_gestion'
      ]} customer={editedCustomer} renderField={renderField} />

      {/* Actividad Económica */}
      <Section title="Actividad Económica" keys={[
        'actividad_economica', 'empresa_labora', 'fecha_vinculacion',
        'direccion_empresa', 'telefono_empresa', 'tipo_de_contrato', 'cargo_actual'
      ]} customer={editedCustomer} renderField={renderField} />

      {/* Información Financiera */}
      <Section title="Información Financiera" keys={[
        'ingresos', 'valor_inmueble', 'cuota_inicial', 'porcentaje_financiar',
        'total_egresos', 'total_activos', 'total_pasivos'
      ]} customer={editedCustomer} renderField={renderField} />

      {/* Producto Solicitado */}
      <Section title="Producto Solicitado" keys={[
        'tipo_credito', 'plazo_meses','segundo_titular', 'informacion_producto',  'observacion', 'estado',
      ]} customer={editedCustomer} renderField={renderField} />

      {/* Archivos */}
      <Section title="Archivos" keys={['archivos']} customer={editedCustomer} renderField={renderField} />

      {/* Solicitudes */}
      <Section title="Solicitudes" keys={['banco']} customer={editedCustomer} renderField={renderField} />
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
