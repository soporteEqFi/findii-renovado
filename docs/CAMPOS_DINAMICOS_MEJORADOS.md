# 🚀 Campos Dinámicos Mejorados - Implementación Optimizada

## 📋 Resumen de Mejoras

Se ha implementado un sistema optimizado de campos dinámicos basado en la **Guía Frontend - Campos Dinámicos JSON** que corrige los problemas actuales y mejora significativamente la funcionalidad.

---

## 🔧 **Nuevos Archivos Creados**

### 1. `src/services/camposDinamicosService.ts`
**Servicio principal optimizado que implementa todas las mejores prácticas de la guía:**

- ✅ Headers obligatorios con `empresa_id`
- ✅ URLs construidas según la guía (`/schema/{entidad}`, `/json/{entidad}/{id}/{campo}`)
- ✅ Caché inteligente con TTL de 5 minutos
- ✅ Validación automática con `validate=true`
- ✅ Manejo robusto de errores
- ✅ Filtrado automático de campos vacíos
- ✅ Validación de tipos según esquema

### 2. `src/hooks/useCamposDinamicos.ts`
**Hook optimizado que simplifica el uso de campos dinámicos:**

- ✅ Soporte para esquemas completos (campos fijos + dinámicos)
- ✅ Funciones integradas para CRUD de datos JSON
- ✅ Utilidades de filtrado y validación
- ✅ Hook múltiple para cargar varios esquemas en paralelo
- ✅ Estados de loading y error bien manejados

### 3. `src/components/ejemplos/FormularioDinamicoMejorado.tsx`
**Componente de ejemplo que demuestra el uso correcto:**

- ✅ Validación completa del formulario
- ✅ Manejo de errores por campo
- ✅ Estados de loading y guardado
- ✅ Debug information en desarrollo
- ✅ Soporte para creación y edición

---

## 🔄 **Archivos Actualizados**

### 1. `src/config/constants.ts`
```typescript
// Nuevos endpoints según la guía
SCHEMA_COMPLETO: '/schema',           // GET /schema/{entidad}
JSON_DATA: '/json',                   // CRUD /json/{entidad}/{id}/{campo}
```

### 2. `src/services/esquemaService.ts`
- ✅ Integración con el nuevo servicio optimizado
- ✅ Fallback al método anterior para compatibilidad
- ✅ Nuevo método `obtenerEsquemaCompleto()`
- ✅ Optimización de `actualizarJson()` con mejor manejo de errores

---

## 🚀 **Cómo Usar el Nuevo Sistema**

### **Opción 1: Hook Simplificado (Recomendado)**

```typescript
import { useCamposDinamicos } from '../hooks/useCamposDinamicos';

const MiComponente = () => {
  const {
    esquemaCompleto,
    esquemaJSON,
    loading,
    error,
    guardarDatos,
    filtrarDatos,
    validarDatos
  } = useCamposDinamicos('solicitante', 'info_extra');

  const handleSubmit = async (formData: Record<string, any>) => {
    const datosLimpios = filtrarDatos(formData);
    const datosValidados = validarDatos(datosLimpios);
    await guardarDatos(recordId, datosValidados, true);
  };

  // ... resto del componente
};
```

### **Opción 2: Servicio Directo**

```typescript
import { camposDinamicosAPI } from '../services/camposDinamicosService';

// Obtener esquema completo
const esquema = await camposDinamicosAPI.obtenerEsquemaCompleto('solicitante');

// Guardar datos con validación
await camposDinamicosAPI.actualizarVariasClavesJSON(
  'solicitante', 123, 'info_extra', datos, true
);

// Leer datos específicos
const datos = await camposDinamicosAPI.leerCampoJSON('solicitante', 123, 'info_extra');
```

### **Opción 3: Servicio Existente (Compatibilidad)**

```typescript
import { esquemaService } from '../services/esquemaService';

// Funciona igual que antes, pero optimizado internamente
const esquema = await esquemaService.obtenerEsquema('solicitante', 'info_extra', 1);
await esquemaService.actualizarJson('solicitante', 123, 'info_extra', datos, 1, true);

// NUEVO: Esquema completo
const esquemaCompleto = await esquemaService.obtenerEsquemaCompleto('solicitante', 1);
```

