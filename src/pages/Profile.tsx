import { useState } from 'react';
import ProfileDetails from '../components/profile/ProfileDetails';
import { useProfile } from '../hooks/useProfile';
import toast from 'react-hot-toast';

const Profile = () => {
  const { userInfo, loading, error, updateProfile } = useProfile();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debug: Verificar datos del usuario
  console.log('🔍 Profile: userInfo recibido:', userInfo);
  console.log('🔍 Profile: loading:', loading);
  console.log('🔍 Profile: error:', error);

  const handleSaveProfile = async (updatedInfo: any) => {
    try {
      await updateProfile(updatedInfo);
      setIsModalOpen(false);
      
      // Mensaje diferente si se cambió la contraseña
      if (updatedInfo.contraseña) {
        toast.success('Perfil y contraseña actualizados correctamente');
      } else {
        toast.success('Perfil actualizado correctamente');
      }
    } catch (err) {
      toast.error('Error al actualizar la información del usuario');
    }
  };

  // Mostrar loading solo cuando está cargando y no hay datos
  if (loading && !userInfo) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !userInfo) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mt-4 sm:mt-6">
          <div className="text-center text-sm sm:text-base">
            {error || 'No se pudo cargar la información del usuario'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-4 sm:py-6 lg:py-8">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col items-center">
            <img
              src={userInfo.imagen_aliado || '/default-avatar.png'}
              alt={userInfo.nombre}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full mb-4 sm:mb-5 object-cover"
            />
            <h2 className="text-xl sm:text-2xl font-bold mb-2 text-center">{userInfo.nombre}</h2>
            <p className="text-gray-600 mb-4 sm:mb-6 text-center">{userInfo.rol}</p>
            
            {/* Responsive grid for user info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-2xl mb-6">
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm font-medium text-gray-500">Correo</p>
                <p className="text-sm sm:text-base break-words">{userInfo.correo}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm font-medium text-gray-500">Cédula</p>
                <p className="text-sm sm:text-base">{userInfo.cedula}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm font-medium text-gray-500">Empresa</p>
                <p className="text-sm sm:text-base break-words">{userInfo.empresa}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm font-medium text-gray-500">Rol</p>
                <p className="text-sm sm:text-base">{userInfo.rol}</p>
              </div>
            </div>
            
            <button
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto"
              onClick={() => setIsModalOpen(true)}
            >
              Editar Perfil
            </button>
          </div>
        </div>

        <ProfileDetails
          userInfo={userInfo}
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProfile}
        />

        {/* Success messages are now handled by toast */}
      </div>
    </div>
  );
};

export default Profile;
