import React, { useState, useEffect } from 'react';
import { Customer } from '../../types/customer';
import { Mail, Phone, Save, Loader2, Trash2, X, Edit2 } from 'lucide-react';
import { usePermissions } from '../../utils/permissions';

interface CustomerDetailsProps {
  customer: Customer;
  isLoading: boolean;
  error: string | null;
  onCustomerUpdate: (updatedCustomer: Customer) => void;
  onCustomerDelete: (solicitanteId: string) => void;
}

export const CustomerDetails: React.FC<CustomerDetailsProps> = ({
  customer,
  isLoading,
  error,
  onCustomerUpdate,
  onCustomerDelete,
}) => {
  const { canEditCustomer, canDeleteCustomer } = usePermissions();
  const [isEditing, setIsEditing] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState<Customer>(customer);
  const [loading, setLoading] = useState(isLoading);
  const [apiError, setApiError] = useState<string | null>(error);

  useEffect(() => {
    // Mapear los campos del customer al formato correcto cuando se recibe
    const mappedCustomer = {
      ...customer,
      id_solicitante: customer.id_solicitante || customer.solicitante_id || customer.id,
      nombre_completo: customer.nombre_completo || '',
      correo_electronico: customer.correo_electronico || '',
      direccion_residencia: customer.direccion_residencia || '',
      tipo_contrato: customer.tipo_contrato || '',
      tipo_de_credito: customer.tipo_de_credito || '',
    };
   
    setEditedCustomer(mappedCustomer);
  }, [customer]);

  const handleInputChange = (field: keyof Customer, value: string) => {
    setEditedCustomer(prev => {
      const newCustomer = { ...prev, [field]: value };
      // console.log('Campo actualizado:', field, 'Nuevo valor:', value);
      return newCustomer;
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
    if (!canDeleteCustomer) return;

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

      onCustomerDelete(customer.id_solicitante);
    } catch (error: any) {
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!canEditCustomer) return;

    setLoading(true);
    setApiError(null);

    try {
      console.log('Enviando datos actualizados:', editedCustomer);

      // Verificar que tengamos un ID válido
      if (!editedCustomer.id_solicitante) {
        throw new Error('ID del solicitante no encontrado');
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
          tipo_credito: editedCustomer.tipo_de_credito,
          plazo_meses: Number(editedCustomer.plazo_meses) || 0,
          segundo_titular: typeof editedCustomer.segundo_titular === 'boolean' 
            ? (editedCustomer.segundo_titular ? 'si' : 'no')
            : (editedCustomer.segundo_titular || 'no'),
          observacion: editedCustomer.observacion,
          estado: editedCustomer.estado
        },
        SOLICITUDES: {
          banco: editedCustomer.banco
        }
      };

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
      
      if (typeof onCustomerUpdate === 'function') {
        onCustomerUpdate(updatedCustomer);
      }
      
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error en la actualización:', error);
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (key: keyof Customer, value: any) => {
    if (key === 'id' || key === 'created_at' || key === 'archivos' || key === 'asesor_usuario') return null;

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
        {isEditing && canEditCustomer ? (
          <input
            type={key.includes('date') || key.includes('fecha') ? 'date' : 'text'}
            value={editedCustomer[key] || ''}
            onChange={(e) => handleInputChange(key, e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            disabled={loading}
          />
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
        'tipo_de_credito', 'plazo_meses', 'segundo_titular', 'observacion', 'estado'
      ]} customer={editedCustomer} renderField={renderField} />

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
            {canEditCustomer && (
              <button
                onClick={handleEdit}
                className="flex items-center bg-blue-500 text-white px-3 py-2 rounded-md shadow hover:bg-blue-600"
              >
                <Edit2 className="mr-2" />
                Editar
              </button>
            )}
            {canDeleteCustomer && (
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
