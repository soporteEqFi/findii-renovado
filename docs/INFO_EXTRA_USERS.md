# Sistema de Información Adicional (info_extra) para Usuarios

## Descripción

El sistema de usuarios ahora incluye un campo `info_extra` que permite almacenar información adicional específica de cada usuario de forma flexible. Este campo es opcional y puede contener cualquier estructura JSON.

## Campos Específicos Implementados

### Campos Principales
- **ciudad**: Ciudad del usuario (ej: "Barranquilla")
- **banco_nombre**: Nombre del banco asociado (ej: "Bancolombia")
- **linea_credito**: Tipo de línea de crédito (ej: "hipotecario")

### Ejemplo de Estructura
```json
{
  "ciudad": "Barranquilla",
  "banco_nombre": "Bancolombia",
  "linea_credito": "hipotecario"
}
```

## Implementación en el Frontend

### 1. Formulario de Creación (`NewUserForm.tsx`)
- ✅ Campos específicos para ciudad, banco y línea de crédito
- ✅ Validación para enviar solo campos con valor
- ✅ Interfaz intuitiva con placeholders

### 2. Detalles de Usuario (`UserDetails.tsx`)
- ✅ Visualización clara de información adicional
- ✅ Edición inline de campos específicos
- ✅ Iconos descriptivos para cada campo
- ✅ Soporte para campos adicionales dinámicos

### 3. Tabla de Usuarios (`UserColumns.tsx`)
- ✅ Nueva columna "Información Adicional"
- ✅ Muestra ciudad y banco con iconos
- ✅ Indicador cuando no hay información adicional

### 4. Servicio (`userService.ts`)
- ✅ Procesamiento automático de `info_extra`
- ✅ Limpieza de campos vacíos
- ✅ Manejo de strings JSON vs objetos
- ✅ Validación de datos

## Uso en el Sistema

### Crear Usuario con Info Extra
```typescript
await createUser({
  nombre: "Juan Pérez",
  cedula: "12345678",
  correo: "juan@empresa.com",
  contraseña: "password123",
  rol: "asesor",
  info_extra: {
    ciudad: "Barranquilla",
    banco_nombre: "Bancolombia",
    linea_credito: "hipotecario"
  }
}, 1);
```

### Actualizar Info Extra
```typescript
await updateUser(123, {
  info_extra: {
    ciudad: "Bogotá",
    cargo: "Gerente"
  }
}, 1);
```

### Consultar Info Extra
```typescript
const user = await getUserById(123, 1);
console.log(user.info_extra?.ciudad); // "Barranquilla"
console.log(user.info_extra?.banco_nombre); // "Bancolombia"
```

## Características Técnicas

### Tipado TypeScript
```typescript
interface UserInfoExtra {
  ciudad?: string;
  banco_nombre?: string;
  linea_credito?: string;
  [key: string]: any; // Para campos dinámicos adicionales
}
```

### Procesamiento Automático
- **Limpieza**: Campos vacíos se eliminan automáticamente
- **Validación**: Manejo robusto de strings JSON vs objetos
- **Compatibilidad**: Soporte para campos adicionales dinámicos

### Interfaz de Usuario
- **Visualización**: Campos específicos con iconos descriptivos
- **Edición**: Formularios inline para modificar información
- **Tabla**: Resumen visual en la lista de usuarios

## Ventajas del Sistema

1. **Flexibilidad**: Permite agregar campos sin modificar la base de datos
2. **Opcional**: Los campos no son obligatorios
3. **Escalable**: Fácil agregar nuevos campos específicos
4. **Consistente**: Manejo uniforme en toda la aplicación
5. **Intuitivo**: Interfaz clara para usuarios finales

## Campos de Línea de Crédito Disponibles

- `hipotecario` - Crédito hipotecario
- `consumo` - Crédito de consumo
- `comercial` - Crédito comercial
- `microcredito` - Microcrédito
- `libranza` - Crédito por libranza
