# Páginas de React

## 📁 Estructura de archivos:

### **`Login.tsx`** - Página de autenticación
- **Funcionalidad:** Formulario de login con email/password
- **Estado:** Manejo de errores y loading
- **Redirección:** A `/` después del login exitoso
- **Uso:** Ruta pública `/login`

### **`Customers.tsx`** - Página principal de clientes
- **Funcionalidad:** Lista, creación, edición y eliminación de clientes
- **Hooks:** `useCustomers`, `useAuth`
- **Componentes:** `CustomerTable`, `CustomerDetails`, `CustomerForm`
- **Uso:** Ruta principal `/`

### **`Users.tsx`** - Página de gestión de usuarios
- **Funcionalidad:** Lista, creación, edición y eliminación de usuarios
- **Hooks:** `useUsers`, `useAuth`
- **Componentes:** `UserTable`, `UserDetails`, `NewUserForm`
- **Uso:** Ruta `/users` (solo admin)

### **`Profile.tsx`** - Página de perfil de usuario
- **Funcionalidad:** Ver y editar información del perfil
- **Hooks:** `useProfile`, `useAuth`
- **Componentes:** `ProfileDetails`
- **Uso:** Ruta `/profile`

### **`CreditTypeAdmin.tsx`** - Página de administración de tipos de crédito
- **Funcionalidad:** Gestión de tipos de crédito y campos dinámicos
- **Hooks:** `useAuth`
- **Componentes:** `CreditTypeForm`
- **Uso:** Ruta `/credit-types` (solo admin)

## 🔄 Flujo de uso:

### **Páginas públicas:**
```typescript
// Login - No requiere autenticación
<Route path="/login" element={<Login />} />
```

### **Páginas protegidas:**
```typescript
// Customers - Requiere autenticación
<Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
  <Route index element={<Customers />} />
</Route>

// Users - Requiere rol admin
<Route path="users" element={<AdminRoute><Users /></AdminRoute>} />
```

## 🎯 Beneficios:

- **Separación clara** - Cada página tiene su responsabilidad
- **Reutilización** - Hooks y componentes compartidos
- **Consistencia** - Mismo patrón en todas las páginas
- **Mantenibilidad** - Fácil de modificar y extender

## 📝 Mejoras implementadas:

### **Hooks personalizados:**
- ✅ **`useProfile`** - Manejo de datos del perfil
- ✅ **`useModal`** - Manejo de modales
- ✅ **`PageWrapper`** - Componente wrapper para lógica común

### **Simplificaciones:**
- ✅ **Profile.tsx** - Lógica simplificada usando hooks
- ✅ **URLs centralizadas** - Usando `API_CONFIG`
- ✅ **Manejo de errores** - Consistente con toast

## 📝 Recomendaciones:

1. **Usar PageWrapper** para lógica común de autenticación
2. **Implementar hooks** para lógica específica de cada página
3. **Mantener consistencia** en manejo de errores y loading
4. **Usar constantes** para URLs y configuraciones 