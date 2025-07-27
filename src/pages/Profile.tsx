import { useState } from 'react';
import ProfileDetails from '../components/profile/ProfileDetails';
import { useProfile } from '../hooks/useProfile';
import { PageWrapper } from '../components/PageWrapper';
import toast from 'react-hot-toast';

const Profile = () => {
  const { userInfo, loading, error, updateProfile } = useProfile();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveProfile = async (updatedInfo: any) => {
    try {
      await updateProfile(updatedInfo);
      setIsModalOpen(false);
      toast.success('Perfil actualizado correctamente');
    } catch (err) {
      toast.error('Error al actualizar la información del usuario');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !userInfo) {
    return (
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <div className="text-center">
            {error || 'No se pudo cargar la información del usuario'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex flex-col items-center">
            <img 
              src={userInfo.imagen_aliado || '/default-avatar.png'} 
              alt={userInfo.nombre}
              className="w-32 h-32 rounded-full mb-5 object-cover"
            />
            <h2 className="text-2xl font-bold mb-2">{userInfo.nombre}</h2>
            <p className="text-gray-600 mb-4">{userInfo.rol}</p>
            <div className="grid grid-cols-2 gap-4 w-full max-w-2xl mb-6">
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm font-medium text-gray-500">Correo</p>
                <p className="">{userInfo.correo}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm font-medium text-gray-500">Cédula</p>
                <p className="">{userInfo.cedula}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm font-medium text-gray-500">Empresa</p>
                <p className="">{userInfo.empresa}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm font-medium text-gray-500">Rol</p>
                <p className="">{userInfo.rol}</p>
              </div>
            </div>
            <button 
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
