import React, { useEffect, useState } from 'react';
import { FieldDefinition } from '../../types/fieldDefinition';

interface Props {
  initial?: FieldDefinition;
  onSubmit: (data: FieldDefinition) => void;
  onCancel: () => void;
}

const defaultItem: FieldDefinition = {
  empresa_id: 1,
  entity: 'solicitante',
  json_column: 'info_extra',
  key: '',
  type: 'string',
  required: false,
  description: '',
  default_value: '',
};

const FieldForm: React.FC<Props> = ({ initial, onSubmit, onCancel }) => {
  const [form, setForm] = useState<FieldDefinition>(initial || defaultItem);
  const [listValuesText, setListValuesText] = useState<string>(''); // ✅ Estado local para el textarea

  useEffect(() => {
    if (initial) setForm(initial);
  }, [initial]);

  const isObject = form.type === 'object';
  const isArray = form.type === 'array';
  const isString = form.type === 'string';

  // ✅ Sincronizar el texto del textarea cuando cambie form.list_values desde fuera
  useEffect(() => {
    if (isObject) {
      setListValuesText(form.list_values ? JSON.stringify(form.list_values, null, 2) : '');
    } else if (isArray) {
      const arr = (form.list_values && (form.list_values as any).enum) || [];
      setListValuesText(Array.isArray(arr) ? arr.join(', ') : '');
    } else if (isString) {
      setListValuesText(Array.isArray(form.list_values) ? (form.list_values as any[]).join(', ') : '');
    } else {
      setListValuesText('');
    }
  }, [form.list_values, isObject, isArray, isString]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as any;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // ✅ Solo actualizar el estado local del textarea (sin procesamiento inmediato)
  const handleListValuesTextChange = (value: string) => {
    setListValuesText(value);
  };

  // ✅ Procesar solo cuando se pierde el foco (onBlur)
  const handleListValuesBlur = () => {
    try {
      if (isObject) {
        const parsed = JSON.parse(listValuesText || 'null');
        setForm(prev => ({ ...prev, list_values: parsed }));
      } else if (isArray) {
        const enumArr = listValuesText
          .split(',')
          .map(v => v.trim())
          .filter(Boolean);
        setForm(prev => ({ ...prev, list_values: { enum: enumArr } }));
      } else if (isString) {
        const arr = listValuesText
          .split(',')
          .map(v => v.trim())
          .filter(Boolean);
        setForm(prev => ({ ...prev, list_values: arr }));
      } else {
        setForm(prev => ({ ...prev, list_values: undefined }));
      }
    } catch (e) {
      // En caso de error de parsing, mostrar un mensaje o mantener el valor
      console.warn('Error parsing list values:', e);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.key) return;

    // ✅ Asegurar que los list_values estén actualizados antes del submit
    handleListValuesBlur();

    // Dar un micro-delay para que se actualice el estado
    setTimeout(() => {
      onSubmit(form);
    }, 10);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">Entidad</label>
          <select name="entity" value={form.entity} onChange={handleChange} className="w-full border rounded px-3 py-2">
            <option value="solicitante">solicitante</option>
            <option value="ubicacion">ubicacion</option>
            <option value="actividad_economica">actividad_economica</option>
            <option value="informacion_financiera">informacion_financiera</option>
            <option value="referencia">referencia</option>
            <option value="solicitud">solicitud</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Columna JSON</label>
          <select name="json_column" value={form.json_column} onChange={handleChange} className="w-full border rounded px-3 py-2">
            <option value="info_extra">info_extra</option>
            <option value="detalle_direccion">detalle_direccion</option>
            <option value="detalle_actividad">detalle_actividad</option>
            <option value="detalle_financiera">detalle_financiera</option>
            <option value="detalle_referencia">detalle_referencia</option>
            <option value="detalle_credito">detalle_credito</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Clave (key)</label>
          <input name="key" value={form.key} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="ej: estado_civil" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">Tipo</label>
          <select name="type" value={form.type} onChange={handleChange} className="w-full border rounded px-3 py-2">
            <option value="string">string</option>
            <option value="integer">integer</option>
            <option value="number">number</option>
            <option value="boolean">boolean</option>
            <option value="date">date</option>
            <option value="object">object</option>
            <option value="array">array</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input id="required" type="checkbox" name="required" checked={form.required} onChange={handleChange} />
          <label htmlFor="required" className="text-sm font-medium">Requerido</label>
        </div>
        <div>
          <label className="block text-sm font-medium">Valor por defecto</label>
          <input name="default_value" value={form.default_value ?? ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Descripción</label>
        <textarea name="description" value={form.description ?? ''} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={2} />
      </div>

      {(isObject || isArray || isString) && (
        <div>
          <label className="block text-sm font-medium">
            {isObject ? 'Estructura del objeto (JSON)' : isArray ? 'Opciones (comma-separated)' : 'Opciones para string (comma-separated)'}
          </label>
          <textarea
            value={listValuesText}
            onChange={(e) => handleListValuesTextChange(e.target.value)}
            onBlur={handleListValuesBlur}
            className="w-full border rounded px-3 py-2 font-mono"
            rows={isObject ? 6 : 3}
            placeholder={isObject ? '{"object_structure": [{"key":"subcampo","type":"string","required":false}]}' : 'opcion1, opcion2, opcion3'}
            title="Escribe las opciones separadas por comas. El procesamiento se hace al salir del campo."
          />
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded border">Cancelar</button>
        <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Guardar</button>
      </div>
    </form>
  );
};

export default FieldForm;
