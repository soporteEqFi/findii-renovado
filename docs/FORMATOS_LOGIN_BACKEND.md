# Formatos de Respuesta de Login - Backend

## ✅ **Formatos Aceptados por el Frontend**

El frontend ahora es más flexible y acepta múltiples formatos de respuesta del backend para el login.

## 🔑 **Endpoint**
```
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

## 📋 **Formatos de Respuesta Aceptados**

### **Formato 1 (Original)**
```json
{
  "acceso": "AUTORIZADO",
  "usuario": [
    {
      "id": 123,
      "nombre": "Juan Pérez",
      "cedula": "12345678",
      "rol": "admin"
    }
  ],
  "rol": "admin",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **Formato 2 (Con status)**
```json
{
  "status": "AUTORIZADO",
  "usuario": [
    {
      "id": 123,
      "nombre": "Juan Pérez",
      "cedula": "12345678"
    }
  ],
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **Formato 3 (Con success)**
```json
{
  "success": true,
  "user": [
    {
      "id": 123,
      "nombre": "Juan Pérez",
      "cedula": "12345678"
    }
  ],
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **Formato 4 (Con data)**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "nombre": "Juan Pérez",
      "cedula": "12345678"
    }
  ],
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **Formato 5 (Simple)**
```json
{
  "status": "success",
  "user": {
    "id": 123,
    "nombre": "Juan Pérez",
    "cedula": "12345678"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **Formato 6 (Con ok)**
```json
{
  "ok": true,
  "message": "Login exitoso",
  "user": {
    "id": 1,
    "nombre": "Jean Trujillo",
    "cedula": "1127895433",
    "email": "jeantpdev@gmail.com",
    "rol": "admin"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **Formato 7 (Con empresa separada)**
```json
{
  "ok": true,
  "access_token": "jwt_token_here",
  "user": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@empresa.com",
    "rol": "admin",
    "cedula": "12345678",
    "empresa_id": 1,
    "info_extra": {}
  },
  "empresa": {
    "id": 1,
    "nombre": "Mi Empresa S.A.",
    "imagen": "https://ejemplo.com/logo.png",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "message": "Login exitoso"
}
```

## 🎯 **Campos Requeridos**

### **Campo de Autorización (uno de estos):**
- `acceso`: "AUTORIZADO"
- `status`: "AUTORIZADO", "authorized", "success"
- `success`: true
- `ok`: true

### **Campo de Usuario (uno de estos):**
- `usuario`: Array o objeto
- `user`: Array o objeto (puede incluir: id, nombre, cedula, email, rol)
- `data`: Array o objeto

### **Campo de Token (uno de estos):**
- `access_token`: String
- `token`: String
- `accessToken`: String

## 📊 **Campos del Usuario**

### **Campos Obligatorios:**
- **`id`** o **`id_usuario`**: ID numérico del usuario
- **`nombre`**: Nombre del usuario
- **`cedula`**: Cédula del asesor

### **Campos Opcionales:**
- **`username`**: Username del usuario
- **`apellido`**: Apellido del usuario
- **`correo`**: Correo electrónico
- **`rol`**: Rol del usuario
- **`empresa_id`**: ID de la empresa asociada
- **`info_extra`**: Información adicional en formato JSON

### **Objeto Empresa (Separado):**
Cuando la API envía información de la empresa, puede venir en un objeto separado llamado `empresa`:
- **`empresa.id`**: ID de la empresa
- **`empresa.nombre`**: Nombre de la empresa
- **`empresa.imagen`**: URL de la imagen/logo de la empresa
- **`empresa.created_at`**: Fecha de creación de la empresa

### **Campos Legacy (Dentro del usuario):**
- **`empresa`**: Nombre de la empresa (formato legacy)
- **`imagen_aliado`**: URL de la imagen (formato legacy)

## 🔍 **Debugging**

El frontend ahora incluye logs para debugging:

```javascript
// En la consola del navegador verás:
console.log('Respuesta del backend:', data);
console.log('Campos disponibles:', Object.keys(data));
```

## ⚠️ **Errores Comunes**

### **Error: "no se encontró campo de acceso/autorización"**
- **Solución**: Asegúrate de incluir uno de: `acceso`, `status`, o `success`

### **Error: "datos de usuario no encontrados"**
- **Solución**: Asegúrate de incluir uno de: `usuario`, `user`, o `data`

### **Error: "token no encontrado"**
- **Solución**: Asegúrate de incluir uno de: `access_token`, `token`, o `accessToken`

## 🎯 **Ejemplo Mínimo Funcional**

```json
{
  "ok": true,
  "user": {
    "id": 1,
    "nombre": "Usuario Test",
    "cedula": "12345678"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 📝 **Notas**

- El frontend convierte automáticamente objetos de usuario en arrays
- Los campos opcionales tienen valores por defecto
- El sistema es compatible con múltiples formatos de respuesta
- Los logs ayudan a identificar problemas de formato
