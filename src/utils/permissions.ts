import { USER_ROLES, PERMISSIONS } from '../config/constants';

// Definimos las acciones posibles
export type Permission =
  | 'delete_customer'
  | 'edit_customer'
  | 'change_status'
  | 'create_customer'
  | 'view_customer'
  | 'download_sales';

// Mapeamos los permisos de constants.ts a los permisos específicos
const permissionMapping: Record<string, Permission[]> = {
  [USER_ROLES.ADMIN]: ['delete_customer', 'edit_customer', 'change_status', 'create_customer', 'view_customer', 'download_sales'],
  [USER_ROLES.MANAGER]: ['edit_customer', 'change_status', 'create_customer', 'view_customer'],
  [USER_ROLES.USER]: ['view_customer'],
  [USER_ROLES.BANCO]: ['view_customer', 'change_status'],
  [USER_ROLES.SUPERVISOR]: ['delete_customer', 'edit_customer', 'change_status', 'create_customer', 'view_customer'],
};

// Hook personalizado para manejar permisos
export const usePermissions = () => {
  const checkPermission = (permission: Permission): boolean => {
    // Obtener el usuario del localStorage y parsearlo como JSON
    const userString = localStorage.getItem('user');
    let userRole: string | null = null;

    if (userString) {
      try {
        // El usuario está almacenado como string JSON dentro de "user"
        const userData = JSON.parse(userString);
        // Si userData es un string (objeto serializado), parsearlo nuevamente
        const userObject = typeof userData === 'string' ? JSON.parse(userData) : userData;
        userRole = userObject.rol as string;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // Fallback a user_role si no se pudo obtener del objeto user
    if (!userRole) {
      userRole = localStorage.getItem('user_role');
    }

    if (!userRole) return false;
    return permissionMapping[userRole]?.includes(permission) || false;
  };

  return {
    canDeleteCustomer: () => checkPermission('delete_customer'),
    canEditCustomer: () => checkPermission('edit_customer'),
    canChangeStatus: () => checkPermission('change_status'),
    canCreateCustomer: () => checkPermission('create_customer'),
    canViewCustomer: () => checkPermission('view_customer'),
    canDownloadSales: () => checkPermission('download_sales'),
  };
};