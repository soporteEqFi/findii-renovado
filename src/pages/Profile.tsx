import { Container, Paper, Box, CircularProgress, Button, Snackbar, Alert } from '@mui/material';
import ProfileDetails from '../components/profile/ProfileDetails';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // <-- NUEVO

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

      await fetchUserInfo(); // Refresca
      setIsModalOpen(false);
      setSuccessMessage('Perfil actualizado correctamente'); // <-- NUEVO MENSAJE
    } catch (err) {
      setError('Error al actualizar la información del usuario');
      console.error('Error updating user info:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !userInfo) {
    return (
      <Container>
        <Paper sx={{ p: 3, mt: 3 }}>
          <Box textAlign="center">
            {error || 'No se pudo cargar la información del usuario'}
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container>
      <Box py={4}>
        <Paper sx={{ p: 4 }}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <img 
              src={userInfo.imagen_aliado || '/default-avatar.png'} 
              alt={userInfo.nombre}
              style={{ width: '120px', height: '120px', borderRadius: '50%', marginBottom: '20px', objectFit: 'cover' }}
            />
            <h2 className="text-2xl font-bold mb-2">{userInfo.nombre}</h2>
            <p className="text-gray-600 mb-4">{userInfo.rol}</p>
            <div className="grid grid-cols-2 gap-4 w-full max-w-2xl mb-6">
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-500">Correo</p>
                <p className="font-medium">{userInfo.correo}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-500">Cédula</p>
                <p className="font-medium">{userInfo.cedula}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-500">Empresa</p>
                <p className="font-medium">{userInfo.empresa}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-500">Rol</p>
                <p className="font-medium">{userInfo.rol}</p>
              </div>
            </div>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => setIsModalOpen(true)}
            >
              Editar Perfil
            </Button>
          </Box>
        </Paper>

        <ProfileDetails 
          userInfo={userInfo}
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProfile}
        />

        {/* Snackbar para mensaje de éxito */}
        <Snackbar 
          open={!!successMessage} 
          autoHideDuration={3000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success" onClose={handleCloseSnackbar} variant="filled">
            {successMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default Profile;
