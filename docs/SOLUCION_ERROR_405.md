# 🚨 Solución Error 405 - Method Not Allowed

## 🔍 **Problema Identificado**

El error **405 Method Not Allowed** ocurre porque se está enviando el método HTTP incorrecto al backend:

```
❌ POST http://127.0.0.1:5000/json/schema/solicitante/info_extra?empresa_id=1 (405 Method Not Allowed)
```

## ⚡ **Causa del Error**

El endpoint `/json/schema/{entidad}/{campo}` espera **GET** para obtener esquemas, pero se estaba enviando **POST**.

## ✅ **Solución Implementada**

### **1. Métodos HTTP Correctos Según Operación**

| **Operación** | **Endpoint** | **Método HTTP** | **Formato Body** | **Propósito** |
|---------------|--------------|-----------------|------------------|---------------|
| **Obtener esquema completo** | `/schema/{entidad}` | `GET` | - | Cargar configuración de campos |
| **Obtener esquema JSON** | `/json/schema/{entidad}/{campo}` | `GET` | - | Cargar definición de campos dinámicos |
| **Leer datos JSON** | `/json/{entidad}/{id}/{campo}` | `GET` | - | Obtener valores guardados |
| **Actualizar múltiples campos** | `/json/{entidad}/{id}/{campo}` | `PATCH` | `{ "value": { datos } }` | Guardar/actualizar valores |
| **Actualizar una clave** | `/json/{entidad}/{id}/{campo}` | `PATCH` | `{ "path": "clave", "value": valor }` | Actualizar campo específico |
| **Eliminar clave JSON** | `/json/{entidad}/{id}/{campo}?path={clave}` | `DELETE` | - | Eliminar campo específico |

### **2. Correcciones Aplicadas**

#### **A. Servicio `camposDinamicosService.ts` - Actualizado según Guía**

```typescript
// ✅ CORRECTO: GET para obtener esquemas
async obtenerEsquemaJSON(entidad: string, campoJson: string) {
  // RUTA: /json/schema/{entidad}/{json_field}?empresa_id={id}
  const url = this.buildUrl(`/json/schema/${entidad}/${campoJson}`);
  const response = await fetch(url, {
    method: 'GET', // ✅ GET para esquemas
    headers: this.getHeaders()
  });
}

// ✅ CORRECTO: PATCH para actualizar múltiples campos
async actualizarVariasClavesJSON(entidad: string, recordId: number, campoJson: string, datos: any) {
  // RUTA: /json/{entidad}/{record_id}/{json_field}?empresa_id={id}&validate=true
  const url = this.buildUrl(`/json/${entidad}/${recordId}/${campoJson}`);
  const response = await fetch(url, {
    method: 'PATCH', // ✅ PATCH para actualizar
    headers: this.getHeaders(),
    // ✅ FORMATO SEGÚN GUÍA: { "value": { datos } }
    body: JSON.stringify({ value: datos })
  });
}

// ✅ CORRECTO: PATCH para actualizar una clave específica
async actualizarClaveJSON(entidad: string, recordId: number, campoJson: string, clave: string, valor: any) {
  const response = await fetch(url, {
    method: 'PATCH',
    headers: this.getHeaders(),
    // ✅ FORMATO SEGÚN GUÍA: { "path": "clave", "value": valor }
    body: JSON.stringify({ path: clave, value: valor })
  });
}
```

#### **B. Fallback Inteligente**

El servicio ahora prueba múltiples métodos HTTP en orden de preferencia:

```typescript
const metodosHTTP = ['PATCH', 'PUT', 'POST']; // Orden de preferencia

for (const metodo of metodosHTTP) {
  // Si obtenemos 405, probar el siguiente método
  if (response.status === 405) {
    continue;
  }
}
```

### **3. Logging Mejorado**

Ahora el servicio muestra claramente qué operación está realizando:

```typescript
console.log(`🔍 Obteniendo esquema COMPLETO con GET: ${url}`);
console.log(`💾 Intentando ACTUALIZAR DATOS con método ${metodo}...`);
console.log(`🔧 Método HTTP: ${metodo} (para actualizar datos JSON)`);
```

---

## 🧪 **Verificación de la Solución**

### **1. Usar el Componente de Diagnóstico**

Agregar a cualquier página para probar:

```typescript
import { TestCamposDinamicos } from '../components/test/TestCamposDinamicos';

// En tu componente
<TestCamposDinamicos />
```

### **2. Comandos de Consola**

Abrir la consola del navegador (F12) y ejecutar:

```javascript
// Diagnóstico completo
diagnostico.ejecutarDiagnosticoCompleto('solicitante', 1, 'info_extra');

// Verificar configuración
diagnostico.verificarConfiguracion();

// Probar endpoints específicos
diagnostico.probarEndpoints('solicitante', 1, 'info_extra');
```

### **3. Verificación Manual**

1. Abrir DevTools (F12) → Pestaña Network
2. Intentar cargar/guardar campos dinámicos
3. Verificar que las peticiones usen los métodos correctos:
   - **GET** para `/schema/` y `/json/schema/`
   - **PATCH** para `/json/{entidad}/{id}/{campo}`

---

## 📋 **Checklist de Verificación**

- [ ] **GET** para obtener esquemas (`/schema/{entidad}`)
- [ ] **GET** para obtener esquemas JSON (`/json/schema/{entidad}/{campo}`)
- [ ] **PATCH** para actualizar datos (`/json/{entidad}/{id}/{campo}`)
- [ ] Headers incluyen `empresa_id` correctamente
- [ ] URL se construye con query parameters apropiados
- [ ] Fallback funciona si PATCH no está disponible
- [ ] Logging muestra operaciones claramente

---

## 🔧 **Configuración del Backend Necesaria**

### **Endpoints que debe soportar tu backend:**

```python
# Flask example
@app.route('/schema/<entidad>', methods=['GET'])
def get_schema_completo(entidad):
    # Retornar esquema completo con campos fijos + dinámicos
    pass

@app.route('/json/schema/<entidad>/<campo_json>', methods=['GET'])
def get_schema_json(entidad, campo_json):
    # Retornar solo campos dinámicos
    pass

@app.route('/json/<entidad>/<int:record_id>/<campo_json>', methods=['GET', 'PATCH', 'DELETE'])
def handle_json_data(entidad, record_id, campo_json):
    if request.method == 'GET':
        # Leer datos JSON
        pass
    elif request.method == 'PATCH':
        # Actualizar datos JSON
        pass
    elif request.method == 'DELETE':
        # Eliminar clave JSON
        pass
```

---

## 🎯 **Próximos Pasos**

1. **Probar la solución** con el componente de diagnóstico
2. **Verificar** que el backend soporta los métodos HTTP correctos
3. **Revisar logs** para confirmar que se usan los métodos apropiados
4. **Actualizar endpoints del backend** si es necesario

---

## 📞 **Si el Error Persiste**

Si después de aplicar estas correcciones el error 405 persiste:

1. **Ejecutar diagnóstico completo:** `diagnostico.ejecutarDiagnosticoCompleto()`
2. **Revisar configuración del backend** para asegurar que soporta los métodos HTTP correctos
3. **Verificar que la URL base** apunte al servidor correcto
4. **Consultar logs del servidor** para ver qué métodos están configurados

El sistema ahora es **mucho más robusto** y debería manejar diferentes configuraciones de backend automáticamente! 🚀