---

## 🎯 **Migración de Componentes Existentes**

### **Antes:**
```typescript
const { esquemas, loading } = useEsquemasCompletos(esquemasConfig);
// Múltiples hooks y servicios diferentes
```

### **Después:**
```typescript
const configuraciones = [
  { entidad: 'solicitante', campoJson: 'info_extra' },
  { entidad: 'ubicacion', campoJson: 'detalle_direccion' }
];

const { esquemas, loading } = useMultiplesCamposDinamicos(configuraciones);
// Un solo hook optimizado
```

---

## 🔍 **Características Principales**

### **1. Caché Inteligente**
- TTL de 5 minutos según la guía
- Cache por empresa y entidad
- Limpieza automática al cambiar empresa

### **2. Validación Robusta**
- Validación de tipos según esquema
- Filtrado de campos vacíos
- Validación de backend con `validate=true`

### **3. Manejo de Errores**
- Fallback automático a métodos anteriores
- Mensajes de error descriptivos
- Estados de error por componente

### **4. Multi-tenant**
- Soporte completo para `empresa_id`
- Headers automáticos según la guía
- Cambio dinámico de empresa

### **5. Performance Optimizada**
- Carga en paralelo de múltiples esquemas
- Caché compartido entre componentes
- Minimización de requests redundantes

---

## 🧪 **Pruebas y Debug**

### **Modo Desarrollo**
Los componentes muestran información de debug en desarrollo:

```typescript
// Información del esquema
{process.env.NODE_ENV === 'development' && (
  <div>
    Entidad: {esquemaCompleto.entidad}
    Campos dinámicos: {esquemaCompleto.campos_dinamicos.length}
  </div>
)}

// Datos del formulario
{process.env.NODE_ENV === 'development' && (
  <pre>{JSON.stringify(formData, null, 2)}</pre>
)}
```

### **Logging Automático**
El servicio registra automáticamente:
- URLs construidas
- Respuestas del backend
- Errores y fallbacks
- Datos enviados y recibidos

---

## 📊 **Entidades y Campos Soportados**

| **Entidad** | **Tabla** | **Campo JSON** | **Descripción** |
|-------------|-----------|----------------|-----------------|
| `solicitante` | `solicitantes` | `info_extra` | Información personal adicional |
| `ubicacion` | `ubicaciones` | `detalle_direccion` | Detalles de ubicación |
| `actividad_economica` | `actividad_economica` | `detalle_actividad` | Información laboral |
| `informacion_financiera` | `informacion_financiera` | `detalle_financiera` | Datos financieros |
| `referencia` | `referencias` | `detalle_referencia` | Referencias personales |
| `solicitud` | `solicitudes` | `detalle_credito` | Detalles del crédito |

---

## ⚠️ **Consideraciones Importantes**

### **1. Compatibilidad**
- Los métodos existentes siguen funcionando
- Fallback automático si el nuevo servicio falla
- Migración gradual posible

### **2. Configuración**
- Verificar que `empresa_id` esté configurado en localStorage
- Endpoints del backend deben coincidir con la guía
- Headers de autorización necesarios

### **3. Empresa ID**
Todas las requests incluyen automáticamente `empresa_id`:
```typescript
// Como query parameter (recomendado)
/schema/solicitante?empresa_id=1

// Como header (alternativo)
'X-Empresa-Id': '1'
```

---

## 🎉 **Próximos Pasos**

1. **Probar el nuevo servicio** con una entidad simple
2. **Migrar componentes existentes** gradualmente
3. **Configurar endpoints del backend** según la guía
4. **Validar funcionalidad completa** en diferentes escenarios
5. **Documentar casos de uso específicos** del proyecto

El sistema está listo para usar y mejora significativamente la gestión de campos dinámicos siguiendo todas las mejores prácticas de la guía! 🚀

# 🚀 Campos Dinámicos Mejorados - Sistema de Archivos

## 📁 **Nuevo Tipo: Campo de Archivo**

