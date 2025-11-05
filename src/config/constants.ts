// Configuración de la API
// Cambia esta variable para cambiar entre desarrollo y producción
const IS_PRODUCTION = false; // Cambia a false para desarrollo

export const API_CONFIG = {
  BASE_URL: IS_PRODUCTION ? 'https://api-findii.onrender.com' : 'http://localhost:5000',
  ENDPOINTS: {
    LOGIN: '/auth/login',
    VALIDATE_TOKEN: '/validate-token',
    USER_INFO: '/get-user-info',

    // Customers
    GET_COMBINED_DATA: '/get-combined-data',
    ADD_RECORD: '/add-record/',
    EDIT_RECORD: '/edit-record/',
    DELETE_CUSTOMER: '/delete-customer',
    ACTUALIZAR_ESTADO: '/solicitudes/actualizar-estado',
    // Dashboard tabla nuevo origen de datos
    DASHBOARD_TABLA: '/dashboard/tabla',

    // Users - Nuevos endpoints con sistema de empresas
    USUARIOS: '/usuarios',                    // GET /usuarios/?empresa_id=1, POST /usuarios/?empresa_id=1
    USUARIO_BY_ID: '/usuarios',               // GET /usuarios/{id}?empresa_id=1, PUT /usuarios/{id}?empresa_id=1, DELETE /usuarios/{id}?empresa_id=1

    // Nuevos endpoints para esquemas dinámicos
    GET_ESQUEMA: '/json/schema',
    UPDATE_JSON: '/json',

    // Endpoints según guía campos dinámicos
    SCHEMA_COMPLETO: '/schema',           // GET /schema/{entidad}
    JSON_DATA: '/json',                   // CRUD /json/{entidad}/{id}/{campo}
    JSON_DEFINITIONS: '/json/definitions', // POST /json/definitions/{entidad}/{campo}

    // Endpoints para entidades base
    SOLICITANTES: '/solicitantes',
    UBICACIONES: '/ubicaciones',
    ACTIVIDAD_ECONOMICA: '/actividad_economica',
    INFORMACION_FINANCIERA: '/informacion_financiera',
    REFERENCIAS: '/referencias',
    REFERENCIAS_POR_SOLICITANTE: '/referencias/por-solicitante',
    // Nuevos endpoints JSON para gestionar referencias dentro de una sola fila por solicitante
    REFERENCIAS_ADD: '/referencias/agregar',
    REFERENCIAS_UPDATE: '/referencias/actualizar',
    REFERENCIAS_DELETE: '/referencias/eliminar',
    SOLICITUDES: '/solicitudes',
    SOLICITUDES_PATCH: '/solicitudes/{id}', // PATCH para actualizar solicitudes
    ESTADOS_DISPONIBLES: '/solicitudes/estados-disponibles', // GET para obtener estados disponibles
    DOCUMENTOS: '/documentos',

    // Endpoint unificado para crear registro completo
    CREAR_REGISTRO_COMPLETO: '/solicitantes/crear-registro-completo',

    // Endpoint para editar registro completo
    EDITAR_REGISTRO_COMPLETO: '/solicitantes/{id}/editar-registro-completo',

    // Endpoint para traer todos los registros de un solicitante
    TRAER_TODOS_REGISTROS: '/solicitantes',

    // Endpoints para notificaciones
    NOTIFICACIONES: '/notificaciones',
    NOTIFICACIONES_PENDIENTES: '/notificaciones/pendientes',
    MARCAR_LEIDA: '/notificaciones/{id}/marcar-leida',

    // Endpoint para configuración de columnas dinámicas
    COLUMNAS_TABLA: '/configuraciones/columnas-tabla',

    // Endpoints para configuraciones (ciudades, bancos, etc.)
    CONFIGURACIONES: '/configuraciones', // GET /configuraciones/{categoria}?empresa_id={id}

    // Endpoints para estadísticas
    ESTADISTICAS_RENDIMIENTO: '/estadisticas/rendimiento',
    ESTADISTICAS_FINANCIERAS: '/estadisticas/financieras',
    ESTADISTICAS_COMPLETAS: '/estadisticas/completas',
    ESTADISTICAS_USUARIOS: '/estadisticas/usuarios',

    // Endpoint para reordenar campos dinámicos
    REORDENAR_CAMPOS: '/json/definitions/{entity}/{json_field}/reorder',
    ORDEN_CAMPOS_FORMULARIO: '/json/definitions/{entity}/{json_field}/reorder',

    // Endpoint para descargar ventas
    DESCARGAR_VENTAS: '/solicitantes/descargar-ventas',
  }
};

// Export API_BASE_URL for backward compatibility
export const API_BASE_URL = API_CONFIG.BASE_URL;

// Función helper para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Roles de usuario
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
  BANCO: 'banco',
  ASESOR: 'asesor',
  SUPERVISOR: 'supervisor'
} as const;

// Estados de clientes
export const CUSTOMER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
} as const;

// Estados de crédito
export const CREDIT_STATUSES = [
  'Pendiente',
  'En estudio',
  'Pendiente información adicional',
  'Aprobado',
  'Desembolsado',
  'Pagado',
  'Negado',
  'Desistido'
] as const;

// Configuración de la aplicación
export const APP_CONFIG = {
  APP_NAME: 'Sistema de Seguimiento de Créditos',
  TOAST_DURATION: 3000,
  ITEMS_PER_PAGE: 10,
};

// Rutas de la aplicación
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  USERS: '/users',
  PROFILE: '/profile',
  SEGUIMIENTO: '/seguimiento',
  CONFIG: '/config',
} as const;

// Permisos por rol
export const PERMISSIONS = {
  [USER_ROLES.ADMIN]: ['create', 'read', 'update', 'delete', 'manage_users'],
  [USER_ROLES.SUPERVISOR]: ['create', 'read', 'update', 'delete', 'manage_users'],
  [USER_ROLES.MANAGER]: ['create', 'read', 'update'],
  [USER_ROLES.USER]: ['read'],
  [USER_ROLES.BANCO]: ['view_customer', 'download_sales'],
  [USER_ROLES.ASESOR]: ['create', 'read', 'update'],
} as const;

// API para ciudades de Colombia
export const COLOMBIA_CITIES_API = 'https://www.datos.gov.co/resource/xdk5-pm3f.json';