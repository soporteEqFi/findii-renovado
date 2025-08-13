# Sistema de Ciudades de Colombia

## Descripción

Este sistema permite mostrar todas las ciudades de Colombia en el formulario de registro de clientes (`CustomerForm.tsx`). El sistema utiliza una API pública del DANE como fuente principal de datos, con un respaldo local de ciudades principales.

## Componentes Implementados

### 1. Hook `useCities` (`src/hooks/useCities.ts`)

Este hook maneja la carga de ciudades de Colombia con las siguientes características:

- **Fuente principal**: API del DANE (`https://www.datos.gov.co/resource/xdk5-pm3f.json`)
- **Respaldo**: Datos locales de ciudades principales
- **Funcionalidades**:
  - Carga automática de departamentos y ciudades
  - Ordenamiento alfabético
  - Manejo de errores con fallback a datos locales
  - Filtrado de ciudades por departamento

### 2. Datos Locales (`src/data/colombianCities.ts`)

Archivo con las ciudades principales de Colombia como respaldo, incluyendo:
- 22 departamentos
- 10 ciudades principales por departamento
- Funciones auxiliares para acceso a datos

### 3. Configuración (`src/config/constants.ts`)

Constante para la URL de la API de ciudades:
```typescript
export const COLOMBIA_CITIES_API = 'https://www.datos.gov.co/resource/xdk5-pm3f.json';
```

## Funcionamiento en el Formulario

### Campos Modificados

1. **Departamento**: Cambió de input de texto a select con opciones dinámicas
2. **Ciudad de Gestión**: Cambió de input de texto a select dependiente del departamento

### Características de la UI

- **Carga progresiva**: Muestra indicadores de carga mientras obtiene los datos
- **Validación**: La ciudad se deshabilita hasta que se seleccione un departamento
- **Mensajes informativos**: Indica al usuario qué hacer en cada paso
- **Manejo de errores**: Muestra mensajes si no se pueden cargar los datos

## Ventajas del Sistema

1. **Datos oficiales**: Utiliza la API del DANE para datos actualizados
2. **Respaldo robusto**: Funciona incluso si la API no está disponible
3. **Experiencia de usuario mejorada**: Selección guiada y validada
4. **Datos consistentes**: Evita errores de escritura en nombres de ciudades
5. **Rendimiento optimizado**: Carga una sola vez y reutiliza los datos

## Uso

```typescript
import { useCities } from '../../hooks/useCities';

const { cities, departments, loading, error, getCitiesByDepartment } = useCities();
```

## Estructura de Datos

```typescript
interface City {
  municipio: string;
  departamento: string;
}
```

## Alternativas Consideradas

1. **API del DANE**: Fuente oficial y actualizada
2. **Datos locales**: Respaldo confiable y rápido
3. **Otras APIs**: Se pueden agregar más fuentes si es necesario

## Mantenimiento

- Los datos locales se pueden actualizar manualmente en `colombianCities.ts`
- La API del DANE se actualiza automáticamente
- El sistema es extensible para agregar más fuentes de datos
