# Migración al Sistema de Campos Dinámicos

## ✅ **Migración Completada**

El sistema de campos dinámicos ha sido implementado y está listo para usar. Se ha realizado la migración automática del formulario anterior al nuevo sistema.

## 🔄 **Cambios Realizados**

### **1. Reemplazo del Formulario**
- **Antes**: `CustomerForm.tsx` (formulario estático)
- **Ahora**: `CustomerFormDinamico.tsx` (formulario dinámico)
- **Ubicación**: `src/pages/Customers.tsx` - Import actualizado automáticamente

### **2. Sistema de Fallbacks**
- **Esquemas Temporales**: `src/config/esquemasTemporales.ts`
- **Funcionamiento**: Si el backend no está disponible, usa esquemas predefinidos
- **Desarrollo**: Simula respuestas exitosas para testing

## 🚀 **Cómo Usar el Nuevo Sistema**

### **1. Acceso Normal**
El formulario funciona exactamente igual que antes:
1. Ve a la página principal de clientes
2. Haz clic en "Nuevo Cliente"
3. Llena el formulario
4. Guarda

### **2. Campos Dinámicos**
Los nuevos campos aparecen automáticamente según los esquemas:
- **Información Personal**: Campos base (nombres, apellidos, etc.)
- **Información Adicional**: Teléfono, estado civil, personas a cargo
- **Ubicación**: Dirección, barrio, estrato
- **Actividad Económica**: Empresa, cargo, antigüedad, ingresos
- **Información Financiera**: Otros ingresos, gastos por categoría
- **Crédito**: Monto, plazo, destino, cuota inicial
- **Referencias**: Nombre, teléfono, parentesco

## 🔧 **Configuración del Backend**

### **1. Endpoints Requeridos**
```typescript
// Consultar esquemas
GET /json/schema/{entidad}/{campoJson}?empresa_id={empresaId}

// Crear registros base
POST /{entidad}/?empresa_id={empresaId}

// Actualizar campos JSON
PATCH /json/{entidad}/{id}/{campoJson}?empresa_id={empresaId}
```

### **2. Entidades Soportadas**
- `solicitantes` - Información del solicitante
- `ubicaciones` - Información de ubicación
- `actividad_economica` - Información laboral
- `informacion_financiera` - Información financiera
- `referencias` - Referencias personales
- `solicitudes` - Información del crédito

### **3. Campos JSON**
- `info_extra` - Campos adicionales del solicitante
- `detalle_direccion` - Detalles de dirección
- `detalle_actividad` - Detalles de actividad económica
- `detalle_financiera` - Detalles financieros
- `detalle_referencia` - Detalles de referencias
- `detalle_credito` - Detalles del crédito

## 📊 **Esquemas Temporales Actuales**

### **Solicitante - info_extra**
```typescript
[
  { key: 'telefono', type: 'string', required: true, description: 'Teléfono de contacto' },
  { key: 'estado_civil', type: 'string', required: true, list_values: ['Soltero', 'Casado', ...] },
  { key: 'personas_a_cargo', type: 'integer', required: false, description: 'Número de personas a cargo' }
]
```

### **Ubicación - detalle_direccion**
```typescript
[
  { key: 'direccion_residencia', type: 'string', required: true, description: 'Dirección de residencia' },
  { key: 'barrio', type: 'string', required: false, description: 'Barrio' },
  { key: 'estrato', type: 'integer', required: false, description: 'Estrato socioeconómico' }
]
```

### **Actividad Económica - detalle_actividad**
```typescript
[
  { key: 'empresa', type: 'string', required: false, description: 'Nombre de la empresa' },
  { key: 'cargo', type: 'string', required: false, description: 'Cargo actual' },
  { key: 'antiguedad_meses', type: 'integer', required: false, description: 'Antigüedad en meses' },
  { key: 'ingresos_mensuales', type: 'number', required: false, description: 'Ingresos mensuales' }
]
```

## 🎯 **Ventajas del Nuevo Sistema**

### **1. Flexibilidad Total**
- Agregar campos sin tocar código frontend
- Modificar tipos de campos dinámicamente
- Configurar validaciones desde la BD

### **2. Multi-tenant**
- Cada empresa puede tener campos diferentes
- Esquemas independientes por empresa

### **3. Mantenimiento Simplificado**
- Un solo lugar para definir campos
- Cambios inmediatos sin deploy

### **4. Experiencia de Usuario**
- Mismo diseño y funcionalidad
- Campos se adaptan automáticamente
- Validaciones en tiempo real

## 🔍 **Debugging**

### **1. Ver Esquemas Cargados**
```typescript
// En la consola del navegador
console.log('Esquemas:', esquemas);
```

### **2. Ver Datos Enviados**
```typescript
// En la consola del navegador
console.log('Datos base:', datosBase);
console.log('Datos dinámicos:', datosDinamicos);
```

### **3. Logs del Sistema**
- Los esquemas temporales se cargan automáticamente
- Las simulaciones se muestran en la consola
- Errores se manejan graciosamente

## ⚠️ **Consideraciones**

### **1. Desarrollo vs Producción**
- **Desarrollo**: Usa esquemas temporales y simulaciones
- **Producción**: Requiere backend configurado

### **2. Compatibilidad**
- El formulario mantiene toda la funcionalidad anterior
- Los checkboxes de términos siguen funcionando
- Los archivos adjuntos siguen disponibles

### **3. Performance**
- Cache de esquemas por 5 minutos
- Carga lazy de campos dinámicos
- Optimización de re-renders

## 📝 **Próximos Pasos**

1. **Configurar Backend**: Implementar endpoints de esquemas
2. **Definir Esquemas**: Crear esquemas en la BD según necesidades
3. **Testing**: Probar con datos reales
4. **Optimización**: Ajustar performance según uso

## 🆘 **Soporte**

Si encuentras algún problema:

1. **Revisar Consola**: Ver logs de errores
2. **Verificar Red**: Comprobar conexión al backend
3. **Esquemas Temporales**: Verificar que se cargan correctamente
4. **Formulario**: Probar funcionalidad básica

El sistema está diseñado para ser robusto y funcionar tanto con backend como sin él.
