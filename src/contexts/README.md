# Contextos de React

## 📁 Estructura de archivos:

### **`AuthContext.tsx`** - Contexto de autenticación
- **Estado global** para autenticación de usuarios
- **Funciones:** `login()`, `logout()`, `validateToken()`
- **Estado:** `user`, `isAuthenticated`, `isLoading`, `token`
- **Uso:** Envuelve toda la aplicación en `App.tsx`

## 🔄 Flujo de autenticación:

1. **Inicio de app** → `AuthProvider` verifica token en localStorage
2. **Login** → `login()` llama a API y guarda datos
3. **Protección de rutas** → `useAuth()` verifica `isAuthenticated`
4. **Logout** → `logout()` limpia localStorage y estado

## 📝 Cómo usar:

```typescript
// En cualquier componente
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return <div>Welcome {user.nombre}!</div>;
};
```

## 🎯 Beneficios:

- **Estado centralizado** - Un solo lugar para datos de usuario
- **Persistencia** - Datos guardados en localStorage
- **Validación automática** - Token se valida al iniciar
- **Fácil de usar** - Hook `useAuth()` en cualquier componente

## 📝 Notas importantes:

- **`UserContext.tsx`** fue eliminado (duplicado con AuthContext)
- **`useAuth.ts`** fue eliminado (duplicado con AuthContext)
- Solo **`AuthContext`** maneja toda la autenticación
- Los tipos de `User` vienen de `src/types/user.ts` 