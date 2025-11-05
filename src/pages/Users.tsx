import { useState, useEffect } from 'react';
import { Loader2, UserPlus, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import { useUsers } from '../hooks/useUsers';
import { UserTable } from '../components/users/UserTable';
import { UserDetails } from '../components/users/UserDetails';
import { NewUserForm } from '../components/users/NewUserForm';
import { User, CreateUserData, UpdateUserData } from '../types/user';
import { getTimeRemaining } from '../utils/dateValidation';

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
  const [originalUser, setOriginalUser] = useState<User | null>(null); // Copia del usuario original para comparar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);

  // Obtener empresa_id del localStorage o usar valor por defecto
  const empresaId = parseInt(localStorage.getItem('empresa_id') || '1', 10);

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
    // Guardar una copia profunda del usuario original para comparar después
    const originalUserCopy = JSON.parse(JSON.stringify(user));
    setSelectedUser(user);
    setEditedUser(user);
    setOriginalUser(originalUserCopy);
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

    console.log('🚀 handleSave INICIADO');
    console.log('🚀 editedUser.info_extra:', editedUser.info_extra);
    console.log('🚀 selectedUser?.info_extra:', selectedUser?.info_extra);
    console.log('🚀 originalUser?.info_extra:', originalUser?.info_extra);

    try {
      const updateData: UpdateUserData = {};

      // Solo incluir campos que han cambiado
      if (editedUser.nombre !== selectedUser?.nombre) updateData.nombre = editedUser.nombre;
      if (editedUser.cedula !== selectedUser?.cedula) updateData.cedula = editedUser.cedula;
      if (editedUser.correo !== selectedUser?.correo) updateData.correo = editedUser.correo;
      if (editedUser.rol !== selectedUser?.rol) updateData.rol = editedUser.rol;
      if (editedUser.reports_to_id !== selectedUser?.reports_to_id) updateData.reports_to_id = editedUser.reports_to_id;
      // Comparar info_extra de forma más robusta
      // Primero parsear y limpiar campos temporales de ambos objetos para comparar correctamente
      let parsedEditedInfoExtra: any = {};
      let parsedSelectedInfoExtra: any = {};

      // Parsear info_extra de editedUser
      if (editedUser.info_extra) {
        if (typeof editedUser.info_extra === 'string') {
          try {
            parsedEditedInfoExtra = JSON.parse(editedUser.info_extra);
          } catch {
            parsedEditedInfoExtra = {};
          }
        } else {
          parsedEditedInfoExtra = editedUser.info_extra;
        }
      }

      // Usar originalUser para comparar (el estado original antes de editar)
      const userToCompare = originalUser || selectedUser;

      // Parsear info_extra del usuario original (para comparar)
      if (userToCompare?.info_extra) {
        if (typeof userToCompare.info_extra === 'string') {
          try {
            parsedSelectedInfoExtra = JSON.parse(userToCompare.info_extra);
          } catch {
            parsedSelectedInfoExtra = {};
          }
        } else {
          parsedSelectedInfoExtra = userToCompare.info_extra;
        }
      }

      console.log('🔍 Usando originalUser para comparar:', originalUser ? 'SÍ' : 'NO');

      // Detectar objetos corruptos con claves numéricas en editedUser
      if (typeof parsedEditedInfoExtra === 'object' && parsedEditedInfoExtra !== null) {
        const keys = Object.keys(parsedEditedInfoExtra);
        const hasNumericKeys = keys.some(key => /^\d+$/.test(key));

        if (hasNumericKeys) {
          try {
            const reconstructedJson = Object.values(parsedEditedInfoExtra).join('');
            parsedEditedInfoExtra = JSON.parse(reconstructedJson);
          } catch (error) {
            parsedEditedInfoExtra = {};
          }
        }
      }

      // Verificar si el usuario originalmente tenía campos temporales (ANTES de limpiar)
      const originallyHadTemporalFields = parsedSelectedInfoExtra.tiempo_conexion ||
                                          parsedSelectedInfoExtra.usuario_activo !== undefined;

      // Verificar si el usuario editado tiene campos temporales (ANTES de limpiar)
      const editedHasTemporalFields = parsedEditedInfoExtra.tiempo_conexion ||
                                     parsedEditedInfoExtra.usuario_activo !== undefined;

      // Crear copias para comparar SIN campos temporales
      let cleanedEditedForComparison = { ...parsedEditedInfoExtra };
      let cleanedSelectedForComparison = { ...parsedSelectedInfoExtra };

      // Limpiar campos temporales de ambas copias para comparar
      delete cleanedEditedForComparison.tiempo_conexion;
      delete cleanedEditedForComparison.usuario_activo;
      delete cleanedSelectedForComparison.tiempo_conexion;
      delete cleanedSelectedForComparison.usuario_activo;

      // Comparar objetos parseados DESPUÉS de limpiar campos temporales
      const editedKeys = Object.keys(cleanedEditedForComparison).sort();
      const selectedKeys = Object.keys(cleanedSelectedForComparison).sort();

      console.log('🔍 Comparación de info_extra:');
      console.log('🔍 parsedEditedInfoExtra (ORIGINAL):', JSON.stringify(parsedEditedInfoExtra, null, 2));
      console.log('🔍 parsedSelectedInfoExtra (ORIGINAL):', JSON.stringify(parsedSelectedInfoExtra, null, 2));
      console.log('🔍 cleanedEditedForComparison:', JSON.stringify(cleanedEditedForComparison, null, 2));
      console.log('🔍 cleanedSelectedForComparison:', JSON.stringify(cleanedSelectedForComparison, null, 2));
      console.log('🔍 originallyHadTemporalFields:', originallyHadTemporalFields);
      console.log('🔍 editedHasTemporalFields:', editedHasTemporalFields);

      // Comparar objetos originales (antes de limpiar) para detectar cambios en campos temporales
      const originalObjectsAreDifferent = JSON.stringify(parsedEditedInfoExtra) !== JSON.stringify(parsedSelectedInfoExtra);

      // Comparar objetos limpios (después de limpiar campos temporales) para detectar cambios en otros campos
      const cleanedObjectsAreDifferent = editedKeys.length !== selectedKeys.length ||
          JSON.stringify(cleanedEditedForComparison) !== JSON.stringify(cleanedSelectedForComparison);

      // Si originalmente NO tenía campos temporales pero ahora SÍ los tiene, es un cambio importante
      const temporalFieldsAdded = !originallyHadTemporalFields && editedHasTemporalFields;

      // Si originalmente tenía campos temporales pero ahora no los tiene en el editado, es un cambio importante
      // IMPORTANTE: Esto detecta cuando se eliminaron campos temporales, incluso si ambos objetos quedan iguales después
      const temporalFieldsRemoved = originallyHadTemporalFields && !editedHasTemporalFields;

      // Hay cambio si:
      // 1. Los objetos originales son diferentes (cualquier cambio, incluyendo campos temporales)
      // 2. Los objetos limpios son diferentes (cambio en otros campos)
      // 3. Se agregaron campos temporales
      // 4. Se eliminaron campos temporales
      const infoExtraChanged = originalObjectsAreDifferent || cleanedObjectsAreDifferent || temporalFieldsAdded || temporalFieldsRemoved;

      console.log('🔍 originalObjectsAreDifferent:', originalObjectsAreDifferent);
      console.log('🔍 cleanedObjectsAreDifferent:', cleanedObjectsAreDifferent);
      console.log('🔍 temporalFieldsAdded:', temporalFieldsAdded);
      console.log('🔍 temporalFieldsRemoved:', temporalFieldsRemoved);
      console.log('🔍 infoExtraChanged:', infoExtraChanged);

      if (infoExtraChanged) {
        // Si tiene campos temporales, enviar el objeto completo (con campos temporales)
        // Si no tiene campos temporales, enviar el objeto limpio (sin campos temporales)
        // Esto preserva todos los demás campos (ciudad, banco_nombre, etc.)
        if (editedHasTemporalFields) {
          // Tiene campos temporales: enviar el objeto completo con campos temporales
          updateData.info_extra = parsedEditedInfoExtra;
          console.log('✅ INFO_EXTRA con campos temporales (a enviar al backend):', JSON.stringify(parsedEditedInfoExtra, null, 2));
        } else {
          // No tiene campos temporales: enviar el objeto limpio (sin campos temporales)
          updateData.info_extra = cleanedEditedForComparison;
          console.log('✅ INFO_EXTRA LIMPIO (a enviar al backend):', JSON.stringify(cleanedEditedForComparison, null, 2));
        }

        if (updateData.info_extra) {
          console.log('✅ ¿Tiene tiempo_conexion?', 'tiempo_conexion' in updateData.info_extra);
          console.log('✅ ¿Tiene usuario_activo?', 'usuario_activo' in updateData.info_extra);
          console.log('✅ Campos que se envían:', Object.keys(updateData.info_extra));
        }
      }

      // Detectar si se está cambiando la contraseña
      const isPasswordChange = editedUser.contraseña && editedUser.contraseña.trim() !== '';

      // Incluir contraseña si se ha ingresado un valor nuevo (no vacío)
      // Nota: No comparamos con selectedUser.contraseña porque por seguridad el backend no la devuelve
      if (isPasswordChange) {
        updateData.contraseña = editedUser.contraseña;
      }

      // Verificar que hay al menos un campo para actualizar
      console.log('📊 updateData antes de verificar:', updateData);
      console.log('📊 Keys en updateData:', Object.keys(updateData));

      if (Object.keys(updateData).length === 0) {
        console.warn('⚠️ No hay campos para actualizar - SALIENDO');
        setIsEditing(false);
        return;
      }

      console.log('✅ Hay campos para actualizar, procediendo...');

      const updatedUser = await updateUser(editedUser.id, updateData, empresaId);
      setSelectedUser(updatedUser);
      // Limpiar la contraseña del editedUser después de guardar exitosamente
      setEditedUser({ ...updatedUser, contraseña: undefined });
      // Actualizar también el originalUser con el usuario actualizado
      setOriginalUser(JSON.parse(JSON.stringify(updatedUser)));
      setIsEditing(false);

      // Mostrar mensaje de éxito
      if (isPasswordChange) {
        toast.success('Contraseña actualizada correctamente');
      } else {
        toast.success('Usuario actualizado correctamente');
      }
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al actualizar usuario: ${errorMessage}`);
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

  const handleInputChange = (field: keyof User, value: string | number | null) => {
    if (!editedUser) return;

    // 🔧 VALIDACIÓN ESPECIAL PARA INFO_EXTRA
    if (field === 'info_extra' && typeof value === 'string') {
      try {
        // Intentar parsear el JSON string
        const parsedValue = JSON.parse(value);

        // Validar que no sea un objeto corrupto con claves numéricas
        if (typeof parsedValue === 'object' && parsedValue !== null) {
          const keys = Object.keys(parsedValue);
          const hasNumericKeys = keys.some(key => /^\d+$/.test(key));

          if (hasNumericKeys) {
            // Intentar reconstruir el JSON válido a partir de las claves numéricas
            try {
              const reconstructedJson = Object.values(parsedValue).join('');
              const validJson = JSON.parse(reconstructedJson);
              setEditedUser({ ...editedUser, [field]: validJson });
              return;
            } catch (error) {
              setEditedUser({ ...editedUser, [field]: {} });
              return;
            }
          }
        }

        // Asignar el objeto parseado en lugar del string
        setEditedUser({ ...editedUser, [field]: parsedValue });
        return;
      } catch (error) {
        // Si no se puede parsear, asignar objeto vacío
        setEditedUser({ ...editedUser, [field]: {} });
        return;
      }
    }

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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Usuarios</h1>
          <div className="flex items-center space-x-4">
            {user && (() => {
              // Obtener info_extra del usuario
              const infoExtra = typeof user.info_extra === 'string'
                ? JSON.parse(user.info_extra)
                : user.info_extra || {};

              const tiempoConexion = infoExtra?.tiempo_conexion;
              const timeRemaining = tiempoConexion ? getTimeRemaining(tiempoConexion) : null;

              return (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Conectado como: <span className="font-medium">{user.nombre}</span>
                    {user.rol && (
                      <span className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs dark:text-gray-300">
                        {user.rol}
                      </span>
                    )}
                  </span>
                  {timeRemaining && timeRemaining.days >= 0 && (
                    <span className="inline-flex items-center px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-full text-xs text-yellow-800">
                      <Clock className="w-3 h-3 mr-1" />
                      {timeRemaining.days > 0 ? (
                        <>
                          {timeRemaining.days} día{timeRemaining.days !== 1 ? 's' : ''}
                          {timeRemaining.hours > 0 && `, ${timeRemaining.hours} hora${timeRemaining.hours !== 1 ? 's' : ''}`}
                        </>
                      ) : timeRemaining.hours > 0 ? (
                        <>
                          {timeRemaining.hours} hora{timeRemaining.hours !== 1 ? 's' : ''}
                          {timeRemaining.minutes > 0 && `, ${timeRemaining.minutes} minuto${timeRemaining.minutes !== 1 ? 's' : ''}`}
                        </>
                      ) : (
                        <>
                          {timeRemaining.minutes} minuto{timeRemaining.minutes !== 1 ? 's' : ''}
                        </>
                      )}
                    </span>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Botón Nuevo Usuario */}
        {canEdit() && (
          <div className="flex justify-end p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setIsNewUserModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
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
          setOriginalUser(null); // Limpiar cuando se cierra el modal
        }}
        title=""
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
            onClose={() => {
              setIsModalOpen(false);
              setIsEditing(false);
            }}
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