El sistema de campos dinámicos ahora soporta campos de tipo **"file"** que permiten adjuntar archivos a cualquier entidad del sistema.

### **🎯 Características Principales:**

- ✅ **Múltiples tipos de archivo** configurables
- ✅ **Límites de tamaño** personalizables
- ✅ **Archivos únicos o múltiples**
- ✅ **Campos adicionales** configurables por archivo
- ✅ **Rutas de almacenamiento** personalizadas
- ✅ **Validación automática** de tipos y tamaños

## 🏗️ **Estructura del Campo de Archivo**

### **1. Configuración Básica**
```typescript
{
  key: 'documentos_credito',
  type: 'file',
  required: false,
  description: 'Documentos relacionados al crédito',
  order_index: 6
}
```

### **2. Configuración Avanzada**
```typescript
{
  key: 'documentos_credito',
  type: 'file',
  required: false,
  description: 'Documentos relacionados al crédito',
  order_index: 6,
  list_values: {
    file_config: {
      allowed_types: ['pdf', 'doc', 'docx', 'jpg', 'png'],
      max_size_mb: 5,
      multiple: true,
      required_fields: ['descripcion', 'categoria'],
      storage_path: 'creditos/documentos'
    }
  }
}
```

## ⚙️ **Opciones de Configuración**

### **`allowed_types`**
Array de extensiones permitidas (sin el punto):
```typescript
allowed_types: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx']
```

### **`max_size_mb`**
Tamaño máximo en megabytes:
```typescript
max_size_mb: 10 // 10MB máximo
```

### **`multiple`**
Si permite múltiples archivos:
```typescript
multiple: true  // Múltiples archivos
multiple: false // Un solo archivo
```

### **`required_fields`**
Campos adicionales requeridos para cada archivo:
```typescript
required_fields: ['descripcion', 'categoria', 'fecha_vencimiento']
```

### **`storage_path`**
Ruta personalizada de almacenamiento:
```typescript
storage_path: 'solicitantes/identificacion'
storage_path: 'creditos/documentos'
storage_path: 'actividad_economica/certificados'
```

## 📋 **Ejemplos de Implementación**

### **1. Cédula de Ciudadanía (Archivo Único)**
```typescript
{
  key: 'cedula',
  type: 'file',
  required: true,
  description: 'Cédula de ciudadanía',
  order_index: 1,
  list_values: {
    file_config: {
      allowed_types: ['pdf', 'jpg', 'png'],
      max_size_mb: 2,
      multiple: false,
      required_fields: ['fecha_vencimiento'],
      storage_path: 'solicitantes/identificacion'
    }
  }
}
```

### **2. Documentos de Crédito (Múltiples Archivos)**
```typescript
{
  key: 'documentos_credito',
  type: 'file',
  required: false,
  description: 'Documentos relacionados al crédito',
  order_index: 6,
  list_values: {
    file_config: {
      allowed_types: ['pdf', 'doc', 'docx', 'jpg', 'png'],
      max_size_mb: 5,
      multiple: true,
      required_fields: ['descripcion', 'categoria'],
      storage_path: 'creditos/documentos'
    }
  }
}
```

### **3. Certificados Laborales (Múltiples con Campos Específicos)**
```typescript
{
  key: 'certificados_laborales',
  type: 'file',
  required: false,
  description: 'Certificados laborales',
  order_index: 2,
  list_values: {
    file_config: {
      allowed_types: ['pdf', 'doc', 'docx'],
      max_size_mb: 3,
      multiple: true,
      required_fields: ['empresa', 'fecha_emision', 'cargo'],
      storage_path: 'solicitantes/laboral'
    }
  }
}
```

## 🔧 **Componente de Interfaz**

### **Características del Componente:**
- 📤 **Botón de subida** con validación visual
- 📊 **Barra de progreso** durante la subida
- 🗂️ **Lista de archivos** con iconos por tipo
- ✏️ **Campos adicionales** configurables
- 🗑️ **Eliminación** de archivos
- 📥 **Descarga** de archivos existentes

### **Estados Visuales:**
- ✅ **Archivo válido** - Icono verde
- ⚠️ **Archivo en proceso** - Icono girando
- ❌ **Archivo inválido** - Icono rojo
- 📁 **Archivo subido** - Icono del tipo de archivo

