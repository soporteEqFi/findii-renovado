# Aplicación de Seguimiento de Créditos

## 📁 Estructura del Proyecto

### **Tecnologías principales:**
- **React 18** + **TypeScript** - Framework principal
- **Vite** - Herramienta de construcción
- **Tailwind CSS** - Framework de estilos
- **React Router** - Navegación entre páginas

### **Organización de carpetas:**

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes básicos (Botones, Tablas, etc.)
│   ├── layout/         # Componentes de estructura (Sidebar, Navbar)
│   ├── customers/      # Componentes específicos de clientes
│   ├── users/          # Componentes específicos de usuarios
│   └── admin/          # Componentes de administración
├── pages/              # Páginas principales de la aplicación
├── services/           # Llamadas a la API y lógica de datos
├── hooks/              # Hooks personalizados (lógica reutilizable)
├── contexts/           # Estado global (Autenticación, Usuario)
├── types/              # Definiciones de tipos TypeScript
└── utils/              # Funciones utilitarias
```

### **Flujo de la aplicación:**

1. **Autenticación** (`AuthContext.tsx`)
   - Maneja el login/logout
   - Guarda el token en localStorage
   - Protege rutas privadas

2. **Navegación** (`App.tsx`)
   - Define todas las rutas
   - Protege rutas según el rol del usuario
   - Maneja redirecciones

3. **Páginas principales:**
   - `/` - Lista de clientes (página principal)
   - `/users` - Gestión de usuarios (solo admin)
   - `/profile` - Perfil del usuario
   - `/credit-types` - Tipos de crédito (solo admin)

### **Cómo funciona la autenticación:**

```typescript
// En cualquier componente puedes usar:
const { user, isAuthenticated, login, logout } = useAuth();

// Para proteger rutas:
<ProtectedRoute>
  <ComponentePrivado />
</ProtectedRoute>
```

### **Cómo hacer llamadas a la API:**

```typescript
// Usar los servicios en src/services/
import { fetchCustomers } from '../services/api';

// O usar hooks personalizados:
import { useCustomers } from '../hooks/useCustomers';
const { customers, loadCustomers } = useCustomers();
```

## 🚀 Para ejecutar el proyecto:

```bash
npm install    # Instalar dependencias
npm run dev    # Ejecutar en desarrollo
npm run build  # Construir para producción
```

## 📝 Notas importantes:

- **Roles de usuario:** `admin`, `manager`, `user`
- **API base:** `http://127.0.0.1:5000`
- **Estilos:** Tailwind CSS (clases utilitarias)
- **Iconos:** Lucide React
- **Notificaciones:** React Hot Toast