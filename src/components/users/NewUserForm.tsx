import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { CreateUserData } from '../../types/user';

interface NewUserFormProps {
  onSubmit: (userData: CreateUserData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export const NewUserForm: React.FC<NewUserFormProps> = ({
  onSubmit,
  onCancel,
  isLoading
}) => {
  const [formData, setFormData] = useState<CreateUserData>({
    correo: '',
    contraseña: '',
    nombre: '',
    rol: '',
    cedula: '',
    info_extra: {
      ciudad: '',
      banco_nombre: '',
      linea_credito: ''
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Limpiar info_extra si todos los campos están vacíos
    const infoExtra = formData.info_extra || {};
    const hasInfoExtra = Object.values(infoExtra).some(value => value && value.trim() !== '');

    const dataToSubmit = {
      ...formData,
      info_extra: hasInfoExtra ? infoExtra : undefined
    };

    await onSubmit(dataToSubmit);
  };

  const handleInputChange = (field: keyof CreateUserData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInfoExtraChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      info_extra: {
        ...prev.info_extra,
        [field]: value
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Campos principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre *</label>
          <input
            type="text"
            required
            className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.nombre}
            onChange={(e) => handleInputChange('nombre', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Cédula *</label>
          <input
            type="text"
            required
            className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.cedula}
            onChange={(e) => handleInputChange('cedula', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Correo *</label>
          <input
            type="email"
            required
            className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.correo}
            onChange={(e) => handleInputChange('correo', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Contraseña *</label>
          <input
            type="password"
            required
            className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.contraseña}
            onChange={(e) => handleInputChange('contraseña', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Rol *</label>
          <select
            required
            className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.rol}
            onChange={(e) => handleInputChange('rol', e.target.value)}
          >
            <option value="">Seleccionar...</option>
            <option value="admin">Admin</option>
            <option value="banco">Banco</option>
            <option value="asesor">Asesor</option>
          </select>
        </div>
      </div>

      {/* Información adicional */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Información Adicional (Opcional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Ciudad</label>
            <input
              type="text"
              className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.info_extra?.ciudad || ''}
              onChange={(e) => handleInfoExtraChange('ciudad', e.target.value)}
              placeholder="Ej: Barranquilla"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Banco</label>
            <input
              type="text"
              className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.info_extra?.banco_nombre || ''}
              onChange={(e) => handleInfoExtraChange('banco_nombre', e.target.value)}
              placeholder="Ej: Bancolombia"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Línea de Crédito</label>
            <select
              className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.info_extra?.linea_credito || ''}
              onChange={(e) => handleInfoExtraChange('linea_credito', e.target.value)}
            >
              <option value="">Seleccionar...</option>
              <option value="hipotecario">Hipotecario</option>
              <option value="vehicular">Vehicular</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creando...
            </>
          ) : (
            'Crear Usuario'
          )}
        </button>
      </div>
    </form>
  );
};