## 🚀 **Cómo Usar**

### **1. En la Configuración de Campos Dinámicos:**
```typescript
// Agregar campo de archivo al esquema
const esquemaConArchivos = [
  ...camposExistentes,
  {
    key: 'mi_campo_archivo',
    type: 'file',
    required: true,
    description: 'Descripción del campo',
    list_values: {
      file_config: {
        allowed_types: ['pdf', 'jpg'],
        max_size_mb: 5,
        multiple: false,
        required_fields: ['descripcion']
      }
    }
  }
];
```

### **2. En el Frontend:**
```typescript
import { DynamicFileField } from '../components/ui/DynamicFileField';

// Renderizar campo de archivo
<DynamicFileField
  value={data.mi_campo_archivo}
  onChange={(value) => updateData('mi_campo_archivo', value)}
  config={campo.list_values.file_config}
  label="Mi Campo de Archivo"
  required={campo.required}
  entityId={123}
  entityType="solicitante"
  jsonColumn="info_extra"
  fieldKey="mi_campo_archivo"
/>
```

## 🔒 **Seguridad y Validación**

### **Validaciones Automáticas:**
- ✅ **Tipo de archivo** - Solo extensiones permitidas
- ✅ **Tamaño máximo** - Límite configurable
- ✅ **Archivos múltiples** - Control de cantidad
- ✅ **Campos requeridos** - Validación de metadatos

### **Sanitización:**
- 🧹 **Nombres de archivo** - Eliminación de caracteres especiales
- 📁 **Rutas de almacenamiento** - Prevención de path traversal
- 🔍 **Tipos MIME** - Verificación de contenido real

## 📊 **Almacenamiento y Persistencia**

### **Estructura de Datos:**
```typescript
interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploaded_at: string;
  description?: string;
  // Campos adicionales configurados
  [key: string]: any;
}
```

### **Formato JSONB:**
```json
{
  "mi_campo_archivo": [
    {
      "id": "uuid-archivo-1",
      "name": "documento.pdf",
      "size": 2048576,
      "type": "application/pdf",
      "url": "/uploads/solicitantes/identificacion/documento.pdf",
      "uploaded_at": "2025-01-15T10:30:00Z",
      "descripcion": "Cédula de ciudadanía",
      "categoria": "identificacion"
    }
  ]
}
```

## 🔄 **Integración con Sistema Existente**

### **Compatibilidad:**
- ✅ **Campos existentes** - No se ven afectados
- ✅ **Esquemas actuales** - Funcionan sin cambios
- ✅ **Validaciones** - Se integran automáticamente
- ✅ **Interfaz** - Consistente con otros campos

### **Migración:**
- 🔄 **Agregar tipo "file"** a esquemas existentes
- 🔄 **Configurar campos** de archivo según necesidades
- 🔄 **Actualizar formularios** para incluir archivos
- 🔄 **Migrar datos** existentes si es necesario

## 📈 **Casos de Uso Comunes**

### **1. Documentos de Identificación:**
- Cédulas, pasaportes, licencias
- Fotos de perfil
- Firmas digitalizadas

### **2. Documentos Financieros:**
- Estados de cuenta
- Comprobantes de ingresos
- Declaraciones de renta

### **3. Documentos Laborales:**
- Certificados de trabajo
- Contratos laborales
- Cartas de recomendación

### **4. Documentos de Crédito:**
- Solicitudes de crédito
- Avales y garantías
- Documentos de respaldo

## 🎯 **Próximas Mejoras**

### **Funcionalidades Adicionales:**
- 🔄 **Compresión automática** de imágenes
- 🔍 **OCR** para documentos PDF
- 📱 **Subida desde móvil** con cámara
- 🌐 **Integración con nube** (Google Drive, Dropbox)

### **Seguridad Avanzada:**
- 🔐 **Encriptación** de archivos sensibles
- 🚫 **Detección de malware** en archivos
- 📋 **Auditoría completa** de archivos
- 🗂️ **Clasificación automática** por contenido
