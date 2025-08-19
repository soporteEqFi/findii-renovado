// Esquemas temporales para desarrollo
// Estos esquemas se usarán como fallback cuando el backend no esté disponible
// Nombres de entidades actualizados para coincidir con la BD real

import { EsquemaCampo } from '../types/esquemas';

export const esquemasTemporales: Record<string, EsquemaCampo[]> = {
  // Esquema para información del solicitante (campos base + dinámicos)
  solicitante_info_extra: [
    {
      key: 'nombres',
      type: 'string',
      required: true,
      description: 'Nombres del solicitante',
      default_value: 'Juan Carlos',
      order_index: 1
    },
    {
      key: 'primer_apellido',
      type: 'string',
      required: true,
      description: 'Primer apellido',
      default_value: 'Rodríguez',
      order_index: 2
    },
    {
      key: 'segundo_apellido',
      type: 'string',
      required: false,
      description: 'Segundo apellido',
      default_value: 'García',
      order_index: 3
    },
    {
      key: 'tipo_identificacion',
      type: 'array',
      required: true,
      list_values: {
        enum: ['CC', 'TE', 'TI']
      },
      description: 'Tipo de identificación',
      default_value: 'CC',
      order_index: 4
    },
    {
      key: 'numero_documento',
      type: 'string',
      required: true,
      description: 'Número de documento',
      default_value: '12345678',
      order_index: 5
    },
    {
      key: 'fecha_nacimiento',
      type: 'date',
      required: true,
      description: 'Fecha de nacimiento',
      order_index: 6
    },
    {
      key: 'genero',
      type: 'array',
      required: true,
      list_values: {
        enum: ['M', 'F']
      },
      description: 'Género',
      default_value: 'M',
      order_index: 7
    },
    {
      key: 'correo',
      type: 'string',
      required: true,
      description: 'Correo electrónico',
      default_value: 'juan.rodriguez@email.com',
      order_index: 8
    },
    {
      key: 'telefono',
      type: 'string',
      required: true,
      description: 'Teléfono de contacto',
      default_value: '3001234567',
      order_index: 9
    },
    {
      key: 'estado_civil',
      type: 'array',
      required: true,
      list_values: {
        enum: ['Soltero', 'Casado', 'Divorciado', 'Viudo', 'Unión Libre']
      },
      description: 'Estado Civil',
      default_value: 'Soltero',
      order_index: 10
    },
    {
      key: 'personas_a_cargo',
      type: 'integer',
      required: false,
      description: 'Número de personas a cargo',
      default_value: 0,
      order_index: 11
    }
  ],

  // Esquema para detalles de ubicación
  ubicacion_detalle_direccion: [
    {
      key: 'ciudad_residencia',
      type: 'string',
      required: true,
      description: 'Ciudad de residencia',
      default_value: 'Bogotá',
      order_index: 1
    },
    {
      key: 'departamento_residencia',
      type: 'string',
      required: true,
      description: 'Departamento de residencia',
      default_value: 'Cundinamarca',
      order_index: 2
    },
    {
      key: 'direccion_residencia',
      type: 'string',
      required: true,
      description: 'Dirección de residencia',
      default_value: 'Calle 123 #45-67',
      order_index: 3
    },
    {
      key: 'barrio',
      type: 'string',
      required: false,
      description: 'Barrio',
      default_value: 'Chapinero',
      order_index: 4
    },
    {
      key: 'estrato',
      type: 'integer',
      required: false,
      description: 'Estrato socioeconómico',
      default_value: 3,
      order_index: 5
    },
    {
      key: 'arrendador',
      type: 'object',
      required: false,
      description: 'Información del arrendador',
      list_values: {
        object_structure: [
          { key: 'nombre', type: 'string', required: true, description: 'Nombre del arrendador', default_value: 'María López' },
          { key: 'telefono', type: 'string', required: true, description: 'Teléfono de contacto', default_value: '3009876543' },
          { key: 'ciudad', type: 'string', required: false, description: 'Ciudad', default_value: 'Bogotá' },
          { key: 'departamento', type: 'string', required: false, description: 'Departamento', default_value: 'Cundinamarca' },
          { key: 'valor_mensual_arriendo', type: 'number', required: false, description: 'Valor mensual del arriendo', default_value: 1200000 }
        ]
      },
      default_value: {
        nombre: 'María López',
        telefono: '3009876543',
        ciudad: 'Bogotá',
        departamento: 'Cundinamarca',
        valor_mensual_arriendo: 1200000
      },
      order_index: 6
    }
  ],

  // Esquema para detalles de actividad económica
  actividad_economica_detalle_actividad: [
    {
      key: 'tipo_actividad',
      type: 'array',
      required: true,
      list_values: {
        enum: ['empleado', 'independiente', 'pensionado', 'desempleado']
      },
      description: 'Tipo de actividad económica',
      default_value: 'empleado',
      order_index: 1
    },
    {
      key: 'sector_economico',
      type: 'array',
      required: true,
      list_values: {
        enum: ['servicios', 'comercio', 'industria', 'agricultura', 'construccion', 'otros']
      },
      description: 'Sector económico',
      default_value: 'servicios',
      order_index: 2
    },
    {
      key: 'empresa',
      type: 'string',
      required: false,
      description: 'Nombre de la empresa',
      default_value: 'TechCorp SAS',
      order_index: 3
    },
    {
      key: 'cargo',
      type: 'string',
      required: false,
      description: 'Cargo actual',
      default_value: 'Desarrollador Senior',
      order_index: 4
    },
    {
      key: 'antiguedad_meses',
      type: 'integer',
      required: false,
      description: 'Antigüedad en meses',
      default_value: 48,
      order_index: 5
    },
    {
      key: 'ingresos_mensuales',
      type: 'number',
      required: false,
      description: 'Ingresos mensuales',
      default_value: 4500000,
      order_index: 6
    }
  ],

  // Esquema para detalles financieros
  informacion_financiera_detalle_financiera: [
    {
      key: 'total_ingresos_mensuales',
      type: 'number',
      required: true,
      description: 'Total de ingresos mensuales',
      default_value: 5000000,
      order_index: 1
    },
    {
      key: 'total_egresos_mensuales',
      type: 'number',
      required: true,
      description: 'Total de egresos mensuales',
      default_value: 2800000,
      order_index: 2
    },
    {
      key: 'total_activos',
      type: 'number',
      required: false,
      description: 'Total de activos',
      default_value: 45000000,
      order_index: 3
    },
    {
      key: 'total_pasivos',
      type: 'number',
      required: false,
      description: 'Total de pasivos',
      default_value: 2500000,
      order_index: 4
    },
    {
      key: 'otros_ingresos',
      type: 'number',
      required: false,
      description: 'Otros ingresos mensuales',
      default_value: 500000,
      order_index: 5
    },
    {
      key: 'gastos_vivienda',
      type: 'number',
      required: false,
      description: 'Gastos de vivienda',
      default_value: 1200000,
      order_index: 6
    },
    {
      key: 'gastos_alimentacion',
      type: 'number',
      required: false,
      description: 'Gastos de alimentación',
      default_value: 600000,
      order_index: 7
    },
    {
      key: 'gastos_transporte',
      type: 'number',
      required: false,
      description: 'Gastos de transporte',
      default_value: 400000,
      order_index: 8
    }
  ],

  // Esquema para referencias
  referencia_detalle_referencia: [
    {
      key: 'tipo_referencia',
      type: 'array',
      required: true,
      list_values: {
        enum: ['personal', 'familiar', 'laboral', 'comercial']
      },
      description: 'Tipo de referencia',
      default_value: 'personal',
      order_index: 1
    },
    {
      key: 'nombre_referencia',
      type: 'string',
      required: true,
      description: 'Nombre de la referencia',
      default_value: 'Carlos Martínez',
      order_index: 2
    },
    {
      key: 'telefono_referencia',
      type: 'string',
      required: true,
      description: 'Teléfono de la referencia',
      default_value: '3009876543',
      order_index: 3
    },
    {
      key: 'parentesco',
      type: 'string',
      required: false,
      description: 'Parentesco o relación',
      default_value: 'Amigo',
      order_index: 4
    }
  ],

  // Esquema para detalles de solicitud/crédito
  solicitud_detalle_credito: [
    {
      key: 'monto_solicitado',
      type: 'number',
      required: true,
      description: 'Monto solicitado',
      default_value: 15000000,
      order_index: 1
    },
    {
      key: 'plazo_meses',
      type: 'integer',
      required: true,
      description: 'Plazo en meses',
      default_value: 36,
      order_index: 2
    },
    {
      key: 'destino_credito',
      type: 'array',
      required: true,
      list_values: {
        enum: ['Vivienda', 'Vehiculo', 'Negocio', 'Educación', 'Consumo', 'Otros']
      },
      description: 'Destino del crédito',
      default_value: 'Vehiculo',
      order_index: 3
    },
    {
      key: 'cuota_inicial',
      type: 'number',
      required: false,
      description: 'Cuota inicial',
      default_value: 3000000,
      order_index: 4
    },
    {
      key: 'valor_inmueble',
      type: 'number',
      required: false,
      description: 'Valor del inmueble',
      default_value: 0,
      order_index: 5
    }
  ]
};
