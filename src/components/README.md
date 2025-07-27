# Componentes de React

## 📁 Estructura de carpetas:

### **`ui/`** - Componentes básicos reutilizables
- **`Button.tsx`** - Botones con diferentes variantes
- **`Card.tsx`** - Contenedores de tarjetas
- **`Modal.tsx`** - Modales con diferentes tamaños
- **`Table.tsx`** - Tablas reutilizables

### **`layout/`** - Componentes de estructura
- **`Layout.tsx`** - Layout principal con Sidebar y contenido
- **`Sidebar.tsx`** - Barra lateral de navegación

### **`customers/`** - Componentes específicos de clientes
- **`CustomerForm.tsx`** - Formulario de creación/edición (32KB - muy grande)
- **`CustomerDetails.tsx`** - Detalles de cliente (24KB - muy grande)
- **`CustomerTable.tsx`** - Tabla de clientes
- **`CustomerColumns.tsx`** - Definición de columnas

### **`users/`** - Componentes específicos de usuarios
- **`UserTable.tsx`** - Tabla de usuarios
- **`UserDetails.tsx`** - Detalles de usuario
- **`UserColumns.tsx`** - Definición de columnas
- **`NewUserForm.tsx`** - Formulario de nuevo usuario

### **`admin/`** - Componentes de administración
- **`CreditTypeForm.tsx`** - Formulario de tipos de crédito

### **`profile/`** - Componentes de perfil
- **`ProfileDetails.tsx`** - Detalles del perfil

### **`tracking/`** - Componentes de seguimiento
- **`CreditTracking.tsx`** - Seguimiento de créditos

### **Componentes sueltos:**
- **`ProtectedRoute.tsx`** - Protección de rutas
- **`Sidebar.tsx`** - Barra lateral (duplicado con layout/)

## 🔄 Flujo de uso:

### **Componentes UI básicos:**
```typescript
import { Button, Modal, Card } from '../components/ui';

// Uso
<Button variant="primary">Click me</Button>
<Modal isOpen={true} onClose={() => {}} title="Title">Content</Modal>
```

### **Componentes específicos:**
```typescript
import { CustomerTable, CustomerDetails } from '../components/customers';
import { UserTable, UserDetails } from '../components/users';
```

## 🎯 Beneficios:

- **Reutilización** - Componentes UI básicos
- **Organización** - Por dominio (customers, users, etc.)
- **Mantenibilidad** - Cada componente tiene su responsabilidad
- **Consistencia** - Mismos estilos y patrones

## ⚠️ Problemas identificados:

### **Componentes muy grandes:**
- **`CustomerForm.tsx`** (32KB, 836 líneas) - Necesita división
- **`CustomerDetails.tsx`** (24KB, 615 líneas) - Necesita división

### **Duplicaciones eliminadas:**
- ✅ **`Modal.tsx`** duplicado eliminado
- ✅ **`Sidebar.tsx`** duplicado eliminado
- ✅ **`auth/`** carpeta vacía eliminada

## 📝 Recomendaciones:

1. **Dividir componentes grandes** en subcomponentes
2. **Extraer lógica** a hooks personalizados
3. **Crear componentes más pequeños** y reutilizables
4. **Mantener consistencia** en nombres y estructura 