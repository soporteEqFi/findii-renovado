# Modo Oscuro - Documentación

## Implementación Completa

Se ha implementado un sistema completo de modo oscuro en la aplicación con las siguientes características:

### 🎨 Características

- **Toggle en Sidebar**: Botón para cambiar entre modo claro y oscuro
- **Persistencia**: La preferencia se guarda en localStorage
- **Transiciones suaves**: Animaciones de 200ms para cambios de color
- **Cobertura completa**: Todos los componentes principales soportan modo oscuro

### 🔧 Componentes Actualizados

#### Core
- `ThemeContext.tsx` - Context para gestionar el estado del tema
- `App.tsx` - Envuelve la aplicación con ThemeProvider
- `tailwind.config.js` - Configurado con `darkMode: 'class'`
- `index.css` - Estilos globales y transiciones

#### UI Components
- `Sidebar.tsx` - Toggle de tema y estilos dark
- `Layout.tsx` - Fondo y header adaptados
- `Card.tsx` - Componente de tarjeta con soporte dark
- `Modal.tsx` - Modales con fondo oscuro
- `Table.tsx` - Tablas con colores adaptados

#### Pages
- `Login.tsx` - Página de login con modo oscuro

### 🎯 Paleta de Colores

#### Modo Claro
- Fondo principal: `bg-gray-100`
- Tarjetas: `bg-white`
- Texto: `text-gray-900`
- Bordes: `border-gray-200`

#### Modo Oscuro
- Fondo principal: `dark:bg-gray-900`
- Tarjetas: `dark:bg-gray-800`
- Texto: `dark:text-gray-100`
- Bordes: `dark:border-gray-700`

### 📝 Uso del ThemeContext

```tsx
import { useTheme } from '../contexts/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme, setTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
    </button>
  );
}
```

### 🎨 Agregar Modo Oscuro a Nuevos Componentes

Para agregar soporte de modo oscuro a un componente nuevo:

```tsx
// Ejemplo de clases Tailwind con dark mode
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
  <h1 className="text-gray-900 dark:text-gray-100">Título</h1>
  <p className="text-gray-600 dark:text-gray-400">Descripción</p>
  <button className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600">
    Botón
  </button>
</div>
```

### 🔄 Transiciones

Todas las transiciones de color están configuradas globalmente en `index.css`:

```css
* {
  @apply transition-colors duration-200;
}
```

### 💾 Persistencia

El tema seleccionado se guarda automáticamente en `localStorage` con la key `'theme'` y se restaura al cargar la aplicación.

### 🚀 Próximos Pasos

Para extender el modo oscuro a más componentes:

1. Identificar componentes con fondos blancos: `bg-white`
2. Agregar clase dark equivalente: `dark:bg-gray-800`
3. Actualizar textos: `text-gray-900` → `dark:text-gray-100`
4. Actualizar bordes: `border-gray-200` → `dark:border-gray-700`
5. Probar interacciones (hover, focus, active)

### 🎯 Componentes Pendientes

Los siguientes componentes pueden necesitar actualización según se usen:
- Formularios dinámicos de clientes
- Tablas de configuración
- Estadísticas y gráficos
- Modales de edición
- Componentes de notificaciones

### 📱 Compatibilidad

El modo oscuro funciona en:
- ✅ Escritorio
- ✅ Tablet
- ✅ Móvil
- ✅ Todos los navegadores modernos
