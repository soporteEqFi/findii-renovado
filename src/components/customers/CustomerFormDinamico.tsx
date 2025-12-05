import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { File, X as XIcon, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useEsquemasCompletos } from '../../hooks/useEsquemasCompletos';
import { useEstados } from '../../hooks/useEstados';
import { FormularioCompleto } from '../ui/FormularioCompleto';
import { esquemaService } from '../../services/esquemaService';
import { documentService } from '../../services/documentService';
import { referenciaService } from '../../services/referenciaService';
import { userService } from '../../services/userService';
import { User } from '../../types/user';
import { buildApiUrl, API_CONFIG } from '../../config/constants';

interface CustomerFormDinamicoProps {
  onSubmit: () => Promise<void>;
  onCancel: () => void;
}

export const CustomerFormDinamico: React.FC<CustomerFormDinamicoProps> = ({
  onSubmit,
  onCancel
}) => {
  // Estados para todos los campos (base + dinámicos) - INICIALMENTE VACÍO
  const [datosFormulario, setDatosFormulario] = useState<Record<string, any>>({});
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para archivos y checkboxes
  // Legacy múltiple (para Pensionado)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  // Slots de documentos (Opción B)
  const [fileCC, setFileCC] = useState<File | null>(null);
  const [fileCartaLaboral, setFileCartaLaboral] = useState<File | null>(null);
  const [filesDesprendibles, setFilesDesprendibles] = useState<File[]>([]); // requeridos 2 para Empleado
  const [fileDeclaracionRenta, setFileDeclaracionRenta] = useState<File | null>(null);
  const [filesExtractos, setFilesExtractos] = useState<File[]>([]); // requeridos 3 para Independiente
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [aceptaAcuerdoFirma, setAceptaAcuerdoFirma] = useState(false);
  const [referencias, setReferencias] = useState<Array<Record<string, any>>>([{}, {}]);

  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  const empresaId = useMemo(() => parseInt(localStorage.getItem('empresa_id') || '1', 10), []);

  const currentUserRole = useMemo(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed?.rol) return String(parsed.rol).toLowerCase();
      } catch (error) {
        console.error('Error parsing user role from localStorage:', error);
      }
    }
    const storedRole = localStorage.getItem('user_role');
    return storedRole ? storedRole.toLowerCase() : 'user';
  }, []);

  const canAssignUsers = currentUserRole === 'admin' || currentUserRole === 'supervisor';

  const formatUserLabel = useCallback((user: User) => {
    const city = user.info_extra?.ciudad || (user.info_extra as any)?.ciudad_residencia || '';
    const bank = user.info_extra?.banco_nombre || (user.info_extra as any)?.nombre_banco_usuario || '';
    const details: string[] = [];
    if (city) details.push(city);
    if (bank) details.push(`Banco ${bank}`);
    if (details.length === 0) {
      return user.nombre;
    }
    return `${user.nombre} · ${details.join(' · ')}`;
  }, []);

  const currentUserId = useMemo(() => {
    const storedId = localStorage.getItem('user_id');
    return storedId ? parseInt(storedId, 10) : null;
  }, []);

  const currentUserName = useMemo(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        return parsed?.nombre || parsed?.name || 'Mi usuario';
      } catch (error) {
        console.error('Error parsing current user from localStorage:', error);
      }
    }
    return 'Mi usuario';
  }, []);

  useEffect(() => {
    if (!canAssignUsers) {
      setAvailableUsers([]);
      setLoadingUsers(false);
      setUsersError(null);
      return;
    }

    let isMounted = true;

    const cargarUsuarios = async () => {
      setLoadingUsers(true);
      setUsersError(null);
      try {
        const usuarios = await userService.getUsers(empresaId, { includeIdentityHeaders: false });
        if (isMounted) {
          setAvailableUsers(usuarios);
        }
      } catch (error) {
        console.error('Error cargando usuarios para asignación:', error);
        if (isMounted) {
          setUsersError('No se pudieron cargar los usuarios disponibles.');
        }
      } finally {
        if (isMounted) {
          setLoadingUsers(false);
        }
      }
    };

    cargarUsuarios();

    return () => {
      isMounted = false;
    };
  }, [empresaId, canAssignUsers]);

  // Configuración de esquemas completos - consultar campos fijos + dinámicos
  const esquemasConfig = [
    { entidad: 'solicitante' },
    { entidad: 'ubicacion' },
    { entidad: 'actividad_economica' },
    { entidad: 'informacion_financiera' },
    { entidad: 'referencia' },
    { entidad: 'solicitud' }
  ];

  const { esquemas, loading: esquemasLoading, error: esquemasError } = useEsquemasCompletos(esquemasConfig);

  // Hook para obtener estados dinámicos
  const { estados, loading: loadingEstados } = useEstados(empresaId);

  // Manejo de archivos (legacy + slots)
  // Legacy (solo para Pensionado)
  const handleLegacyFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };
  const handleLegacyRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handlers para slots
  const handleSelectSingle = (setter: (f: File | null) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setter(f);
  };
  const handleSelectMultiple = (setter: (fs: File[]) => void, max?: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const arr = Array.from(e.target.files || []);
    setter(typeof max === 'number' ? arr.slice(0, max) : arr);
  };
  const removeFromList = (list: File[], index: number, setter: (fs: File[]) => void) => {
    setter(list.filter((_, i) => i !== index));
  };

  // ✅ AUTO-LLENAR TODOS LOS CAMPOS CON DATOS DE PRUEBA COMPLETOS
  const autoLlenarTodosLosCampos = () => {
    const nuevosValores: Record<string, any> = { ...datosFormulario };

    // Datos de prueba completos para acelerar el desarrollo
    const datosPrueba = {
      // ===== SOLICITANTE =====
      nombres: 'Juan Carlos',
      primer_apellido: 'Pérez',
      segundo_apellido: 'García',
      tipo_identificacion: 'CC',
      numero_documento: '12345678',
      fecha_nacimiento: '1990-05-15',
      genero: 'M',
      correo: 'equitisoporte@gmail.com',
      telefono: '3001234567',
      estado_civil: 'Soltero',
      personas_a_cargo: 0,
      fecha_expedicion: '2010-01-01',
      lugar_nacimiento: 'Bogotá',
      celular: '3001234567',
      id_autenticacion: 'ABC123',
      recibir_correspondencia: true,
      paga_impuestos_fuera: false,
      pais_donde_paga_impuestos: '',
      declara_renta: false,

      // ===== UBICACIÓN =====
      direccion: 'Calle 123 # 45-67',
      ciudad_residencia: 'Bogotá',
      departamento_residencia: 'Cundinamarca',
      direccion_residencia: 'Calle 123 # 45-67',
      tipo_direccion: 'Casa',
      barrio: 'Chapinero',
      estrato: 4,
      tipo_vivienda: 'Propia',
      paga_arriendo: false,
      arrendador: '',

      // ===== ACTIVIDAD ECONÓMICA =====
      tipo_actividad_economica: 'Empleado',
      sector_economico: 'Tecnología',
      codigo_ciuu: '6201',
      departamento_empresa: 'Cundinamarca',
      ciudad_empresa: 'Bogotá',
      telefono_empresa: '6011234567',
      correo_electronico_empresa: 'empresa@email.com',
      nit_empresa: '900123456-7',
      sector_economico_empresa: 'Tecnología',
      tipo_contrato: 'Indefinido',
      fecha_ingreso_empresa: '2020-01-15',
      empresa: 'Tech Solutions S.A.S.',
      cargo: 'Desarrollador Senior',
      salario_base: 5000000,
      tipo_actividad: 'Empleado',

      // ===== INFORMACIÓN FINANCIERA =====
      ingresos_mensuales_base: 5000000,
      gastos_mensuales: 2000000,
      otros_ingresos: 500000,
      total_ingresos_mensuales: 5500000,
      total_egresos_mensuales: 2000000,
      total_activos: 50000000,
      total_pasivos: 10000000,
      gastos_vivienda: 800000,
      gastos_alimentacion: 600000,
      gastos_transporte: 300000,
      ingreso_basico_mensual: 5000000,
      ingreso_variable_mensual: 500000,
      otros_ingresos_mensuales: 0,
      gastos_financieros_mensuales: 200000,
      gastos_personales_mensuales: 400000,
      ingresos_fijos_pension: 0,
      ingresos_por_ventas: 0,
      ingresos_varios: 0,
      honorarios: 0,
      arriendos: 0,
      ingresos_actividad_independiente: 0,
      detalle_otros_ingresos: '',
      ingresos_mensuales: 5500000,

      // ===== REFERENCIAS =====
      nombre_completo: 'María González',
      telefono_referencia: '3009876543',
      celular_referencia: '3009876543',
      relacion_referencia: 'Familiar',
      parentesco: 'Hermana',
      nombre_referencia: 'María González',
      tipo_referencia: 'personal',
      ciudad_referencia: 'Bogotá',

      // ===== SOLICITUD =====
      monto_solicitado: 50000000,
      plazo_meses: 60,
      tipo_credito_id: 1,
      destino_credito: 'Vivienda',
      cuota_inicial: 10000000,
      valor_inmueble: 150000000,
      tipo_credito: 'Hipotecario',
      banco_nombre: 'Banco de Bogotá',
      estado: 'Pendiente',
      ciudad_solicitud: 'Bogotá',
      assigned_to_user_id: currentUserId || null,

      // ===== CAMPOS ADICIONALES =====
      pago_impuestos_colombia: true,
      pago_de_impuestos_fuera_de_colombia: false,
      codigo_ciiu: '6201',
      departamento_de_la_empresa: 'Cundinamarca',
      ciudad_de_la_empresa: 'Bogotá',
      telefono_de_la_empresa: '6011234567',
      correo_electronico_de_la_empresa: 'empresa@email.com',
      nit_de_la_empresa: '900123456-7',
      direccion_de_la_empresa: 'Calle 100 # 50-30',
      nombre_del_negocio: '',
      direccion_del_negocio: '',
      departamento_del_negocio: '',
      ciudad_del_negocio: '',
      numero_de_empleados_del_negocio: 0,
      antiguedad_en_la_actividad: 3,
      entidad_pagadora_pension: '',
      antiguedad_actividad: 3,
      antiguedad_actividad_texto: '3 años',
      numero_empleados_negocio: 0
    };

    // Aplicar datos de prueba SOLO si el campo está completamente vacío (undefined o null)
    // NO sobrescribir valores que el usuario ya escribió (incluyendo '' o 0)
    Object.entries(datosPrueba).forEach(([key, value]) => {
      // Solo llenar si NO existe el campo o es null/undefined
      if (nuevosValores[key] === undefined || nuevosValores[key] === null) {
        nuevosValores[key] = value;
      }
    });

    // NO aplicar default_value automáticamente
    // Los default_value solo se muestran en la UI pero NO se guardan en el estado
    // El usuario debe interactuar con el campo para que se guarde

    // Actualizar el formulario con los nuevos valores
    setDatosFormulario(nuevosValores);
  };

  // ✅ VALIDACIÓN COMPLETA DE ESQUEMAS CARGADOS (debe ir ANTES del useEffect)
  const entidadesRequeridas = ['solicitante', 'ubicacion', 'actividad_economica', 'informacion_financiera', 'referencia', 'solicitud'];
  const esquemasCompletos = entidadesRequeridas.every(entidad =>
    esquemas[entidad]?.esquema &&
    (esquemas[entidad]?.esquema?.campos_fijos || esquemas[entidad]?.esquema?.campos_dinamicos)
  );

  // Función para limpiar el formulario
  const limpiarFormulario = () => {
    // Crear un objeto completamente vacío
    // NO inicializar campos con valores por defecto
    // Solo agregar valores cuando el usuario interactúe con el formulario
    setDatosFormulario({});
    setErrores({});
    setSelectedFiles([]);
    setFileCC(null);
    setFileCartaLaboral(null);
    setFilesDesprendibles([]);
    setFileDeclaracionRenta(null);
    setFilesExtractos([]);
    setAceptaTerminos(false);
    setAceptaAcuerdoFirma(false);
    setReferencias([{}, {}]);
  };

  // Limpiar formulario cuando se monta el componente
  React.useEffect(() => {
    limpiarFormulario();
  }, []);

  // Auto-llenado automático cuando los esquemas se cargan (opcional)
  React.useEffect(() => {
    if (!esquemasLoading && esquemasCompletos) {
    }
  }, [esquemasLoading, esquemasCompletos]);

  // Obtener información del asesor al montar el componente
  React.useEffect(() => {
    const obtenerInformacionAsesor = async () => {
      try {
        const currentUser = await userService.getCurrentUserInfo();

        setDatosFormulario(prev => {
          const newData = {
            ...prev,
            nombre_asesor: currentUser.nombre,
            correo_asesor: currentUser.correo
          };
          return newData;
        });

      } catch (error) {
        console.error('❌ Error obteniendo información del asesor:', error);
      }
    };

    obtenerInformacionAsesor();
  }, []);

  // Función para obtener información del asesor y banquero
  const obtenerInformacionAsesorYBanquero = async (bancoNombre: string, ciudadSolicitud: string) => {
    try {
      // Obtener información del usuario logueado (asesor)
      const currentUser = await userService.getCurrentUserInfo();

      // Buscar banquero por criterios
      const banker = await userService.findBankerByCriteria(bancoNombre, ciudadSolicitud);

      // Actualizar formulario con la información obtenida
      setDatosFormulario(prev => {
        const newData = {
          ...prev,
          nombre_asesor: currentUser.nombre,
          correo_asesor: currentUser.correo,
          nombre_banco_usuario: banker?.nombre || '',
          correo_banco_usuario: banker?.correo || ''
        };


        return newData;
      });



    } catch (error) {
      console.error('❌ Error obteniendo información de asesor y banquero:', error);
      // En caso de error, solo obtener información del asesor
      try {
        const currentUser = await userService.getCurrentUserInfo();
        setDatosFormulario(prev => ({
          ...prev,
          nombre_asesor: currentUser.nombre,
          correo_asesor: currentUser.correo,
          nombre_banco_usuario: '',
          correo_banco_usuario: ''
        }));
      } catch (asesorError) {
        console.error('❌ Error crítico obteniendo información del asesor:', asesorError);
      }
    }
  };

  // Manejar cambios en todos los campos
  const handleFieldChange = (key: string, value: any) => {
    // 🔍 DEBUG: Log específico para nacionalidad
    if (key === 'nacionalidad') {
      console.log('🔍 CustomerFormDinamico - nacionalidad recibida:', value);
    }

    setDatosFormulario(prev => ({ ...prev, [key]: value }));

    // Limpiar error del campo
    if (errores[key]) {
      setErrores(prev => ({ ...prev, [key]: '' }));
    }

    // Si cambia el banco o la ciudad, obtener información del banquero
    if (key === 'banco_nombre' || key === 'ciudad_solicitud') {
      const bancoNombre = key === 'banco_nombre' ? value : datosFormulario.banco_nombre;
      const ciudadSolicitud = key === 'ciudad_solicitud' ? value : datosFormulario.ciudad_solicitud;

      // Solo ejecutar si ambos campos tienen valor
      if (bancoNombre && ciudadSolicitud) {
        obtenerInformacionAsesorYBanquero(bancoNombre, ciudadSolicitud);
      }
    }
  };

  // Envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar checkboxes
    if (!aceptaTerminos) {
      toast.error('Debes aceptar los términos y condiciones de uso para continuar');
      return;
    }

    if (!aceptaAcuerdoFirma) {
      toast.error('Debes aceptar el acuerdo de firma para continuar');
      return;
    }

    // Validación de documentos por tipo de actividad (Opción B)
    const tipoActividad: string = (datosFormulario.tipo_actividad || datosFormulario.tipo_actividad_economica || '').toString().toLowerCase();
    const isEmpleado = tipoActividad.includes('empleado');
    const isIndependiente = tipoActividad.includes('independ');
    const isPensionado = tipoActividad.includes('pension');

    if (!isPensionado) {
      // Validación por slots
      if (!fileCC) {
        toast.error('Debes adjuntar la Cédula (CC)');
        return;
      }

      if (isEmpleado) {
        if (!fileCartaLaboral) {
          toast.error('Para Empleado: adjunta la Carta laboral');
          return;
        }
        if (filesDesprendibles.length < 2) {
          toast.error('Para Empleado: adjunta 2 desprendibles de nómina');
          return;
        }
      }

      if (isIndependiente) {
        if (!fileDeclaracionRenta) {
          toast.error('Para Independiente: adjunta la Declaración de renta');
          return;
        }
        if (filesExtractos.length < 3) {
          toast.error('Para Independiente: adjunta extractos del último trimestre (mínimo 3)');
          return;
        }
      }
    }

    const referenciasCandidatasPrevias = (Array.isArray(referencias) ? referencias : [])
      .map((r) => {
        const { detalle_referencia, referencia_id, id, ...rest } = (r || {}) as any;
        const flatDetalle = detalle_referencia && typeof detalle_referencia === 'object' ? detalle_referencia : {};
        const tipo = (r as any)?.tipo_referencia || (r as any)?.tipo || undefined;
        const plano: Record<string, any> = { ...rest, ...flatDetalle };
        if (tipo) plano.tipo_referencia = tipo;
        delete (plano as any).id;
        delete (plano as any).referencia_id; // dejar que el backend asigne
        return plano;
      })
      .filter((plano) => {
        // Permitir envío solo si el usuario llenó al menos un CAMPO CLAVE
        // Excluimos campos que suelen tener defaults o poco significativos.
        const camposClave = [
          'nombre_referencia',
          'nombre_referencia1',
          'celular_referencia',
          'direccion_referencia',
          'direccion_referencia1',
          'relacion_referencia',
          'relacion_referencia1',
        ];
        return camposClave.some((k) => {
          const v = (plano as any)[k];
          return v !== undefined && v !== null && String(v).trim() !== '';
        });
      });

    if (referenciasCandidatasPrevias.length < 2) {
      toast.error('Debes registrar al menos dos referencias');
      return;
    }

    setIsSubmitting(true);
    try {

      // No incluir referencias en el payload unificado. Se gestionan con endpoints dedicados.
      const datosParaEnviar = { ...datosFormulario };

      // 📤 Log de datos que se enviarán
      console.log('📤 DATOS QUE SE ENVIARÁN AL BACKEND:', datosParaEnviar);

      const empresaId = parseInt(localStorage.getItem('empresa_id') || '1', 10);
      const resultado = await esquemaService.crearRegistroCompletoUnificado(
        datosParaEnviar,
        esquemas,
        empresaId
      );

      // Extraer solicitante_id del registro creado en la respuesta del API
      let solicitanteId = null;
      // El solicitante_id debe estar en resultado.data donde se almacenan los registros creados
      if (resultado?.data?.solicitante_id) {
        solicitanteId = resultado.data.solicitante_id;
      } else if (resultado?.data?.solicitante?.id) {
        solicitanteId = resultado.data.solicitante.id;
      } else if (resultado?.data?.id) {
        solicitanteId = resultado.data.id;
      } else {
        console.error('❌ No se pudo encontrar solicitante_id en la respuesta');
      }
      // Agregar referencias usando el endpoint POST /referencias/agregar
      try {
        const referenciasCandidatas = (Array.isArray(referencias) ? referencias : [])
          .map((r) => {
            const { detalle_referencia, referencia_id, id, ...rest } = (r || {}) as any;
            const flatDetalle = detalle_referencia && typeof detalle_referencia === 'object' ? detalle_referencia : {};
            const tipo = (r as any)?.tipo_referencia || (r as any)?.tipo || undefined;
            const plano: Record<string, any> = { ...rest, ...flatDetalle };
            if (tipo) plano.tipo_referencia = tipo;
            delete (plano as any).id;
            delete (plano as any).referencia_id; // dejar que el backend asigne
            return plano;
          })
          .filter((plano) => {
            // Permitir envío solo si el usuario llenó al menos un CAMPO CLAVE
            // Excluimos campos que suelen tener defaults o poco significativos.
            const camposClave = [
              'nombre_referencia',
              'nombre_referencia1',
              'celular_referencia',
              'direccion_referencia',
              'direccion_referencia1',
              'relacion_referencia',
              'relacion_referencia1',
            ];
            return camposClave.some((k) => {
              const v = (plano as any)[k];
              return v !== undefined && v !== null && String(v).trim() !== '';
            });
          });

        if (solicitanteId && referenciasCandidatas.length > 0) {
          console.log('🔄 Agregando referencias individuales vía API...', referenciasCandidatas);
          const results = await Promise.all(
            referenciasCandidatas.map(async (ref) => {
              try {
                const res = await referenciaService.addReferencia(Number(solicitanteId), ref as any);
                console.log('✅ Referencia agregada:', res);
                return res;
              } catch (err) {
                console.error('❌ Error agregando referencia:', ref, err);
                throw err;
              }
            })
          );
          console.log('✅ Todas las referencias agregadas:', results);
        } else {
          console.log('ℹ️ No hay referencias para agregar o no hay solicitanteId');
        }
      } catch (refsError) {
        console.error('❌ Error al agregar referencias:', refsError);
        toast.error('Se creó la solicitud pero hubo errores agregando las referencias');
      }

      // 2. Subir documentos (antes de enviar emails)
      // Compilar lista de archivos desde slots o legacy si es Pensionado
      const filesParaSubir: File[] = isPensionado
        ? selectedFiles
        : [
            ...([fileCC].filter(Boolean) as File[]),
            ...([fileCartaLaboral].filter(Boolean) as File[]),
            ...filesDesprendibles,
            ...([fileDeclaracionRenta].filter(Boolean) as File[]),
            ...filesExtractos,
          ];

      if (filesParaSubir.length > 0 && solicitanteId) {
        console.log('🚀 === INICIANDO PROCESO DE SUBIDA DE ARCHIVOS ===');
        console.log('📁 Solicitante ID obtenido:', solicitanteId);
        console.log('📂 Número de archivos a subir:', filesParaSubir.length);

        // Log detallado de cada archivo
        filesParaSubir.forEach((file, index) => {
          console.log(`📄 Archivo ${index + 1}:`, {
            nombre: file.name,
            tamaño: `${(file.size / 1024).toFixed(2)} KB`,
            tipo: file.type,
            lastModified: new Date(file.lastModified).toLocaleString()
          });
        });

        try {
          console.log('🔄 Llamando documentService.uploadMultipleDocuments...');
          console.log('📤 Parámetros de subida:', {
            archivos: filesParaSubir.map(f => ({ nombre: f.name, tamaño: f.size })),
            solicitante_id: solicitanteId
          });

          // Subir todos los documentos (en paralelo, pero esperamos a que todos terminen)
          await documentService.uploadMultipleDocuments(
            filesParaSubir,
            solicitanteId
          );

          console.log('✅ === ARCHIVOS SUBIDOS EXITOSAMENTE ===');
          console.log('📈 Total archivos procesados:', filesParaSubir.length);

          toast.success(`Solicitud creada y ${filesParaSubir.length} archivo(s) subido(s) exitosamente`);
        } catch (uploadError) {
          console.error('❌ === ERROR EN SUBIDA DE ARCHIVOS ===');
          console.error('🔍 Tipo de error:', typeof uploadError);
          console.error('📋 Error completo:', uploadError);

          if (uploadError instanceof Error) {
            console.error('📝 Mensaje del error:', uploadError.message);
            console.error('📚 Stack trace:', uploadError.stack);
          }

          // Si es un error de fetch, intentar obtener más detalles
          if (uploadError && typeof uploadError === 'object' && 'response' in uploadError) {
            console.error('🌐 Respuesta del servidor:', uploadError.response);
          }

          toast.error('Solicitud creada pero hubo un error al subir los archivos');
          // Continuar con el envío de emails incluso si hay error en archivos
        }
      } else if (filesParaSubir.length > 0 && !solicitanteId) {
        console.warn('⚠️ === ARCHIVOS SELECCIONADOS PERO SIN SOLICITANTE_ID ===');
        console.warn('📂 Archivos seleccionados:', filesParaSubir.length);
        console.warn('🆔 Resultado completo:', resultado);
        console.warn('🔍 Estructura del resultado:', Object.keys(resultado || {}));
        toast.error('Solicitud creada pero no se pudo obtener el ID para subir archivos');
      } else {
        console.log('ℹ️ No hay archivos para subir');
      }

      // 3. Enviar emails (después de subir todos los documentos)
      if (solicitanteId) {
        try {
          console.log('📧 === INICIANDO ENVÍO DE EMAILS ===');
          console.log('📁 Solicitante ID:', solicitanteId);

          const emailData: any = {};

          // Agregar datos opcionales si están disponibles en el formulario
          if (datosFormulario.correo_asesor) {
            emailData.correo_asesor = datosFormulario.correo_asesor;
          }
          if (datosFormulario.nombre_asesor) {
            emailData.nombre_asesor = datosFormulario.nombre_asesor;
          }
          if (datosFormulario.correo_banco_usuario) {
            emailData.correo_banco_usuario = datosFormulario.correo_banco_usuario;
          }
          if (datosFormulario.nombre_banco_usuario) {
            emailData.nombre_banco_usuario = datosFormulario.nombre_banco_usuario;
          }

          console.log('📤 Datos de email a enviar:', emailData);

          const empresaIdToUse = parseInt(localStorage.getItem('empresa_id') || '1', 10);
          const endpoint = API_CONFIG.ENDPOINTS.ENVIAR_EMAILS.replace('{id}', solicitanteId.toString());
          const url = buildApiUrl(`${endpoint}?empresa_id=${empresaIdToUse}`);

          const emailsResponse = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-User-Id': localStorage.getItem('user_id') || '1',
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify(emailData)
          });

          if (!emailsResponse.ok) {
            const errorText = await emailsResponse.text();
            console.error('❌ Error al enviar emails:', errorText);
            throw new Error(`Error ${emailsResponse.status}: ${errorText}`);
          }

          const emailsResult = await emailsResponse.json();
          console.log('✅ === EMAILS ENVIADOS EXITOSAMENTE ===');
          console.log('📊 Resultado:', emailsResult);

          if (filesParaSubir.length > 0) {
            toast.success(`Solicitud creada, ${filesParaSubir.length} archivo(s) subido(s) y emails enviados exitosamente`);
          } else {
            toast.success('Solicitud creada y emails enviados exitosamente');
          }
        } catch (emailError) {
          console.error('❌ === ERROR EN ENVÍO DE EMAILS ===');
          console.error('📋 Error completo:', emailError);

          if (emailError instanceof Error) {
            console.error('📝 Mensaje del error:', emailError.message);
          }

          // No interrumpir el flujo principal si falla el envío de emails
          toast.error('Solicitud creada pero hubo un error al enviar los emails');
        }
      } else {
        console.log('ℹ️ No hay solicitanteId, no se pueden enviar emails');
        if (filesParaSubir.length === 0) {
          toast.success('Solicitud creada exitosamente');
        }
      }

      // Llamar al callback del padre para cerrar el modal y recargar datos
      await onSubmit();

    } catch (error) {
      console.error('❌ ERROR EN EL PROCESO:', error);

      // Capturar información detallada del error
      if (error instanceof Error) {
        console.error('📋 Mensaje del error:', error.message);
        console.error('📋 Stack trace:', error.stack);
      }

      // Si es un error de fetch, intentar obtener la respuesta
      if (error && typeof error === 'object' && 'response' in error) {
        console.error('📋 Respuesta del servidor:', error.response);
        try {
          const errorText = await (error as any).response?.text();
          console.error('📋 Texto de respuesta del servidor:', errorText);
          console.error('🔍 Probablemente el servidor devolvió HTML en lugar de JSON');

          // Mostrar las primeras líneas del HTML para ver qué página es
          if (errorText && errorText.includes('<')) {
            const lines = errorText.split('\n').slice(0, 10);
            console.error('🔍 Primeras líneas de la respuesta HTML:', lines);
          }
        } catch (parseError) {
          console.error('📋 No se pudo parsear la respuesta:', parseError);
        }
      }

      // Información adicional del error de fetch
      console.error('🔍 Detalles del error:');
      console.error('  - Tipo:', typeof error);
      console.error('  - Constructor:', error?.constructor?.name);
      console.error('  - Keys:', Object.keys(error || {}));

      toast.error(error instanceof Error ? error.message : 'Error al crear la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };



  // Debug useEffect removido (no aportaba y causaba lints)

  if (esquemasLoading || loadingEstados) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2">
          {loadingEstados ? 'Cargando estados disponibles...' : 'Cargando formulario dinámico...'}
        </span>
      </div>
    );
  }

  if (esquemasError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">Error al cargar esquemas: {esquemasError}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // ⚠️ VALIDACIÓN: Si no todos los esquemas están listos, mostrar loading
  if (!esquemasCompletos) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Esperando que todos los esquemas se carguen...</p>
          <p className="text-sm text-gray-400 mt-1">
            Cargados: {entidadesRequeridas.filter(e => esquemas[e]?.esquema).length}/{entidadesRequeridas.length}
          </p>
        </div>
      </div>
    );
  }

  // Derivar tipo de actividad para mostrar notas y requisitos en UI
  const actividadStr = (datosFormulario.tipo_actividad || datosFormulario.tipo_actividad_economica || '').toString().toLowerCase();
  const isEmpleadoUI = actividadStr.includes('empleado');
  const isIndependienteUI = actividadStr.includes('independ');
  const isPensionadoUI = actividadStr.includes('pension');

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ✅ BOTÓN AUTO-LLENAR PARA PRUEBAS */}
      <div className="flex justify-between items-center bg-blue-50 dark:bg-gray-800 p-4 rounded-lg">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Formulario de Registro</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Llena automáticamente todos los campos con datos de prueba para acelerar el desarrollo</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={autoLlenarTodosLosCampos}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium"
            title="Llena automáticamente TODOS los campos con datos de prueba realistas"
          >
            🚀 Llenar con Datos de Prueba
          </button>
          <button
            type="button"
            onClick={limpiarFormulario}
            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
            title="Limpiar todos los campos del formulario"
          >
            🗑️ Limpiar
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* ✅ FORMULARIO COMPLETO - Información del Solicitante */}
        {esquemas.solicitante?.esquema && esquemas.solicitante.esquema.campos_fijos && esquemas.solicitante.esquema.campos_dinamicos ? (
          <FormularioCompleto
            esquemaCompleto={esquemas.solicitante.esquema}
            valores={datosFormulario}
            onChange={handleFieldChange}
            errores={errores}
            titulo="Información del Solicitante"
            estadosDisponibles={estados}
          />
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700">⏳ Cargando campos del solicitante...</p>
          </div>
        )}

        {/* Formulario Completo - Ubicación */}
        {esquemas.ubicacion?.esquema && esquemas.ubicacion.esquema.campos_fijos && esquemas.ubicacion.esquema.campos_dinamicos ? (
          <FormularioCompleto
            esquemaCompleto={esquemas.ubicacion.esquema}
            valores={datosFormulario}
            onChange={handleFieldChange}
            errores={errores}
            titulo="Información de Ubicación"
            estadosDisponibles={estados}
          />
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700">⏳ Cargando campos de ubicación...</p>
          </div>
        )}

        {/* Formulario Completo - Actividad Económica */}
        {esquemas.actividad_economica?.esquema && esquemas.actividad_economica.esquema.campos_fijos && esquemas.actividad_economica.esquema.campos_dinamicos ? (
          <FormularioCompleto
            esquemaCompleto={esquemas.actividad_economica.esquema}
            valores={datosFormulario}
            onChange={handleFieldChange}
            errores={errores}
            titulo="Información Laboral"
            estadosDisponibles={estados}
          />
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700">⏳ Cargando campos de actividad económica...</p>
          </div>
        )}

        {/* Formulario Completo - Información Financiera */}
        {esquemas.informacion_financiera?.esquema && esquemas.informacion_financiera.esquema.campos_fijos && esquemas.informacion_financiera.esquema.campos_dinamicos ? (
          <FormularioCompleto
            esquemaCompleto={esquemas.informacion_financiera.esquema}
            valores={datosFormulario}
            onChange={handleFieldChange}
            errores={errores}
            titulo="Información Financiera"
            estadosDisponibles={estados}
          />
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700">⏳ Cargando campos de información financiera...</p>
          </div>
        )}

        {/* Sección de Referencias Múltiples */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Información de Referencias</h3>

          {referencias.map((referencia, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg relative">
              {referencias.length > 2 && (
                <button
                  type="button"
                  onClick={() => {
                    const nuevasReferencias = [...referencias];
                    nuevasReferencias.splice(index, 1);
                    setReferencias(nuevasReferencias);
                  }}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  title="Eliminar referencia"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              )}

              <h4 className="text-md font-medium text-gray-800 dark:text-gray-100 mb-4">Referencia {index + 1}</h4>

              {esquemas.referencia?.esquema?.campos_fijos && esquemas.referencia.esquema.campos_dinamicos ? (
                <FormularioCompleto
                  key={index}
                  esquemaCompleto={{
                    ...esquemas.referencia.esquema,
                    // Inyectar opciones para tipo_referencia si faltan
                    campos_fijos: esquemas.referencia.esquema.campos_fijos.map(field => (
                      field.key === 'tipo_referencia' && !field.list_values
                        ? {
                            ...field,
                            list_values: { enum: ['personal', 'familiar', 'laboral', 'comercial'] }
                          }
                        : field
                    )),
                    campos_dinamicos: esquemas.referencia.esquema.campos_dinamicos
                  }}
                  valores={{
                    ...referencia,
                    ...(referencia?.detalle_referencia || {})
                  }}
                  onChange={(key, value) => {
                    const dynamicKeys = new Set(
                      (esquemas.referencia?.esquema?.campos_dinamicos || []).map((f: any) => f.key)
                    );
                    const nuevasReferencias = [...referencias];
                    const actual = { ...nuevasReferencias[index] };
                    if (dynamicKeys.has(key)) {
                      actual.detalle_referencia = {
                        ...(actual.detalle_referencia || {}),
                        [key]: value
                      };
                    } else {
                      (actual as any)[key] = value;
                    }
                    nuevasReferencias[index] = actual;
                    setReferencias(nuevasReferencias);
                  }}
                  errores={errores}
                  estadosDisponibles={estados}
                />
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-700">⏳ Cargando campos de referencia...</p>
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setReferencias([...referencias, {}])}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={false}
            >
              + Agregar Referencia
            </button>
          </div>
        </div>

        {/* Formulario Completo - Solicitud */}
        {esquemas.solicitud?.esquema && esquemas.solicitud.esquema.campos_fijos && esquemas.solicitud.esquema.campos_dinamicos ? (
          <FormularioCompleto
            esquemaCompleto={esquemas.solicitud.esquema}
            valores={datosFormulario}
            onChange={handleFieldChange}
            errores={errores}
            titulo="Información del Crédito"
            excludeKeys={["estado"]}
            estadosDisponibles={estados}
          />
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700">⏳ Cargando campos de solicitud...</p>
          </div>
        )}

        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">Asignación de la solicitud</h4>
          {canAssignUsers ? (
            <>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="assigned-to-user">
                Asignar a
              </label>
              <select
                id="assigned-to-user"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={datosFormulario.assigned_to_user_id !== null && datosFormulario.assigned_to_user_id !== undefined ? String(datosFormulario.assigned_to_user_id) : ''}
                onChange={(event) => {
                  const value = event.target.value;
                  handleFieldChange('assigned_to_user_id', value ? parseInt(value, 10) : null);
                }}
                disabled={loadingUsers}
              >
                <option value="">
                  {currentUserId ? `Asignarme a mí (${currentUserName})` : 'Asignarme a mí'}
                </option>
                {availableUsers
                  .filter((user) => (currentUserId ? user.id !== currentUserId : true))
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {formatUserLabel(user)}
                    </option>
                  ))}
              </select>
              {loadingUsers && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Cargando usuarios...</p>
              )}
              {usersError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{usersError}</p>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              La solicitud se asignará automáticamente al usuario que la crea.
            </p>
          )}
        </div>

        {/* Archivos Adjuntos - Condicional por tipo de actividad */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2 mb-3">Archivos Adjuntos</h3>
          {!isPensionadoUI && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded mb-4 text-sm text-blue-800 dark:text-blue-200">
              Empleados: CC, Carta laboral y últimos dos desprendibles de nómina. Independientes: CC, Declaración de renta y Extractos del último trimestre.
            </div>
          )}

          {/* Pensionado: flujo legacy de múltiples archivos */}
          {isPensionadoUI ? (
            <div className="space-y-3">
              <div>
                <input type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleLegacyFileSelect} />
              </div>
              {selectedFiles.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Archivos seleccionados: ({selectedFiles.length})</h4>
                  <ul className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <li key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded">
                        <div className="flex items-center">
                          <File className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-sm">{file.name}</span>
                          <span className="ml-2 text-xs text-gray-500">({(file.size/1024).toFixed(1)} KB)</span>
                        </div>
                        <button type="button" className="text-gray-500 hover:text-red-500" onClick={() => handleLegacyRemoveFile(index)}><XIcon className="w-4 h-4" /></button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="text-xs text-gray-500">Puedes subir múltiples archivos como en el flujo anterior.</div>
            </div>
          ) : (
          <div className="space-y-4">
            {/* CC */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cédula (CC) <span className="text-red-500">*</span></label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx" onChange={handleSelectSingle(setFileCC)} />
              {fileCC && (
                <div className="mt-2 flex items-center justify-between bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded">
                  <div className="flex items-center">
                    <File className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">{fileCC.name}</span>
                    <span className="ml-2 text-xs text-gray-500">({(fileCC.size/1024).toFixed(1)} KB)</span>
                  </div>
                  <button type="button" className="text-gray-500 hover:text-red-500" onClick={() => setFileCC(null)}><XIcon className="w-4 h-4" /></button>
                </div>
              )}
            </div>

            {/* Carta laboral (si empleado) */}
            {isEmpleadoUI && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Carta laboral <span className="text-red-500">*</span></label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={handleSelectSingle(setFileCartaLaboral)} />
                {fileCartaLaboral && (
                  <div className="mt-2 flex items-center justify-between bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded">
                    <div className="flex items-center">
                      <File className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">{fileCartaLaboral.name}</span>
                      <span className="ml-2 text-xs text-gray-500">({(fileCartaLaboral.size/1024).toFixed(1)} KB)</span>
                    </div>
                    <button type="button" className="text-gray-500 hover:text-red-500" onClick={() => setFileCartaLaboral(null)}><XIcon className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
            )}

            {/* Desprendibles (2) - si empleado */}
            {isEmpleadoUI && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Desprendibles de nómina (2) <span className="text-red-500">*</span></label>
                <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleSelectMultiple(setFilesDesprendibles, 2)} />
                {filesDesprendibles.length > 0 && (
                  <ul className="mt-2 space-y-2">
                    {filesDesprendibles.map((f, idx) => (
                      <li key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded">
                        <div className="flex items-center">
                          <File className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-sm">{f.name}</span>
                          <span className="ml-2 text-xs text-gray-500">({(f.size/1024).toFixed(1)} KB)</span>
                        </div>
                        <button type="button" className="text-gray-500 hover:text-red-500" onClick={() => removeFromList(filesDesprendibles, idx, setFilesDesprendibles)}><XIcon className="w-4 h-4" /></button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Declaración de renta - si independiente */}
            {isIndependienteUI && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Declaración de renta <span className="text-red-500">*</span></label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={handleSelectSingle(setFileDeclaracionRenta)} />
                {fileDeclaracionRenta && (
                  <div className="mt-2 flex items-center justify-between bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded">
                    <div className="flex items-center">
                      <File className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">{fileDeclaracionRenta.name}</span>
                      <span className="ml-2 text-xs text-gray-500">({(fileDeclaracionRenta.size/1024).toFixed(1)} KB)</span>
                    </div>
                    <button type="button" className="text-gray-500 hover:text-red-500" onClick={() => setFileDeclaracionRenta(null)}><XIcon className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
            )}

            {/* Extractos (3) - si independiente */}
            {isIndependienteUI && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Extractos del último trimestre (mínimo 3) <span className="text-red-500">*</span></label>
                <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleSelectMultiple(setFilesExtractos)} />
                {filesExtractos.length > 0 && (
                  <ul className="mt-2 space-y-2">
                    {filesExtractos.map((f, idx) => (
                      <li key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded">
                        <div className="flex items-center">
                          <File className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-sm">{f.name}</span>
                          <span className="ml-2 text-xs text-gray-500">({(f.size/1024).toFixed(1)} KB)</span>
                        </div>
                        <button type="button" className="text-gray-500 hover:text-red-500" onClick={() => removeFromList(filesExtractos, idx, setFilesExtractos)}><XIcon className="w-4 h-4" /></button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          )}
        </div>
      </div>

      {/* Checkboxes de Términos y Condiciones */}
      <div className="mt-6 space-y-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="acepta-terminos"
              checked={aceptaTerminos}
              onChange={(e) => setAceptaTerminos(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              required
            />
            <div className="flex-1">
              <label htmlFor="acepta-terminos" className="text-sm text-gray-700 dark:text-gray-300">
                <a href="/terminos-condiciones" target="_blank" rel="noopener noreferrer" className="text-sm font-medium underline">
                  Acepto los Términos y Condiciones de Uso
                </a>
              </label>
            </div>
          </div>
        </div>

        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="acepta-acuerdo-firma"
              checked={aceptaAcuerdoFirma}
              onChange={(e) => setAceptaAcuerdoFirma(e.target.checked)}
              className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              required
            />
            <div className="flex-1">
              <label htmlFor="acepta-acuerdo-firma" className="text-sm text-gray-700 dark:text-gray-300">
                <a href="/acuerdo-firma" target="_blank" rel="noopener noreferrer" className="text-sm font-medium underline">
                  Acepto el Acuerdo de Firma
                </a>
              </label>
            </div>
          </div>
        </div>
      </div>

             {/* Debug de Esquemas (solo en desarrollo) */}
       {/* {process.env.NODE_ENV === 'development' && (
         <div className="mt-6">
           <h3 className="text-lg font-medium text-gray-900 mb-4">Debug de Esquemas Completos</h3>
           {Object.entries(esquemas).map(([key, esquemaData]) => (
             esquemaData.esquema && (
               <div key={key} className="mb-4">
                 <h4 className="text-md font-medium text-gray-800 mb-2">Esquema: {key}</h4>
                 <div className="text-sm text-gray-600">
                   <p>Total campos: {esquemaData.esquema.total_campos}</p>
                   <p>Campos fijos: {esquemaData.esquema.campos_fijos.length}</p>
                   <p>Campos dinámicos: {esquemaData.esquema.campos_dinamicos.length}</p>
                   <p>Tabla: {esquemaData.esquema.tabla}</p>
                   <p>JSON Column: {esquemaData.esquema.json_column}</p>
                 </div>
               </div>
             )
           ))}
         </div>
       )} */}

      {/* Form Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={limpiarFormulario}
          className="px-4 py-2 border border-orange-300 rounded-md shadow-sm text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          Limpiar Formulario
        </button>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSubmitting ? 'Creando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </form>
  );
};
