# Sistema de Campos Dinámicos - Frontend

## 🎯 **Descripción General**

El sistema de campos dinámicos permite que el frontend genere formularios automáticamente basándose en esquemas definidos en la base de datos. Esto proporciona máxima flexibilidad para agregar, modificar o eliminar campos sin necesidad de cambios en el código frontend.

## 🏗️ **Arquitectura**

### **Componentes Principales**

1. **`useEsquema`** - Hook para consultar esquemas individuales
2. **`useEsquemas`** - Hook para cargar múltiples esquemas
3. **`CampoDinamico`** - Componente que renderiza cualquier tipo de campo
4. **`FormularioDinamico`** - Componente que genera formularios completos
5. **`esquemaService`** - Servicio para manejar peticiones al backend
6. **`CustomerFormDinamico`** - Formulario completo usando campos dinámicos

### **Flujo de Datos**

```
Backend (Esquemas) → useEsquema → CampoDinamico → FormularioDinamico → Usuario
```

## 📁 **Estructura de Archivos**

```
src/
├── hooks/
│   ├── useEsquema.ts          # Hook para esquemas individuales
│   └── useEsquemas.ts         # Hook para múltiples esquemas
├── components/
│   ├── ui/
│   │   ├── CampoDinamico.tsx      # Componente de campo individual
│   │   └── FormularioDinamico.tsx # Componente de formulario
│   └── customers/
│       └── CustomerFormDinamico.tsx # Formulario completo
├── services/
│   └── esquemaService.ts      # Servicio para API
├── types/
│   └── esquemas.ts            # Tipos TypeScript
└── config/
    └── constants.ts           # Endpoints actualizados
```

## 🔧 **Configuración**

### **1. Endpoints en constants.ts**

```typescript
export const API_CONFIG = {
  // ... otros endpoints
  GET_ESQUEMA: '/json/schema',
  UPDATE_JSON: '/json',
  SOLICITANTES: '/solicitantes',
  UBICACIONES: '/ubicaciones',
  // ... más entidades
};
```

### **2. Configuración de Esquemas**

```typescript
const esquemasConfig = [
  { entidad: 'solicitante', campoJson: 'info_extra' },
  { entidad: 'ubicacion', campoJson: 'detalle_direccion' },
  { entidad: 'actividad_economica', campoJson: 'detalle_actividad' },
  { entidad: 'informacion_financiera', campoJson: 'detalle_financiera' },
  { entidad: 'referencia', campoJson: 'detalle_referencia' },
  { entidad: 'solicitud', campoJson: 'detalle_credito' }
];
```

## 🚀 **Uso Básico**

### **1. Usar Hook Individual**

```typescript
import { useEsquema } from '../hooks/useEsquema';

const { esquema, loading, error } = useEsquema('solicitante', 'info_extra', 1);
```

### **2. Usar Hook Múltiple**

```typescript
import { useEsquemas } from '../hooks/useEsquemas';

const { esquemas, loading, error } = useEsquemas(esquemasConfig);
```

### **3. Renderizar Campo Individual**

```typescript
import { CampoDinamico } from '../components/ui/CampoDinamico';

<CampoDinamico
  campo={esquema[0]}
  value={valores[campo.key]}
  onChange={(key, value) => setValores(prev => ({ ...prev, [key]: value }))}
  error={errores[campo.key]}
/>
```

### **4. Renderizar Formulario Completo**

```typescript
import { FormularioDinamico } from '../components/ui/FormularioDinamico';

<FormularioDinamico
  esquema={esquema}
  valores={valores}
  onChange={handleChange}
  errores={errores}
  titulo="Información Personal"
/>
```

## 📊 **Tipos de Campos Soportados**

| Tipo | Descripción | Renderizado |
|------|-------------|-------------|
| `string` | Texto simple | Input text |
| `integer` | Número entero | Input number |
| `number` | Número decimal | Input number con step |
| `boolean` | Verdadero/Falso | Checkbox |
| `date` | Fecha | Input date |
| `object` | Objeto JSON | Textarea JSON |
| `array` | Lista de valores | Textarea con comas |

### **Campos con Opciones Predefinidas**

