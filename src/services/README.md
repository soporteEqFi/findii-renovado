# Servicios de la Aplicación

## 📁 Archivos de servicios activos:

### **`baseService.ts`** - Servicio base para llamadas API
- **`apiCall(endpoint, options)`** - Función base para llamadas API
- **`apiGet(endpoint)`** - Llamadas GET
- **`apiPost(endpoint, data)`** - Llamadas POST
- **`apiPut(endpoint, data)`** - Llamadas PUT
- **`apiDelete(endpoint)`** - Llamadas DELETE
- **`getBaseHeaders(includeAuth)`** - Headers base con autenticación

### **`authService.ts`** - Servicios de autenticación
- **`loginUser(email, password)`** - Iniciar sesión
- **`validateToken()`** - Validar token de autenticación

### **`userService.ts`** - Gestión de usuarios
- **`fetchUsers()`** - Obtener lista de usuarios
- **`createUser(userData)`** - Crear nuevo usuario
- **`updateUser(user)`** - Actualizar usuario existente
- **`deleteUser(userId)`** - Eliminar usuario

### **`creditTypeService.ts`** - Gestión de tipos de crédito
- **`getCreditTypes(cedula)`** - Obtener tipos de crédito
- **`createCreditType(creditType, cedula)`** - Crear tipo de crédito
- **`updateCreditType(creditType)`** - Actualizar tipo de crédito
- **`deleteCreditType(id)`** - Eliminar tipo de crédito
- **`clearCreditTypesCache(cedula)`** - Limpiar caché

### **`cacheService.ts`** - Sistema de caché
- **`set(key, data)`** - Guardar datos en caché
- **`get(key)`** - Obtener datos del caché
- **`clear(key)`** - Limpiar caché específico
- **`clearAll()`** - Limpiar todo el caché

## 🔄 Flujo de uso:

1. **Base:** `baseService.ts` → Usado por todos los servicios
2. **Autenticación:** `authService.ts` → `AuthContext.tsx`
3. **Usuarios:** `userService.ts` → `useUsers.ts` → `Users.tsx`
4. **Tipos de crédito:** `creditTypeService.ts` → `CreditTypeAdmin.tsx`
5. **Clientes:** `useCustomers.ts` (hook personalizado) → `Customers.tsx`

## 🎯 Beneficios del baseService:

- **Consistencia** - Mismo manejo de errores en todos los servicios
- **Reutilización** - Headers y configuración centralizada
- **Mantenibilidad** - Cambios en un solo lugar
- **Tipado** - TypeScript para todas las respuestas

## 📝 Mejoras implementadas:

### **Eliminación de duplicación:**
- ✅ **`api.ts` eliminado** - Duplicado de `authService.ts`
- ✅ **URLs centralizadas** - Usando `API_CONFIG`
- ✅ **Código simplificado** - Usando `baseService`

### **Optimizaciones:**
- ✅ **`userService.ts`** - Simplificado usando `baseService`
- ✅ **`creditTypeService.ts`** - URLs centralizadas
- ✅ **Manejo de errores** - Consistente en todos los servicios

## 📝 Notas importantes:

- **`useCustomers.ts`** maneja toda la lógica de clientes (no usa servicios separados)
- **`cacheService.ts`** se usa internamente en `creditTypeService.ts`
- Todos los servicios usan el token de autenticación automáticamente
- Las URLs de la API están en `src/config/constants.ts` 