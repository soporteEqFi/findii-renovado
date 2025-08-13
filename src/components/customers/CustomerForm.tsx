import React, { useState, useRef, useEffect } from 'react';
import { Customer } from '../../types/customer';
import { buildApiUrl, API_CONFIG } from '../../config/constants';
import { Upload, File, X as XIcon, Save, Loader2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCreditTypes, clearCreditTypesCache } from '../../services/creditTypeService';
import { useCities } from '../../hooks/useCities';

interface CustomerFormProps {
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  onSubmit,
  onCancel,
  isLoading
}) => {
  // Obtener la cédula del localStorage al inicializar el componente
  const asesorCedula = localStorage.getItem('cedula') || '';

  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    asesor_usuario: asesorCedula, // Asignar la cédula directamente aquí
    segundo_titular: 'no' // Establecer valor por defecto explícitamente
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Agregar nuevos estados para los campos dinámicos
  const [creditTypeFields, setCreditTypeFields] = useState<any[]>([]);
  const [dynamicFieldValues, setDynamicFieldValues] = useState<Record<string, any>>({});
  const [availableCreditTypes, setAvailableCreditTypes] = useState<any[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Agregar estado para los campos del segundo titular
  const [segundoTitularFields, setSegundoTitularFields] = useState<Record<string, any>>({});

  // Estados para los checkboxes de términos y condiciones
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [aceptaAcuerdoFirma, setAceptaAcuerdoFirma] = useState(false);

  // Hook para cargar ciudades de Colombia
  const { cities, departments, loading: citiesLoading, error: citiesError, getCitiesByDepartment } = useCities();

  // Estado para el departamento seleccionado
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');

  // Función para validar un campo específico
  const validateField = (fieldName: string, value: any): string => {
    const numericValidations: Record<string, { min: number; max: number; step?: number }> = {
      personas_a_cargo: { min: 0, max: 20 },
      estrato: { min: 1, max: 6 },
      ingresos: { min: 0, max: 1000000000, step: 1000 },
      valor_inmueble: { min: 0, max: 5000000000, step: 100000 },
      cuota_inicial: { min: 0, max: 5000000000, step: 100000 },
      porcentaje_financiar: { min: 0, max: 100, step: 0.1 },
      total_activos: { min: 0, max: 10000000000, step: 100000 },
      total_pasivos: { min: 0, max: 10000000000, step: 100000 },
      total_egresos: { min: 0, max: 1000000000, step: 1000 },
      plazo_meses: { min: 12, max: 360 },
      telefono_empresa: { min: 1, max: 9999999999}
    };

    if (numericValidations[fieldName] && value) {
      const numValue = parseFloat(value.toString());
      if (!isNaN(numValue)) {
        const validation = numericValidations[fieldName];
        if (numValue < validation.min || numValue > validation.max) {
          return `Debe estar entre ${validation.min} y ${validation.max}`;
        }
      }
    }

    return '';
  };

  // Función unificada para cargar y procesar los tipos de crédito
  const loadCreditTypes = async (selectedType?: string) => {
    try {
      const cedula = localStorage.getItem('cedula') || '';
      const data = await getCreditTypes(cedula);
      console.log('=== DATOS DE TIPOS DE CRÉDITO EN CUSTOMER FORM ===');
      console.log('Datos de los tipos de crédito:', data);

      // Verificar cada tipo de crédito
      data.forEach((type, index) => {
        console.log(`Tipo ${index}:`, {
          id: type.id,
          name: type.name,
          displayName: type.displayName,
          isActive: type.isActive
        });
      });

      // Guardar los tipos de crédito disponibles
      setAvailableCreditTypes(data);

      // Si hay un tipo seleccionado, procesar sus campos
      if (selectedType) {
        const selectedCreditType = data.find((type: any) =>
          type.name === `credito_${selectedType}`
        );

        if (selectedCreditType) {
          setCreditTypeFields(selectedCreditType.fields);
          const initialValues = selectedCreditType.fields.reduce((acc: any, field: any) => {
            acc[field.name] = '';
            return acc;
          }, {});
          setDynamicFieldValues(initialValues);
        } else {
          setCreditTypeFields([]);
          setDynamicFieldValues({});
        }
      }
    } catch (error) {
      console.error('Error al cargar los tipos de crédito:', error);
      toast.error('Error al cargar los tipos de crédito');
    }
  };

  // Efecto para cargar los tipos de crédito inicialmente
  useEffect(() => {
    console.log('=== CUSTOMER FORM: useEffect ejecutado ===');
    console.log('Componente montado, cargando tipos de crédito...');
    console.log('Estado inicial de segundo_titular:', newCustomer.segundo_titular);
    loadCreditTypes();
  }, []);

  // Efecto para manejar cambios en el tipo de crédito seleccionado
  useEffect(() => {
    console.log('=== CUSTOMER FORM: useEffect para tipo_credito ejecutado ===');
    console.log('tipo_credito:', newCustomer.tipo_credito);
    console.log('availableCreditTypes length:', availableCreditTypes.length);

    if (newCustomer.tipo_credito) {
      const selectedType = availableCreditTypes.find(
        (type: any) => type.name === `credito_${newCustomer.tipo_credito}`
      );

      if (selectedType) {
        setCreditTypeFields(selectedType.fields);
        const initialValues = selectedType.fields.reduce((acc: any, field: any) => {
          acc[field.name] = '';
          return acc;
        }, {});
        setDynamicFieldValues(initialValues);
      }
    }
  }, [newCustomer.tipo_credito, availableCreditTypes]);

  // Efecto para debuggear cambios en segundo_titular
  useEffect(() => {
    console.log('=== DEBUG SEGUNDO TITULAR ===');
    console.log('Estado actual de segundo_titular:', newCustomer.segundo_titular);
    console.log('Estado actual de segundoTitularFields:', segundoTitularFields);
  }, [newCustomer.segundo_titular, segundoTitularFields]);

  const handleInputChange = (field: string, value: any) => {
    // Para todos los campos, permitir escritura libre
    setNewCustomer(prev => ({ ...prev, [field]: value }));

    // Si es el campo segundo_titular, limpiar o inicializar los campos del segundo titular
    if (field === 'segundo_titular') {
      console.log('=== CAMBIO EN SEGUNDO TITULAR ===');
      console.log('Valor seleccionado:', value);
      console.log('Tipo de valor:', typeof value);
      console.log('Valor === "si":', value === 'si');
      console.log('Valor === true:', value === true);
      console.log('Valor === "true":', value === 'true');

      if (String(value).toLowerCase() === 'si' || String(value).toLowerCase() === 'true') {
        console.log('Inicializando campos del segundo titular...');
        // Inicializar los campos del segundo titular
        setSegundoTitularFields({
          nombre: '',
          tipo_documento: '',
          numero_documento: '',
          fecha_nacimiento: '',
          estado_civil: '',
          personas_a_cargo: '',
          numero_celular: '',
          correo_electronico: '',
          nivel_estudio: '',
          profesion: ''
        });
      } else {
        console.log('Limpiando campos del segundo titular...');
        // Limpiar los campos del segundo titular
        setSegundoTitularFields({});
      }
    }

    // Validar el campo y actualizar errores
    const error = validateField(field, value);
    setFieldErrors(prev => ({
      ...prev,
      [field]: error
    }));
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

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Modificar el handleInputChange existente para manejar campos dinámicos
  const handleDynamicFieldChange = (fieldName: string, value: any) => {
    // Permitir escritura libre para todos los campos dinámicos
    setDynamicFieldValues(prev => ({ ...prev, [fieldName]: value }));

    // Validar campos dinámicos si tienen validación
    const field = creditTypeFields.find(f => f.name === fieldName);
    let error = '';

    if (field && field.fieldType === 'number' && field.validation && value) {
      const numValue = parseFloat(value.toString());
      if (!isNaN(numValue)) {
        if (field.validation.minValue !== undefined && numValue < field.validation.minValue) {
          error = `Mínimo ${field.validation.minValue}`;
        } else if (field.validation.maxValue !== undefined && numValue > field.validation.maxValue) {
          error = `Máximo ${field.validation.maxValue}`;
        }
      }
    }

    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };

  // Función para manejar cambios en los campos del segundo titular
  const handleSegundoTitularChange = (fieldName: string, value: any) => {
    setSegundoTitularFields(prev => ({ ...prev, [fieldName]: value }));
  };

  // Función para manejar el cambio de departamento
  const handleDepartmentChange = (department: string) => {
    setSelectedDepartment(department);
    // Actualizar el campo departamento en el estado del cliente
    handleInputChange('departamento', department);
    // Limpiar la ciudad cuando cambia el departamento
    handleInputChange('ciudad_gestion', '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que se hayan aceptado ambos términos y condiciones
    if (!aceptaTerminos) {
      toast.error('Debes aceptar los términos y condiciones de uso para continuar');
      return;
    }

    if (!aceptaAcuerdoFirma) {
      toast.error('Debes aceptar el acuerdo de firma para continuar');
      return;
    }

    // Validaciones específicas para campos numéricos
    const numericValidations: Record<string, { min: number; max: number; step?: number }> = {
      personas_a_cargo: { min: 0, max: 20 },
      estrato: { min: 1, max: 6 },
      ingresos: { min: 0, max: 1000000000, step: 1000 },
      valor_inmueble: { min: 0, max: 5000000000, step: 100000 },
      cuota_inicial: { min: 0, max: 5000000000, step: 100000 },
      porcentaje_financiar: { min: 0, max: 100, step: 0.1 },
      total_activos: { min: 0, max: 10000000000, step: 100000 },
      total_pasivos: { min: 0, max: 10000000000, step: 100000 },
      total_egresos: { min: 0, max: 1000000000, step: 1000 },
      plazo_meses: { min: 12, max: 360 },
      telefono_empresa: { min: 1, max: 9999999999}
    };

    // Validar campos numéricos antes del envío
    const validationErrors: string[] = [];

    Object.entries(numericValidations).forEach(([field, validation]) => {
      const value = newCustomer[field as keyof Customer];
      if (value) {
        const numValue = parseFloat(value.toString());
        if (!isNaN(numValue)) {
          if (numValue < validation.min || numValue > validation.max) {
            validationErrors.push(`${field}: debe estar entre ${validation.min} y ${validation.max}`);
          }
        }
      }
    });

    // Validar campos dinámicos
    creditTypeFields.forEach((field) => {
      if (field.fieldType === 'number' && field.validation) {
        const value = dynamicFieldValues[field.name];
        if (value && field.isRequired) {
          const numValue = parseFloat(value.toString());
          if (!isNaN(numValue)) {
            if (field.validation.minValue !== undefined && numValue < field.validation.minValue) {
              validationErrors.push(`${field.displayName}: mínimo ${field.validation.minValue}`);
            }
            if (field.validation.maxValue !== undefined && numValue > field.validation.maxValue) {
              validationErrors.push(`${field.displayName}: máximo ${field.validation.maxValue}`);
            }
          }
        }
      }
    });

    if (validationErrors.length > 0) {
      toast.error(`Errores de validación:\n${validationErrors.join('\n')}`);
      return;
    }

    try {
      const formData = new FormData();
      // Incluir los campos dinámicos en un JSON bajo "informacion_producto"
      const informacionProducto = { ...dynamicFieldValues };

      // Debug: verificar el valor de segundo_titular
      console.log('=== DEBUG SEGUNDO TITULAR ===');
      console.log('newCustomer.segundo_titular:', newCustomer.segundo_titular);
      console.log('typeof newCustomer.segundo_titular:', typeof newCustomer.segundo_titular);
      console.log('newCustomer.segundo_titular === "si":', newCustomer.segundo_titular === 'si');
      console.log('segundoTitularFields:', segundoTitularFields);

      // Incluir la información del segundo titular en un JSON bajo "info_segundo_titular"
      const segundoTitularValue = String(newCustomer.segundo_titular).toLowerCase();
      const infoSegundoTitular = (segundoTitularValue === 'si' || segundoTitularValue === 'true') ?
                                  { ...segundoTitularFields } : {};

      console.log('infoSegundoTitular result:', infoSegundoTitular);

      // Incluir los campos dinámicos en los datos del cliente
      const customerData = {
        ...newCustomer,
        // Asegurar que segundo_titular se envíe como string
        segundo_titular: newCustomer.segundo_titular === 'si' ? 'si' : 'no',
        informacion_producto: JSON.stringify(informacionProducto),
        info_segundo_titular: JSON.stringify(infoSegundoTitular),
        asesor_usuario: localStorage.getItem('cedula') || ''
      };

      // Debug: verificar los datos antes de enviar
      console.log('Datos del cliente:', customerData);
      console.log('Tipo documento:', customerData.tipo_documento);
      console.log('Segundo titular (valor final):', customerData.segundo_titular);
      console.log('Tipo de segundo titular:', typeof customerData.segundo_titular);
      console.log('Información del producto (JSON):', informacionProducto);
      console.log('Información del segundo titular (JSON):', infoSegundoTitular);

      // Debug: verificar el FormData antes de enviar
      console.log('=== VERIFICACIÓN DEL FORMDATA ===');
      for (let [key, value] of formData.entries()) {
        console.log(`FormData - ${key}:`, value, `(tipo: ${typeof value})`);
      }

      // Agregar todos los campos al FormData
      Object.entries(customerData).forEach(([key, value]) => {
        console.log(`FormData - ${key}:`, value, `(tipo: ${typeof value})`);
        formData.append(key, value?.toString() || '');
      });

      // Verificar específicamente el valor de segundo_titular en el FormData
      console.log('=== VERIFICACIÓN ESPECÍFICA SEGUNDO TITULAR ===');
      console.log('Valor de segundo_titular en FormData:', formData.get('segundo_titular'));
      console.log('Tipo de segundo_titular en FormData:', typeof formData.get('segundo_titular'));

      // Modificar cómo se envían los archivos
      selectedFiles.forEach((file) => {
        formData.append('archivos', file);
      });

      // Realizar la petición a la API
      console.log('=== ENVIANDO PETICIÓN A LA API ===');
      console.log('URL:', buildApiUrl(API_CONFIG.ENDPOINTS.ADD_RECORD));
      console.log('Método:', 'POST');
      console.log('Body (FormData):', formData);

      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.ADD_RECORD), {
        method: 'POST',
        body: formData,
      });

      // Debug: verificar la respuesta de la API
      console.log('=== RESPUESTA DE LA API ===');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', errorData);
        throw new Error(errorData?.message || 'Error al enviar el formulario');
      } else {
        const responseData = await response.json().catch(() => null);
        console.log('Respuesta exitosa:', responseData);
      }

      // Limpiar el caché después de un registro exitoso
      const cedula = localStorage.getItem('cedula') || '';
      clearCreditTypesCache(cedula);

      toast.success('Cliente registrado exitosamente');
      await onSubmit(e);

    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al registrar el cliente');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Información Personal */}
        <div className="md:col-span-3">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-3">Información Personal</h3>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Nombre Completo *
          </label>
          <input
            type="text"
            value={newCustomer.nombre_completo || ''}
            onChange={(e) => handleInputChange('nombre_completo', e.target.value)}
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Tipo Documento *
          </label>
          <select
            value={newCustomer.tipo_documento || ''}
            onChange={(e) => handleInputChange('tipo_documento', e.target.value)}
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
            required
          >
            <option value="">Seleccionar...</option>
            <option value="CC">CC - Cédula de Ciudadanía</option>
            <option value="TI">TI - Tarjeta de Identidad</option>
            <option value="CE">CE - Cédula de Extranjería</option>
            <option value="PA">PA - Pasaporte</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Número Documento *
          </label>
          <input
            type="text"
            value={newCustomer.numero_documento || ''}
            onChange={(e) => handleInputChange('numero_documento', e.target.value)}
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Fecha Nacimiento *
          </label>
          <div className="relative">
            <input
              type="date"
              value={newCustomer.fecha_nacimiento || ''}
              onChange={(e) => handleInputChange('fecha_nacimiento', e.target.value)}
              className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
              required
            />
            {/* <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" /> */}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Estado Civil *
          </label>
          <select
            value={newCustomer.estado_civil || ''}
            onChange={(e) => handleInputChange('estado_civil', e.target.value)}
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
            required
          >
            <option value="">Seleccionar...</option>
            <option value="soltero">Soltero(a)</option>
            <option value="casado">Casado(a)</option>
            <option value="divorciado">Divorciado(a)</option>
            <option value="viudo">Viudo(a)</option>
            <option value="union_libre">Unión Libre</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Personas a Cargo *
          </label>
          <input
            type="number"
            value={newCustomer.personas_a_cargo || ''}
            onChange={(e) => handleInputChange('personas_a_cargo', e.target.value)}
            className={`border text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5 ${
              fieldErrors.personas_a_cargo
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            required
          />
          {fieldErrors.personas_a_cargo && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.personas_a_cargo}</p>
          )}
        </div>

        {/* Contact Information */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Número Celular *
          </label>
          <input
            type="tel"
            value={newCustomer.numero_celular || ''}
            onChange={(e) => handleInputChange('numero_celular', e.target.value)}
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Correo Electrónico *
          </label>
          <input
            type="email"
            value={newCustomer.correo_electronico || ''}
            onChange={(e) => handleInputChange('correo_electronico', e.target.value)}
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
            required
          />
        </div>

        {/* Additional Personal Information */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Nivel Estudio
          </label>
          <select
            value={newCustomer.nivel_estudio || ''}
            onChange={(e) => handleInputChange('nivel_estudio', e.target.value)}
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
          >
            <option value="">Seleccionar...</option>
            <option value="primaria">Primaria</option>
            <option value="bachillerato">Bachillerato</option>
            <option value="tecnico">Técnico</option>
            <option value="tecnologo">Tecnólogo</option>
            <option value="profesional">Profesional</option>
            <option value="postgrado">Postgrado</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Profesión
          </label>
          <input
            type="text"
            value={newCustomer.profesion || ''}
            onChange={(e) => handleInputChange('profesion', e.target.value)}
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
          />
        </div>



        {/* Location Information */}
        <div className="md:col-span-3">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-3 mt-4">Información de Ubicación</h3>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Dirección Residencia *
          </label>
          <input
            type="text"
            value={newCustomer.direccion_residencia || ''}
            onChange={(e) => handleInputChange('direccion_residencia', e.target.value)}
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Tipo de Vivienda *
          </label>
          <select
            value={newCustomer.tipo_vivienda || ''}
            onChange={(e) => handleInputChange('tipo_vivienda', e.target.value)}
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
            required
          >
            <option value="">Seleccionar...</option>
            <option value="propia">Propia</option>
            <option value="familiar">Familiar</option>
            <option value="arrendada">Arrendada</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Barrio *
          </label>
          <input
            type="text"
            value={newCustomer.barrio || ''}
            onChange={(e) => handleInputChange('barrio', e.target.value)}
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Departamento *
          </label>
          <select
            value={selectedDepartment}
            onChange={(e) => handleDepartmentChange(e.target.value)}
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
            required
          >
            <option value="">Seleccionar departamento...</option>
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
          {citiesLoading && (
            <p className="text-xs text-gray-500 mt-1">Cargando departamentos...</p>
          )}
          {citiesError && (
            <p className="text-xs text-red-500 mt-1">{citiesError}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Estrato *
          </label>
          <input
            type="number"
            value={newCustomer.estrato || ''}
            onChange={(e) => handleInputChange('estrato', e.target.value)}
            className={`border text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5 ${
              fieldErrors.estrato
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            required
          />
          {fieldErrors.estrato && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.estrato}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Ciudad de Gestión *
          </label>
          <select
            value={newCustomer.ciudad_gestion || ''}
            onChange={(e) => handleInputChange('ciudad_gestion', e.target.value)}
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
            required
            disabled={!selectedDepartment}
          >
            <option value="">
              {selectedDepartment ? 'Seleccionar ciudad...' : 'Primero selecciona un departamento'}
            </option>
            {selectedDepartment && getCitiesByDepartment(selectedDepartment).map((city) => (
              <option key={city.municipio} value={city.municipio}>
                {city.municipio}
              </option>
            ))}
          </select>
          {citiesLoading && (
            <p className="text-xs text-gray-500 mt-1">Cargando ciudades...</p>
          )}
        </div>

        {/* Informational Laboral */}
        <div className="md:col-span-3">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-3 mt-4">Información Laboral</h3>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Actividad Económica *
          </label>
          <input
            type="text"
            value={newCustomer.actividad_economica || ''}
            onChange={(e) => handleInputChange('actividad_economica', e.target.value)}
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Dirección Empresa *
          </label>
          <input
            type="text"
            value={newCustomer.direccion_empresa || ''}
            onChange={(e) => handleInputChange('direccion_empresa', e.target.value)}
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Teléfono Empresa *
          </label>
          <input
            type="tel"
            value={newCustomer.telefono_empresa || ''}
            onChange={(e) => handleInputChange('telefono_empresa', e.target.value)}
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Tipo de Contrato *
          </label>
          <select
            value={newCustomer.tipo_contrato || ''}
            onChange={(e) => handleInputChange('tipo_contrato', e.target.value)}
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
            required
          >
            <option value="">Seleccionar...</option>
            <option value="indefinido">Indefinido</option>
            <option value="fijo">Término Fijo</option>
            <option value="servicios">Prestación de Servicios</option>
            <option value="obra_labor">Obra o Labor</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Cargo Actual *
          </label>
          <input
            type="text"
            value={newCustomer.cargo_actual || ''}
            onChange={(e) => handleInputChange('cargo_actual', e.target.value)}
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Empresa donde Labora *
          </label>
          <input
            type="text"
            value={newCustomer.empresa_labora || ''}
            onChange={(e) => handleInputChange('empresa_labora', e.target.value)}
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Fecha de Vinculación *
          </label>
          <input
            type="date"
            value={newCustomer.fecha_vinculacion || ''}
            onChange={(e) => handleInputChange('fecha_vinculacion', e.target.value)}
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
            required
          />
        </div>



        {/* Informational Financial */}
        <div className="md:col-span-3">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-3 mt-4">Información Financiera</h3>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Ingresos Mensuales *
          </label>
          <input
            type="number"
            value={newCustomer.ingresos || ''}
            onChange={(e) => handleInputChange('ingresos', e.target.value)}
            className={`border text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5 ${
              fieldErrors.ingresos
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            required
          />
          {fieldErrors.ingresos && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.ingresos}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Valor del Inmueble *
          </label>
          <input
            type="number"
            value={newCustomer.valor_inmueble || ''}
            onChange={(e) => handleInputChange('valor_inmueble', e.target.value)}
            className={`border text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5 ${
              fieldErrors.valor_inmueble
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            required
          />
          {fieldErrors.valor_inmueble && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.valor_inmueble}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Cuota Inicial *
          </label>
          <input
            type="number"
            value={newCustomer.cuota_inicial || ''}
            onChange={(e) => handleInputChange('cuota_inicial', e.target.value)}
            className={`border text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5 ${
              fieldErrors.cuota_inicial
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            required
          />
          {fieldErrors.cuota_inicial && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.cuota_inicial}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Porcentaje a Financiar *
          </label>
          <input
            type="number"
            value={newCustomer.porcentaje_financiar || ''}
            onChange={(e) => handleInputChange('porcentaje_financiar', e.target.value)}
            className={`border text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5 ${
              fieldErrors.porcentaje_financiar
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            required
          />
          {fieldErrors.porcentaje_financiar && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.porcentaje_financiar}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Total Activos *
          </label>
          <input
            type="number"
            value={newCustomer.total_activos || ''}
            onChange={(e) => handleInputChange('total_activos', e.target.value)}
            className={`border text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5 ${
              fieldErrors.total_activos
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            required
          />
          {fieldErrors.total_activos && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.total_activos}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Total Pasivos *
          </label>
          <input
            type="number"
            value={newCustomer.total_pasivos || ''}
            onChange={(e) => handleInputChange('total_pasivos', e.target.value)}
            className={`border text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5 ${
              fieldErrors.total_pasivos
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            required
          />
          {fieldErrors.total_pasivos && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.total_pasivos}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Total Egresos *
          </label>
          <input
            type="number"
            value={newCustomer.total_egresos || ''}
            onChange={(e) => handleInputChange('total_egresos', e.target.value)}
            className={`border text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5 ${
              fieldErrors.total_egresos
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            required
          />
          {fieldErrors.total_egresos && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.total_egresos}</p>
          )}
        </div>



        {/* Informational Credit */}
        <div className="md:col-span-3">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-3 mt-4">Información del Crédito</h3>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Tipo de Crédito *
          </label>
          <select
            value={newCustomer.tipo_credito || ''}
            onChange={(e) => handleInputChange('tipo_credito', e.target.value)}
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
            required
          >
            <option value="">Seleccionar...</option>
            {Array.isArray(availableCreditTypes) && availableCreditTypes.map((type) => {
              // Extraer el nombre sin el prefijo 'credito_'
              const creditType = type.name.replace('credito_', '');
              return (
                <option key={type.id} value={creditType}>
                  {type.displayName}
                </option>
              );
            })}
          </select>
        </div>



        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Banco *
          </label>
          <select
            value={newCustomer.banco || ''}
            onChange={(e) => handleInputChange('banco', e.target.value)}
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
            required
          >
            <option value="">Seleccionar...</option>
            <option value="Bancolombia">Bancolombia</option>
            <option value="Davivienda">Davivienda</option>
            <option value="BBVA">BBVA</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Plazo en Meses *
          </label>
          <input
            type="number"
            value={newCustomer.plazo_meses || ''}
            onChange={(e) => handleInputChange('plazo_meses', e.target.value)}
            className={`border text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5 ${
              fieldErrors.plazo_meses
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            required
          />
          {fieldErrors.plazo_meses && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.plazo_meses}</p>
          )}
        </div>
          {/* Campos dinámicos del tipo de crédito */}
          {creditTypeFields.length > 0 && (
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            {creditTypeFields.map((field) => (
              <div key={field.id} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {field.displayName} {field.isRequired && '*'}
                </label>
                {field.fieldType === 'select' ? (
                  <select
                    value={dynamicFieldValues[field.name] || ''}
                    onChange={(e) => handleDynamicFieldChange(field.name, e.target.value)}
                    className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
                    required={field.isRequired}
                  >
                    <option value="">Seleccionar...</option>
                    {field.options.map((option: string) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.fieldType}
                    value={dynamicFieldValues[field.name] || ''}
                    onChange={(e) => handleDynamicFieldChange(field.name, e.target.value)}
                    className={`border text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5 ${
                      fieldErrors[field.name]
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    required={field.isRequired}
                  />
                )}
                {fieldErrors[field.name] && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors[field.name]}</p>
                )}
              </div>
            ))}
          </div>
        )}


        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Segundo Titular
          </label>
          <select
            value={newCustomer.segundo_titular || 'no'}
            onChange={(e) => handleInputChange('segundo_titular', e.target.value)}
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
          >
            <option value="no">No</option>
            <option value="si">Sí</option>
          </select>
        </div>

        {/* Campos del Segundo Titular - Solo se muestran si se selecciona "Sí" */}
        {(newCustomer.segundo_titular === 'si' || String(newCustomer.segundo_titular).toLowerCase() === 'true') && (
          <>
            <div className="md:col-span-3">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-3 mt-4">Información del Segundo Titular</h3>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Nombre Completo *
              </label>
              <input
                type="text"
                value={segundoTitularFields.nombre || ''}
                onChange={(e) => handleSegundoTitularChange('nombre', e.target.value)}
                className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Tipo Documento *
              </label>
              <select
                value={segundoTitularFields.tipo_documento || ''}
                onChange={(e) => handleSegundoTitularChange('tipo_documento', e.target.value)}
                className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
                required
              >
                <option value="">Seleccionar...</option>
                <option value="CC">CC - Cédula de Ciudadanía</option>
                <option value="TI">TI - Tarjeta de Identidad</option>
                <option value="CE">CE - Cédula de Extranjería</option>
                <option value="PA">PA - Pasaporte</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Número Documento *
              </label>
              <input
                type="text"
                value={segundoTitularFields.numero_documento || ''}
                onChange={(e) => handleSegundoTitularChange('numero_documento', e.target.value)}
                className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Fecha Nacimiento *
              </label>
              <input
                type="date"
                value={segundoTitularFields.fecha_nacimiento || ''}
                onChange={(e) => handleSegundoTitularChange('fecha_nacimiento', e.target.value)}
                className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Estado Civil *
              </label>
              <select
                value={segundoTitularFields.estado_civil || ''}
                onChange={(e) => handleSegundoTitularChange('estado_civil', e.target.value)}
                className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
                required
              >
                <option value="">Seleccionar...</option>
                <option value="soltero">Soltero(a)</option>
                <option value="casado">Casado(a)</option>
                <option value="divorciado">Divorciado(a)</option>
                <option value="viudo">Viudo(a)</option>
                <option value="union_libre">Unión Libre</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Personas a Cargo *
              </label>
              <input
                type="number"
                value={segundoTitularFields.personas_a_cargo || ''}
                onChange={(e) => handleSegundoTitularChange('personas_a_cargo', e.target.value)}
                className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Número Celular *
              </label>
              <input
                type="tel"
                value={segundoTitularFields.numero_celular || ''}
                onChange={(e) => handleSegundoTitularChange('numero_celular', e.target.value)}
                className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Correo Electrónico *
              </label>
              <input
                type="email"
                value={segundoTitularFields.correo_electronico || ''}
                onChange={(e) => handleSegundoTitularChange('correo_electronico', e.target.value)}
                className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Nivel Estudio
              </label>
              <select
                value={segundoTitularFields.nivel_estudio || ''}
                onChange={(e) => handleSegundoTitularChange('nivel_estudio', e.target.value)}
                className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
              >
                <option value="">Seleccionar...</option>
                <option value="primaria">Primaria</option>
                <option value="bachillerato">Bachillerato</option>
                <option value="tecnico">Técnico</option>
                <option value="tecnologo">Tecnólogo</option>
                <option value="profesional">Profesional</option>
                <option value="postgrado">Postgrado</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Profesión
              </label>
              <input
                type="text"
                value={segundoTitularFields.profesion || ''}
                onChange={(e) => handleSegundoTitularChange('profesion', e.target.value)}
                className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
              />
            </div>
          </>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Observaciones
          </label>
          <textarea
            value={newCustomer.observacion || ''}
            onChange={(e) => handleInputChange('observacion', e.target.value)}
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
            rows={3}
          />
        </div>

        {/* File Upload Section */}
        <div className="md:col-span-3">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-3 mt-4">Archivos Adjuntos</h3>
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
        {/* Primer checkbox - Términos y Condiciones de Uso */}
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
                <span className="font-medium">Acepto los Términos y Condiciones de Uso</span> de la plataforma FINDII.CO.
                He leído y comprendo que al aceptar estos términos autorizo el tratamiento de mis datos personales
                y acepto las condiciones establecidas para el uso de la plataforma.
              </label>
              <div className="mt-2">
                <a
                  href="/terminos-condiciones"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                >
                  Leer términos y condiciones completos
                </a>
              </div>
            </div>
          </div>
          {!aceptaTerminos && (
            <p className="text-red-600 text-sm mt-2">
              Debes aceptar los términos y condiciones de uso para continuar
            </p>
          )}
        </div>

        {/* Segundo checkbox - Acuerdo de Firma */}
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
                <span className="font-medium">Acepto el Acuerdo de Firma</span> de la plataforma FINDII.CO.
                He leído y comprendo que al aceptar este acuerdo autorizo el tratamiento de mis datos personales
                y acepto las condiciones establecidas para el proceso de firma de documentos.
              </label>
              <div className="mt-2">
                <a
                  href="/acuerdo-firma"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-800 text-sm font-medium underline"
                >
                  Leer acuerdo de firma completo
                </a>
              </div>
            </div>
          </div>
          {!aceptaAcuerdoFirma && (
            <p className="text-red-600 text-sm mt-2">
              Debes aceptar el acuerdo de firma para continuar
            </p>
          )}
        </div>
      </div>

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