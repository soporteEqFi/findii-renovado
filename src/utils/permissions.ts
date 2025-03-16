// Definimos los tipos de roles disponibles
export type UserRole = 'admin' | 'asesor' | 'banco' | 'manager';

// Definimos las acciones posibles
export type Permission = 
  | 'delete_customer'
  | 'edit_customer'
  | 'change_status'
  | 'create_customer'
  | 'view_customer'
  | 'download_sales';

// Definimos los permisos por rol
export const rolePermissions: Record<UserRole, Permission[]> = {
  admin: ['delete_customer', 'edit_customer', 'change_status', 'create_customer', 'view_customer', 'download_sales'],
  asesor: ['create_customer', 'view_customer'],
  banco: ['change_status', 'view_customer'],
  manager: ['edit_customer', 'change_status', 'create_customer', 'view_customer']
};

// Hook personalizado para manejar permisos
export const usePermissions = () => {
  const checkPermission = (permission: Permission): boolean => {
    // Obtener el usuario del localStorage y parsearlo como JSON
    const userString = localStorage.getItem('user');
    let userRole: UserRole | null = null;
    
    if (userString) {
      try {
        // El usuario está almacenado como string JSON dentro de "user"
        const userData = JSON.parse(userString);
        // Si userData es un string (objeto serializado), parsearlo nuevamente
        const userObject = typeof userData === 'string' ? JSON.parse(userData) : userData;
        userRole = userObject.role as UserRole;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    // Fallback a user_role si no se pudo obtener del objeto user
    if (!userRole) {
      userRole = localStorage.getItem('user_role') as UserRole;
    }
    
    if (!userRole) return false;
    return rolePermissions[userRole]?.includes(permission) || false;
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