Si un campo `string` tiene `list_values`, se renderiza como un `select`:

```typescript
{
  key: 'estado_civil',
  type: 'string',
  required: true,
  list_values: ['Soltero', 'Casado', 'Divorciado', 'Viudo'],
  description: 'Estado Civil'
}
```

## 🔄 **Flujo de Creación de Solicitud**

### **1. Crear Entidades Base**

```typescript
// 1. Crear solicitante
const solicitante = await esquemaService.crearRegistro('solicitantes', datosBase);

// 2. Crear ubicación
const ubicacion = await esquemaService.crearRegistro('ubicaciones', {
  solicitante_id: solicitante.id,
  ciudad_residencia: datos.ciudad,
  departamento_residencia: datos.departamento
});

// 3. Crear actividad económica
const actividad = await esquemaService.crearRegistro('actividad_economica', {
  solicitante_id: solicitante.id,
  tipo_actividad: datos.tipo_actividad
});

// 4. Crear información financiera
const financiera = await esquemaService.crearRegistro('informacion_financiera', {
  solicitante_id: solicitante.id,
  total_ingresos_mensuales: datos.ingresos
});

// 5. Crear solicitud
const solicitud = await esquemaService.crearRegistro('solicitudes', {
  solicitante_id: solicitante.id,
  estado: 'abierta'
});
```

### **2. Llenar Campos Dinámicos**

```typescript
// Para cada entidad, llenar campos JSON dinámicos
if (esquemas.solicitante_info_extra?.esquema) {
  const datosDinamicos = esquemaService.filtrarCamposConValor(
    valores,
    esquemas.solicitante_info_extra.esquema
  );

  await esquemaService.actualizarJson(
    'solicitante',
    solicitante.id,
    'info_extra',
    datosDinamicos
  );
}
```

## 🛠️ **Servicios Disponibles**

### **esquemaService**

```typescript
// Obtener esquema
const esquema = await esquemaService.obtenerEsquema('solicitante', 'info_extra', 1);

// Crear registro base
const registro = await esquemaService.crearRegistro('solicitantes', datos);

// Actualizar campos JSON
await esquemaService.actualizarJson('solicitante', id, 'info_extra', datos);

// Filtrar campos con valor
const datosLimpios = esquemaService.filtrarCamposConValor(datos, esquema);

// Validar tipos
const datosValidados = esquemaService.validarTipos(datos, esquema);
```

## 🎨 **Personalización**

### **Estilos CSS**

Los componentes usan Tailwind CSS y pueden personalizarse:

```typescript
// Clases base para campos
const baseClasses = `border text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5 ${
  error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
}`;
```

### **Layout del Formulario**

```typescript
// Grid responsivo
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {/* Campos se distribuyen automáticamente */}
</div>
```

## 🔍 **Debugging**

### **Ver Esquemas Cargados**

```typescript
console.log('Esquemas:', esquemas);
console.log('Esquema solicitante:', esquemas.solicitante_info_extra?.esquema);
```

### **Ver Datos Enviados**

```typescript
console.log('Datos base:', datosBase);
console.log('Datos dinámicos:', datosDinamicos);
```

## ⚠️ **Consideraciones**

1. **Cache**: Los esquemas se cachean por 5 minutos para evitar consultas innecesarias
2. **Validación**: Los tipos se validan automáticamente según el esquema
3. **Errores**: Manejo robusto de errores con mensajes descriptivos
4. **Loading States**: Estados de carga para mejor UX
5. **Responsive**: Formularios adaptables a diferentes tamaños de pantalla

## 🔄 **Migración**

Para migrar del sistema anterior:

1. Reemplazar `CustomerForm.tsx` por `CustomerFormDinamico.tsx`
2. Actualizar imports en páginas que usen el formulario
3. Configurar esquemas en el backend según la guía
4. Probar funcionalidad completa

## 📝 **Próximos Pasos**

1. Implementar validación de esquemas en tiempo real
2. Agregar soporte para campos condicionales
3. Implementar preview de formularios
4. Agregar soporte para subformularios anidados
5. Implementar drag & drop para reordenar campos
