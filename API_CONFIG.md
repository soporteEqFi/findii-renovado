# Configuración de API - Cambio entre Entornos

## Descripción

Este documento explica cómo cambiar fácilmente entre el entorno de desarrollo local y el entorno de producción sin tener que modificar múltiples archivos.

## Configuración Centralizada

Todas las URLs de la API están centralizadas en el archivo `src/config/constants.ts`.

### Cambio de Entorno

Para cambiar entre desarrollo y producción, solo necesitas modificar **una línea** en `src/config/constants.ts`:

```typescript
// Cambia esta variable para cambiar entre desarrollo y producción
const IS_PRODUCTION = false; // Cambia a true para producción
```

### URLs por Entorno

- **Desarrollo local**: `http://127.0.0.1:5000`
- **Producción**: `https://api-findii.onrender.com`

## Cómo Funciona

### 1. Constante de Entorno
```typescript
const IS_PRODUCTION = false; // Cambia a true para producción
```

### 2. URL Base Dinámica
```typescript
export const API_CONFIG = {
  BASE_URL: IS_PRODUCTION ? 'https://api-findii.onrender.com' : 'http://127.0.0.1:5000',
  // ... endpoints
};
```

### 3. Función Helper
```typescript
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
```

### 4. Uso en el Código
```typescript
// En lugar de:
fetch('http://127.0.0.1:5000/get-combined-data')

// Usar:
fetch(buildApiUrl(API_CONFIG.ENDPOINTS.GET_COMBINED_DATA))
```

## Endpoints Disponibles

Todos los endpoints están definidos en `API_CONFIG.ENDPOINTS`:

- `LOGIN`: '/iniciar-sesion/'
- `GET_COMBINED_DATA`: '/get-combined-data'
- `ADD_RECORD`: '/add-record/'
- `EDIT_RECORD`: '/edit-record/'
- `DELETE_CUSTOMER`: '/delete-customer'
- `EDIT_STATUS`: '/editar-estado'
- `GET_ALL_USERS`: '/get-all-user/'
- `CREATE_USER`: '/create-user/'
- `UPDATE_USER`: '/update-user/'
- `DELETE_USER`: '/delete-user/'
- `GET_CREDIT_TYPES`: '/get-credit-types'
- `CREATE_CREDIT_TYPE`: '/create-credit-type'
- `UPDATE_CREDIT_TYPE`: '/update-credit-type'
- `DELETE_CREDIT_TYPE`: '/delete-credit-type'

## Ventajas

1. **Un solo punto de cambio**: Solo modificas una línea para cambiar de entorno
2. **Consistencia**: Todas las URLs usan la misma configuración
3. **Mantenibilidad**: Fácil de mantener y actualizar
4. **Prevención de errores**: No hay riesgo de olvidar cambiar alguna URL

## Pasos para Cambiar de Entorno

1. Abre `src/config/constants.ts`
2. Cambia `IS_PRODUCTION` de `false` a `true` (o viceversa)
3. Guarda el archivo
4. ¡Listo! Todas las URLs se actualizarán automáticamente

## Archivos Actualizados

Los siguientes archivos ya usan la configuración centralizada:

- ✅ `src/hooks/useCustomers.ts`
- ✅ `src/pages/Customers.tsx`
- ✅ `src/components/tracking/CreditTracking.tsx`
- ✅ `src/components/Sidebar.tsx`
- ✅ `src/components/customers/CustomerDetails.tsx`
- ✅ `src/components/customers/CustomerForm.tsx`
