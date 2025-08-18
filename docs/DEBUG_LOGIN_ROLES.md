# Debugging de Roles en Login

## 🔍 **Problema Identificado**

El usuario tiene rol "admin" en el backend pero aparece como "user" en el frontend, causando que no aparezca el botón de crear nuevo registro.

## 📊 **Respuesta del Backend**

```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "message": "Login exitoso",
    "ok": true,
    "user": {
        "cedula": "1127895433",
        "email": "jeantpdev@gmail.com",
        "id": 1,
        "nombre": "Jean Trujillo",
        "rol": "admin"
    }
}
```

## 🔧 **Logs de Debugging Agregados**

### **1. En AuthContext.tsx**
```javascript
console.log('Datos completos del backend:', data);
console.log('Datos del usuario extraídos:', userData);
console.log('Rol encontrado en data.rol:', data.rol);
console.log('Rol encontrado en userData.rol:', userData.rol);
console.log('Objeto de usuario final:', userObj);
```

### **2. En permissions.ts**
```javascript
console.log('Usuario parseado del localStorage:', userObject);
console.log('Rol encontrado:', userRole);
console.log('Permisos disponibles para este rol:', permissionMapping[userRole]);
```

## 🎯 **Mapeo de Roles**

### **Roles Soportados:**
- `admin` - Acceso completo
- `manager` - Edición y creación
- `user` - Solo lectura
- `banco` - Vista y cambio de estado

### **Permisos por Rol:**
```typescript
const permissionMapping = {
  admin: ['delete_customer', 'edit_customer', 'change_status', 'create_customer', 'view_customer', 'download_sales'],
  manager: ['edit_customer', 'change_status', 'create_customer', 'view_customer'],
  user: ['view_customer'],
  banco: ['view_customer', 'change_status'],
};
```

## 🔍 **Pasos para Debugging**

### **1. Verificar Respuesta del Backend**
- Abrir consola del navegador
- Hacer login
- Revisar logs: "Datos completos del backend"

### **2. Verificar Extracción de Datos**
- Revisar logs: "Datos del usuario extraídos"
- Verificar que `userData.rol` sea "admin"

### **3. Verificar Mapeo Final**
- Revisar logs: "Objeto de usuario final"
- Verificar que `userObj.rol` sea "admin"

### **4. Verificar Permisos**
- Revisar logs: "Rol encontrado" y "Permisos disponibles"
- Verificar que el rol se lea correctamente del localStorage

## ⚠️ **Posibles Problemas**

### **1. Rol no se extrae correctamente**
- **Síntoma**: `userData.rol` es undefined
- **Solución**: Verificar que el backend envíe el rol en el campo correcto

### **2. Rol se convierte a minúsculas**
- **Síntoma**: "ADMIN" se convierte a "admin"
- **Solución**: El sistema ya maneja esto correctamente

### **3. Rol no se guarda en localStorage**
- **Síntoma**: El rol no persiste entre recargas
- **Solución**: Verificar que `localStorage.setItem('user', JSON.stringify(userObj))` funcione

### **4. Permisos no se aplican**
- **Síntoma**: El rol es correcto pero los permisos no funcionan
- **Solución**: Verificar que `permissionMapping[userRole]` devuelva el array correcto

## 🎯 **Solución Esperada**

Con el rol "admin", el usuario debería tener acceso a:
- ✅ Crear nuevos clientes
- ✅ Editar clientes existentes
- ✅ Eliminar clientes
- ✅ Cambiar estados
- ✅ Descargar ventas
- ✅ Ver todos los clientes

## 📝 **Comandos para Verificar**

```javascript
// En la consola del navegador
console.log('Usuario actual:', JSON.parse(localStorage.getItem('user')));
console.log('Rol actual:', JSON.parse(localStorage.getItem('user')).rol);
```

## 🔧 **Si el Problema Persiste**

1. **Verificar todos los logs** en la consola
2. **Comparar** la respuesta del backend con el objeto final
3. **Verificar** que el rol se guarde correctamente en localStorage
4. **Confirmar** que los permisos se apliquen correctamente
