# Hooks Personalizados

## 📁 Estructura de archivos:

### **`useCustomers.ts`** - Hook para gestión de clientes
- **Estado:** `customers`, `isLoading`, `error`, `totalRecords`
- **Funciones:** `loadCustomers()`, `updateCustomer()`, `deleteCustomer()`, `updateStatus()`
- **Uso:** En `Customers.tsx` y componentes relacionados

### **`useUsers.ts`** - Hook para gestión de usuarios
- **Estado:** `users`, `isLoading`, `error`
- **Funciones:** `loadUsers()`, `createUser()`, `updateUser()`, `deleteUser()`
- **Uso:** En `Users.tsx` y componentes relacionados

### **`useFileUpload.ts`** - Hook para manejo de archivos
- **Estado:** `selectedFiles`, `fileInputRef`
- **Funciones:** `handleFileSelect()`, `handleRemoveFile()`, `triggerFileInput()`
- **Uso:** En formularios que requieren subida de archivos

### **`useDynamicFields.ts`** - Hook para campos dinámicos
- **Estado:** `creditTypeFields`, `dynamicFieldValues`, `availableCreditTypes`
- **Funciones:** `loadCreditTypes()`, `handleDynamicFieldChange()`, `updateFieldsForCreditType()`
- **Uso:** En formularios con campos dinámicos según tipo de crédito

### **`useProfile.ts`** - Hook para gestión de perfil
- **Estado:** `userInfo`, `loading`, `error`
- **Funciones:** `fetchUserInfo()`, `updateProfile()`
- **Uso:** En `Profile.tsx` para manejar datos del perfil

### **`useModal.ts`** - Hook para manejo de modales
- **Estado:** `isOpen`
- **Funciones:** `openModal()`, `closeModal()`, `toggleModal()`
- **Uso:** En cualquier componente que necesite un modal

## 🔄 Flujo de uso:

### **useCustomers:**
```typescript
import { useCustomers } from '../hooks/useCustomers';

const CustomersPage = () => {
  const { 
    customers, 
    isLoading, 
    loadCustomers, 
    updateCustomer 
  } = useCustomers();
  
  useEffect(() => {
    loadCustomers();
  }, []);
  
  return <div>...</div>;
};
```

### **useUsers:**
```typescript
import { useUsers } from '../hooks/useUsers';

const UsersPage = () => {
  const { 
    users, 
    isLoading, 
    loadUsers, 
    createUser 
  } = useUsers();
  
  useEffect(() => {
    loadUsers();
  }, []);
  
  return <div>...</div>;
};
```

## 🎯 Beneficios:

- **Lógica reutilizable** - Misma lógica en múltiples componentes
- **Estado centralizado** - Un lugar para cada tipo de datos
- **Manejo de errores** - Errores consistentes en toda la app
- **Loading states** - Estados de carga automáticos

## 📝 Notas importantes:

- **`useAuth.ts`** fue eliminado (duplicado con AuthContext)
- Cada hook maneja **un tipo específico** de datos
- Los hooks usan **servicios** para llamadas a la API
- **Error handling** consistente en todos los hooks 