import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface NewUserFormProps {
  onSubmit: (userData: {
    email: string;
    password: string;
    nombre: string;
    rol: string;
    cedula: string;
    empresa: string;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export const NewUserForm: React.FC<NewUserFormProps> = ({
  onSubmit,
  onCancel,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    rol: '',
    cedula: '',
    empresa: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nombre</label>
        <input
          type="text"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.nombre}
          onChange={(e) => handleInputChange('nombre', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
        <input
          type="password"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Cédula</label>
        <input
          type="text"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.cedula}
          onChange={(e) => handleInputChange('cedula', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Empresa</label>
        <input
          type="text"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.empresa}
          onChange={(e) => handleInputChange('empresa', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Rol</label>
        <select
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.rol}
          onChange={(e) => handleInputChange('rol', e.target.value)}
        >
          <option value="">Seleccionar...</option>
          <option value="admin">Admin</option>
          <option value="rh">RH</option>
          <option value="banco">Banco</option>
        </select>
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