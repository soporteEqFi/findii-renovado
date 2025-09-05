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
}

export const FormularioCompleto: React.FC<FormularioCompletoProps> = ({
  esquemaCompleto,
  valores,
  onChange,
  errores = {},
  titulo,
  disabled = false,
  excludeKeys = []
}) => {
  const handleFieldChange = (key: string, value: any) => {
    onChange(key, value);
  };

  // Obtiene un valor intentando múltiples ubicaciones comunes en estructuras anidadas
  const getNestedValue = (key: string): any => {
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

  // Crear un array ordenado insertando los campos dinámicos después de sus campos activadores
  const todosLosCampos: any[] = [];

  // Primero agregar todos los campos fijos (ordenados)
  const camposFijosOrdenados = ordenarCampos(camposFijosVisibles);
  camposFijosOrdenados.forEach(campoFijo => {
    todosLosCampos.push(campoFijo);

    // Buscar campos dinámicos que se activen con este campo fijo
    const camposDinamicosRelacionados = camposDinamicosVisibles.filter(campoDinamico =>
      campoDinamico.conditional_on?.field === campoFijo.key
    );

    // Insertar los campos dinámicos relacionados justo después del campo fijo (ordenados)
    todosLosCampos.push(...ordenarCampos(camposDinamicosRelacionados));
  });

  // Agregar campos dinámicos que no tienen campo activador específico al final (ordenados)
  const camposDinamicosSinActivador = camposDinamicosVisibles.filter(campoDinamico =>
    !camposFijosVisibles.some(campoFijo => campoFijo.key === campoDinamico.conditional_on?.field)
  );

  todosLosCampos.push(...ordenarCampos(camposDinamicosSinActivador));

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
            />
          ))}
        </div>
      )}
    </div>
  );
};
