import { useState, useEffect } from 'react';

interface UserInfo {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  cedula: string;
  empresa?: string;
  imagen_aliado?: string | null;
  apellido?: string;
  usuario?: string;
  info_extra?: any;
}

interface ProfileDetailsProps {
  userInfo: UserInfo;
  open: boolean;
  onClose: () => void;
  onSave: (updatedInfo: Partial<UserInfo>) => void;
}

const ProfileDetails = ({ userInfo, open, onClose, onSave }: ProfileDetailsProps) => {
  const [formData, setFormData] = useState<UserInfo>(userInfo);

  useEffect(() => {
    setFormData(userInfo);
  }, [userInfo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Editar Perfil</h2>
        </div>

        <div className="px-6 py-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cédula</label>
              <input
                type="text"
                name="cedula"
                value={formData.cedula}
                onChange={handleChange}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
              <input
                type="text"
                name="empresa"
                value={formData.empresa || ''}
                onChange={handleChange}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL de Imagen</label>
              <input
                type="text"
                name="imagen_aliado"
                value={formData.imagen_aliado}
                onChange={handleChange}
                disabled
                placeholder="URL de la imagen de perfil"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-not-allowed"
              />
            </div> */}

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <input
                type="text"
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              />
            </div> */}
          </div>
        </div>

        <div className="px-6 py-4 border-t flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;