import React, { useState, useEffect, useRef } from 'react';
import { Customer } from '../../types/customer';
import { Mail, Phone, Save, Loader2, Trash2, X, Edit2, File, Image, Download, Upload, X as XIcon, ExternalLink, AlertCircle } from 'lucide-react';
import { usePermissions } from '../../utils/permissions';
import { buildApiUrl, API_CONFIG } from '../../config/constants';
import { useSolicitanteCompleto } from '../../hooks/useSolicitanteCompleto';
import { documentService } from '../../services/documentService';
import { Document } from '../../types';
import { NotificationHistory } from '../NotificationHistory';
import { useConfiguraciones } from '../../hooks/useConfiguraciones';
import { departments, getCitiesByDepartment } from '../../data/colombianCities';
import { useEsquemaCompleto } from '../../hooks/useEsquemaCompleto';
import { emailService } from '../../services/emailService';

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

  const { datos: datosCompletos, datosMapeados, loading: loadingCompletos, error: errorCompletos, refetch } = useSolicitanteCompleto(
    isNaN(solicitanteIdNumber) || solicitanteIdNumber <= 0 ? null : solicitanteIdNumber
  );
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [editedCustomer, setEditedCustomer] = useState<Customer>(initialEditedCustomer);
  const [loading, setLoading] = useState(isLoading);
  const [apiError, setApiError] = useState<string | null>(error);
  const [editedData, setEditedData] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  // const [productInfo, setProductInfo] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filesToDelete, setFilesToDelete] = useState<number[]>([]);
  const [customerDocuments, setCustomerDocuments] = useState<Document[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estado para rastrear el valor original del banco
  const [originalBankValue, setOriginalBankValue] = useState<string>('');

  // Configuraciones dinámicas (bancos, ciudades)
  const empresaId = parseInt(localStorage.getItem('empresa_id') || '1', 10);
  const { bancos, ciudades, loading: loadingConfig } = useConfiguraciones(empresaId);
  // Esquema para actividad económica
  const { esquema: esquemaActividad } = useEsquemaCompleto('actividad_economica', empresaId);
  
  // Esquema para solicitud (incluye tipo_credito)
  const { esquema: esquemaSolicitud } = useEsquemaCompleto('solicitud', empresaId);

  // Cargar documentos del cliente cuando se obtiene el solicitante_id
  useEffect(() => {
    const loadCustomerDocuments = async () => {

      if (solicitanteIdNumber && !isNaN(solicitanteIdNumber) && solicitanteIdNumber > 0) {
        setLoadingDocuments(true);
        try {

          const documents = await documentService.getDocuments(solicitanteIdNumber);
          // Asegurar que documents sea un array
          const documentsArray = Array.isArray(documents) ? documents : [];
          setCustomerDocuments(documentsArray);

        } catch (error) {
          console.error('❌ Error al cargar documentos del cliente:', error);
          setCustomerDocuments([]);
        } finally {
          setLoadingDocuments(false);
        }
      } else {
        console.warn('⚠️ No se puede cargar documentos - solicitante_id inválido:', solicitanteIdNumber);
        setCustomerDocuments([]);
      }
    };
  // Mapa del tipo seleccionado -> clave de detalle a usar (vehiculo reutiliza hipotecario)
  const detailKeyForTipoCredito = (normalized: string): string => {
    if (normalized === 'vehiculo') return 'hipotecario';
    return normalized;
  };

    loadCustomerDocuments();
  }, [solicitanteIdNumber, customer.id_solicitante, customer.solicitante_id, customer.id]);

  // Mostrar loading si se están cargando los datos completos
  // MOVER ESTO DESPUÉS DE TODOS LOS HOOKS

  useEffect(() => {
    // Si tenemos datos completos del solicitante, usarlos
    if (datosMapeados) {
      console.log('📊 Datos completos disponibles:', datosMapeados);
      const mappedCustomer = {
        ...customer,
                 ...datosMapeados, // Usar los datos mapeados del servicio
         id_solicitante: solicitanteIdNumber,
      };
      setEditedCustomer(mappedCustomer);
      // Inicializar datos editables con la estructura completa
      if (datosCompletos) {
        setEditedData(JSON.parse(JSON.stringify(datosCompletos)));
        // Capturar el valor original del banco
        const originalBank = (datosCompletos?.solicitudes?.[0] as any)?.banco_nombre || '';
        setOriginalBankValue(originalBank);
      }
    } else {
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
      // Capturar el valor original del banco desde customer
      const originalBank = customer.banco || '';
      setOriginalBankValue(originalBank);
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
    // Validar que el usuario banco solo pueda editar registros de su banco
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        if (userObj.rol === 'banco') {
          const userBanco = userObj.info_extra?.banco_nombre || '';
          const customerBanco = customer.banco || editedCustomer.banco || '';
          
          if (userBanco && customerBanco && userBanco !== customerBanco) {
            alert(`No tienes permisos para editar registros de ${customerBanco}. Solo puedes editar registros de ${userBanco}.`);
            return;
          }
        }
      } catch (error) {
        console.error('Error validating bank permissions:', error);
      }
    }

    setEditedCustomer({ ...customer }); // Reset to current customer data when starting edit
    setEditedData(datosCompletos ? JSON.parse(JSON.stringify(datosCompletos)) : null);
    setValidationErrors({});
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedCustomer(customer);
    setEditedData(datosCompletos ? JSON.parse(JSON.stringify(datosCompletos)) : null);
    setValidationErrors({});
  };

  const handleDelete = async () => {
    // Validar que el usuario banco solo pueda eliminar registros de su banco
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        if (userObj.rol === 'banco') {
          const userBanco = userObj.info_extra?.banco_nombre || '';
          const customerBanco = customer.banco || editedCustomer.banco || '';
          
          if (userBanco && customerBanco && userBanco !== customerBanco) {
            alert(`No tienes permisos para eliminar registros de ${customerBanco}. Solo puedes eliminar registros de ${userBanco}.`);
            return;
          }
        }
      } catch (error) {
        console.error('Error validating bank permissions for delete:', error);
      }
    }

    // Confirmar antes de eliminar
    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar el registro de "${customer.nombre_completo || customer.nombre || 'este cliente'}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmDelete) {
      console.log('Eliminación cancelada por el usuario');
      return;
    }

    setLoading(true);
    setApiError(null);
    console.log('Eliminando cliente con ID de solicitud:', customer.id_solicitud);
    console.log('Customer:', customer);

    try {
      // Obtener empresa_id del localStorage
      const empresaId = localStorage.getItem('empresa_id') || '1';

      // Usar el ID de la solicitud para el endpoint de eliminación
      const solicitudId = customer.id_solicitud;

      if (!solicitudId) {
        throw new Error('ID de la solicitud no encontrado');
      }

      const response = await fetch(buildApiUrl(`/solicitudes/${solicitudId}?empresa_id=${empresaId}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Respuesta de eliminación:', response);

      if (!response.ok) {
        throw new Error('Error al eliminar el registro');
      }

      // Mostrar mensaje de éxito
      alert('Registro eliminado exitosamente');

      onCustomerDelete(solicitudId.toString());
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
    console.log('🗑️ Marcando documento para eliminación:', documentId);
    setFilesToDelete(prev => {
      const newList = [...prev, documentId];
      console.log('🗑️ Lista actualizada de documentos a eliminar:', newList);
      return newList;
    });
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

    // Función específica para gestionar documentos
  const handleManageDocuments = async () => {
    console.log('🚀 === INICIANDO handleManageDocuments ===');
    console.log('🆔 editedCustomer.id_solicitante:', editedCustomer.id_solicitante);
    console.log('📁 selectedFiles:', selectedFiles);
    console.log('🗑️ filesToDelete:', filesToDelete);

    if (!editedCustomer.id_solicitante) {
      setApiError('ID del solicitante no encontrado');
      return;
    }

    setLoading(true);
    setApiError(null);

    try {
      console.log('🔄 === GESTIONANDO DOCUMENTOS ===');

      // Eliminar archivos marcados para eliminación
      if (filesToDelete.length > 0) {
        console.log('🗑️ Eliminando archivos:', filesToDelete);
        console.log('🗑️ Total archivos a eliminar:', filesToDelete.length);

        for (const documentId of filesToDelete) {
          try {
            console.log('🗑️ Intentando eliminar documento ID:', documentId);
            console.log('🗑️ URL de eliminación:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DOCUMENTOS}/${documentId}`);

            await documentService.deleteDocument(documentId);
            console.log('✅ Documento eliminado exitosamente:', documentId);
          } catch (error: any) {
            console.error('❌ Error al eliminar documento:', documentId, error);
            console.error('❌ Error details:', error);
            throw new Error(`Error al eliminar documento ${documentId}: ${error.message}`);
          }
        }

        console.log('✅ Todos los documentos marcados fueron eliminados exitosamente');
      }

      // Subir nuevos archivos
      if (selectedFiles.length > 0) {
        console.log('📤 Subiendo nuevos archivos:', selectedFiles.map(f => f.name));
        console.log('📤 Total archivos a subir:', selectedFiles.length);
        console.log('🆔 Solicitante ID para subida:', Number(editedCustomer.id_solicitante));

        try {
          console.log('📤 Llamando a uploadMultipleDocuments...');
          const uploadResults = await documentService.uploadMultipleDocuments(
            selectedFiles,
            Number(editedCustomer.id_solicitante)
          );
          console.log('✅ Archivos subidos exitosamente:', uploadResults);
        } catch (error: any) {
          console.error('❌ Error al subir archivos:', error);
          console.error('❌ Error details:', error);
          throw new Error(`Error al subir los nuevos archivos: ${error.message}`);
        }
      }

      // Recargar documentos después de los cambios
      try {
        console.log('🔄 Recargando documentos...');
        const updatedDocuments = await documentService.getDocuments(Number(editedCustomer.id_solicitante));
        setCustomerDocuments(updatedDocuments);
        console.log('✅ Documentos recargados:', updatedDocuments);
      } catch (error) {
        console.error('❌ Error al recargar documentos:', error);
      }

      // Limpiar estados
      setSelectedFiles([]);
      setFilesToDelete([]);

      // Mostrar mensaje de éxito
      alert('Documentos gestionados exitosamente');

    } catch (error: any) {
      console.error('❌ Error en la gestión de documentos:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Función de validación
  const validateData = (data: any): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Validar solicitante
    if (data?.solicitante) {
      if (!data.solicitante.nombres?.trim()) {
        errors['solicitante.nombres'] = 'El nombre es obligatorio';
      }
      if (!data.solicitante.primer_apellido?.trim()) {
        errors['solicitante.primer_apellido'] = 'El primer apellido es obligatorio';
      }
      if (!data.solicitante.numero_documento?.trim()) {
        errors['solicitante.numero_documento'] = 'El número de documento es obligatorio';
      }
      if (data.solicitante.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.solicitante.correo)) {
        errors['solicitante.correo'] = 'El formato del correo es inválido';
      }
    }

    return errors;
  };

  // Función para actualizar datos anidados
  const updateNestedData = (path: string, value: any) => {
    if (!editedData) return;

    console.log('🔄 updateNestedData called:', { path, value });

    const pathArray = path.split('.');
    const newData = JSON.parse(JSON.stringify(editedData));

    // Manejar campos que van en info_extra pero se muestran en la sección básica
    if (pathArray[0] === 'solicitante' && pathArray.length === 2) {
      const fieldName = pathArray[1];
      const infoExtraFields = ['telefono', 'celular', 'estado_civil', 'personas_a_cargo', 'nacionalidad'];

      if (infoExtraFields.includes(fieldName)) {
        // Estos campos van en info_extra
        if (!newData.solicitante.info_extra) {
          newData.solicitante.info_extra = {};
        }
        newData.solicitante.info_extra[fieldName] = value;
      } else {
        // Campos normales del solicitante
        newData.solicitante[fieldName] = value;
      }
    } else {
      // Lógica mejorada para otros paths, manejando arrays correctamente
      let current = newData;
      for (let i = 0; i < pathArray.length - 1; i++) {
        const currentKey = pathArray[i];
        const nextKey = pathArray[i + 1];

        // Si la clave actual no existe, crearla
        if (!current[currentKey]) {
          // Si el siguiente elemento es un número, crear un array
          if (!isNaN(parseInt(nextKey))) {
            current[currentKey] = [];
          } else {
            current[currentKey] = {};
          }
        }

        // Si necesitamos acceder a un índice de array específico
        if (!isNaN(parseInt(currentKey))) {
          const index = parseInt(currentKey);
          // Asegurar que el array tenga suficientes elementos
          while (current.length <= index) {
            current.push({});
          }
          current = current[index];
        } else {
          current = current[currentKey];
        }
      }

      // Establecer el valor final
      const finalKey = pathArray[pathArray.length - 1];
      if (!isNaN(parseInt(finalKey))) {
        const index = parseInt(finalKey);
        while (current.length <= index) {
          current.push({});
        }
        current[index] = value;
      } else {
        current[finalKey] = value;
      }
    }

    console.log('✅ Updated data structure:', newData);
    setEditedData(newData);

    // Limpiar error de validación si existe
    if (validationErrors[path]) {
      const newErrors = { ...validationErrors };
      delete newErrors[path];
      setValidationErrors(newErrors);
    }
  };

  const handleSave = async () => {
    if (!canEditCustomer()) return;

    // Validar que el usuario banco solo pueda guardar registros de su banco
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        if (userObj.rol === 'banco') {
          const userBanco = userObj.info_extra?.banco_nombre || '';
          const customerBanco = customer.banco || editedCustomer.banco || '';
          
          if (userBanco && customerBanco && userBanco !== customerBanco) {
            alert(`No tienes permisos para guardar cambios en registros de ${customerBanco}. Solo puedes editar registros de ${userBanco}.`);
            return;
          }
        }
      } catch (error) {
        console.error('Error validating bank permissions for save:', error);
      }
    }

    // Validar datos antes de enviar
    const errors = validateData(editedData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setApiError('Por favor corrige los errores antes de continuar');
      return;
    }

    setLoading(true);
    setApiError(null);
    setValidationErrors({});

    try {
      console.log('Enviando datos actualizados:', editedData);

      // Verificar que tengamos un ID válido
      if (!solicitanteIdNumber) {
        throw new Error('ID del solicitante no encontrado');
      }

      // Obtener empresa_id y user_id
      const empresaId = localStorage.getItem('empresa_id') || '1';
      const userId = localStorage.getItem('user_id') || localStorage.getItem('cedula') || '123';

      // Detectar cambio de banco
      const currentBankValue = editedData?.solicitudes?.[0]?.banco_nombre || '';
      const bankHasChanged = originalBankValue && currentBankValue && originalBankValue !== currentBankValue;
      
      console.log('🏦 Detección de cambio de banco:', {
        original: originalBankValue,
        current: currentBankValue,
        hasChanged: bankHasChanged
      });

      // Preparar datos en el formato esperado por el backend (siguiendo estructura de crear-registro-completo)
      const requestData: any = {};

      // Solicitante - campos fijos + info_extra como JSON
      if (editedData?.solicitante) {
        requestData.solicitante = {
          nombres: editedData.solicitante.nombres,
          primer_apellido: editedData.solicitante.primer_apellido,
          segundo_apellido: editedData.solicitante.segundo_apellido,
          correo: editedData.solicitante.correo,
          numero_documento: editedData.solicitante.numero_documento,
          tipo_identificacion: editedData.solicitante.tipo_identificacion,
          fecha_nacimiento: editedData.solicitante.fecha_nacimiento,
          genero: editedData.solicitante.genero
        };

        // Campos dinámicos van en info_extra
        if (editedData.solicitante.info_extra) {
          requestData.solicitante.info_extra = editedData.solicitante.info_extra;
        }
      }

      // Ubicaciones - campos fijos + detalle_direccion como JSON
      if (editedData?.ubicaciones && editedData.ubicaciones.length > 0) {
        requestData.ubicaciones = editedData.ubicaciones.map((ubicacion: any) => {
          const ubicacionData: any = {
            ciudad_residencia: ubicacion.ciudad_residencia,
            departamento_residencia: ubicacion.departamento_residencia
          };

          // Campos dinámicos van en detalle_direccion
          if (ubicacion.detalle_direccion) {
            ubicacionData.detalle_direccion = ubicacion.detalle_direccion;
          }

          return ubicacionData;
        });
      }

      // Actividad económica - campos fijos + detalle_actividad como JSON
      if (editedData?.actividad_economica) {
        requestData.actividad_economica = {};

        // Campos dinámicos van en detalle_actividad
        if (editedData.actividad_economica.detalle_actividad) {
          requestData.actividad_economica.detalle_actividad = editedData.actividad_economica.detalle_actividad;
        }
      }

      // Información financiera - campos fijos + detalle_financiera como JSON
      if (editedData?.informacion_financiera) {
        requestData.informacion_financiera = {
          total_ingresos_mensuales: editedData.informacion_financiera.total_ingresos_mensuales,
          total_egresos_mensuales: editedData.informacion_financiera.total_egresos_mensuales,
          total_activos: editedData.informacion_financiera.total_activos,
          total_pasivos: editedData.informacion_financiera.total_pasivos
        };

        // Campos dinámicos van en detalle_financiera
        if (editedData.informacion_financiera.detalle_financiera) {
          requestData.informacion_financiera.detalle_financiera = editedData.informacion_financiera.detalle_financiera;
        }
      }

      // Referencias - campos fijos + detalle_referencia como JSON
      if (editedData?.referencias && editedData.referencias.length > 0) {
        requestData.referencias = editedData.referencias.map((referencia: any) => {
          const referenciaData: any = {
            tipo_referencia: referencia.tipo_referencia
          };

          // Campos dinámicos van en detalle_referencia
          if (referencia.detalle_referencia) {
            referenciaData.detalle_referencia = referencia.detalle_referencia;
          }

          return referenciaData;
        });
      }

      // Solicitudes - campos fijos + campos específicos del tipo de crédito al mismo nivel
      if (editedData?.solicitudes && editedData.solicitudes.length > 0) {
        requestData.solicitudes = editedData.solicitudes.map((solicitud: any) => {
          const solicitudData: any = {
            estado: solicitud.estado,
            banco_nombre: solicitud.banco_nombre,
            ciudad_solicitud: solicitud.ciudad_solicitud
          };

          // Agregar campos básicos de detalle_credito
          if (solicitud.detalle_credito) {
            if (solicitud.detalle_credito.tipo_credito) {
              solicitudData.tipo_credito = solicitud.detalle_credito.tipo_credito;
            }

            // Buscar y agregar campos específicos del tipo de crédito al mismo nivel
            Object.keys(solicitud.detalle_credito).forEach(key => {
              if (key !== 'tipo_credito' && typeof solicitud.detalle_credito[key] === 'object' && solicitud.detalle_credito[key] !== null) {
                // Agregar los campos del tipo específico de crédito (ej: credito_hipotecario)
                solicitudData[key] = solicitud.detalle_credito[key];
              }
            });
          }

          return solicitudData;
        });
      }

      console.log('Datos preparados para envío:', requestData);

      // Construir URL del endpoint
      const endpoint = API_CONFIG.ENDPOINTS.EDITAR_REGISTRO_COMPLETO.replace('{id}', solicitanteIdNumber.toString());
      const url = buildApiUrl(endpoint);

      console.log('URL de la solicitud:', url);

      // Enviar solicitud PATCH
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Empresa-Id': empresaId,
          'X-User-Id': userId,
        },
        body: JSON.stringify(requestData),
      });

      console.log('Respuesta del servidor:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      const updatedCustomer = await response.json();
      console.log('Respuesta exitosa:', updatedCustomer);

      // Refrescar los datos del hook para obtener la información actualizada
      await refetch();

      // Enviar notificación de cambio de banco si es necesario
      if (bankHasChanged) {
        console.log('📧 Enviando notificación de cambio de banco...');
        
        try {
          // Obtener información del usuario actual
          const userData = localStorage.getItem('user');
          let userName = 'Usuario';
          if (userData) {
            const userObj = JSON.parse(userData);
            userName = userObj.nombre || userObj.nombres || 'Usuario';
          }

          // Preparar datos para la notificación
          const emailData = {
            customerName: editedData?.solicitante?.nombres + ' ' + (editedData?.solicitante?.primer_apellido || ''),
            customerDocument: editedData?.solicitante?.numero_documento || '',
            previousBank: originalBankValue,
            newBank: currentBankValue,
            solicitudId: Number(customer.id_solicitud || solicitanteIdNumber),
            changedBy: userName,
            changeDate: new Date().toISOString()
          };

          // Enviar email de notificación
          await emailService.sendBankChangeNotification(emailData, parseInt(empresaId));
          
          // Crear notificación interna
          await emailService.createBankChangeNotification(emailData, parseInt(empresaId));
          
          console.log('✅ Notificaciones de cambio de banco enviadas exitosamente');
        } catch (emailError) {
          console.error('❌ Error al enviar notificaciones de cambio de banco:', emailError);
          // No interrumpir el flujo principal por errores de notificación
        }
      }

      // Mostrar mensaje de éxito
      const successMessage = bankHasChanged 
        ? 'Registro actualizado exitosamente. Se ha notificado el cambio de banco.'
        : 'Registro actualizado exitosamente';
      alert(successMessage);

      // Salir del modo edición
      setIsEditing(false);

      // Limpiar datos editados
      setEditedData(null);

      // Notificar al componente padre
      onSave();
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
              // console.log(`📄 Documento ${index + 1} - ESTRUCTURA COMPLETA:`, document);
              // console.log(`📄 Documento ${index + 1} - TODAS LAS CLAVES:`, Object.keys(document));
              // console.log(`📄 Documento ${index + 1}:`, {
              //   id: document.id,
              //   nombre: document.nombre,
              //   documento_url: document.documento_url,
              //   solicitante_id: document.solicitante_id,
              //   // Verificar otros posibles nombres de campos
              //   filename: (document as any).filename,
              //   original_filename: (document as any).original_filename,
              //   file_name: (document as any).file_name,
              //   name: (document as any).name
              // });

              // Intentar obtener el nombre del archivo de diferentes formas
              const possibleNames = [
                document.nombre,
                (document as any).filename,
                (document as any).original_filename,
                (document as any).file_name,
                (document as any).name
              ];

              const fileName = possibleNames.find(name => name && name !== '') || `Documento ${index + 1}`;
              const isImage = fileName && fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i);
              const fileUrl = document.documento_url;

              // console.log(`📄 Procesando documento ${index + 1}:`, {
              //   possibleNames,
              //   fileName,
              //   fileUrl,
              //   isImage
              // });

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
                           title="Marcar para eliminar"
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
          ) : key === 'banco_nombre' ? (
            <select
              value={editedCustomer[key] || ''}
              onChange={(e) => handleInputChange(key, e.target.value)}
              className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
              disabled={loading || loadingConfig}
            >
              <option value="">{loadingConfig ? 'Cargando bancos...' : 'Seleccionar banco...'}</option>
              {bancos.map((banco) => (
                <option key={banco} value={banco}>{banco}</option>
              ))}
            </select>
          ) : key === 'estado_civil' ? (
            <select
              value={editedCustomer[key] || ''}
              onChange={(e) => handleInputChange(key, e.target.value)}
              className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
              disabled={loading}
            >
              <option value="">Seleccionar estado civil...</option>
              <option value="Soltero">Soltero</option>
              <option value="Casado">Casado</option>
              <option value="Unión Libre">Unión Libre</option>
              <option value="Divorciado">Divorciado</option>
              <option value="Viudo">Viudo</option>
            </select>
          ) : key === 'departamento' ? (
            <select
              value={editedCustomer[key] || ''}
              onChange={(e) => handleInputChange(key, e.target.value)}
              className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
              disabled={loading}
            >
              <option value="">Seleccionar departamento...</option>
              {departments.map((dep) => (
                <option key={dep} value={dep}>{dep}</option>
              ))}
            </select>
          ) : key === 'ciudad' || key === 'ciudad_solicitud' || key === 'lugar_nacimiento' ? (
            <select
              value={editedCustomer[key] || ''}
              onChange={(e) => handleInputChange(key, e.target.value)}
              className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
              disabled={loading || loadingConfig}
            >
              <option value="">{loadingConfig ? 'Cargando ciudades...' : 'Seleccionar ciudad...'}</option>
              {(editedCustomer['departamento']
                ? getCitiesByDepartment(String(editedCustomer['departamento']))
                : ciudades).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
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
        {/* {process.env.NODE_ENV === 'development' && datosCompletos && (
          <div className="bg-blue-50 p-2 text-xs text-blue-700 border rounded">
            ✅ Datos completos cargados del endpoint /solicitantes/{solicitanteIdNumber}/traer-todos-registros
          </div>
        )} */}

        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-600">{apiError}</p>
          </div>
        )}

             {/* CAMPOS DINÁMICOS - Usar datos completos cuando estén disponibles */}
       {datosCompletos ? (
         <>
                       {/* Información Básica del Solicitante */}
            <EditableDynamicSection
              title="Información Básica del Solicitante"
              data={isEditing ? {
                ...editedData?.solicitante,
                ...editedData?.solicitante?.info_extra
              } : {
                ...datosCompletos.solicitante,
                ...datosCompletos.solicitante.info_extra
              }}
              basePath="solicitante"
              excludeKeys={['info_extra']}
              isEditing={isEditing}
              canEdit={canEditCustomer()}
              onUpdate={updateNestedData}
              validationErrors={validationErrors}
            />

            {/* Información de Ubicación */}
            {(datosCompletos.ubicaciones.length > 0 || editedData?.ubicaciones?.length > 0) && (
              <EditableDynamicSection
                title="Información de Ubicación"
                data={isEditing ? editedData?.ubicaciones?.[0] : datosCompletos.ubicaciones[0]}
                basePath="ubicaciones.0"
                isEditing={isEditing}
                canEdit={canEditCustomer()}
                onUpdate={updateNestedData}
                validationErrors={validationErrors}
              />
            )}

            {/* Detalles de Dirección */}
            {(datosCompletos.ubicaciones[0]?.detalle_direccion || editedData?.ubicaciones?.[0]?.detalle_direccion) && (
              <EditableDynamicSection
                title="Detalles de Dirección"
                data={isEditing ? editedData?.ubicaciones?.[0]?.detalle_direccion : datosCompletos.ubicaciones[0].detalle_direccion}
                basePath="ubicaciones.0.detalle_direccion"
                isEditing={isEditing}
                canEdit={canEditCustomer()}
                onUpdate={updateNestedData}
                validationErrors={validationErrors}
              />
            )}

            {/* Información de Actividad Económica */}
            {(datosCompletos.actividad_economica || editedData?.actividad_economica) && (
              <EditableDynamicSection
                title="Actividad Económica"
                data={isEditing ? editedData?.actividad_economica : datosCompletos.actividad_economica}
                basePath="actividad_economica"
                excludeKeys={['detalle_actividad']}
                isEditing={isEditing}
                canEdit={canEditCustomer()}
                onUpdate={updateNestedData}
                validationErrors={validationErrors}
              />
            )}

            {/* Detalles de Actividad Económica con campos condicionales integrados */}
            {(datosCompletos.actividad_economica?.detalle_actividad || editedData?.actividad_economica?.detalle_actividad) && (
              <EditableDynamicSection
                title="Detalles de Actividad Económica"
                data={isEditing ? editedData?.actividad_economica?.detalle_actividad : datosCompletos.actividad_economica.detalle_actividad}
                basePath="actividad_economica.detalle_actividad"
                isEditing={isEditing}
                canEdit={canEditCustomer()}
                onUpdate={updateNestedData}
                validationErrors={validationErrors}
                includeConditionalFields={true}
                esquemaActividad={esquemaActividad}
              />
            )}

            {/* Información Financiera */}
            {(datosCompletos.informacion_financiera || editedData?.informacion_financiera) && (
              <EditableDynamicSection
                title="Información Financiera"
                data={isEditing ? editedData?.informacion_financiera : datosCompletos.informacion_financiera}
                basePath="informacion_financiera"
                excludeKeys={['detalle_financiera']}
                isEditing={isEditing}
                canEdit={canEditCustomer()}
                onUpdate={updateNestedData}
                validationErrors={validationErrors}
              />
            )}

            {/* Detalles Financieros */}
            {(datosCompletos.informacion_financiera?.detalle_financiera || editedData?.informacion_financiera?.detalle_financiera) && (
              <EditableDynamicSection
                title="Detalles Financieros"
                data={isEditing ? editedData?.informacion_financiera?.detalle_financiera : datosCompletos.informacion_financiera.detalle_financiera}
                basePath="informacion_financiera.detalle_financiera"
                isEditing={isEditing}
                canEdit={canEditCustomer()}
                onUpdate={updateNestedData}
                validationErrors={validationErrors}
              />
            )}

            {/* Información de Referencias */}
            {(datosCompletos.referencias.length > 0 || editedData?.referencias?.length > 0) && (
              <EditableDynamicSection
                title="Información de Referencias"
                data={isEditing ? editedData?.referencias?.[0] : datosCompletos.referencias[0]}
                basePath="referencias.0"
                excludeKeys={['detalle_referencia']}
                isEditing={isEditing}
                canEdit={canEditCustomer()}
                onUpdate={updateNestedData}
                validationErrors={validationErrors}
              />
            )}

            {/* Detalles de Referencias */}
            {(datosCompletos.referencias[0]?.detalle_referencia || editedData?.referencias?.[0]?.detalle_referencia) && (
              <EditableDynamicSection
                title="Detalles de Referencias"
                data={isEditing ? editedData?.referencias?.[0]?.detalle_referencia : datosCompletos.referencias[0].detalle_referencia}
                basePath="referencias.0.detalle_referencia"
                isEditing={isEditing}
                canEdit={canEditCustomer()}
                onUpdate={updateNestedData}
                validationErrors={validationErrors}
              />
            )}

            {/* Información de Solicitudes */}
            {(datosCompletos.solicitudes.length > 0 || editedData?.solicitudes?.length > 0) && (
              <EditableDynamicSection
                title="Información de Solicitudes"
                data={isEditing ? editedData?.solicitudes?.[0] : datosCompletos.solicitudes[0]}
                basePath="solicitudes.0"
                excludeKeys={['detalle_credito']}
                isEditing={isEditing}
                canEdit={canEditCustomer()}
                onUpdate={updateNestedData}
                validationErrors={validationErrors}
              />
            )}

            {/* Detalles de Crédito */}
            {(datosCompletos.solicitudes[0]?.detalle_credito || editedData?.solicitudes?.[0]?.detalle_credito) && (
              <>
                <EditableDynamicSection
                  title="Detalles de Crédito"
                  data={isEditing ? editedData?.solicitudes?.[0]?.detalle_credito : datosCompletos.solicitudes[0].detalle_credito}
                  basePath="solicitudes.0.detalle_credito"
                  isEditing={isEditing}
                  canEdit={canEditCustomer()}
                  onUpdate={updateNestedData}
                  validationErrors={validationErrors}
                />

                {/* Detalles específicos del tipo de crédito */}
                {(() => {
                  const creditoData = isEditing ? editedData?.solicitudes?.[0]?.detalle_credito : datosCompletos.solicitudes[0].detalle_credito;
                  const tipoCreditoKey = Object.keys(creditoData || {}).find(key =>
                    key !== 'tipo_credito' && typeof creditoData[key] === 'object' && creditoData[key] !== null
                  );

                  if (tipoCreditoKey && creditoData[tipoCreditoKey]) {
                    return (
                      <EditableDynamicSection
                        title={`Detalles de ${creditoData.tipo_credito || tipoCreditoKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`}
                        data={creditoData[tipoCreditoKey]}
                        basePath={`solicitudes.0.detalle_credito.${tipoCreditoKey}`}
                        isEditing={isEditing}
                        canEdit={canEditCustomer()}
                        onUpdate={updateNestedData}
                        validationErrors={validationErrors}
                      />
                    );
                  }
                  return null;
                })()}
              </>
            )}
         </>
       ) : (
         <>
           {/* Fallback a campos hardcodeados si no hay datos completos */}
           <Section title="Información Básica del Solicitante" keys={[
             'nombre_completo', 'tipo_documento', 'numero_documento',
             'fecha_nacimiento', 'genero', 'correo_electronico'
           ]} customer={editedCustomer} renderField={renderField} />

           <Section title="Información Adicional del Solicitante" keys={[
             'personas_a_cargo', 'telefono', 'nacionalidad', 'estado_civil'
           ]} customer={editedCustomer} renderField={renderField} />

           <Section title="Información de Ubicación" keys={[
             'direccion', 'ciudad', 'departamento'
           ]} customer={editedCustomer} renderField={renderField} />

           <Section title="Actividad Económica" keys={[
             'tipo_actividad', 'sector_economico', 'empresa', 'tipo_contrato'
           ]} customer={editedCustomer} renderField={renderField} />

           <Section title="Información Financiera" keys={[
             'ingresos_mensuales', 'gastos_mensuales', 'total_activos', 'total_pasivos'
           ]} customer={editedCustomer} renderField={renderField} />

           <Section title="Información de Crédito" keys={[
             'estado_credito'
           ]} customer={editedCustomer} renderField={renderField} />
         </>
       )}

               {/* Archivos */}
       <div className="md:col-span-2">
         <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-3 mt-4">Archivos</h3>

         {/* Debug info para documentos */}
         {/* {process.env.NODE_ENV === 'development' && (
           <div className="bg-yellow-50 p-2 text-xs text-yellow-700 border rounded mb-4">
             🔍 Debug documentos: loadingDocuments={loadingDocuments.toString()},
             customerDocuments.length={customerDocuments.length},
             solicitanteIdNumber={solicitanteIdNumber}
           </div>
         )} */}

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

           // console.log('📋 Documentos procesados:', documentsArray);
           // console.log('📋 Tipo de customerDocuments:', typeof customerDocuments);
           // console.log('📋 customerDocuments raw:', customerDocuments);

           if (!loadingDocuments && documentsArray.length === 0) {
             return (
               <div className="text-gray-500 text-sm mb-4">
                 No hay documentos disponibles para este cliente.
                 {process.env.NODE_ENV === 'development' && (
                   <div className="mt-2 text-xs text-gray-400">
                     (Debug: solicitanteIdNumber={solicitanteIdNumber})
                   </div>
                 )}
               </div>
             );
           }

           return (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {documentsArray.map((doc: any, index: number) => {
                 // console.log(`📄 Documento ${index + 1} - ESTRUCTURA COMPLETA:`, doc);
                 // console.log(`📄 Documento ${index + 1} - TODAS LAS CLAVES:`, Object.keys(doc));

                 // Intentar obtener el nombre del archivo de diferentes formas
                 const possibleNames = [
                   doc.nombre,
                   doc.filename,
                   doc.original_filename,
                   doc.file_name,
                   doc.name
                 ];

                 const fileName = possibleNames.find(name => name && name !== '') || `Documento ${index + 1}`;
                 const fileUrl = doc.documento_url || doc.url || doc.file_path;
                 const isImage = fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                 const isMarkedForDeletion = filesToDelete.includes(doc.id);

                 // console.log(`📄 Procesando documento ${index + 1}:`, {
                 //   possibleNames,
                 //   fileName,
                 //   fileUrl,
                 //   isImage
                 // });

                 return (
                   <div
                     key={doc.id || index}
                     className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
                       isMarkedForDeletion
                         ? 'border-red-300 bg-red-50'
                         : 'border-gray-200'
                     }`}
                   >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {isImage ? (
                          <Image className="w-8 h-8 text-blue-500" />
                        ) : (
                          <File className="w-8 h-8 text-gray-500" />
                        )}
                      </div>
                                             <div className="flex-1 min-w-0">
                         <div className="flex items-center space-x-2">
                           <h4 className="text-sm font-medium text-gray-900 truncate">
                             {fileName}
                           </h4>
                           {isMarkedForDeletion && (
                             <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                               Eliminar
                             </span>
                           )}
                         </div>
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

                         {/* Botón de eliminar para documentos existentes */}
                         {isEditing && canEditCustomer() && (
                           <button
                             onClick={() => handleDeleteExistingFile(doc.id)}
                             className="inline-flex items-center mt-2 text-sm text-red-600 hover:text-red-800"
                             title="Marcar para eliminar"
                           >
                             <XIcon className="w-4 h-4 mr-1" />
                             Eliminar
                           </button>
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
             <div className="flex items-center justify-between mb-4">
               <h4 className="text-lg font-medium text-gray-900">Gestión de Documentos</h4>
               <div className="flex space-x-2">
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
                   className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                 >
                   <Upload className="w-4 h-4 mr-2" />
                   Seleccionar Archivos
                 </button>

                 {(selectedFiles.length > 0 || filesToDelete.length > 0) && (
                   <button
                     type="button"
                     onClick={handleManageDocuments}
                     disabled={loading}
                     className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                   >
                     {loading ? (
                       <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                     ) : (
                       <Save className="w-4 h-4 mr-2" />
                     )}
                     {loading ? 'Procesando...' : 'Aplicar Cambios'}
                   </button>
                 )}
               </div>
             </div>

             {/* Resumen de cambios */}
             {(selectedFiles.length > 0 || filesToDelete.length > 0) && (
               <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                 <h5 className="text-sm font-medium text-blue-900 mb-2">Cambios pendientes:</h5>
                 <div className="space-y-1">
                   {selectedFiles.length > 0 && (
                     <div className="text-sm text-blue-700">
                       📤 Archivos a subir: {selectedFiles.length}
                     </div>
                   )}
                   {filesToDelete.length > 0 && (
                     <div className="text-sm text-blue-700">
                       🗑️ Archivos a eliminar: {filesToDelete.length}
                     </div>
                   )}
                 </div>
               </div>
             )}

             {selectedFiles.length > 0 && (
               <div className="mt-4">
                 <h5 className="text-sm font-medium text-gray-700 mb-2">Archivos seleccionados para subir:</h5>
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
      {/* {process.env.NODE_ENV === 'development' && datosCompletos && (
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
      )} */}
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

      {/* Historial de Notificaciones */}
      {customer.id_solicitud && (
        <div className="mt-8">
          <NotificationHistory
            solicitudId={typeof customer.id_solicitud === 'string' ? parseInt(customer.id_solicitud) : customer.id_solicitud}
            empresaId={parseInt(localStorage.getItem('empresa_id') || '1')}
          />
        </div>
      )}
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

// Componente para secciones dinámicas editables
const EditableDynamicSection: React.FC<{
  title: string;
  data: Record<string, any>;
  basePath: string;
  excludeKeys?: string[];
  isEditing: boolean;
  canEdit: boolean;
  onUpdate: (path: string, value: any) => void;
  validationErrors: Record<string, string>;
  includeConditionalFields?: boolean;
  esquemaActividad?: any;
}> = ({ title, data, basePath, excludeKeys = [], isEditing, canEdit, onUpdate, validationErrors, includeConditionalFields = false, esquemaActividad: propEsquemaActividad }) => {
  if (!data || typeof data !== 'object') {
    return null;
  }

  // Configuraciones dinámicas disponibles también aquí
  const empresaIdLocal = parseInt(localStorage.getItem('empresa_id') || '1', 10);
  const { bancos: bancosCfg, ciudades: ciudadesCfg, loading: loadingCfg } = useConfiguraciones(empresaIdLocal);
  const { esquema: esquemaActividad } = useEsquemaCompleto('actividad_economica', empresaIdLocal);
  const { esquema: esquemaSolicitudLocal } = useEsquemaCompleto('solicitud', empresaIdLocal);

  // Helper: normalizar valor de BD a opciones del select tipo_credito
  const normalizeTipoCredito = (v: any): string => {
    if (!v) return '';
    const s = String(v).toLowerCase();
    if (s.includes('vehicul')) return 'vehiculo';
    if (s.includes('hipotec') || s.includes('vivienda')) return 'hipotecario';
    if (s.includes('libre')) return 'libre_inversion';
    if (s.includes('consumo')) return 'consumo';
    // si ya viene uno válido
    const valid = ['hipotecario','consumo','libre_inversion','vehiculo'];
    return valid.includes(s) ? s : '';
  };

  // Mapa del tipo seleccionado -> clave de detalle a usar (vehiculo reutiliza hipotecario)
  const detailKeyForTipoCredito = (normalized: string): string => {
    if (normalized === 'vehiculo') return 'hipotecario';
    return normalized;
  };

  // Get conditional fields if includeConditionalFields is enabled
  const getConditionalFields = () => {
    if (!includeConditionalFields) {
      return [];
    }

    let conditionalFields: string[] = [];

    // Handle tipo_actividad_economica conditional fields
    if (esquemaActividad && data.tipo_actividad_economica) {
      const selected = String(data.tipo_actividad_economica);
      const condCampos = [
        ...(esquemaActividad.campos_dinamicos || []),
        ...(esquemaActividad.campos_fijos || [])
      ]
        .filter(c => c.conditional_on && c.conditional_on.field === 'tipo_actividad_economica' && c.conditional_on.value === selected)
        .sort((a: any, b: any) => (a.order_index ?? 999) - (b.order_index ?? 999));

      conditionalFields.push(...condCampos.map(campo => campo.key));
    }

    // Handle tipo_credito conditional fields using schema
    if (esquemaSolicitudLocal && data.tipo_credito) {
      const selected = String(data.tipo_credito);
      const condCampos = [
        ...(esquemaSolicitudLocal.campos_dinamicos || []),
        ...(esquemaSolicitudLocal.campos_fijos || [])
      ]
        .filter(c => c.conditional_on && c.conditional_on.field === 'tipo_credito' && c.conditional_on.value === selected)
        .sort((a: any, b: any) => (a.order_index ?? 999) - (b.order_index ?? 999));

      conditionalFields.push(...condCampos.map(campo => campo.key));
    }

    return conditionalFields;
  };

  const conditionalFieldKeys = getConditionalFields();

  const filteredKeys = Object.keys(data).filter(key => {
    const value = data[key];

    // Excluir claves específicas
    if (excludeKeys.includes(key)) {
      return false;
    }

    // Excluir campos de timestamps y IDs automáticamente
    if (key === 'created_at' || key === 'updated_at' || key === 'id' ||
        key.endsWith('_id') || key.includes('_id_') ||
        key === 'created_by_user_id' || key === 'assigned_to_user_id') {
      return false;
    }

    // Excluir objetos JSON complejos
    if (typeof value === 'object' && !Array.isArray(value)) {
      return false;
    }

    // Excluir arrays muy largos
    if (Array.isArray(value) && value.length > 10) {
      return false;
    }

    // Mostrar todos los campos relevantes tanto en edición como en visualización
    return true;
  });

  // Add conditional fields to the filtered keys if they should be included
  const allKeys = [...filteredKeys];
  if (includeConditionalFields) {
    // Handle tipo_actividad_economica conditional fields
    const tipoActividadIndex = allKeys.indexOf('tipo_actividad_economica');
    let insertIndex = tipoActividadIndex !== -1 ? tipoActividadIndex + 1 : allKeys.length;
    
    conditionalFieldKeys.forEach(condKey => {
      if (!allKeys.includes(condKey)) {
        // Handle activity economic conditional fields
        if (!condKey.includes('.')) {
          const campoSchema = esquemaActividad?.campos_dinamicos?.find(c => c.key === condKey) || 
                            esquemaActividad?.campos_fijos?.find(c => c.key === condKey);
          
          if (campoSchema?.type === 'object' && campoSchema?.list_values && 'object_structure' in campoSchema.list_values) {
            // Add individual subfields instead of the object field
            const structure = ((campoSchema.list_values as any).object_structure as any[])
              .slice()
              .sort((a: any, b: any) => (a.order_index ?? 999) - (b.order_index ?? 999));
            
            structure.forEach(sub => {
              const subFieldKey = `${condKey}.${sub.key}`;
              allKeys.splice(insertIndex, 0, subFieldKey);
              insertIndex++;
            });
          } else {
            // Add the field normally
            allKeys.splice(insertIndex, 0, condKey);
            insertIndex++;
          }
        }
      }
    });

    // Handle tipo_credito conditional fields
    const tipoCreditoIndex = allKeys.indexOf('tipo_credito');
    let creditInsertIndex = tipoCreditoIndex !== -1 ? tipoCreditoIndex + 1 : allKeys.length;
    
    conditionalFieldKeys.forEach(condKey => {
      if (!allKeys.includes(condKey) && !condKey.includes('.')) {
        // Check if this is a credit conditional field (not activity field)
        const isCreditField = esquemaSolicitudLocal?.campos_dinamicos?.find(c => c.key === condKey && c.conditional_on?.field === 'tipo_credito') ||
                             esquemaSolicitudLocal?.campos_fijos?.find(c => c.key === condKey && c.conditional_on?.field === 'tipo_credito');
        
        if (isCreditField) {
          // Check if this is an object field with structure - if so, add its subfields individually
          if (isCreditField.type === 'object' && isCreditField.list_values && 'object_structure' in isCreditField.list_values) {
            // Add individual subfields instead of the object field
            const structure = ((isCreditField.list_values as any).object_structure as any[])
              .slice()
              .sort((a: any, b: any) => (a.order_index ?? 999) - (b.order_index ?? 999));
            
            structure.forEach(sub => {
              const subFieldKey = `${condKey}.${sub.key}`;
              allKeys.splice(creditInsertIndex, 0, subFieldKey);
              creditInsertIndex++;
            });
          } else {
            // Add the field normally
            allKeys.splice(creditInsertIndex, 0, condKey);
            creditInsertIndex++;
          }
        }
      }
    });
  }

  if (allKeys.length === 0) {
    return null;
  }

  const formatFieldName = (key: string) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getFieldType = (key: string, value: any) => {
    if (key.includes('fecha') || key.includes('date')) return 'date';
    if (key.includes('correo') || key.includes('email')) return 'email';
    if (key.includes('telefono') || key.includes('celular') || key.includes('phone')) return 'tel';
    if (typeof value === 'number' || key.includes('ingreso') || key.includes('gasto') || key.includes('valor') || key.includes('monto')) return 'number';
    if (typeof value === 'boolean') return 'checkbox';
    return 'text';
  };

  const formatDisplayValue = (value: any, key: string) => {
    if (value === null || value === undefined) {
      return '-';
    }

    // Para strings vacíos, mostrar el campo vacío pero editable
    if (value === '') {
      return isEditing ? '' : '-';
    }

    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No';
    }

    if (typeof value === 'number') {
      return value.toLocaleString();
    }

    if (typeof value === 'string') {
      if (key.includes('correo') || key.includes('email')) {
        return (
          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-2 text-gray-500" />
            {value}
          </div>
        );
      }

      if (key.includes('telefono') || key.includes('celular') || /^\d{10,}$/.test(value)) {
        return (
          <div className="flex items-center">
            <Phone className="w-4 h-4 mr-2 text-gray-500" />
            {value}
          </div>
        );
      }

      return value;
    }

    return String(value);
  };

  // Function to render individual subfields as separate grid items
  const renderSubField = (fullKey: string, parentKey: string, subKey: string, value: any, subSchema: any) => {
    const fieldPath = `${basePath}.${parentKey}.${subKey}`;
    const hasError = validationErrors[fieldPath];
    const baseClasses = `border text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5 ${hasError ? 'border-red-300 focus:border-red-500' : 'border-gray-300'}`;

    return (
      <div key={fullKey} className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mt-2">
          {formatFieldName(subKey)}
          {hasError && (
            <span className="ml-1 text-red-500 text-xs">*</span>
          )}
        </label>

        {isEditing && canEdit ? (
          <div className="space-y-1">
            {subSchema?.type === 'boolean' ? (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(e) => onUpdate(fieldPath, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {Boolean(value) ? 'Sí' : 'No'}
                </span>
              </div>
            ) : subSchema?.type === 'number' || subSchema?.type === 'integer' ? (
              <input
                type="number"
                value={value ?? ''}
                onChange={(e) => onUpdate(fieldPath, e.target.value === '' ? '' : Number(e.target.value))}
                className={baseClasses}
              />
            ) : subSchema?.type === 'date' ? (
              <input
                type="date"
                value={value ?? ''}
                onChange={(e) => onUpdate(fieldPath, e.target.value)}
                className={baseClasses}
              />
            ) : (
              <input
                type="text"
                value={value ?? ''}
                onChange={(e) => onUpdate(fieldPath, e.target.value)}
                className={baseClasses}
              />
            )}
          </div>
        ) : (
          <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800">
            {subSchema?.type === 'boolean' ? (value ? 'Sí' : 'No') : (value || '-')}
          </div>
        )}
      </div>
    );
  };

  // Function to render conditional fields with schema information
  const renderConditionalField = (key: string, value: any, campoSchema: any) => {
    const fieldPath = `${basePath}.${key}`;
    const hasError = validationErrors[fieldPath];
    const baseClasses = `border text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5 ${hasError ? 'border-red-300 focus:border-red-500' : 'border-gray-300'}`;

    return (
      <div key={key} className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mt-2">
          {formatFieldName(key)}
          {hasError && (
            <span className="ml-1 text-red-500 text-xs">*</span>
          )}
        </label>

        {isEditing && canEdit ? (
          <div className="space-y-1">
            {campoSchema?.type === 'boolean' ? (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(e) => onUpdate(fieldPath, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {Boolean(value) ? 'Sí' : 'No'}
                </span>
              </div>
            ) : campoSchema?.type === 'number' || campoSchema?.type === 'integer' ? (
              <input
                type="number"
                value={value ?? ''}
                onChange={(e) => onUpdate(fieldPath, e.target.value === '' ? '' : Number(e.target.value))}
                className={baseClasses}
              />
            ) : campoSchema?.type === 'date' ? (
              <input
                type="date"
                value={value ?? ''}
                onChange={(e) => onUpdate(fieldPath, e.target.value)}
                className={baseClasses}
              />
            ) : campoSchema?.type === 'object' && campoSchema?.list_values && 'object_structure' in campoSchema.list_values ? (
              <div className="p-3 rounded-md border border-gray-200">
                <div className="text-sm font-medium text-gray-700 mb-2">{formatFieldName(key)}</div>
                {((campoSchema.list_values as any).object_structure as any[])
                  .slice()
                  .sort((a: any, b: any) => (a.order_index ?? 999) - (b.order_index ?? 999))
                  .map((sub: any) => {
                    const subPath = `${fieldPath}.${sub.key}`;
                    const subVal = value ? value[sub.key] : undefined;
                    
                    if (sub.type === 'number' || sub.type === 'integer') {
                      return (
                        <div key={sub.key} className="mt-2">
                          <label className="block text-xs font-medium text-gray-700">{formatFieldName(sub.key)}</label>
                          <input type="number" value={subVal ?? ''} onChange={(e) => onUpdate(subPath, e.target.value === '' ? '' : Number(e.target.value))} className={baseClasses} />
                        </div>
                      );
                    }
                    if (sub.type === 'boolean') {
                      return (
                        <div key={sub.key} className="mt-2">
                          <label className="block text-xs font-medium text-gray-700">{formatFieldName(sub.key)}</label>
                          <input type="checkbox" checked={!!subVal} onChange={(e) => onUpdate(subPath, e.target.checked)} />
                        </div>
                      );
                    }
                    if (sub.type === 'date') {
                      return (
                        <div key={sub.key} className="mt-2">
                          <label className="block text-xs font-medium text-gray-700">{formatFieldName(sub.key)}</label>
                          <input type="date" value={subVal ?? ''} onChange={(e) => onUpdate(subPath, e.target.value)} className={baseClasses} />
                        </div>
                      );
                    }
                    return (
                      <div key={sub.key} className="mt-2">
                        <label className="block text-xs font-medium text-gray-700">{formatFieldName(sub.key)}</label>
                        <input type="text" value={subVal ?? ''} onChange={(e) => onUpdate(subPath, e.target.value)} className={baseClasses} />
                      </div>
                    );
                  })}
              </div>
            ) : (
              <input
                type="text"
                value={value ?? ''}
                onChange={(e) => onUpdate(fieldPath, e.target.value)}
                className={baseClasses}
              />
            )}
          </div>
        ) : (
          <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800">
            {campoSchema?.type === 'boolean' ? (value ? 'Sí' : 'No') : (value || '-')}
          </div>
        )}
      </div>
    );
  };

  const renderField = (key: string, value: any) => {
    const fieldPath = `${basePath}.${key}`;
    const fieldType = getFieldType(key, value);
    const hasError = validationErrors[fieldPath];
    const displayValue = formatDisplayValue(value, key);

    // Debugging: log the value being rendered
    console.log(`🔍 Rendering field ${key}:`, { value, fieldPath, displayValue });

    return (
      <div key={key} className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mt-2">
          {formatFieldName(key)}
          {hasError && (
            <span className="ml-1 text-red-500 text-xs">*</span>
          )}
        </label>

        {isEditing && canEdit ? (
          <div className="space-y-1">
            {key === 'banco_nombre' ? (
              <select
                value={value || ''}
                onChange={(e) => onUpdate(fieldPath, e.target.value)}
                className={`border text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5 ${
                  hasError ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
                }`}
                disabled={loadingCfg}
              >
                <option value="">{loadingCfg ? 'Cargando bancos...' : 'Seleccionar banco...'}</option>
                {bancosCfg.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            ) : key === 'tipo_credito' ? (
              <>
                {(() => {
                  let opciones: string[] = [];
                  const campoSchema = esquemaSolicitudLocal?.campos_dinamicos?.find(c => c.key === key) || 
                                    esquemaSolicitudLocal?.campos_fijos?.find(c => c.key === key);
                  
                  if (campoSchema && campoSchema.list_values && typeof campoSchema.list_values === 'object' && 'enum' in campoSchema.list_values) {
                    opciones = (campoSchema.list_values as any).enum as string[];
                  } else {
                    // Fallback to hardcoded options if schema not available
                    opciones = ['hipotecario', 'consumo', 'libre_inversion', 'vehiculo'];
                  }

                  return (
                    <select
                      value={value || ''}
                      onChange={(e) => {
                        const nuevo = e.target.value;
                        onUpdate(fieldPath, nuevo);
                      }}
                      className={`border text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5 ${
                        hasError ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Seleccionar tipo de crédito...</option>
                      {opciones.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  );
                })()}
                {/* Conditional fields for tipo_credito will be rendered inline in the main grid */}
              </>
            ) : key === 'tipo_actividad' || key === 'tipo_actividad_economica' ? (
              <>
                {(() => {
                  let opciones: string[] = [];
                  const campoSchema = esquemaActividad?.campos_dinamicos?.find(c => c.key === key) || esquemaActividad?.campos_fijos?.find(c => c.key === key);
                  if (campoSchema && campoSchema.list_values && typeof campoSchema.list_values === 'object' && 'enum' in campoSchema.list_values) {
                    opciones = (campoSchema.list_values as any).enum as string[];
                  } else {
                    opciones = ['Empleado', 'Pensionado', 'Independiente'];
                  }

                  return (
                    <select
                      value={value || ''}
                      onChange={(e) => {
                        const nuevo = e.target.value;
                        onUpdate(fieldPath, nuevo);
                      }}
                      className={`border text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5 ${
                        hasError ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Seleccionar tipo de actividad...</option>
                      {opciones.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  );
                })()}

              </>
            ) : key === 'ciudad' || key === 'ciudad_solicitud' || key === 'lugar_nacimiento' || key === 'ciudad_residencia' ? (
              <select
                value={value || ''}
                onChange={(e) => onUpdate(fieldPath, e.target.value)}
                className={`border text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5 ${
                  hasError ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
                }`}
                disabled={loadingCfg}
              >
                <option value="">{loadingCfg ? 'Cargando ciudades...' : 'Seleccionar ciudad...'}</option>
                {((data['departamento'] || data['departamento_residencia']) ? getCitiesByDepartment(String(data['departamento'] || data['departamento_residencia'])) : ciudadesCfg).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            ) : key === 'estado_civil' ? (
              <select
                value={value || ''}
                onChange={(e) => onUpdate(fieldPath, e.target.value)}
                className={`border text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5 ${
                  hasError ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccionar estado civil...</option>
                <option value="Soltero">Soltero</option>
                <option value="Casado">Casado</option>
                <option value="Unión Libre">Unión Libre</option>
                <option value="Divorciado">Divorciado</option>
                <option value="Viudo">Viudo</option>
              </select>
            ) : key === 'estado' ? (
              <select
                value={value || ''}
                onChange={(e) => onUpdate(fieldPath, e.target.value)}
                className={`border text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5 ${
                  hasError ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccionar...</option>
                <option value="Pendiente">Pendiente</option>
                <option value="En estudio">En estudio</option>
                <option value="Aprobado">Aprobado</option>
                <option value="Negado">Negado</option>
                <option value="Desembolsado">Desembolsado</option>
              </select>
            ) : fieldType === 'checkbox' ? (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(e) => onUpdate(fieldPath, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {Boolean(value) ? 'Sí' : 'No'}
                </span>
              </div>
            ) : fieldType === 'number' ? (
              <input
                type="number"
                value={value || ''}
                onChange={(e) => onUpdate(fieldPath, e.target.value ? Number(e.target.value) : 0)}
                className={`border text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5 ${
                  hasError ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
                }`}
                step="0.01"
              />
            ) : (
              <input
                type={fieldType}
                value={value || ''}
                onChange={(e) => onUpdate(fieldPath, e.target.value)}
                className={`border text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5 ${
                  hasError ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
                }`}
              />
            )}
            {hasError && (
              <div className="flex items-center text-red-600 text-xs mt-1">
                <AlertCircle className="w-3 h-3 mr-1" />
                {validationErrors[fieldPath]}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800 mt-2">
            {displayValue}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="md:col-span-2">
      <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-3 mt-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
        {allKeys.map((key) => {
          // Handle dot-notation keys for subfields (e.g., "datos_empleado.nombre_empresa")
          let value = data[key];
          let isSubField = false;
          let parentKey = '';
          let subKey = '';
          
          if (key.includes('.')) {
            isSubField = true;
            [parentKey, subKey] = key.split('.');
            value = data[parentKey] ? data[parentKey][subKey] : undefined;
          }
          
          // If this is a conditional field and includeConditionalFields is enabled, 
          // render it with schema information
          if (includeConditionalFields && (conditionalFieldKeys.includes(key) || conditionalFieldKeys.includes(parentKey))) {
            if (isSubField) {
              // Find the parent schema and then the subfield schema
              const parentSchema = esquemaActividad?.campos_dinamicos?.find(c => c.key === parentKey) || 
                                 esquemaActividad?.campos_fijos?.find(c => c.key === parentKey);
              
              if (parentSchema?.type === 'object' && parentSchema?.list_values && 'object_structure' in parentSchema.list_values) {
                const subSchema = ((parentSchema.list_values as any).object_structure as any[])
                  .find(sub => sub.key === subKey);
                
                return renderSubField(key, parentKey, subKey, value, subSchema);
              }
            } else {
              const campoSchema = esquemaActividad?.campos_dinamicos?.find(c => c.key === key) || 
                                esquemaActividad?.campos_fijos?.find(c => c.key === key);
              
              return renderConditionalField(key, value, campoSchema);
            }
          }
          
          return renderField(key, value);
        })}
      </div>
    </div>
  );
};

// Componente para secciones dinámicas que renderiza todos los campos de un objeto (solo lectura)
const DynamicSection: React.FC<{
  title: string;
  data: Record<string, any>;
  excludeKeys?: string[];
}> = ({ title, data, excludeKeys = [] }) => {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const filteredKeys = Object.keys(data).filter(key => {
    const value = data[key];

    // Excluir claves específicas
    if (excludeKeys.includes(key)) {
      return false;
    }

    // Excluir campos de timestamps y IDs automáticamente
    if (key === 'created_at' || key === 'updated_at' || key === 'id' ||
        key.endsWith('_id') || key.includes('_id_') ||
        key === 'created_by_user_id' || key === 'assigned_to_user_id') {
      return false;
    }

    // Excluir valores null, undefined o vacíos
    if (value === null || value === undefined || value === '') {
      return false;
    }

    // Excluir objetos JSON ya que los expandiremos en formatValue
    if (typeof value === 'object' && !Array.isArray(value)) {
      return false;
    }

    // Excluir arrays muy largos
    if (Array.isArray(value) && value.length > 10) {
      return false;
    }

    return true;
  });

  if (filteredKeys.length === 0) {
    return null;
  }

  const formatFieldName = (key: string) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined) {
      return '-';
    }

    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No';
    }

    if (typeof value === 'number') {
      return value.toLocaleString();
    }

    if (typeof value === 'string') {
      if (value.trim() === '') {
        return '-';
      }

      if (value.includes('@')) {
        return (
          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-2 text-gray-500" />
            {value}
          </div>
        );
      }

      if (/^\d{10,}$/.test(value)) {
        return (
          <div className="flex items-center">
            <Phone className="w-4 h-4 mr-2 text-gray-500" />
            {value}
          </div>
        );
      }

      return value;
    }

    return String(value);
  };

  return (
    <div className="md:col-span-2">
      <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-3 mt-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
        {filteredKeys.map((key) => {
          const value = data[key];
          const formattedValue = formatValue(value);

          return (
            <div key={key} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mt-2">
                {formatFieldName(key)}
              </label>
              <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800 mt-2">
                {formattedValue}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
