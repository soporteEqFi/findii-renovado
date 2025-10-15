import React from 'react';
import { Loader2, Upload, Trash2, File as FileIcon, Image as ImageIcon, ExternalLink, Edit2, X as XIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { FormularioCompleto } from '../ui/FormularioCompleto';
import { useEsquemasCompletos } from '../../hooks/useEsquemasCompletos';
import { useEsquemaCompleto } from '../../hooks/useEsquemaCompleto';
import { useEsquemaDetalleCreditoCompleto } from '../../hooks/useEsquemaDetalleCreditoCompleto';
import { useSolicitanteCompleto } from '../../hooks/useSolicitanteCompleto';
import { useLimpiezaCondicional } from '../../hooks/useLimpiezaCondicional';
import { useEstados } from '../../hooks/useEstados';
import { API_CONFIG, buildApiUrl } from '../../config/constants';
import { emailService } from '../../services/emailService';
import { referenciaService } from '../../services/referenciaService';
import { documentService } from '../../services/documentService';
import { userService } from '../../services/userService';
import { NotificationHistory } from '../NotificationHistory';
import { ObservacionesSolicitud } from './ObservacionesSolicitud';

interface CustomerFormDinamicoEditProps {
  solicitanteId: number;
  onSaved?: () => void;
  onCancel?: () => void;
}

export const CustomerFormDinamicoEdit: React.FC<CustomerFormDinamicoEditProps> = ({
  solicitanteId,
  onSaved,
  onCancel,
}) => {
  // 🔍 DEBUG: Verificar qué información tenemos en localStorage
  React.useEffect(() => {
    console.log('🔍 === DEBUG LOCALSTORAGE (EDIT) ===');
    console.log('user:', localStorage.getItem('user'));
    console.log('user_id:', localStorage.getItem('user_id'));
    console.log('user_name:', localStorage.getItem('user_name'));
    console.log('user_email:', localStorage.getItem('user_email'));
    console.log('cedula:', localStorage.getItem('cedula'));
    console.log('empresa_id:', localStorage.getItem('empresa_id'));
    console.log('access_token:', localStorage.getItem('access_token') ? 'EXISTE' : 'NO EXISTE');
    console.log('='.repeat(50));
  }, []);
  // 1) Cargar registro completo del solicitante
  const { datos: datosCompletos, loading: loadingCompletos, error: errorCompletos, refetch } = useSolicitanteCompleto(
    isNaN(solicitanteId) || solicitanteId <= 0 ? null : solicitanteId
  );

  // 2) Estados de edición
  const [editedData, setEditedData] = React.useState<any | null>(null);
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});
  // IDs en proceso de eliminación para mostrar spinner/disable
  const [deletingRefIds, setDeletingRefIds] = React.useState<Set<number>>(new Set());
  const [loadingSave, setLoadingSave] = React.useState(false);
  const [originalBankValue, setOriginalBankValue] = React.useState<string>('');

  // 3) Cargar esquemas de secciones
  const esquemasConfig = [
    { entidad: 'solicitante' },
    { entidad: 'ubicacion' },
    { entidad: 'actividad_economica' },
    { entidad: 'informacion_financiera' },
    { entidad: 'referencia' },
    { entidad: 'solicitud' },
  ];
  const { esquemas, loading: esquemasLoading, error: esquemasError } = useEsquemasCompletos(esquemasConfig);

  // Hook para obtener estados dinámicos
  const empresaId = parseInt(localStorage.getItem('empresa_id') || '1', 10);
  const { estados, loading: loadingEstados } = useEstados(empresaId);


  // Además, algunos componentes consumen estos hooks puntuales
  useEsquemaCompleto('solicitud', parseInt(localStorage.getItem('empresa_id') || '1', 10));
  useEsquemaCompleto('actividad_economica', parseInt(localStorage.getItem('empresa_id') || '1', 10));
  useEsquemaDetalleCreditoCompleto(parseInt(localStorage.getItem('empresa_id') || '1', 10));

  // Hook para limpieza de campos condicionales
  const { limpiarCamposCondicionalesGenerico } = useLimpiezaCondicional();

  // 4) Inicializar datos editables al cargar datosCompletos
  React.useEffect(() => {
    if (datosCompletos) {
      const datosClonados = JSON.parse(JSON.stringify(datosCompletos));
      
      // DEBUG: Verificar TODA la estructura de datos cargados
      console.log('🔍 ========== DATOS CARGADOS RAW ==========');
      console.log('📦 Estructura completa:', datosCompletos);
      console.log('👤 Solicitante:', datosCompletos?.solicitante);
      console.log('📍 Ubicaciones:', datosCompletos?.ubicaciones);
      console.log('💼 Actividad económica:', datosCompletos?.actividad_economica);
      console.log('💰 Información financiera:', datosCompletos?.informacion_financiera);
      console.log('👥 Referencias:', datosCompletos?.referencias);
      console.log('📄 Solicitudes:', datosCompletos?.solicitudes);
      console.log('🏦 Solicitud[0] completa:', datosCompletos?.solicitudes?.[0]);
      console.log('💳 Detalle crédito:', datosCompletos?.solicitudes?.[0]?.detalle_credito);
      console.log('🔑 Keys de solicitud[0]:', datosCompletos?.solicitudes?.[0] ? Object.keys(datosCompletos.solicitudes[0]) : []);
      console.log('🔑 Keys de detalle_credito:', datosCompletos?.solicitudes?.[0]?.detalle_credito ? Object.keys(datosCompletos.solicitudes[0].detalle_credito) : []);
      console.log('========================================');
      
      // IMPORTANTE: Buscar tipo_credito en TODAS las ubicaciones posibles
      let tipoCreditoEncontrado = null;
      
      // Buscar en orden de prioridad
      if (datosClonados?.solicitudes?.[0]?.detalle_credito?.tipo_credito) {
        tipoCreditoEncontrado = datosClonados.solicitudes[0].detalle_credito.tipo_credito;
        console.log('✅ tipo_credito encontrado en detalle_credito:', tipoCreditoEncontrado);
      } else if (datosClonados?.solicitudes?.[0]?.tipo_credito) {
        tipoCreditoEncontrado = datosClonados.solicitudes[0].tipo_credito;
        console.log('✅ tipo_credito encontrado en solicitud:', tipoCreditoEncontrado);
      } else if (datosClonados?.tipo_credito) {
        tipoCreditoEncontrado = datosClonados.tipo_credito;
        console.log('✅ tipo_credito encontrado en raíz:', tipoCreditoEncontrado);
      } else {
        // Buscar dentro de todos los campos de detalle_credito por si tiene otro nombre
        const detalle = datosClonados?.solicitudes?.[0]?.detalle_credito;
        if (detalle && typeof detalle === 'object') {
          const keys = Object.keys(detalle);
          console.log('🔍 Buscando tipo_credito en keys de detalle_credito:', keys);
          
          // Buscar variaciones del nombre
          const posiblesNombres = ['tipo_credito', 'tipo_de_credito', 'tipoCredito', 'tipo'];
          for (const nombre of posiblesNombres) {
            if (detalle[nombre]) {
              tipoCreditoEncontrado = detalle[nombre];
              console.log(`✅ tipo_credito encontrado como "${nombre}":`, tipoCreditoEncontrado);
              break;
            }
          }
        }
      }
      
      // Si encontramos el valor, propagarlo a TODAS las ubicaciones
      if (tipoCreditoEncontrado) {
        // Asegurar estructura de solicitudes
        if (!datosClonados.solicitudes) datosClonados.solicitudes = [{}];
        if (!datosClonados.solicitudes[0]) datosClonados.solicitudes[0] = {};
        if (!datosClonados.solicitudes[0].detalle_credito) {
          datosClonados.solicitudes[0].detalle_credito = {};
        }
        
        // Propagar a todas las ubicaciones
        datosClonados.solicitudes[0].tipo_credito = tipoCreditoEncontrado;
        datosClonados.solicitudes[0].detalle_credito.tipo_credito = tipoCreditoEncontrado;
        datosClonados.tipo_credito = tipoCreditoEncontrado;
        
        console.log('✅ tipo_credito propagado a TODAS las ubicaciones:', tipoCreditoEncontrado);
      } else {
        console.warn('⚠️ NO se encontró tipo_credito en ninguna ubicación');
      }
      
      setEditedData(datosClonados);
      const originalBank = (datosCompletos?.solicitudes?.[0] as any)?.banco_nombre || '';
      setOriginalBankValue(originalBank);
      
      // DEBUG: Verificar tipo_credito Y banco_nombre DESPUÉS de la propagación
      console.log('🔍 CustomerFormDinamicoEdit - Datos después de propagación:', {
        tipoCreditoDirecto: datosClonados?.tipo_credito,
        tipoCreditoEnSolicitud: datosClonados?.solicitudes?.[0]?.tipo_credito,
        tipoCreditoEnDetalle: datosClonados?.solicitudes?.[0]?.detalle_credito?.tipo_credito,
        valorFinal: tipoCreditoEncontrado,
        // DEBUG banco_nombre
        bancoNombreEnSolicitud: datosClonados?.solicitudes?.[0]?.banco_nombre,
        bancoNombreOriginal: originalBank,
        solicitudCompleta: datosClonados?.solicitudes?.[0]
      });
    }
  }, [datosCompletos]);

  // Obtener información del asesor al montar el componente
  React.useEffect(() => {
    const obtenerInformacionAsesor = async () => {
      try {
        const currentUser = await userService.getCurrentUserInfo();
        if (editedData) {
          const newData = JSON.parse(JSON.stringify(editedData));

          // Asegurar estructura de solicitudes
          if (!newData.solicitudes) newData.solicitudes = [{}];
          if (!newData.solicitudes[0]) newData.solicitudes[0] = {};

          // Solo añadir información del asesor si no existe
          if (!newData.solicitudes[0].nombre_asesor) {
            newData.solicitudes[0].nombre_asesor = currentUser.nombre;
          }
          if (!newData.solicitudes[0].correo_asesor) {
            newData.solicitudes[0].correo_asesor = currentUser.correo;
          }

          setEditedData(newData);
          console.log('🧑‍💼 Información del asesor cargada (Edit):', {
            nombre: currentUser.nombre,
            correo: currentUser.correo
          });
        }
      } catch (error) {
        console.error('Error obteniendo información del asesor:', error);
      }
    };

    if (editedData) {
      obtenerInformacionAsesor();
    }
  }, [editedData?.solicitante?.id]); // Solo ejecutar cuando editedData esté listo

  // Cargar/rellenar referencias desde el endpoint unificado al iniciar
  React.useEffect(() => {
    const cargarReferenciasIniciales = async () => {
      try {
        const solicitanteIdNumber = Number(solicitanteId);
        if (!solicitanteIdNumber) return;

        const empresaId = localStorage.getItem('empresa_id') || '1';
        const userId = localStorage.getItem('user_id') || localStorage.getItem('cedula') || undefined;
        const fetched = await referenciaService.getReferenciasPorSolicitante(solicitanteIdNumber, empresaId, userId);
        const cont: any = (fetched as any)?.data || fetched;
        const lista: any[] = cont?.detalle_referencia?.referencias || [];

        if (Array.isArray(lista) && lista.length > 0) {
          // Map auxiliar por id_tipo_referencia del contenedor superior
          const tipos = Array.isArray(cont?.tipo_referencia) ? cont.tipo_referencia : [];
          // Asegurar que cada referencia tenga tipo_referencia usando emparejamiento por índice
          const normalizadas = lista.map((r: any, idx: number) => {
            const tipoFromIndex = tipos?.[idx]?.tipo_referencia ?? null;
            return {
              ...r,
              // espejo para no perder el id durante ediciones
              id: r?.referencia_id ?? r?.id ?? 0,
              // preservar id_tipo_referencia proveniente del backend
              id_tipo_referencia: (typeof r?.id_tipo_referencia !== 'undefined') ? Number(r.id_tipo_referencia) : r?.tipo?.id_tipo_referencia,
              tipo_referencia: r?.tipo_referencia ?? tipoFromIndex ?? null,
            };
          });
          setEditedData((prev: any) => ({
            ...prev,
            referencias: normalizadas,
            tipo_referencia: cont?.tipo_referencia || prev?.tipo_referencia
          }));
        }
      } catch (e) {
        // Si 404 u otro error, no bloquear UI
        console.warn('No se pudieron cargar referencias iniciales', e);
      }
    };

    // Solo cargar si editedData ya está inicializado
    if (editedData) {
      cargarReferenciasIniciales();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solicitanteId, editedData?.solicitante?.id]); // Trigger when editedData is ready

  // 5) Utilidad para extraer tipo_credito consistente con CustomerDetails.tsx
  const getTipoCreditoValue = React.useCallback((data: any, fallback?: any) => {
    return (
      data?.solicitudes?.[0]?.detalle_credito?.tipo_credito ??
      data?.solicitudes?.[0]?.tipo_credito ??
      data?.tipo_credito ??
      fallback ??
      ''
    );
  }, []);

  // 6) Validación simple (puedes extender igual a CustomerDetails)
  const validateData = (data: any): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (data?.solicitante) {
      if (!data.solicitante.nombres?.trim()) errors['solicitante.nombres'] = 'El nombre es obligatorio';
      if (!data.solicitante.primer_apellido?.trim()) errors['solicitante.primer_apellido'] = 'El primer apellido es obligatorio';
      if (!data.solicitante.numero_documento?.trim()) errors['solicitante.numero_documento'] = 'El número de documento es obligatorio';
    }
    return errors;
  };

  // 7) Actualizar datos anidados (copiado y adaptado de CustomerDetails.tsx)
  const updateNestedData = (path: string, value: any) => {
    if (!editedData) return;
    const pathArray = path.split('.');
    const newData = JSON.parse(JSON.stringify(editedData));

    if (pathArray[0] === 'solicitante' && pathArray.length === 2) {
      const fieldName = pathArray[1];
      const infoExtraFields = ['telefono', 'celular', 'estado_civil', 'personas_a_cargo', 'nacionalidad'];
      if (infoExtraFields.includes(fieldName)) {
        if (!newData.solicitante.info_extra) newData.solicitante.info_extra = {};
        newData.solicitante.info_extra[fieldName] = value;
      } else {
        newData.solicitante[fieldName] = value;
      }
    } else {
      let current = newData;
      for (let i = 0; i < pathArray.length - 1; i++) {
        const currentKey = pathArray[i];
        const nextKey = pathArray[i + 1];
        if (!current[currentKey]) {
          if (!isNaN(parseInt(nextKey))) {
            current[currentKey] = [];
          } else {
            current[currentKey] = {};
          }
        }
        if (!isNaN(parseInt(currentKey))) {
          const index = parseInt(currentKey);
          while (current.length <= index) current.push({});
          current = current[index];
        } else {
          current = current[currentKey];
        }
      }
      const finalKey = pathArray[pathArray.length - 1];
      if (!isNaN(parseInt(finalKey))) {
        const index = parseInt(finalKey);
        while (current.length <= index) current.push({});
        current[index] = value;
      } else {
        current[finalKey] = value;
      }
    }

    setEditedData(newData);
    if (validationErrors[path]) {
      const newErrors = { ...validationErrors };
      delete newErrors[path];
      setValidationErrors(newErrors);
    }
  };

  // 8) Adaptador de onChange plano desde FormularioCompleto (que usa claves del esquema)
  // Encuentra un path para un key buscando en estructuras conocidas
  const findPathForKey = React.useCallback((data: any, key: string): string | null => {
    if (!data) return null;
    if (Object.prototype.hasOwnProperty.call(data, key)) return key;

    // solicitante e info_extra
    if (data.solicitante && Object.prototype.hasOwnProperty.call(data.solicitante, key)) return `solicitante.${key}`;
    if (data.solicitante?.info_extra && Object.prototype.hasOwnProperty.call(data.solicitante.info_extra, key)) return `solicitante.info_extra.${key}`;

    // ubicaciones[0] y detalle_direccion
    const u0 = data.ubicaciones?.[0];
    if (u0 && Object.prototype.hasOwnProperty.call(u0, key)) return `ubicaciones.0.${key}`;
    if (u0?.detalle_direccion && Object.prototype.hasOwnProperty.call(u0.detalle_direccion, key)) return `ubicaciones.0.detalle_direccion.${key}`;

    // actividad_economica y detalle
    if (data.actividad_economica && Object.prototype.hasOwnProperty.call(data.actividad_economica, key)) return `actividad_economica.${key}`;
    if (data.actividad_economica?.detalle_actividad && Object.prototype.hasOwnProperty.call(data.actividad_economica.detalle_actividad, key)) return `actividad_economica.detalle_actividad.${key}`;

    // informacion_financiera y detalle
    if (data.informacion_financiera && Object.prototype.hasOwnProperty.call(data.informacion_financiera, key)) return `informacion_financiera.${key}`;
    if (data.informacion_financiera?.detalle_financiera && Object.prototype.hasOwnProperty.call(data.informacion_financiera.detalle_financiera, key)) return `informacion_financiera.detalle_financiera.${key}`;

    // referencias[0] y detalle
    const r0 = data.referencias?.[0];
    if (r0 && Object.prototype.hasOwnProperty.call(r0, key)) return `referencias.0.${key}`;
    if (r0?.detalle_referencia && Object.prototype.hasOwnProperty.call(r0.detalle_referencia, key)) return `referencias.0.detalle_referencia.${key}`;

    // solicitudes[0], detalle_credito y sub-objetos
    const s0 = data.solicitudes?.[0];
    if (s0 && Object.prototype.hasOwnProperty.call(s0, key)) return `solicitudes.0.${key}`;
    const dc = s0?.detalle_credito;
    if (dc && Object.prototype.hasOwnProperty.call(dc, key)) return `solicitudes.0.detalle_credito.${key}`;
    if (dc && typeof dc === 'object') {
      for (const subKey of Object.keys(dc)) {
        const sub = dc[subKey];
        if (sub && typeof sub === 'object' && Object.prototype.hasOwnProperty.call(sub, key)) {
          return `solicitudes.0.detalle_credito.${subKey}.${key}`;
        }
      }
    }

    // Si no se encontró pero la clave parece ser un contenedor de detalle de crédito (p.ej., 'credito_vehicular'),
    // enrutarla explícitamente a solicitudes.0.detalle_credito.<key>
    const creditContainers = new Set([
      'detalle_credito',
      'credito_vehicular',
      'credito_hipotecario',
      'credito_libre_inversion',
      'credito_consumo',
    ]);
    if (creditContainers.has(key)) {
      return `solicitudes.0.detalle_credito.${key}`;
    }

    return null;
  }, []);

  // Mapeo de tipo de crédito a la clave de detalle
  const normalizeTipoCredito = (tipo: string) =>
    (tipo || '')
      .toLowerCase()
      // eliminar acentos/diacríticos
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_');
  const detailKeyForTipoCredito = (tipo: string) => {
    const t = normalizeTipoCredito(tipo);
    if (t.includes('vivienda') || t.includes('hipotecario')) return 'credito_hipotecario';
    if (t.includes('vehicular') || t.includes('vehiculo') || t.includes('auto') || t.includes('vehiculo')) return 'credito_vehicular';
    if (t.includes('libre')) return 'credito_libre_inversion';
    if (t.includes('consumo')) return 'credito_consumo';
    return 'detalle_generico';
  };

  // Función para obtener información del asesor y banquero
  const obtenerInformacionAsesorYBanquero = async (bancoNombre: string, ciudadSolicitud: string) => {
    try {
      // Obtener información del usuario logueado (asesor)
      const currentUser = await userService.getCurrentUserInfo();

      // Buscar banquero por criterios
      const banker = await userService.findBankerByCriteria(bancoNombre, ciudadSolicitud);

      // Actualizar formulario con la información obtenida
      if (!editedData) return;
      const newData = JSON.parse(JSON.stringify(editedData));

      // Asegurar estructura de solicitudes
      if (!newData.solicitudes) newData.solicitudes = [{}];
      if (!newData.solicitudes[0]) newData.solicitudes[0] = {};

      // Añadir campos de asesor y banquero
      newData.solicitudes[0].nombre_asesor = currentUser.nombre;
      newData.solicitudes[0].correo_asesor = currentUser.correo;
      newData.solicitudes[0].nombre_banco_usuario = banker?.nombre || '';
      newData.solicitudes[0].correo_banco_usuario = banker?.correo || '';

      setEditedData(newData);

      console.log('🏦 Información de asesor y banquero obtenida (Edit):', {
        asesor: {
          nombre: currentUser.nombre,
          correo: currentUser.correo
        },
        banquero: banker ? {
          nombre: banker.nombre,
          correo: banker.correo
        } : 'No encontrado'
      });

    } catch (error) {
      console.error('Error obteniendo información de asesor y banquero:', error);
      // En caso de error, solo obtener información del asesor
      try {
        const currentUser = await userService.getCurrentUserInfo();
        if (!editedData) return;
        const newData = JSON.parse(JSON.stringify(editedData));

        if (!newData.solicitudes) newData.solicitudes = [{}];
        if (!newData.solicitudes[0]) newData.solicitudes[0] = {};

        newData.solicitudes[0].nombre_asesor = currentUser.nombre;
        newData.solicitudes[0].correo_asesor = currentUser.correo;
        newData.solicitudes[0].nombre_banco_usuario = '';
        newData.solicitudes[0].correo_banco_usuario = '';

        setEditedData(newData);
      } catch (asesorError) {
        console.error('Error obteniendo información del asesor:', asesorError);
      }
    }
  };

  const handleFieldChange = (key: string, value: any) => {

    // Caso especial: cambio de tipo_credito
    if (key === 'tipo_credito') {
      if (!editedData) return;
      const newData = JSON.parse(JSON.stringify(editedData));
      // Asegurar estructura base
      if (!newData.solicitudes) newData.solicitudes = [{}];
      if (!newData.solicitudes[0]) newData.solicitudes[0] = {};
      if (!newData.solicitudes[0].detalle_credito) newData.solicitudes[0].detalle_credito = {};

      const tipoActual = newData.solicitudes[0].tipo_credito || newData.solicitudes[0].detalle_credito.tipo_credito;
      const targetKey = detailKeyForTipoCredito(String(value || ''));
      const dc = newData.solicitudes[0].detalle_credito;

      console.log('🔄 Cambio de tipo_credito:', {
        tipoAnterior: tipoActual,
        tipoNuevo: value,
        targetKey: targetKey,
        detalleCreditoActual: Object.keys(dc),
        objetosPreservados: Object.keys(dc).filter(k => k !== 'tipo_credito' && typeof dc[k] === 'object')
      });

      // Escribir el tipo en ambos lugares para compatibilidad con esquemas
      newData.solicitudes[0].tipo_credito = value;
      newData.solicitudes[0].detalle_credito.tipo_credito = value;

      // ✅ CRÍTICO: NO ELIMINAR NINGÚN OBJETO DE DETALLE DE CRÉDITO
      // Solo asegurar que el objeto del tipo objetivo existe
      // Esto permite cambiar entre tipos sin perder datos
      if (!dc[targetKey]) {
        dc[targetKey] = {};
        console.log(`✅ Creando objeto vacío para ${targetKey}`);
      } else {
        console.log(`✅ Preservando objeto existente de ${targetKey}:`, dc[targetKey]);
      }

      setEditedData(newData);
      return;
    }

    // Caso especial: objetos de detalle de crédito (p.ej., 'credito_vehicular') que llegan como objetos completos
    // desde CampoDinamico al editar subcampos. Asegurar que se escriban dentro de solicitudes.0.detalle_credito
    const creditContainers = new Set([
      'credito_vehicular',
      'credito_hipotecario',
      'credito_libre_inversion',
      'credito_consumo',
      'detalle_credito',
    ]);
    if (creditContainers.has(key)) {
      if (!editedData) return;
      const newData = JSON.parse(JSON.stringify(editedData));
      if (!newData.solicitudes) newData.solicitudes = [{}];
      if (!newData.solicitudes[0]) newData.solicitudes[0] = {};
      if (!newData.solicitudes[0].detalle_credito) newData.solicitudes[0].detalle_credito = {};
      newData.solicitudes[0].detalle_credito[key] = value;
      setEditedData(newData);
      return;
    }

    // Caso especial: cambio de tipo_actividad (puede llamarse tipo_actividad o tipo_actividad_economica)
    if (key === 'tipo_actividad' || key === 'tipo_actividad_economica') {
      if (!editedData) return;
      const newData = JSON.parse(JSON.stringify(editedData));

      // Asegurar estructura base de actividad económica
      if (!newData.actividad_economica) newData.actividad_economica = {};
      if (!newData.actividad_economica.detalle_actividad) newData.actividad_economica.detalle_actividad = {};

      // Escribir el tipo de actividad en ambos lugares para compatibilidad
      newData.actividad_economica.tipo_actividad = value;
      newData.actividad_economica.detalle_actividad.tipo_actividad_economica = value;


      // Usar el hook para limpiar campos condicionales dinámicamente
      // Buscar tanto 'tipo_actividad' como 'tipo_actividad_economica' en el esquema
      limpiarCamposCondicionalesGenerico(
        esquemas,
        'actividad_economica',
        'tipo_actividad_economica', // Usar el nombre real del campo
        value,
        newData,
        (campoKey, campoValue) => {
          // Actualizar el campo en la estructura anidada
          if (newData.actividad_economica?.detalle_actividad) {
            newData.actividad_economica.detalle_actividad[campoKey] = campoValue;
          }
        }
      );


      setEditedData(newData);
      return;
    }

    const path = findPathForKey(editedData, key) || key;
    updateNestedData(path, value);

    // Si cambia el banco o la ciudad, obtener información del banquero
    if (key === 'banco_nombre' || key === 'ciudad_solicitud') {
      // Obtener valores actuales considerando el cambio
      let bancoNombre = '';
      let ciudadSolicitud = '';

      if (key === 'banco_nombre') {
        bancoNombre = value;
        ciudadSolicitud = editedData?.solicitudes?.[0]?.ciudad_solicitud || '';
      } else if (key === 'ciudad_solicitud') {
        bancoNombre = editedData?.solicitudes?.[0]?.banco_nombre || '';
        ciudadSolicitud = value;
      }

      // Solo ejecutar si ambos campos tienen valor
      if (bancoNombre && ciudadSolicitud) {
        obtenerInformacionAsesorYBanquero(bancoNombre, ciudadSolicitud);
      }
    }
  };

  // 9) Preparar requestData igual que en CustomerDetails.handleSave()
  const buildRequestData = (data: any) => {
    const requestData: any = {};

    if (data?.solicitante) {
      requestData.solicitante = {
        nombres: data.solicitante.nombres,
        primer_apellido: data.solicitante.primer_apellido,
        segundo_apellido: data.solicitante.segundo_apellido,
        correo: data.solicitante.correo,
        numero_documento: data.solicitante.numero_documento,
        tipo_identificacion: data.solicitante.tipo_identificacion,
        fecha_nacimiento: data.solicitante.fecha_nacimiento,
        genero: data.solicitante.genero,
      };
      if (data.solicitante.info_extra) {
        requestData.solicitante.info_extra = data.solicitante.info_extra;
      }
    }

    if (data?.ubicaciones && data.ubicaciones.length > 0) {
      requestData.ubicaciones = data.ubicaciones.map((ubicacion: any) => {
        const ubicacionData: any = {
          ciudad_residencia: ubicacion.ciudad_residencia,
          departamento_residencia: ubicacion.departamento_residencia,
        };
        if (ubicacion.detalle_direccion) {
          ubicacionData.detalle_direccion = ubicacion.detalle_direccion;
        }
        return ubicacionData;
      });
    }

    if (data?.actividad_economica) {
      requestData.actividad_economica = {};
      if (data.actividad_economica.detalle_actividad) {
        requestData.actividad_economica.detalle_actividad = data.actividad_economica.detalle_actividad;
      }
    }

    if (data?.informacion_financiera) {
      requestData.informacion_financiera = {
        total_ingresos_mensuales: data.informacion_financiera.total_ingresos_mensuales,
        total_egresos_mensuales: data.informacion_financiera.total_egresos_mensuales,
        total_activos: data.informacion_financiera.total_activos,
        total_pasivos: data.informacion_financiera.total_pasivos,
      };
      if (data.informacion_financiera.detalle_financiera) {
        requestData.informacion_financiera.detalle_financiera = data.informacion_financiera.detalle_financiera;
      }
    }

    // Importante: referencias serán gestionadas por endpoints dedicados (add/update/delete)
    // Por eso NO se incluyen en el payload principal de edición.

    if (data?.solicitudes && data.solicitudes.length > 0) {
      requestData.solicitudes = data.solicitudes.map((solicitud: any) => {
        const solicitudData: any = {
          estado: solicitud.estado,
          banco_nombre: solicitud.banco_nombre,
          ciudad_solicitud: solicitud.ciudad_solicitud,
          observaciones_historial: solicitud.observaciones_historial || [],
          // Campos de asesor y banquero
          nombre_asesor: solicitud.nombre_asesor,
          correo_asesor: solicitud.correo_asesor,
          nombre_banco_usuario: solicitud.nombre_banco_usuario,
          correo_banco_usuario: solicitud.correo_banco_usuario,
        };

        // 🔧 Procesar tipo_credito como campo fijo (normalizar nombre)
        const tipoCreditoValue = solicitud.tipo_credito || solicitud.tipo_de_credito || solicitud.detalle_credito?.tipo_credito;
        if (tipoCreditoValue) {
          solicitudData.tipo_credito = tipoCreditoValue;
        }
        
        // 🔧 IMPORTANTE: NO incluir tipo_de_credito (debe ser tipo_credito)
        // Si existe tipo_de_credito, ya lo convertimos a tipo_credito arriba

        // 🔧 Procesar detalle_credito y objetos anidados de crédito
        if (solicitud.detalle_credito && typeof solicitud.detalle_credito === 'object') {
          // Crear objeto detalle_credito limpio
          const detalleCredito: any = {};

          // Copiar todos los campos del detalle_credito (excepto tipo_de_credito)
          Object.keys(solicitud.detalle_credito).forEach((key) => {
            // Saltar tipo_de_credito (debe ser tipo_credito como campo fijo)
            if (key === 'tipo_de_credito') {
              return;
            }
            const valor = solicitud.detalle_credito[key];
            // ✅ Preservar todos los valores excepto undefined
            if (valor !== undefined) {
              detalleCredito[key] = valor;
            }
          });

          // Buscar objetos de crédito específicos (credito_vehicular, credito_hipotecario, etc.)
          // MANTENER la estructura anidada, NO aplanar los campos
          // ✅ CRÍTICO: Preservar TODOS los objetos de crédito, incluso si están vacíos o tienen valores en 0
          const creditoKeys = ['credito_vehicular', 'credito_hipotecario', 'credito_libre_inversion', 'credito_consumo'];
          creditoKeys.forEach(creditoKey => {
            if (solicitud.detalle_credito[creditoKey] && typeof solicitud.detalle_credito[creditoKey] === 'object') {
              // Mantener el objeto anidado completo CON TODOS SUS VALORES
              const creditoObjeto: any = {};
              Object.keys(solicitud.detalle_credito[creditoKey]).forEach(subKey => {
                const subValor = solicitud.detalle_credito[creditoKey][subKey];
                // ✅ Incluir TODOS los valores, incluso vacíos, null, 0, etc.
                // Solo excluir undefined para evitar campos no definidos
                if (subValor !== undefined) {
                  creditoObjeto[subKey] = subValor;
                }
              });
              
              // ✅ Agregar el objeto SIEMPRE, incluso si está vacío
              // Esto preserva la estructura para todos los tipos de crédito
              detalleCredito[creditoKey] = creditoObjeto;
            }
          });

          // Solo agregar detalle_credito si tiene contenido
          if (Object.keys(detalleCredito).length > 0) {
            solicitudData.detalle_credito = detalleCredito;
          }
        }

        return solicitudData;
      });
    }

    return requestData;
  };

  // 10) Guardar
  // Utilidad para comparar objetos simples/deep
  const deepEqual = (a: any, b: any): boolean => {
    try {
      return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    if (!editedData) return;
    const errors = validateData(editedData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error('Por favor corrige los errores antes de continuar');
      return;
    }

    setLoadingSave(true);
    try {
      const solicitanteIdNumber = Number(solicitanteId);
      if (!solicitanteIdNumber) throw new Error('ID del solicitante no encontrado');

      const empresaId = localStorage.getItem('empresa_id') || '1';
      const userId = localStorage.getItem('user_id') || localStorage.getItem('cedula') || '123';

      const requestData = buildRequestData(editedData);
        // Asegurar que no mandemos referencias en el PATCH principal
        if (requestData.referencias) delete requestData.referencias;

      // 🏦 LOG ESPECÍFICO PARA CAMPOS DE ASESOR Y BANQUERO EN EDICIÓN
      console.log('\n🏦 === CAMPOS DE ASESOR Y BANQUERO (EDICIÓN) ===');
      console.log('📋 Campos que se enviarán en el JSON/form a la API:');
      const solicitudData = requestData.solicitudes?.[0];
      if (solicitudData) {
        console.log('  🧑‍💼 nombre_asesor:', solicitudData.nombre_asesor || '(NO DEFINIDO)');
        console.log('  📧 correo_asesor:', solicitudData.correo_asesor || '(NO DEFINIDO)');
        console.log('  🏦 nombre_banco_usuario:', solicitudData.nombre_banco_usuario || '(NO DEFINIDO)');
        console.log('  📧 correo_banco_usuario:', solicitudData.correo_banco_usuario || '(NO DEFINIDO)');
      } else {
        console.log('  ⚠️ No se encontró solicitud en requestData');
      }
      console.log('🔍 Estos campos se incluyen automáticamente en el payload de edición que se envía a la API');
      console.log('='.repeat(80));


        const endpoint = API_CONFIG.ENDPOINTS.EDITAR_REGISTRO_COMPLETO.replace('{id}', solicitanteIdNumber.toString());
        const url = buildApiUrl(endpoint);

      // 1) Diff de referencias y llamadas a endpoints dedicados
      const originalRefs: any[] = Array.isArray(datosCompletos?.referencias) ? datosCompletos!.referencias : [];
      const currentRefs: any[] = Array.isArray(editedData?.referencias) ? editedData!.referencias : [];

      const getRefId = (r: any): number | null => {
        const candidate = r?.referencia_id ?? r?.id ?? r?.id_referencia ?? r?.ref_id;
        const n = Number(candidate);
        // Importante: en backend puede existir referencia_id = 0. Tratar 0 como válido.
        return Number.isFinite(n) && n >= 0 ? n : null;
      };
      const flattenRef = (r: any): any => {
        const flat: any = {};
        if (r && typeof r === 'object') {
          // Copiar campos de primer nivel excepto objetos grandes
          Object.keys(r).forEach((k) => {
            if (k !== 'detalle_referencia' && k !== 'id' && k !== 'referencia_id' && k !== 'tipo' && k !== 'tipo_referencia' && k !== 'id_tipo_referencia') {
              flat[k] = r[k];
            }
          });
          if (r.detalle_referencia && typeof r.detalle_referencia === 'object') {
            // Excluir también de detalle posibles nombres de tipo
            const detalle = { ...r.detalle_referencia };
            delete (detalle as any).tipo;
            delete (detalle as any).tipo_referencia;
            delete (detalle as any).id_tipo_referencia;
            Object.assign(flat, detalle);
          }
        }
        return flat;
      };

      const originalById = new Map<number, any>();
      for (const r of originalRefs) {
        const id = getRefId(r);
        if (id !== null) originalById.set(id, r);
      }

      const toAdd: any[] = [];
      const toUpdate: Array<{ id: number; data: any }> = [];
      const seenIds = new Set<number>();

      // (Eliminado) Lógica antigua de id_tipo_referencia ya no es necesaria con contratos simplificados.

      for (const r of currentRefs) {
        const currentId = getRefId(r);
        if (currentId == null) {
          // nuevo
          const addObj = {
            tipo_referencia: r.tipo_referencia || (r?.tipo?.tipo_referencia || r?.tipo?.nombre) || 'personal',
            detalle_referencia: { ...(r.detalle_referencia || {}) },
          };
          // console.debug('[CustomerFormDinamicoEdit] toAdd item:', addObj);
          toAdd.push(addObj);
        } else {
          const id = currentId;
          seenIds.add(id);
          const prev = originalById.get(id);
          const changedTipo = (r?.tipo_referencia || 'personal') !== (prev?.tipo_referencia || 'personal');
          const flatCurr = flattenRef(r);
          const flatPrev = flattenRef(prev);
          const changedDetalle = !deepEqual(flatCurr, flatPrev);
          if (changedTipo || changedDetalle) {
            const updateData: any = {};
            // Enviar solo tipo_referencia (si cambió) y campos de detalle aplanados
            if (changedTipo && r?.tipo_referencia !== undefined) {
              updateData.tipo_referencia = r.tipo_referencia || 'personal';
            }
            if (changedDetalle) Object.assign(updateData, flatCurr);
            // console.debug('[CustomerFormDinamicoEdit] toUpdate item:', { id, updateData });
            toUpdate.push({ id, data: updateData });
          }
        }
      }

      // Importante: no hacer borrados por diff. Las eliminaciones solo se ejecutan al dar clic en el ícono de basura.

      // Ejecutar operaciones de referencias secuencialmente para control de errores
      // console.debug('[CustomerFormDinamicoEdit] toAdd count:', toAdd.length, 'toUpdate count:', toUpdate.length);
      for (const ref of toAdd) {
        const addPayload: any = {
          tipo_referencia: ref.tipo_referencia || 'personal',
          detalle_referencia: { ...(ref.detalle_referencia || {}) },
        };
        // console.debug('[CustomerFormDinamicoEdit] addReferencia payload:', addPayload);
        await referenciaService.addReferencia(solicitanteIdNumber, addPayload, empresaId, userId);
      }
      // Verificar existencia de referencias a actualizar para evitar 404
      let existingIds = new Set<number>();
      try {
        const verify = await referenciaService.getReferenciasPorSolicitante(solicitanteIdNumber, empresaId, userId);
        const contV: any = (verify as any)?.data || verify;
        const listaV: any[] = contV?.detalle_referencia?.referencias || [];
        existingIds = new Set(
          listaV
            .map((r: any) => Number(r?.referencia_id ?? r?.id))
            .filter((n: any) => Number.isFinite(n) && n >= 0)
        );
        // console.debug('[CustomerFormDinamicoEdit] existing reference IDs from backend:', Array.from(existingIds));
      } catch {}

      for (const upd of toUpdate) {
        if (!existingIds.has(Number(upd.id))) {
          toast.error(`La referencia ${String(upd.id)} no existe en el contenedor. Refresca e inténtalo de nuevo.`);
          continue;
        }
        // console.debug('[CustomerFormDinamicoEdit] updateReferencia call:', { solicitanteIdNumber, referencia_id: upd.id, updates: upd.data });
        // // Log explícito del body que enviaremos al backend
        // const updateBodyPreview: any = {
        //   solicitante_id: solicitanteIdNumber,
        //   referencia_id: upd.id,
        //   updates: { ...upd.data },
        // };
        // try {
        //   console.log('[PAYLOAD][REFERENCIAS_UPDATE] =>', JSON.stringify(updateBodyPreview));
        // } catch {}
        await referenciaService.updateReferencia(solicitanteIdNumber, upd.id, upd.data, empresaId, userId);
      }
      // No se ejecutan eliminaciones aquí.

      // 2) PATCH principal sin referencias
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Empresa-Id': empresaId,
          'X-User-Id': userId,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      // Refrescar datos
      await refetch();

      // Notificaciones por cambio de banco
      const currentBankValue = editedData?.solicitudes?.[0]?.banco_nombre || '';
      const bankHasChanged = originalBankValue && currentBankValue && originalBankValue !== currentBankValue;
      if (bankHasChanged) {
        try {
          const userData = localStorage.getItem('user');
          let userName = 'Usuario';
          if (userData) {
            const userObj = JSON.parse(userData);
            userName = userObj.nombre || userObj.nombres || 'Usuario';
          }
          const emailData = {
            customerName: (editedData?.solicitante?.nombres || '') + ' ' + (editedData?.solicitante?.primer_apellido || ''),
            customerDocument: editedData?.solicitante?.numero_documento || '',
            previousBank: originalBankValue,
            newBank: currentBankValue,
            solicitudId: solicitanteIdNumber,
            changedBy: userName,
            changeDate: new Date().toISOString(),
          };
          await emailService.sendBankChangeNotification(emailData, parseInt(empresaId));
          await emailService.createBankChangeNotification(emailData, parseInt(empresaId));
        } catch (e) {
          // No bloquear el flujo por errores de notificación
          console.error('Error enviando notificaciones de cambio de banco', e);
        }
      }

      toast.success(bankHasChanged ? 'Registro actualizado y notificación enviada' : 'Registro actualizado correctamente');
      if (onSaved) onSaved();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Error al guardar');
    } finally {
      setLoadingSave(false);
    }
  };

  // 10.b) Eliminar registro (usa el id de la solicitud como en CustomerDetails)
  const handleDelete = async () => {
    try {
      const empresaId = localStorage.getItem('empresa_id') || '1';
      const solicitudId = editedData?.solicitudes?.[0]?.id || datosCompletos?.solicitudes?.[0]?.id;
      if (!solicitudId) {
        toast.error('ID de la solicitud no encontrado');
        return;
      }
      const confirmDelete = window.confirm('¿Estás seguro de eliminar este registro? Esta acción no se puede deshacer.');
      if (!confirmDelete) return;

      const resp = await fetch(buildApiUrl(`/solicitudes/${solicitudId}?empresa_id=${empresaId}`), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!resp.ok) throw new Error('Error al eliminar el registro');
      toast.success('Registro eliminado');
      // Cerrar modal y notificar arriba para refrescar
      if (onSaved) onSaved();
      if (onCancel) onCancel();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'No se pudo eliminar');
    }
  };

  // 11) Construir valores planos para FormularioCompleto: usamos editedData directamente y claves de esquema como paths
  const valores = React.useMemo(() => {
    // En este enfoque, los keys de esquema deben coincidir con keys/paths de editedData para updateNestedData.
    // Si necesitas un mapeo más complejo, aquí es el lugar para transformarlo.
    console.log('🔍 CustomerFormDinamicoEdit - useMemo valores actualizado:', {
      tipoCreditoDirecto: editedData?.tipo_credito,
      tipoCreditoEnSolicitud: editedData?.solicitudes?.[0]?.tipo_credito,
      tipoCreditoEnDetalle: editedData?.solicitudes?.[0]?.detalle_credito?.tipo_credito,
      // DEBUG banco_nombre
      bancoNombreEnSolicitud: editedData?.solicitudes?.[0]?.banco_nombre,
      ciudadSolicitud: editedData?.solicitudes?.[0]?.ciudad_solicitud,
      estadoSolicitud: editedData?.solicitudes?.[0]?.estado,
      solicitudKeys: editedData?.solicitudes?.[0] ? Object.keys(editedData.solicitudes[0]) : [],
      detalleCreditoKeys: editedData?.solicitudes?.[0]?.detalle_credito ? Object.keys(editedData.solicitudes[0].detalle_credito) : [],
      detalleCreditoCompleto: editedData?.solicitudes?.[0]?.detalle_credito
    });
    return editedData || {};
  }, [editedData]);

  const esquemasCompletos = ['solicitante', 'ubicacion', 'actividad_economica', 'informacion_financiera', 'referencia', 'solicitud']
    .every(entidad => esquemas[entidad]?.esquema && (esquemas[entidad]?.esquema?.campos_fijos || esquemas[entidad]?.esquema?.campos_dinamicos));

  if (loadingCompletos || esquemasLoading || loadingEstados) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2">
          {loadingEstados ? 'Cargando estados disponibles...' : 'Cargando formulario de edición...'}
        </span>
      </div>
    );
  }

  if (errorCompletos) {
    return <div className="text-red-600">Error al cargar datos: {String(errorCompletos)}</div>;
  }

  if (esquemasError) {
    return <div className="text-red-600">Error al cargar esquemas: {String(esquemasError)}</div>;
  }

  if (!editedData || !esquemasCompletos) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2">Preparando datos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen superior con datos precargados (sin fondo azul) */}
      <div className="relative overflow-hidden rounded-xl border bg-white">
        <div className="relative p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar con iniciales */}
            <div className="h-12 w-12 rounded-full bg-gray-700 text-white flex items-center justify-center text-lg font-semibold shadow-md border-2 border-gray-300">
              {(editedData?.solicitante?.nombres?.[0] || 'U')}
            </div>
            <div>
              <div className="text-base font-semibold text-gray-900">
                {(editedData?.solicitante?.nombres || '') + ' ' + (editedData?.solicitante?.primer_apellido || '')}
              </div>
              <div className="text-sm text-gray-600 flex flex-wrap items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                  <span className="text-xs font-medium">Documento:</span>
                  <span className="font-semibold">{editedData?.solicitante?.numero_documento || '—'}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">
                  <span className="text-xs font-medium">Banco:</span>
                  <span className="font-semibold">{editedData?.solicitudes?.[0]?.banco_nombre || '—'}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">
                  <span className="text-xs font-medium">Tipo crédito:</span>
                  <span className="font-semibold">{getTipoCreditoValue(editedData) || '—'}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secciones igual que en CustomerFormDinamico */}
      {esquemas.solicitante?.esquema && (
        <FormularioCompleto
          esquemaCompleto={esquemas.solicitante.esquema}
          valores={valores}
          onChange={handleFieldChange}
          errores={validationErrors}
          titulo="Información del Solicitante"
          estadosDisponibles={estados}
        />
      )}

      {esquemas.ubicacion?.esquema && (
        <FormularioCompleto
          esquemaCompleto={esquemas.ubicacion.esquema}
          valores={valores}
          onChange={handleFieldChange}
          errores={validationErrors}
          titulo="Información de Ubicación"
          estadosDisponibles={estados}
        />
      )}

      {esquemas.actividad_economica?.esquema && (
        <FormularioCompleto
          esquemaCompleto={esquemas.actividad_economica.esquema}
          valores={valores}
          onChange={handleFieldChange}
          errores={validationErrors}
          titulo="Información Laboral"
          estadosDisponibles={estados}
        />
      )}

      {esquemas.informacion_financiera?.esquema && (
        <FormularioCompleto
          esquemaCompleto={esquemas.informacion_financiera.esquema}
          valores={valores}
          onChange={handleFieldChange}
          errores={validationErrors}
          titulo="Información Financiera"
          estadosDisponibles={estados}
        />
      )}

      {esquemas.referencia?.esquema && (
        <div className="space-y-3 p-4 bg-white rounded-xl border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Información de Referencias</h3>
            <button
              type="button"
              onClick={() => {
                setEditedData((prev: any) => ({
                  ...prev,
                  referencias: [
                    ...(prev?.referencias || []),
                    // Sin defaults para evitar creación implícita
                    { tipo_referencia: '', detalle_referencia: {} }
                  ]
                }));
              }}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              + Añadir Referencia
            </button>
          </div>

          {(!editedData?.referencias || editedData.referencias.length === 0) ? (
            <div className="text-sm text-gray-500 italic">No hay referencias registradas</div>
          ) : (
            <div className="space-y-4">
              {editedData.referencias.map((referencia: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 relative group">
                  <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={async () => {
                        const refId = (() => {
                          const c = (referencia as any)?.referencia_id ?? (referencia as any)?.id ?? null;
                          const n = Number(c);
                          return Number.isFinite(n) && n >= 0 ? n : null;
                        })();
                        if (refId == null) return;
                        try {
                          const empresaId = localStorage.getItem('empresa_id') || '1';
                          const userId = localStorage.getItem('user_id') || localStorage.getItem('cedula') || undefined;
                          // Contrato simplificado: solo { solicitante_id, referencia_id }
                          const deleteBodyPreview: any = {
                            solicitante_id: Number(solicitanteId),
                            referencia_id: refId,
                          };
                          try {
                            console.log('[PAYLOAD][REFERENCIAS_DELETE] =>', JSON.stringify(deleteBodyPreview));
                          } catch {}
                          await referenciaService.deleteReferencia(Number(solicitanteId), refId, empresaId, userId);

                          // Refrescar desde backend para asegurar consistencia
                          const fetched = await referenciaService.getReferenciasPorSolicitante(Number(solicitanteId), empresaId, userId);
                          const cont = (fetched as any)?.data || fetched;
                          const nuevas = cont?.detalle_referencia?.referencias || [];
                          // console.debug('[CustomerFormDinamicoEdit] post-delete refresh, referencias:', nuevas);
                          setEditedData((prev: any) => ({ ...prev, referencias: Array.isArray(nuevas) ? nuevas : [] }));
                          toast.success('Referencia eliminada');
                        } catch (e: any) {
                          console.error(e);
                          toast.error(e?.message || 'No se pudo eliminar la referencia');
                        } finally {
                          setDeletingRefIds((prev) => {
                            const next = new Set(prev);
                            next.delete(refId);
                            return next;
                          });
                        }
                      }}
                      className="p-1 text-red-500 hover:text-red-700 disabled:opacity-50"
                      disabled={(() => {
                        const c = (referencia as any)?.referencia_id ?? (referencia as any)?.id ?? null;
                        const n = Number(c);
                        const idOk = Number.isFinite(n) && n >= 0 ? n : -1;
                        return deletingRefIds.has(idOk);
                      })()}
                      title="Eliminar referencia"
                    >
                      {(() => {
                        const c = (referencia as any)?.referencia_id ?? (referencia as any)?.id ?? null;
                        const n = Number(c);
                        const idOk = Number.isFinite(n) && n >= 0 ? n : -1;
                        const loading = deletingRefIds.has(idOk);
                        return loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />;
                      })()}
                    </button>
                  </div>

                  <FormularioCompleto
                    key={index}
                    esquemaCompleto={esquemas.referencia!.esquema as any}
                    valores={{
                      ...referencia,
                      ...(referencia?.detalle_referencia || {}),
                      // Forzar que los campos de nivel superior prevalezcan sobre posibles claves en detalle
                      tipo_referencia:
                        referencia?.tipo_referencia ??
                        referencia?.tipo ??
                        // Fallback: intentar a partir del arreglo editedData.tipo_referencia
                        (() => {
                          try {
                            const tipos = (editedData as any)?.tipo_referencia as any[];
                            const idt = Number(referencia?.id_tipo_referencia ?? referencia?.tipo?.id_tipo_referencia);
                            if (Array.isArray(tipos) && Number.isFinite(idt)) {
                              const found = tipos.find((t: any) => Number(t?.id_tipo_referencia) === idt);
                              return found?.tipo_referencia || '';
                            }
                          } catch {}
                          return '';
                        })(),
                      id_tipo_referencia: referencia?.id_tipo_referencia ?? referencia?.tipo?.id_tipo_referencia ?? undefined,
                      // Compatibilidad: si el esquema usa 'tipo' en vez de 'tipo_referencia'
                      ...(referencia?.tipo_referencia && referencia?.tipo == null ? { tipo: referencia.tipo_referencia } : {}),
                    }}
                    onChange={(key: string, value: any) => {
                      setEditedData((prev: any) => {
                        const newReferencias = [...(prev.referencias || [])];
                        const updatedRef = { ...newReferencias[index] };
                        // Si cambia el tipo (soporte para 'tipo' o 'tipo_referencia') y viene con id, persistir ambos
                        if (key === 'tipo_referencia' || key === 'tipo') {
                          if (value && typeof value === 'object') {
                            if (value.id_tipo_referencia !== undefined) {
                              (updatedRef as any).id_tipo_referencia = value.id_tipo_referencia;
                            }
                            if (value.tipo_referencia || value.nombre) {
                              (updatedRef as any).tipo_referencia = value.tipo_referencia || value.nombre;
                              (updatedRef as any).tipo = value.tipo_referencia || value.nombre;
                            } else if (typeof value.value === 'string') {
                              (updatedRef as any).tipo_referencia = value.value;
                              (updatedRef as any).tipo = value.value;
                            }
                          } else if (typeof value === 'string') {
                            (updatedRef as any).tipo_referencia = value;
                            (updatedRef as any).tipo = value;
                            // No forzamos id_tipo_referencia: el backend no lo requiere para contratos simplificados
                          }
                        } else {
                          // Para todas las demás claves de referencia, escribir siempre dentro de detalle_referencia
                          updatedRef.detalle_referencia = {
                            ...(updatedRef.detalle_referencia || {}),
                            [key]: value,
                          };
                        }
                        newReferencias[index] = updatedRef;
                        return { ...prev, referencias: newReferencias };
                      });
                    }}
                    errores={validationErrors}
                    titulo={`Referencia ${index + 1}`}
                    estadosDisponibles={estados}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {esquemas.solicitud?.esquema && (
        <>
          {/* DEBUG: Verificar campos del esquema de solicitud */}
          {(() => {
            console.log('🔍 === ESQUEMA DE SOLICITUD ===');
            console.log('Campos fijos:', esquemas.solicitud.esquema.campos_fijos?.map(c => ({ key: c.key, description: c.description, type: c.type })));
            console.log('Campos dinámicos:', esquemas.solicitud.esquema.campos_dinamicos?.map(c => ({ key: c.key, description: c.description, type: c.type, list_values: c.list_values })));
            console.log('¿Tiene tipo_credito en fijos?', esquemas.solicitud.esquema.campos_fijos?.find(c => c.key === 'tipo_credito'));
            console.log('¿Tiene tipo_credito en dinámicos?', esquemas.solicitud.esquema.campos_dinamicos?.find(c => c.key === 'tipo_credito'));
            return null;
          })()}
          <FormularioCompleto
            esquemaCompleto={esquemas.solicitud.esquema}
            valores={valores}
            onChange={handleFieldChange}
            errores={validationErrors}
            titulo="Información del Crédito"
            estadosDisponibles={estados}
          />
        </>
      )}

      {/* Archivos adjuntos */}
      <div className="space-y-3 p-4 bg-white rounded-xl border">
        <h3 className="text-lg font-medium text-gray-900">Archivos</h3>
        <EditFilesSection solicitanteId={solicitanteId} />
      </div>

      {/* Observaciones */}
      <div className="p-4 bg-white rounded-xl border">
        {(() => {
          const empresaIdNumber = parseInt(localStorage.getItem('empresa_id') || '1', 10);
          const solicitudIdNumber = Number(editedData?.solicitudes?.[0]?.id || datosCompletos?.solicitudes?.[0]?.id || 0);

          // console.log('🔍 Debug CustomerFormDinamicoEdit - Observaciones:', {
          //   empresaIdNumber,
          //   solicitudIdNumber,
          //   editedDataSolicitudes: editedData?.solicitudes,
          //   datosCompletosSolicitudes: datosCompletos?.solicitudes,
          //   editedDataSolicitudId: editedData?.solicitudes?.[0]?.id,
          //   datosCompletosSolicitudId: datosCompletos?.solicitudes?.[0]?.id
          // });

          if (solicitudIdNumber > 0 && empresaIdNumber > 0) {
            return (
              <ObservacionesSolicitud
                solicitudId={solicitudIdNumber}
                empresaId={empresaIdNumber}
                onObservacionAgregada={(observacion) => {
                  // Actualizar el estado local con la nueva observación
                  if (editedData?.solicitudes?.[0]) {
                    const newData = JSON.parse(JSON.stringify(editedData));
                    if (!newData.solicitudes[0].observaciones) {
                      newData.solicitudes[0].observaciones = [];
                    }
                    newData.solicitudes[0].observaciones.push(observacion);
                    setEditedData(newData);
                  }
                }}
              />
            );
          }
          return (
            <div className="text-sm text-gray-500">
              No hay solicitud asociada aún para mostrar observaciones.
              <br />
              Debug: solicitudId={solicitudIdNumber}, empresaId={empresaIdNumber}
            </div>
          );
        })()}
      </div>

      {/* Notificaciones */}
      <div className="space-y-3 p-4 bg-white rounded-xl border">
        <h3 className="text-lg font-medium text-gray-900">Notificaciones</h3>
        <NotificacionesSection data={editedData} onChange={(path, v) => updateNestedData(path, v)} />
      </div>

      {/* Historial de Notificaciones */}
      <div className="p-4 bg-white rounded-xl border">
        {(() => {
          const empresaIdNumber = parseInt(localStorage.getItem('empresa_id') || '1', 10);
          const solicitudIdNumber = Number(editedData?.solicitudes?.[0]?.id || datosCompletos?.solicitudes?.[0]?.id || 0);
          if (solicitudIdNumber > 0 && empresaIdNumber > 0) {
            return <NotificationHistory solicitudId={solicitudIdNumber} empresaId={empresaIdNumber} />;
          }
          return (
            <div className="text-sm text-gray-500">No hay solicitud asociada aún para mostrar notificaciones.</div>
          );
        })()}
      </div>

      {/* Barra de acciones sticky (para pantallas pequeñas o cuando se hace scroll) */}
      <div className="sticky bottom-0 inset-x-0 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-t px-4 py-3 flex sm:hidden items-center justify-end gap-2 rounded-b-xl">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 w-1/2"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 w-1/2"
          disabled={loadingSave}
        >
          {loadingSave ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      {/* Barra de acciones para pantallas medianas/grandes */}
      <div className="hidden sm:flex justify-end gap-2 px-4 py-4 bg-white rounded-b-xl border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
        >
          Eliminar
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          disabled={loadingSave}
        >
          {loadingSave ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  );
};

// Sección de archivos con listado, abrir, reemplazar y eliminar, similar a CustomerDetails
const EditFilesSection: React.FC<{ solicitanteId: number }> = ({ solicitanteId }) => {
  const [documents, setDocuments] = React.useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = React.useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [replacingDocId, setReplacingDocId] = React.useState<number | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const refreshDocuments = React.useCallback(async () => {
    try {
      setLoadingDocs(true);
      const docs = await documentService.getDocuments(solicitanteId);
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch (e) {
      console.error('Error cargando documentos', e);
      setDocuments([]);
    } finally {
      setLoadingDocs(false);
    }
  }, [solicitanteId]);

  React.useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  const triggerPick = () => inputRef.current?.click();

  const handleDelete = async (id: number) => {
    try {
      await documentService.deleteDocument(id);
      toast.success('Documento eliminado');
      refreshDocuments();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'No se pudo eliminar');
    }
  };

  const onSelect: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    if (replacingDocId) {
      // Reemplazar: sube nuevo y elimina el anterior
      try {
        setUploading(true);
        await documentService.uploadMultipleDocuments([files[0]], solicitanteId);
        await documentService.deleteDocument(replacingDocId);
        toast.success('Archivo reemplazado');
        setReplacingDocId(null);
        await refreshDocuments();
      } catch (e: any) {
        console.error(e);
        toast.error(e?.message || 'No se pudo reemplazar');
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = '';
      }
    } else {
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const removeNewAt = (i: number) => setSelectedFiles((prev) => prev.filter((_, idx) => idx !== i));

  const onUpload = async () => {
    if (selectedFiles.length === 0) return;
    try {
      setUploading(true);
      await documentService.uploadMultipleDocuments(selectedFiles, solicitanteId);
      toast.success(`${selectedFiles.length} archivo(s) subido(s)`);
      setSelectedFiles([]);
      await refreshDocuments();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Error al subir archivos');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input ref={inputRef} type="file" className="hidden" multiple onChange={onSelect} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />

      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-600">
          {documents.length} archivo(s){selectedFiles.length > 0 ? ` · ${selectedFiles.length} nuevo(s)` : ''}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={triggerPick} className="inline-flex items-center px-3 py-2 border rounded-lg text-sm bg-white hover:bg-gray-50">
            <Upload className="w-4 h-4 mr-2" /> Agregar archivos
          </button>
          <button
            type="button"
            onClick={onUpload}
            disabled={selectedFiles.length === 0 || uploading}
            className="inline-flex items-center px-3 py-2 rounded-lg text-sm bg-blue-600 text-white disabled:opacity-60"
          >
            {uploading ? 'Subiendo...' : 'Subir'}
          </button>
        </div>
      </div>

      {loadingDocs && (
        <div className="flex items-center text-gray-600 mb-3">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          <span className="text-sm">Cargando documentos...</span>
        </div>
      )}

      {!loadingDocs && documents.length === 0 && selectedFiles.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center border rounded-md py-8 text-gray-500">
          <FileIcon className="w-10 h-10 text-gray-300 mb-2" />
          <p className="text-sm">No hay documentos disponibles para esta solicitud</p>
        </div>
      )}

      {/* Documentos existentes */}
      <div className="space-y-3">
        {documents.map((doc, index) => {
          const possibleNames = [doc.nombre, doc.filename, doc.original_filename, doc.file_name, doc.name];
          const fileName = possibleNames.find((n: any) => n && n !== '') || `Documento ${index + 1}`;
          const isImage = fileName && /\.(jpg|jpeg|png|gif|webp)$/i.test(String(fileName));
          const fileUrl = doc.documento_url;
          return (
            <div key={`doc-${doc.id}`} className="flex items-center justify-between border rounded-md px-3 py-2 bg-gray-50">
              <div className="flex items-center min-w-0">
                {isImage ? (
                  <ImageIcon className="w-5 h-5 mr-2 text-gray-500" />
                ) : (
                  <FileIcon className="w-5 h-5 mr-2 text-gray-500" />
                )}
                <div className="min-w-0">
                  <div className="text-sm text-gray-900 truncate max-w-[280px]">{fileName}</div>
                  {fileUrl && (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700 mt-0.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1" /> Abrir archivo
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  onClick={() => {
                    setReplacingDocId(doc.id);
                    triggerPick();
                  }}
                  title="Reemplazar archivo"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1" /> Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(doc.id)}
                  className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Archivos nuevos seleccionados */}
      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Nuevos archivos</h4>
          <div className="space-y-2">
            {selectedFiles.map((file, i) => (
              <div key={`new-${i}`} className="flex items-center justify-between border rounded-md px-3 py-2 bg-white">
                <div className="flex items-center min-w-0">
                  <FileIcon className="w-5 h-5 mr-2 text-gray-500" />
                  <div className="min-w-0">
                    <div className="text-sm text-gray-900 truncate max-w-[280px]">{file.name}</div>
                    <div className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</div>
                  </div>
                </div>
                <button onClick={() => removeNewAt(i)} className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md">
                  <XIcon className="w-3.5 h-3.5 mr-1" /> Quitar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};



const NotificacionesSection: React.FC<{ data: any; onChange: (path: string, v: any) => void }> = ({ data, onChange }) => {
  const email = data?.solicitante?.correo || '';
  const celular = data?.solicitante?.info_extra?.celular || '';
  const notifyEmail = data?.preferencias_notificacion?.email ?? true;
  const notifySms = data?.preferencias_notificacion?.sms ?? false;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <label className="block text-sm text-gray-700 mb-1">Correo</label>
        <input className="w-full rounded-lg border px-3 py-2" value={email} readOnly />
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-1">Celular</label>
        <input className="w-full rounded-lg border px-3 py-2" value={celular} readOnly />
      </div>
      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={!!notifyEmail} onChange={(e) => onChange('preferencias_notificacion.email', e.target.checked)} />
        Enviar notificaciones por correo
      </label>
      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={!!notifySms} onChange={(e) => onChange('preferencias_notificacion.sms', e.target.checked)} />
        Enviar notificaciones por SMS
      </label>
    </div>
  );
};
