import React, { useState, useEffect } from 'react';
import { Loader2, Plus, UserPlus } from 'lucide-react';
import Modal from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import { useUsers } from '../hooks/useUsers';
import { UserTable } from '../components/users/UserTable';
import { UserDetails } from '../components/users/UserDetails';
import { NewUserForm } from '../components/users/NewUserForm';
import { User, CreateUserData, UpdateUserData } from '../types/user';

const Users = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    users,
    isLoading,
    error,
    loadUsers,
    updateUser,
    deleteUser,
    createUser
  } = useUsers();

  // Estados locales
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);

  // Obtener empresa_id del usuario autenticado o usar valor por defecto
  const empresaId = 1; // Valor por defecto para empresa_id

  useEffect(() => {
    if (isAuthenticated) {
      loadUsers(empresaId);
    }
  }, [isAuthenticated, loadUsers, empresaId]);

  // Definir los permisos para cada usuario
  const canEdit = (): boolean => user?.rol === 'admin' || user?.rol === 'supervisor';
  const canDelete = (): boolean => user?.rol === 'admin' || user?.rol === 'supervisor';

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
      const updateData: UpdateUserData = {};

      // Solo incluir campos que han cambiado
      if (editedUser.nombre !== selectedUser?.nombre) updateData.nombre = editedUser.nombre;
      if (editedUser.cedula !== selectedUser?.cedula) updateData.cedula = editedUser.cedula;
      if (editedUser.correo !== selectedUser?.correo) updateData.correo = editedUser.correo;
      if (editedUser.rol !== selectedUser?.rol) updateData.rol = editedUser.rol;
      if (editedUser.info_extra !== selectedUser?.info_extra) updateData.info_extra = editedUser.info_extra;

      const updatedUser = await updateUser(editedUser.id, updateData, empresaId);
      setSelectedUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error('Error actualizando usuario:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser || !canDelete()) return;

    // Confirmación antes de eliminar
    const confirmacion = window.confirm(
      `¿Estás seguro de que deseas eliminar al usuario "${selectedUser.nombre}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmacion) return;

    try {
      await deleteUser(selectedUser.id, empresaId);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error eliminando usuario:', error);
    }
  };

  const handleInputChange = (field: keyof User, value: string) => {
    if (!editedUser) return;
    setEditedUser({ ...editedUser, [field]: value });
  };

  const handleCreateUser = async (userData: CreateUserData) => {
    try {
      await createUser(userData, empresaId);
      setIsNewUserModalOpen(false);
    } catch (error) {
      console.error('Error creando usuario:', error);
    }
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
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Autenticación Requerida</h2>
        <p className="text-gray-600">Por favor inicia sesión para ver la información de usuarios.</p>
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
                Conectado como: <span className="font-medium">{user.nombre}</span>
                {user.rol && (
                  <span className="ml-2 px-2 py-1 bg-gray-100 rounded-full text-xs">
                    {user.rol}
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
              onClick={() => setIsNewUserModalOpen(true)}
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
        size="xl"
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

      {/* Modal de Nuevo Usuario */}
      <Modal
        isOpen={isNewUserModalOpen}
        onClose={() => setIsNewUserModalOpen(false)}
        title="Crear Nuevo Usuario"
        size="xl"
      >
        <NewUserForm
          onSubmit={handleCreateUser}
          onCancel={() => setIsNewUserModalOpen(false)}
          isLoading={isLoading}
        />
      </Modal>
    </>
  );
};

export default Users;