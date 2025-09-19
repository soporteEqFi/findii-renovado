import React from 'react';
import { EsquemaCompleto } from '../../hooks/useEsquemaCompleto';
import { CampoDinamico } from './CampoDinamico';

interface FormularioCompletoProps {
  esquemaCompleto: EsquemaCompleto;
  valores: Record<string, any>;
  onChange: (key: string, value: any) => void;
  errores?: Record<string, string>;
  titulo?: string;
  disabled?: boolean;
  // Lista de keys que NO deben renderizarse (p.ej. 'estado' en creación)
  excludeKeys?: string[];
  // Estados disponibles para el campo estado
  estadosDisponibles?: string[];
}

export const FormularioCompleto: React.FC<FormularioCompletoProps> = ({
  esquemaCompleto,
  valores,
  onChange,
  errores = {},
  titulo,
  disabled = false,
  excludeKeys = [],
  estadosDisponibles = []
}) => {
  const handleFieldChange = (key: string, value: any) => {
    // DEBUG: Log para campos SELECT problemáticos
    if (key.includes('ciudad') || key.includes('departamento') || key.includes('tipo_vivienda') || key.includes('correspondencia')) {
      console.log(`🔄 handleFieldChange para ${key}:`, value);
    }

    // Si es un campo activador (como tipo_actividad), limpiar campos condicionales
    if (key === 'tipo_actividad') {
      limpiarCamposCondicionales(key, value);
    }

    onChange(key, value);
  };

  // Función para limpiar campos condicionales cuando cambia un campo activador
  const limpiarCamposCondicionales = (campoActivador: string, nuevoValor: any) => {
    // Obtener todos los campos dinámicos que dependen de este campo activador
    const camposDependientes = esquemaCompleto.campos_dinamicos.filter(campo =>
      campo.conditional_on?.field === campoActivador
    );

    // Limpiar cada campo dependiente
    camposDependientes.forEach(campo => {
      // Solo limpiar si el nuevo valor no coincide con la condición del campo
      if (campo.conditional_on?.value !== nuevoValor) {
        onChange(campo.key, '');
        console.log(`🧹 Limpiando campo condicional: ${campo.key} (dependía de ${campoActivador})`);
      }
    });

    // También limpiar campos fijos que puedan tener condiciones
    const camposFijosDependientes = esquemaCompleto.campos_fijos?.filter(campo =>
      campo.conditional_on?.field === campoActivador
    ) || [];

    camposFijosDependientes.forEach(campo => {
      if (campo.conditional_on?.value !== nuevoValor) {
        onChange(campo.key, '');
        console.log(`🧹 Limpiando campo fijo condicional: ${campo.key} (dependía de ${campoActivador})`);
      }
    });
  };

  // Obtiene un valor intentando múltiples ubicaciones comunes en estructuras anidadas
  const getNestedValue = (key: string): any => {
    // DEBUG: Log para campos SELECT problemáticos
    // if (key.includes('ciudad') || key.includes('departamento') || key.includes('tipo_vivienda') || key.includes('correspondencia')) {
    //   // console.log(`🔍 getNestedValue para ${key}:`, {
    //   //   valorDirecto: valores?.[key],
    //   //   ubicaciones: valores?.ubicaciones?.[0]?.[key],
    //   //   detalleDireccion: valores?.ubicaciones?.[0]?.detalle_direccion?.[key]
    //   // });
    // }
    // Aliases comunes entre esquemas/valores
    if (key === 'tipo_referencia' && valores && valores['tipo'] !== undefined) {
      return valores['tipo'];
    }
    if (key === 'tipo' && valores && valores['tipo_referencia'] !== undefined) {
      return valores['tipo_referencia'];
    }
    // 1) Directo
    if (valores && Object.prototype.hasOwnProperty.call(valores, key)) {
      return valores[key];
    }

    const tryObj = (obj: any) => (obj && Object.prototype.hasOwnProperty.call(obj, key) ? obj[key] : undefined);

    // 2) Solicitante
    const vSolic = tryObj(valores?.solicitante);
    if (vSolic !== undefined) return vSolic;
    const vSolicExtra = tryObj(valores?.solicitante?.info_extra);
    if (vSolicExtra !== undefined) return vSolicExtra;

    // 3) Ubicaciones (primera)
    const ubic0 = valores?.ubicaciones?.[0];
    const vUbic = tryObj(ubic0);
    if (vUbic !== undefined) return vUbic;
    const vUbicDetalle = tryObj(ubic0?.detalle_direccion);
    if (vUbicDetalle !== undefined) return vUbicDetalle;

    // 4) Actividad económica
    const vAct = tryObj(valores?.actividad_economica);
    if (vAct !== undefined) return vAct;
    const vActDet = tryObj(valores?.actividad_economica?.detalle_actividad);
    if (vActDet !== undefined) return vActDet;

    // 5) Información financiera
    const vFin = tryObj(valores?.informacion_financiera);
    if (vFin !== undefined) return vFin;
    const vFinDet = tryObj(valores?.informacion_financiera?.detalle_financiera);
    if (vFinDet !== undefined) return vFinDet;

    // 6) Referencias (primera)
    const ref0 = valores?.referencias?.[0];
    const vRef = tryObj(ref0);
    if (vRef !== undefined) return vRef;
    const vRefDet = tryObj(ref0?.detalle_referencia);
    if (vRefDet !== undefined) return vRefDet;

    // 7) Solicitudes (primera) y detalle_credito
    const sol0 = valores?.solicitudes?.[0];
    const vSol = tryObj(sol0);
    if (vSol !== undefined) return vSol;
    const detCred = sol0?.detalle_credito;
    const vDetCred = tryObj(detCred);
    if (vDetCred !== undefined) return vDetCred;
    // Buscar dentro de sub-objetos del detalle de crédito
    if (detCred && typeof detCred === 'object') {
      for (const subKey of Object.keys(detCred)) {
        const sub = detCred[subKey];
        if (sub && typeof sub === 'object') {
          const v = tryObj(sub);
          if (v !== undefined) return v;
        }
      }
    }

    return undefined;
  };

  // Función para determinar si un campo debe mostrarse basado en condiciones
  const shouldShowField = (campo: any): boolean => {
    if (!campo.conditional_on) return true;

    const { field: triggerField, value: expectedValue } = campo.conditional_on;
    const actualValue = getNestedValue(triggerField);

    return actualValue === expectedValue;
  };

  // Filtrar campos fijos y dinámicos según condiciones
  const exclude = new Set(excludeKeys);
  const camposFijosVisibles = (esquemaCompleto.campos_fijos || [])
    .filter(shouldShowField)
    .filter(c => !exclude.has(c.key));
  const camposDinamicosVisibles = esquemaCompleto.campos_dinamicos
    .filter(shouldShowField)
    .filter(c => !exclude.has(c.key));

  // Ordenar campos por order_index si existe
  const ordenarCampos = (campos: any[]) => {
    return campos.sort((a, b) => {
      const orderA = a.order_index || 999;
      const orderB = b.order_index || 999;
      return orderA - orderB;
    });
  };

  // DEBUG: Log para identificar el problema con tipo_credito
  if (titulo === 'Información del Crédito') {
    console.log('🔍 FormularioCompleto DEBUG - Información del Crédito:', {
      titulo,
      camposFijos: camposFijosVisibles.map(c => ({ key: c.key, order_index: c.order_index })),
      camposDinamicos: camposDinamicosVisibles.map(c => ({ key: c.key, order_index: c.order_index, conditional_on: c.conditional_on })),
      tipoCreditoEnFijos: camposFijosVisibles.find(c => c.key === 'tipo_credito'),
      tipoCreditoEnDinamicos: camposDinamicosVisibles.find(c => c.key === 'tipo_credito')
    });
  }

  // Crear un array ordenado con lógica mejorada para preservar posiciones específicas
  const todosLosCampos: any[] = [];

  // Primero agregar todos los campos fijos (ordenados) manteniendo su posición original
  const camposFijosOrdenados = ordenarCampos(camposFijosVisibles);
  
  // Identificar campos dinámicos por su campo activador
  const camposDinamicosPorActivador = new Map<string, any[]>();
  camposDinamicosVisibles.forEach(campoDinamico => {
    const activador = campoDinamico.conditional_on?.field;
    if (activador) {
      if (!camposDinamicosPorActivador.has(activador)) {
        camposDinamicosPorActivador.set(activador, []);
      }
      camposDinamicosPorActivador.get(activador)!.push(campoDinamico);
    }
  });

  // LÓGICA ESPECIAL: Asegurar que tipo_credito aparezca en su posición correcta
  // independientemente de si está clasificado como fijo o dinámico
  const campoTipoCredito = camposFijosVisibles.find(c => c.key === 'tipo_credito') || 
                           camposDinamicosVisibles.find(c => c.key === 'tipo_credito');
  
  if (campoTipoCredito && titulo === 'Información del Crédito') {
    console.log('🔧 Aplicando lógica especial para tipo_credito:', campoTipoCredito);
    
    // Remover tipo_credito de las listas originales si existe
    const camposFijosSinTipoCredito = camposFijosOrdenados.filter(c => c.key !== 'tipo_credito');
    const camposDinamicosSinTipoCredito = camposDinamicosVisibles.filter(c => c.key !== 'tipo_credito');
    
    // Encontrar la posición correcta para tipo_credito (después de banco_nombre y ciudad_solicitud)
    const camposAntesDeCredito = ['banco_nombre', 'ciudad_solicitud'];
    let posicionInsercion = 0;
    
    for (let i = 0; i < camposFijosSinTipoCredito.length; i++) {
      if (camposAntesDeCredito.includes(camposFijosSinTipoCredito[i].key)) {
        posicionInsercion = i + 1;
      }
    }
    
    // Insertar tipo_credito en la posición correcta
    camposFijosSinTipoCredito.splice(posicionInsercion, 0, campoTipoCredito);
    
    // Agregar todos los campos fijos (incluyendo tipo_credito en su posición correcta)
    todosLosCampos.push(...camposFijosSinTipoCredito);
    
    // Actualizar la lista de campos dinámicos para el procesamiento posterior
    camposDinamicosVisibles.length = 0;
    camposDinamicosVisibles.push(...camposDinamicosSinTipoCredito);
  } else {
    // Lógica normal para otras secciones
    todosLosCampos.push(...camposFijosOrdenados);
  }

  // Procesar campos dinámicos activados por tipo_credito
  const camposDinamicosActivadosPorTipoCredito = camposDinamicosVisibles.filter(c => 
    c.conditional_on?.field === 'tipo_credito'
  );
  
  // Agregar campos dinámicos activados por tipo_credito inmediatamente después
  if (camposDinamicosActivadosPorTipoCredito.length > 0) {
    todosLosCampos.push(...ordenarCampos(camposDinamicosActivadosPorTipoCredito));
  }

  // Agregar el resto de campos dinámicos al final
  const otrosCamposDinamicos = camposDinamicosVisibles.filter(c => 
    c.conditional_on?.field !== 'tipo_credito'
  );
  
  todosLosCampos.push(...ordenarCampos(otrosCamposDinamicos));

  return (
    <div className="space-y-6">
      {titulo && (
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
          {titulo}
        </h3>
      )}

      {/* TODOS LOS CAMPOS JUNTOS (FIJOS Y DINÁMICOS) */}
      {todosLosCampos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {todosLosCampos.map(campo => (
            <CampoDinamico
              key={campo.key}
              campo={campo}
              value={getNestedValue(campo.key)}
              onChange={handleFieldChange}
              error={errores[campo.key]}
              disabled={disabled}
              getValue={getNestedValue}
              estadosDisponibles={estadosDisponibles}
            />
          ))}
        </div>
      )}
    </div>
  );
};
