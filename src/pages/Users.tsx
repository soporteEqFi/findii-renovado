import React, { useState, useEffect } from 'react';
import { Loader2, Plus, UserPlus } from 'lucide-react';
import Modal from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';
import { useUsers } from '../hooks/useUsers';
import { UserTable } from '../components/users/UserTable';
import { UserDetails } from '../components/users/UserDetails';
import { User } from '../types/user';

const Users = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    users,
    isLoading,
    error,
    loadUsers,
    updateUser,
    deleteUser
  } = useUsers();

  // Estados locales
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
    }
  }, [isAuthenticated, loadUsers]);

  // Definir los permisos para cada usuario
  const canEdit = () => user && ['admin'].includes(user.role);
  const canDelete = () => user && user.role === 'admin';

  // Manejadores de eventos
  const handleRowClick = (user: User) => {
    setSelectedUser(user);
    setEditedUser(user);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = () => {
    if (canEdit()) {
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!editedUser) return;
    try {
      const updatedUser = await updateUser(editedUser);
      setSelectedUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser || !canDelete()) return;
    try {
      await deleteUser(selectedUser.id);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleInputChange = (field: keyof User, value: string) => {
    if (!editedUser) return;
    setEditedUser({ ...editedUser, [field]: value });
  };

  // Renderizado condicional para estados de carga y autenticación
  if (authLoading || (isLoading && !isModalOpen)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Verificar si el usuario ha iniciado sesión
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Authentication Required</h2>
        <p className="text-gray-600">Please log in to view user information.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">Usuarios</h1>
          <div className="flex items-center space-x-4">
            {user && (
              <span className="text-sm text-gray-600">
                Logged in as: <span className="font-medium">{user.name}</span>
                {user.role && (
                  <span className="ml-2 px-2 py-1 bg-gray-100 rounded-full text-xs">
                    {user.role}
                  </span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Botón Nuevo Usuario */}
        {canEdit() && (
          <div className="flex justify-end p-4 bg-gray-50 border-b">
            <button
              onClick={() => {/* TODO: implementar creación de usuario */}}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Nuevo Usuario
            </button>
          </div>
        )}

        {/* Tabla de Usuarios */}
        <UserTable
          users={users}
          onRowClick={handleRowClick}
          totalRecords={users.length}
        />
      </div>

      {/* Modal de Detalles */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditing(false);
        }}
        title="Detalles del Usuario"
        maxWidth="max-w-2xl"
      >
        {selectedUser && (
          <UserDetails
            user={selectedUser}
            editedUser={editedUser!}
            isEditing={isEditing}
            isLoading={isLoading}
            error={error}
            canEdit={canEdit}
            canDelete={canDelete}
            onEdit={handleEdit}
            onSave={handleSave}
            onDelete={handleDelete}
            onInputChange={handleInputChange}
          />
        )}
      </Modal>
    </>
  );
};

export default Users; 