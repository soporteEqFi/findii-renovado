import React, { useState, useRef, useEffect } from 'react';
import { Customer } from '../../types/customer';
import { Upload, File, X as XIcon, Save, Loader2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCreditTypes, clearCreditTypesCache } from '../../services/creditTypeService';

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
    asesor_usuario: asesorCedula // Asignar la cédula directamente aquí
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Agregar nuevos estados para los campos dinámicos
  const [creditTypeFields, setCreditTypeFields] = useState<any[]>([]);
  const [dynamicFieldValues, setDynamicFieldValues] = useState<Record<string, any>>({});
  const [availableCreditTypes, setAvailableCreditTypes] = useState<any[]>([]);

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

  const handleInputChange = (field: string, value: any) => {
    setNewCustomer(prev => ({ ...prev, [field]: value }));
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
    setDynamicFieldValues(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      // Incluir los campos dinámicos en un JSON bajo "informacion_producto"
      const informacionProducto = { ...dynamicFieldValues };
      
      // Incluir los campos dinámicos en los datos del cliente
      const customerData = {
        ...newCustomer,
        informacion_producto: JSON.stringify(informacionProducto),
        asesor_usuario: localStorage.getItem('cedula') || ''
      };
      
      // Debug: verificar los datos antes de enviar
      console.log('Datos del cliente:', customerData);
      console.log('Tipo documento:', customerData.tipo_documento);
      console.log('Información del producto (JSON):', informacionProducto);
      
      // Agregar todos los campos al FormData
      Object.entries(customerData).forEach(([key, value]) => {
        formData.append(key, value?.toString() || '');
      });

      // Modificar cómo se envían los archivos
      selectedFiles.forEach((file) => {
        formData.append('archivos', file);
      });

      // Realizar la petición a la API
      const response = await fetch('http://127.0.0.1:5000/add-record/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', errorData);
        throw new Error(errorData?.message || 'Error al enviar el formulario');
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
            <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
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
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
            required
          />
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
          <input
            type="text"
            value={newCustomer.departamento || ''}
            onChange={(e) => handleInputChange('departamento', e.target.value)}
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Estrato *
          </label>
          <input
            type="number"
            value={newCustomer.estrato || ''}
            onChange={(e) => handleInputChange('estrato', e.target.value)}
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Ciudad de Gestión *
          </label>
          <input
            type="text"
            value={newCustomer.ciudad_gestion || ''}
            onChange={(e) => handleInputChange('ciudad_gestion', e.target.value)}
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
            required
          />
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
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Valor del Inmueble *
          </label>
          <input
            type="number"
            value={newCustomer.valor_inmueble || ''}
            onChange={(e) => handleInputChange('valor_inmueble', e.target.value)}
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Cuota Inicial *
          </label>
          <input
            type="number"
            value={newCustomer.cuota_inicial || ''}
            onChange={(e) => handleInputChange('cuota_inicial', e.target.value)}
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Porcentaje a Financiar *
          </label>
          <input
            type="number"
            value={newCustomer.porcentaje_financiar || ''}
            onChange={(e) => handleInputChange('porcentaje_financiar', e.target.value)}
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Total Activos *
          </label>
          <input
            type="number"
            value={newCustomer.total_activos || ''}
            onChange={(e) => handleInputChange('total_activos', e.target.value)}
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Total Pasivos *
          </label>
          <input
            type="number"
            value={newCustomer.total_pasivos || ''}
            onChange={(e) => handleInputChange('total_pasivos', e.target.value)}
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Total Egresos *
          </label>
          <input
            type="number"
            value={newCustomer.total_egresos || ''}
            onChange={(e) => handleInputChange('total_egresos', e.target.value)}
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
            required
          />
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
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
            required
          />
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
                    className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
                    required={field.isRequired}
                    min={field.validation?.minValue}
                    max={field.validation?.maxValue}
                  />
                )}
              </div>
            ))}
          </div>
        )}


        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Segundo Titular
          </label>
          <input
            type="text"
            value={newCustomer.segundo_titular || ''}
            onChange={(e) => handleInputChange('segundo_titular', e.target.value)}
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
          />
        </div>

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