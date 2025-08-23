# API Backend para Campos Condicionales

## Rutas Necesarias

### 1. Actualizar Condición de Campo

**PATCH** `/json/definitions/{definition_id}`

Actualiza la configuración de condición de un campo específico.

#### Request Body:
```json
{
  "conditional_on": {
    "field": "tipo_actividad_economica",
    "value": "empresario"
  }
}
```

#### Response (200):
```json
{
  "id": "123",
  "empresa_id": 1,
  "entity": "solicitante",
  "json_column": "info_extra",
  "key": "numero_documento",
  "type": "string",
  "required": true,
  "description": "Número de documento",
  "conditional_on": {
    "field": "tipo_actividad_economica",
    "value": "empresario"
  },
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### Para remover condición:
```json
{
  "conditional_on": null
}
```

### 2. Obtener Campos Disponibles

**GET** `/json/definitions?entity={entity}&json_column={jsonColumn}`

Obtiene todos los campos disponibles para usar como activadores.

#### Query Parameters:
- `entity`: Entidad (ej: "solicitante")
- `json_column`: Columna JSON (ej: "info_extra")

#### Response (200):
```json
[
  {
    "id": "123",
    "empresa_id": 1,
    "entity": "solicitante",
    "json_column": "info_extra",
    "key": "tipo_identificacion",
    "type": "string",
    "required": true,
    "description": "Tipo de identificación",
    "list_values": {
      "enum": ["CC", "TE", "TI"]
    },
    "conditional_on": null,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

## Estructura de Base de Datos

### Tabla: `field_definitions`

Agregar columna `conditional_on`:

```sql
ALTER TABLE field_definitions
ADD COLUMN conditional_on JSON;
```

### Ejemplo de datos:

```sql
-- Campo sin condición
INSERT INTO field_definitions (
  empresa_id, entity, json_column, key, type, required, description, conditional_on
) VALUES (
  1, 'solicitante', 'info_extra', 'nombres', 'string', true, 'Nombres', NULL
);

-- Campo con condición
INSERT INTO field_definitions (
  empresa_id, entity, json_column, key, type, required, description, conditional_on
) VALUES (
  1, 'solicitante', 'info_extra', 'numero_documento', 'string', true, 'Número de documento',
  '{"field": "tipo_actividad_economica", "value": "empresario"}'
);
```

## Lógica de Condiciones

La condición se evalúa como una comparación simple de igualdad:
- Si el valor del campo activador es igual al valor esperado, el campo se muestra
- Si no es igual, el campo se oculta

## Validaciones

### Backend:
1. Verificar que el campo activador existe
2. Verificar que el valor esperado no esté vacío
3. Verificar que no hay referencias circulares

### Frontend:
1. Validar que se selecciona un campo activador
2. Validar que se ingresa un valor esperado
3. Mostrar vista previa de la condición

## Flujo de Trabajo

1. **Usuario hace clic en "Configurar Condición"** en un campo
2. **Frontend abre modal** con lista de campos disponibles
3. **Usuario selecciona campo activador** y operador
4. **Frontend valida** la configuración
5. **Frontend envía PUT request** al backend
6. **Backend valida** y guarda en base de datos
7. **Backend responde** con campo actualizado
8. **Frontend actualiza** la interfaz

## Consideraciones de Seguridad

1. **Validar empresa_id**: Asegurar que el usuario solo puede modificar campos de su empresa
2. **Validar permisos**: Verificar que el usuario tiene permisos de administración
3. **Sanitizar datos**: Limpiar y validar todos los inputs
4. **Logging**: Registrar cambios en campos condicionales para auditoría

## Testing

### Casos de Prueba:

1. **Crear condición válida**
2. **Actualizar condición existente**
3. **Remover condición** (enviar null)
4. **Condición con campo que no existe** (debe fallar)
5. **Condición sin valor esperado** (debe fallar)
7. **Referencia circular** (campo A activa campo B, campo B activa campo A)

### Ejemplos de Testing:

```bash
# Crear condición
curl -X PATCH http://localhost:3000/json/definitions/123 \
  -H "Content-Type: application/json" \
  -d '{
    "conditional_on": {
      "field": "tipo_actividad_economica",
      "value": "empresario"
    }
  }'

# Remover condición
curl -X PATCH http://localhost:3000/json/definitions/123 \
  -H "Content-Type: application/json" \
  -d '{"conditional_on": null}'
```
