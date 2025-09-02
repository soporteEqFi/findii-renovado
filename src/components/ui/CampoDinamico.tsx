import React from 'react';
import { EsquemaCampo } from '../../types/esquemas';
import { useConfiguraciones } from '../../hooks/useConfiguraciones';
import { departments, getCitiesByDepartment } from '../../data/colombianCities';
import { CREDIT_STATUSES } from '../../config/constants';

interface CampoDinamicoProps {
  campo: EsquemaCampo;
  value: any;
  onChange: (key: string, value: any) => void;
  error?: string;
  disabled?: boolean;
  // Permite consultar otros valores del formulario (p.ej. departamento para filtrar ciudades)
  getValue?: (key: string) => any;
}

export const CampoDinamico: React.FC<CampoDinamicoProps> = ({
  campo,
  value,
  onChange,
  error,
  disabled = false,
  getValue
}) => {
  // Usar default_value si value es null/undefined/empty
  const efectiveValue = value ?? campo.default_value ?? '';

  // Cargar configuraciones para campos específicos
  const empresaId = parseInt(localStorage.getItem('empresa_id') || '1', 10);
  const { ciudades, bancos, loading: loadingConfiguraciones } = useConfiguraciones(empresaId);

  const handleChange = (newValue: any) => {
    onChange(campo.key, newValue);
  };

  // Si es un campo objeto, renderizar los subcampos directamente sin contenedor
  if (campo.type === 'object' && campo.list_values && typeof campo.list_values === 'object' && 'object_structure' in campo.list_values) {
    const structure = (campo.list_values as { object_structure: EsquemaCampo[] }).object_structure;

    // Ordenar los subcampos por order_index si existe
    const structureOrdenada = [...structure].sort((a, b) => {
      const orderA = a.order_index || 999;
      const orderB = b.order_index || 999;
      return orderA - orderB;
    });

    return (
      <div className="col-span-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {structureOrdenada.map((subcampo: EsquemaCampo) => (
            <div key={subcampo.key} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {subcampo.description || subcampo.key} {subcampo.required && <span className="text-red-500">*</span>}
              </label>
              {(subcampo.type === 'array' && subcampo.list_values && typeof subcampo.list_values === 'object' && 'enum' in subcampo.list_values) ? (
                // Si el subcampo es de tipo array con enum, renderizar select
                <select
                  value={efectiveValue[subcampo.key] ?? subcampo.default_value ?? ''}
                  onChange={(e) => {
                    const nuevoObjeto = { ...efectiveValue, [subcampo.key]: e.target.value };
                    // Limpiar campos vacíos
                    Object.keys(nuevoObjeto).forEach(k => {
                      if (nuevoObjeto[k] === '' || nuevoObjeto[k] === null || nuevoObjeto[k] === undefined) {
                        delete nuevoObjeto[k];
                      }
                    });
                    handleChange(nuevoObjeto);
                  }}
                  required={subcampo.required}
                  disabled={disabled}
                  className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
                >
                  <option value="">Seleccionar...</option>
                  {(subcampo.list_values as { enum: string[] }).enum.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : subcampo.type === 'date' ? (
                // Input de fecha
                <input
                  type="date"
                  placeholder={subcampo.description || subcampo.key}
                  value={efectiveValue[subcampo.key] ?? subcampo.default_value ?? ''}
                  onChange={(e) => {
                    const nuevoObjeto = { ...efectiveValue, [subcampo.key]: e.target.value };
                    // Limpiar campos vacíos
                    Object.keys(nuevoObjeto).forEach(k => {
                      if (nuevoObjeto[k] === '' || nuevoObjeto[k] === null || nuevoObjeto[k] === undefined) {
                        delete nuevoObjeto[k];
                      }
                    });
                    handleChange(nuevoObjeto);
                  }}
                  required={subcampo.required}
                  disabled={disabled}
                  className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
                />
              ) : (
                // Input normal
                <input
                  type={subcampo.type === 'number' || subcampo.type === 'integer' ? 'number' : 'text'}
                  placeholder={subcampo.description || subcampo.key}
                  value={efectiveValue[subcampo.key] ?? subcampo.default_value ?? ''}
                  onChange={(e) => {
                    const nuevoObjeto = { ...efectiveValue, [subcampo.key]: e.target.value };
                    // Limpiar campos vacíos
                    Object.keys(nuevoObjeto).forEach(k => {
                      if (nuevoObjeto[k] === '' || nuevoObjeto[k] === null || nuevoObjeto[k] === undefined) {
                        delete nuevoObjeto[k];
                      }
                    });
                    handleChange(nuevoObjeto);
                  }}
                  required={subcampo.required}
                  disabled={disabled}
                  className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
                  step={subcampo.type === 'integer' ? '1' : '0.01'}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const renderCampo = () => {
    const baseClasses = `border text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5 ${
      error
        ? 'border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:ring-blue-500'
    } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`;

    // Campos especiales que usan configuraciones
    if (campo.key === 'ciudad_solicitud') {
      return (
        <select
          value={efectiveValue || ''}
          onChange={(e) => handleChange(e.target.value)}
          className={baseClasses}
          required={campo.required}
          disabled={disabled || loadingConfiguraciones}
        >
          <option value="">{loadingConfiguraciones ? 'Cargando ciudades...' : 'Seleccionar ciudad...'}</option>
          {ciudades.map((ciudad) => (
            <option key={ciudad} value={ciudad}>
              {ciudad}
            </option>
          ))}
        </select>
      );
    }

    if (campo.key === 'banco_nombre') {
      return (
        <select
          value={efectiveValue || ''}
          onChange={(e) => handleChange(e.target.value)}
          className={baseClasses}
          required={campo.required}
          disabled={disabled || loadingConfiguraciones}
        >
          <option value="">{loadingConfiguraciones ? 'Cargando bancos...' : 'Seleccionar banco...'}</option>
          {bancos.map((banco) => (
            <option key={banco} value={banco}>
              {banco}
            </option>
          ))}
        </select>
      );
    }

    // Manejo genérico para campos de Departamento
    if (/departamento/i.test(campo.key)) {
      return (
        <select
          value={efectiveValue || ''}
          onChange={(e) => {
            const nuevoDepartamento = e.target.value;
            handleChange(nuevoDepartamento);
            // Limpiar ciudad relacionada si existe
            const candidatosCiudad = new Set<string>();
            candidatosCiudad.add(campo.key.replace(/departamento/gi, 'ciudad'));
            candidatosCiudad.add(campo.key.replace(/_departamento/gi, '_ciudad'));
            candidatosCiudad.add(campo.key.replace(/Departamento/gi, 'Ciudad'));
            candidatosCiudad.add('ciudad');
            for (const c of candidatosCiudad) {
              // Si el valor actual de esa ciudad no está vacío, limpiarlo
              const actual = typeof getValue === 'function' ? getValue(c) : undefined;
              if (actual) {
                onChange(c, '');
                break;
              }
            }
          }}
          className={baseClasses}
          required={campo.required}
          disabled={disabled}
        >
          <option value="">Seleccionar departamento...</option>
          {departments.map((dep) => (
            <option key={dep} value={dep}>
              {dep}
            </option>
          ))}
        </select>
      );
    }

    // Ciudad en referencias: mostrar solo texto pre-cargado (read-only)
    if (/ciudad/i.test(campo.key) && /referencia/i.test(campo.key)) {
      return (
        <input
          type="text"
          value={efectiveValue || ''}
          onChange={() => { /* read-only */ }}
          className={baseClasses}
          required={false}
          disabled={true}
          placeholder={campo.description}
        />
      );
    }

    // Manejo genérico para campos de Ciudad
    if (/ciudad/i.test(campo.key)) {
      // Inferir el campo de departamento relacionado
      let departamentoRelacionado: string | undefined = undefined;
      if (typeof getValue === 'function') {
        const candidatos = new Set<string>();
        candidatos.add(campo.key.replace(/ciudad/gi, 'departamento'));
        candidatos.add(campo.key.replace(/_ciudad/gi, '_departamento'));
        candidatos.add(campo.key.replace(/Ciudad/gi, 'Departamento'));
        candidatos.add('departamento');
        // Probar candidatos en orden de inserción
        for (const c of candidatos) {
          const val = getValue(c);
          if (val) {
            departamentoRelacionado = val as string;
            break;
          }
        }
      }

      const opcionesCiudades = departamentoRelacionado
        ? getCitiesByDepartment(departamentoRelacionado)
        : ciudades;

      return (
        <select
          value={efectiveValue || ''}
          onChange={(e) => handleChange(e.target.value)}
          className={baseClasses}
          required={campo.required}
          disabled={disabled || loadingConfiguraciones}
        >
          <option value="">{loadingConfiguraciones ? 'Cargando ciudades...' : 'Seleccionar ciudad...'}</option>
          {opcionesCiudades.map((ciudad) => (
            <option key={ciudad} value={ciudad}>
              {ciudad}
            </option>
          ))}
        </select>
      );
    }

    // Campos con opciones predefinidas
    if (campo.key === 'estado') {
      return (
        <select
          value={efectiveValue || ''}
          onChange={(e) => handleChange(e.target.value)}
          className={baseClasses}
          required={campo.required}
          disabled={disabled}
        >
          <option value="">Seleccionar estado...</option>
          {CREDIT_STATUSES.map((st) => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>
      );
    }

    if (campo.key === 'tipo_identificacion') {
      return (
        <select
          value={efectiveValue || ''}
          onChange={(e) => handleChange(e.target.value)}
          className={baseClasses}
          required={campo.required}
          disabled={disabled}
        >
          <option value="">Seleccionar tipo...</option>
          <option value="CC">Cédula de Ciudadanía</option>
          <option value="CE">Cédula de Extranjería</option>
          <option value="TI">Tarjeta de Identidad</option>
          <option value="PP">Pasaporte</option>
          <option value="NIT">NIT</option>
        </select>
      );
    }

    if (campo.key === 'genero') {
      return (
        <select
          value={efectiveValue || ''}
          onChange={(e) => handleChange(e.target.value)}
          className={baseClasses}
          required={campo.required}
          disabled={disabled}
        >
          <option value="">Seleccionar género...</option>
          <option value="M">Masculino</option>
          <option value="F">Femenino</option>
          <option value="O">Otro</option>
        </select>
      );
    }

    if (campo.key === 'estado_civil') {
      return (
        <select
          value={efectiveValue || ''}
          onChange={(e) => handleChange(e.target.value)}
          className={baseClasses}
          required={campo.required}
          disabled={disabled}
        >
          <option value="">Seleccionar estado civil...</option>
          <option value="Soltero">Soltero</option>
          <option value="Casado">Casado</option>
          <option value="Unión Libre">Unión Libre</option>
          <option value="Divorciado">Divorciado</option>
          <option value="Viudo">Viudo</option>
        </select>
      );
    }

    if (campo.key === 'tipo_contrato') {
      return (
        <select
          value={efectiveValue || ''}
          onChange={(e) => handleChange(e.target.value)}
          className={baseClasses}
          required={campo.required}
          disabled={disabled}
        >
          <option value="">Seleccionar tipo de contrato...</option>
          <option value="Indefinido">Indefinido</option>
          <option value="Término Fijo">Término Fijo</option>
          <option value="Prestación de Servicios">Prestación de Servicios</option>
          <option value="Obra o Labor">Obra o Labor</option>
          <option value="Aprendizaje">Aprendizaje</option>
          <option value="Independiente">Independiente</option>
        </select>
      );
    }

    if (campo.key === 'tipo_actividad') {
      return (
        <select
          value={efectiveValue || ''}
          onChange={(e) => handleChange(e.target.value)}
          className={baseClasses}
          required={campo.required}
          disabled={disabled}
        >
          <option value="">Seleccionar tipo de actividad...</option>
          <option value="Empleado">Empleado</option>
          <option value="Independiente">Independiente</option>
          <option value="Pensionado">Pensionado</option>
          <option value="Estudiante">Estudiante</option>
          <option value="Desempleado">Desempleado</option>
          <option value="Rentista">Rentista</option>
        </select>
      );
    }

    if (campo.key === 'sector_economico') {
      return (
        <select
          value={efectiveValue || ''}
          onChange={(e) => handleChange(e.target.value)}
          className={baseClasses}
          required={campo.required}
          disabled={disabled}
        >
          <option value="">Seleccionar sector económico...</option>
          <option value="Tecnología">Tecnología</option>
          <option value="Finanzas">Finanzas</option>
          <option value="Salud">Salud</option>
          <option value="Educación">Educación</option>
          <option value="Comercio">Comercio</option>
          <option value="Manufactura">Manufactura</option>
          <option value="Servicios">Servicios</option>
          <option value="Construcción">Construcción</option>
          <option value="Agricultura">Agricultura</option>
          <option value="Minería">Minería</option>
          <option value="Otro">Otro</option>
        </select>
      );
    }

    if (campo.key === 'tipo_referencia') {
      return (
        <select
          value={efectiveValue || ''}
          onChange={(e) => handleChange(e.target.value)}
          className={baseClasses}
          required={campo.required}
          disabled={disabled}
        >
          <option value="">Seleccionar tipo de referencia...</option>
          <option value="personal">Personal</option>
          <option value="familiar">Familiar</option>
          <option value="laboral">Laboral</option>
          <option value="comercial">Comercial</option>
        </select>
      );
    }

    if (campo.key === 'parentesco') {
      return (
        <select
          value={efectiveValue || ''}
          onChange={(e) => handleChange(e.target.value)}
          className={baseClasses}
          required={campo.required}
          disabled={disabled}
        >
          <option value="">Seleccionar parentesco...</option>
          <option value="Padre">Padre</option>
          <option value="Madre">Madre</option>
          <option value="Hermano">Hermano</option>
          <option value="Hermana">Hermana</option>
          <option value="Hijo">Hijo</option>
          <option value="Hija">Hija</option>
          <option value="Esposo">Esposo</option>
          <option value="Esposa">Esposa</option>
          <option value="Tío">Tío</option>
          <option value="Tía">Tía</option>
          <option value="Primo">Primo</option>
          <option value="Prima">Prima</option>
          <option value="Amigo">Amigo</option>
          <option value="Amiga">Amiga</option>
          <option value="Otro">Otro</option>
        </select>
      );
    }

    if (campo.key === 'destino_credito') {
      return (
        <select
          value={efectiveValue || ''}
          onChange={(e) => handleChange(e.target.value)}
          className={baseClasses}
          required={campo.required}
          disabled={disabled}
        >
          <option value="">Seleccionar destino del crédito...</option>
          <option value="Vivienda">Vivienda</option>
          <option value="Vehiculo">Vehículo</option>
          <option value="Educacion">Educación</option>
          <option value="Negocio">Negocio</option>
          <option value="Consumo">Consumo</option>
          <option value="Viajes">Viajes</option>
          <option value="Salud">Salud</option>
          <option value="Otro">Otro</option>
        </select>
      );
    }

    switch (campo.type) {
      case 'string':
        // Verificar si tiene opciones enum en list_values
        if (campo.list_values && typeof campo.list_values === 'object' && 'enum' in campo.list_values) {
          const opciones = (campo.list_values as { enum: string[] }).enum;
          return (
            <select
              value={efectiveValue || ''}
              onChange={(e) => handleChange(e.target.value)}
              className={baseClasses}
              required={campo.required}
              disabled={disabled}
            >
              <option value="">Seleccionar...</option>
              {opciones.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        }
        // Verificar si es array directo (formato anterior)
        if (campo.list_values && Array.isArray(campo.list_values) && campo.list_values.length > 0) {
          const opciones = campo.list_values as string[];
          return (
            <select
              value={efectiveValue || ''}
              onChange={(e) => handleChange(e.target.value)}
              className={baseClasses}
              required={campo.required}
              disabled={disabled}
            >
              <option value="">Seleccionar...</option>
              {opciones.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        }
        // Input de texto normal
        return (
          <input
            type="text"
            value={efectiveValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            className={baseClasses}
            required={campo.required}
            placeholder={campo.description}
            disabled={disabled}
          />
        );

      case 'integer':
      case 'number':
        return (
          <input
            type="number"
            value={efectiveValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            className={baseClasses}
            required={campo.required}
            placeholder={campo.description}
            disabled={disabled}
            step={campo.type === 'integer' ? '1' : '0.01'}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={efectiveValue || false}
              onChange={(e) => handleChange(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              required={campo.required}
              disabled={disabled}
            />
            <label className="ml-2 text-sm text-gray-700">
              {campo.description || campo.key}
            </label>
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={efectiveValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            className={baseClasses}
            required={campo.required}
            disabled={disabled}
          />
        );

      case 'file':
        // Verificar si tiene configuración de archivo
        if (campo.list_values && typeof campo.list_values === 'object' && 'file_config' in campo.list_values) {
          const fileConfig = (campo.list_values as { file_config: any }).file_config;

          // Importar DynamicFileField dinámicamente para evitar problemas de dependencia circular
          const DynamicFileField = React.lazy(() => import('../ui/DynamicFileField').then(module => ({ default: module.DynamicFileField })));

          return (
            <React.Suspense fallback={<div className="text-gray-500">Cargando campo de archivo...</div>}>
              <DynamicFileField
                value={efectiveValue}
                onChange={(value) => handleChange(value)}
                config={fileConfig}
                label={campo.description || campo.key}
                required={campo.required}
                disabled={disabled}
                entityId={1} // TODO: Obtener del contexto
                entityType="solicitante" // TODO: Obtener del contexto
                jsonColumn="info_extra" // TODO: Obtener del contexto
                fieldKey={campo.key}
              />
            </React.Suspense>
          );
        }
        // Si no tiene configuración de archivo, mostrar error
        return (
          <div className="text-red-500 text-sm p-2 border border-red-300 rounded">
            Error: Campo tipo file debe tener list_values con file_config
          </div>
        );

      case 'array':
        // Verificar si tiene opciones enum en list_values (para selectores de una opción)
        if (campo.list_values && typeof campo.list_values === 'object' && 'enum' in campo.list_values) {
          const opciones = (campo.list_values as { enum: string[] }).enum;
          return (
            <select
              value={efectiveValue || ''}
              onChange={(e) => handleChange(e.target.value)}
              className={baseClasses}
              required={campo.required}
              disabled={disabled}
            >
              <option value="">Seleccionar...</option>
              {opciones.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        }
        // Si no tiene enum, mostrar error
        return (
          <div className="text-red-500 text-sm p-2 border border-red-300 rounded">
            Error: Campo tipo array debe tener list_values con enum
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={efectiveValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            className={baseClasses}
            required={campo.required}
            placeholder={campo.description}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {campo.description || campo.key} {campo.required && '*'}
      </label>
      {renderCampo()}
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};
