import { useState, useEffect } from 'react';
import ProfileDetails from '../components/profile/ProfileDetails';
import { useAuth } from '../contexts/AuthContext';

interface UserInfo {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  cedula: string;
  empresa: string;
  imagen_aliado: string;
}

const Profile = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const { user } = useAuth();

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const user_document = localStorage.getItem('user');
      const userData = JSON.parse(user_document || '{}');
      const user_document_obj = userData.cedula;

      const response = await fetch(`http://127.0.0.1:5000/get-user-info/${user_document_obj}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar la información del usuario');
      }

      const data = await response.json();
      setUserInfo(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar la información del usuario');
      console.error('Error fetching user info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const handleSaveProfile = async (updatedInfo: Partial<UserInfo>) => {
    try {
      setLoading(true);
      const user_document = localStorage.getItem('user');
      const userData = JSON.parse(user_document || '{}');
      const user_document_obj = userData.cedula;

      const payload = {
        id: updatedInfo.id,
        nombre: updatedInfo.nombre,
        cedula: updatedInfo.cedula,
        rol: updatedInfo.rol,
        empresa: updatedInfo.empresa,
      };

      console.log("Actualizando con payload:", payload);

      const response = await fetch(`http://127.0.0.1:5000/update-user/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la información');
      }

      await fetchUserInfo();
      setIsModalOpen(false);
      setSuccessMessage('Perfil actualizado correctamente');
      setShowSuccessAlert(true);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 3000);
    } catch (err) {
      setError('Error al actualizar la información del usuario');
      console.error('Error updating user info:', err);
    } finally {
      setLoading(false);
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

        {/* Success Alert */}
        {showSuccessAlert && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-md">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              {successMessage}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
