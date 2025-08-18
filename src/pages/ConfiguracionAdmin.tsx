import React, { useEffect, useMemo, useState } from 'react';
import { Plus, RefreshCcw } from 'lucide-react';
import { FieldDefinition } from '../types/fieldDefinition';
import { fieldConfigService } from '../services/fieldConfigService';
import { toast } from 'react-hot-toast';
import FieldForm from '../components/configuracion/FieldForm';
import FieldTable from '../components/configuracion/FieldTable';

const ConfiguracionAdmin: React.FC = () => {
  const [items, setItems] = useState<FieldDefinition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editing, setEditing] = useState<FieldDefinition | null>(null);
  const [entity, setEntity] = useState<string>('solicitante');
  const [jsonColumn, setJsonColumn] = useState<string>('info_extra');

  const entityOptions = useMemo(() => ([
    'solicitante',
    'ubicacion',
    'actividad_economica',
    'informacion_financiera',
    'referencia',
    'solicitud',
  ]), []);

  const jsonColumnsByEntity: Record<string, string[]> = useMemo(() => ({
    solicitante: ['info_extra'],
    ubicacion: ['detalle_direccion'],
    actividad_economica: ['detalle_actividad'],
    informacion_financiera: ['detalle_financiera'],
    referencia: ['detalle_referencia'],
    solicitud: ['detalle_credito'],
  }), []);

  const load = async () => {
    setLoading(true);
    try {
      const list = await fieldConfigService.listBy(entity, jsonColumn);
      // Normalizar agregando entity/json_column al item por si backend no los incluye en cada definición
      const normalized = list.map(it => ({ ...it, entity, json_column: jsonColumn } as FieldDefinition));
      setItems(normalized);
    } catch (e: any) {
      toast.error(e.message || 'Error cargando configuración');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Ajustar jsonColumn cuando cambie entidad
    const available = jsonColumnsByEntity[entity] || [];
    if (!available.includes(jsonColumn)) {
      setJsonColumn(available[0] || '');
    }
  }, [entity]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, jsonColumn]);

  const handleCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleEdit = (item: FieldDefinition) => {
    setEditing(item);
    setShowForm(true);
  };

  const handleDelete = async (item: FieldDefinition) => {
    if (!confirm('¿Eliminar este campo?')) return;
    try {
      await fieldConfigService.delete(item.entity, item.json_column, item.key);
      toast.success('Campo eliminado');
      load();
    } catch (e: any) {
      toast.error(e.message || 'Error eliminando');
    }
  };

  const handleSubmit = async (data: FieldDefinition) => {
    try {
      // En ambos casos (crear/editar) usamos upsert por entidad/columna
      const payload: FieldDefinition = {
        ...data,
        entity,
        json_column: jsonColumn,
      };
      await fieldConfigService.upsert(entity, jsonColumn, [payload]);
      toast.success(editing ? 'Campo actualizado' : 'Campo creado');
      setShowForm(false);
      setEditing(null);
      load();
    } catch (e: any) {
      toast.error(e.message || 'Error guardando');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Configuración de Campos</h1>
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm">Entidad</label>
            <select
              value={entity}
              onChange={(e) => setEntity(e.target.value)}
              className="border rounded px-2 py-1"
            >
              {entityOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">Columna JSON</label>
            <select
              value={jsonColumn}
              onChange={(e) => setJsonColumn(e.target.value)}
              className="border rounded px-2 py-1"
            >
              {(jsonColumnsByEntity[entity] || []).map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
          <button onClick={load} className="px-3 py-2 bg-slate-200 rounded hover:bg-slate-300 flex items-center gap-1">
            <RefreshCcw size={16} /> Recargar
          </button>
          <button onClick={handleCreate} className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1">
            <Plus size={16} /> Nuevo Campo
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-6 bg-white rounded shadow p-4">
          <FieldForm
            initial={editing || undefined}
            onCancel={() => { setShowForm(false); setEditing(null); }}
            onSubmit={handleSubmit}
          />
        </div>
      )}

      <div className="bg-white rounded shadow">
        <FieldTable
          items={items}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default ConfiguracionAdmin;
