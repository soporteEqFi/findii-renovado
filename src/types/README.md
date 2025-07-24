# Tipos de TypeScript

## 📁 Estructura de archivos:

### **`index.ts`** - Punto de entrada
- Re-exporta todos los tipos desde sus archivos específicos
- Mantiene la compatibilidad con imports existentes

### **`customer.ts`** - Tipos de clientes
- **`Customer`** - Interfaz completa para datos de clientes
- Incluye información personal, financiera, laboral y de ubicación
- Campos opcionales para compatibilidad con API

### **`user.ts`** - Tipos de usuarios
- **`User`** - Interfaz para datos de usuarios del sistema
- Incluye información de autenticación y perfil

### **`creditTypes.ts`** - Tipos de crédito
- **`CreditType`** - Configuración de tipos de crédito
- **`CreditTypeField`** - Campos dinámicos de formularios
- **`FieldValidation`** - Reglas de validación

## 🔄 Cómo usar:

```typescript
// Importar desde el índice (recomendado)
import { Customer, User, CreditType } from '../types';

// O importar directamente
import { Customer } from '../types/customer';
import { User } from '../types/user';
import { CreditType } from '../types/creditTypes';
```

## 📝 Notas importantes:

- **`index.ts`** es el punto de entrada principal
- Los tipos están organizados por dominio (customers, users, creditTypes)
- Todos los tipos son compatibles con la API del backend
- Los campos opcionales permiten flexibilidad en las respuestas 