import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import StatisticsCard from '../components/statistics/StatisticsCard';
import ChartCard from '../components/statistics/ChartCard';
import SimpleChart from '../components/statistics/SimpleChart';
import { LineChart } from '../components/statistics/LineChart';
import {
  getEstadisticasGenerales,
  getEstadisticasRendimiento,
  getEstadisticasFinancieras,
  getEstadisticasCompletas,
  getEstadisticasUsuarios,
  EstadisticasGenerales,
  EstadisticasRendimiento,
  EstadisticasFinancieras,
  EstadisticasCompletas,
  EstadisticasUsuarios
} from '../services/statisticsService';
import toast from 'react-hot-toast';

type StatisticsType = 'generales' | 'rendimiento' | 'financieras' | 'completas' | 'usuarios';

const Statistics: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<StatisticsType>('generales');
  
  // Check if user has admin/supervisor permissions for users statistics
  const isAdminOrSupervisor = user?.rol === 'admin' || user?.rol === 'supervisor';
  const [periodDays, setPeriodDays] = useState(30);
  const [estadisticasGenerales, setEstadisticasGenerales] = useState<EstadisticasGenerales | null>(null);
  const [estadisticasRendimiento, setEstadisticasRendimiento] = useState<EstadisticasRendimiento | null>(null);
  const [estadisticasFinancieras, setEstadisticasFinancieras] = useState<EstadisticasFinancieras | null>(null);
  const [estadisticasCompletas, setEstadisticasCompletas] = useState<EstadisticasCompletas | null>(null);
  const [estadisticasUsuarios, setEstadisticasUsuarios] = useState<EstadisticasUsuarios | null>(null);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      switch (selectedType) {
        case 'generales':
          const generalesResponse = await getEstadisticasGenerales();
          setEstadisticasGenerales(generalesResponse.data.estadisticas);
          break;
        case 'rendimiento':
          const rendimientoResponse = await getEstadisticasRendimiento(periodDays);
          setEstadisticasRendimiento(rendimientoResponse.data.estadisticas);
          break;
        case 'financieras':
          const financierasResponse = await getEstadisticasFinancieras();
          setEstadisticasFinancieras(financierasResponse.data.estadisticas);
          break;
        case 'completas':
          const completasResponse = await getEstadisticasCompletas(periodDays);
          setEstadisticasCompletas(completasResponse.data.estadisticas);
          break;
        case 'usuarios':
          try {
            const usuariosResponse = await getEstadisticasUsuarios();
            setEstadisticasUsuarios(usuariosResponse.data.estadisticas);
          } catch (error) {
            console.error('Error específico en estadísticas de usuarios:', error);
            if (error instanceof Error && error.message.includes('403')) {
              toast.error('Sin permisos para ver estadísticas de usuarios');
            } else {
              toast.error('Error al cargar estadísticas de usuarios');
            }
            throw error; // Re-throw para que se maneje en el catch principal
          }
          break;
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
      toast.error('Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, [selectedType, periodDays]);

  const renderGeneralStatistics = () => {
    if (!estadisticasGenerales) return null;

    return (
      <div className="space-y-6">
        {/* Cards de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatisticsCard
            title="Total Solicitantes"
            value={estadisticasGenerales.total_solicitantes}
            icon={<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatisticsCard
            title="Total Solicitudes"
            value={estadisticasGenerales.total_solicitudes}
            icon={<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>}
          />
          <StatisticsCard
            title="Total Documentos"
            value={estadisticasGenerales.total_documentos}
            icon={<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>}
          />
          <StatisticsCard
            title="Rol de Usuario"
            value={user?.rol?.toUpperCase() || 'N/A'}
            subtitle={user?.empresa || ''}
            icon={<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>}
          />
        </div>

        {/* Gráfico de línea de tiempo - Solicitudes por día */}
        {estadisticasGenerales.solicitudes_por_dia && Object.keys(estadisticasGenerales.solicitudes_por_dia).length > 0 && (
          <div className="flex justify-center">
            <div className="w-full max-w-4xl">
              <LineChart
                data={estadisticasGenerales.solicitudes_por_dia}
                title="Solicitudes por Día"
                color="#3B82F6"
              />
            </div>
          </div>
        )}

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.keys(estadisticasGenerales.solicitudes_por_estado).length > 0 && (
            <ChartCard title="Solicitudes por Estado">
              <SimpleChart
                data={estadisticasGenerales.solicitudes_por_estado}
                type="pie"
                colors={['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6']}
              />
            </ChartCard>
          )}

          {Object.keys(estadisticasGenerales.solicitudes_por_banco).length > 0 && (
            <ChartCard title="Solicitudes por Banco">
              <SimpleChart
                data={estadisticasGenerales.solicitudes_por_banco}
                type="bar"
                colors={['#3B82F6', '#10B981', '#F59E0B']}
              />
            </ChartCard>
          )}

          {Object.keys(estadisticasGenerales.solicitudes_por_ciudad).length > 0 && (
            <ChartCard title="Solicitudes por Ciudad">
              <SimpleChart
                data={estadisticasGenerales.solicitudes_por_ciudad}
                type="bar"
                colors={['#8B5CF6', '#06B6D4', '#F97316']}
              />
            </ChartCard>
          )}
        </div>
      </div>
    );
  };

  const renderPerformanceStatistics = () => {
    if (!estadisticasRendimiento) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatisticsCard
            title="Solicitudes Completadas"
            value={estadisticasRendimiento.solicitudes_completadas}
            subtitle={`Últimos ${estadisticasRendimiento.periodo_dias} días`}
          />
          <StatisticsCard
            title="Solicitudes Pendientes"
            value={estadisticasRendimiento.solicitudes_pendientes}
          />
          <StatisticsCard
            title="Período de Análisis"
            value={`${estadisticasRendimiento.periodo_dias} días`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.keys(estadisticasRendimiento.solicitudes_por_dia).length > 0 && (
            <ChartCard title="Solicitudes por Día">
              <SimpleChart
                data={estadisticasRendimiento.solicitudes_por_dia}
                type="bar"
              />
            </ChartCard>
          )}

          {Object.keys(estadisticasRendimiento.productividad_usuarios).length > 0 && (
            <ChartCard title="Productividad por Usuario">
              <SimpleChart
                data={estadisticasRendimiento.productividad_usuarios}
                type="pie"
              />
            </ChartCard>
          )}
        </div>
      </div>
    );
  };

  const renderFinancialStatistics = () => {
    if (!estadisticasFinancieras) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatisticsCard
            title="Referencias Promedio"
            value={estadisticasFinancieras.referencias_promedio.toFixed(1)}
          />
          <StatisticsCard
            title="Documentos Promedio"
            value={estadisticasFinancieras.documentos_promedio.toFixed(1)}
          />
          <StatisticsCard
            title="Total Referencias"
            value={estadisticasFinancieras.total_referencias}
          />
          <StatisticsCard
            title="Total Documentos"
            value={estadisticasFinancieras.total_documentos}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Rangos de Ingresos">
            <SimpleChart
              data={estadisticasFinancieras.rangos_ingresos}
              type="pie"
              colors={['#10B981', '#3B82F6', '#F59E0B', '#EF4444']}
            />
          </ChartCard>

          <ChartCard title="Tipos de Actividad Económica">
            <SimpleChart
              data={estadisticasFinancieras.tipos_actividad_economica}
              type="bar"
              colors={['#8B5CF6', '#06B6D4', '#F97316', '#10B981', '#EF4444']}
            />
          </ChartCard>
        </div>
      </div>
    );
  };

  const renderCompleteStatistics = () => {
    if (!estadisticasCompletas) return null;

    return (
      <div className="space-y-8">
        {/* Estadísticas Generales */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas Generales</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatisticsCard
              title="Total Solicitantes"
              value={estadisticasCompletas.generales.total_solicitantes}
            />
            <StatisticsCard
              title="Total Solicitudes"
              value={estadisticasCompletas.generales.total_solicitudes}
            />
            <StatisticsCard
              title="Total Documentos"
              value={estadisticasCompletas.generales.total_documentos}
            />
            <StatisticsCard
              title="Período"
              value={`${periodDays} días`}
            />
          </div>
        </div>

        {/* Estadísticas de Rendimiento */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <StatisticsCard
              title="Completadas"
              value={estadisticasCompletas.rendimiento.solicitudes_completadas}
            />
            <StatisticsCard
              title="Pendientes"
              value={estadisticasCompletas.rendimiento.solicitudes_pendientes}
            />
          </div>
        </div>

        {/* Estadísticas Financieras */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financieras</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <StatisticsCard
              title="Referencias Promedio"
              value={estadisticasCompletas.financieras.referencias_promedio.toFixed(1)}
            />
            <StatisticsCard
              title="Documentos Promedio"
              value={estadisticasCompletas.financieras.documentos_promedio.toFixed(1)}
            />
          </div>
        </div>

        {/* Gráficos combinados */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.keys(estadisticasCompletas.generales.solicitudes_por_estado).length > 0 && (
            <ChartCard title="Estados de Solicitudes">
              <SimpleChart
                data={estadisticasCompletas.generales.solicitudes_por_estado}
                type="pie"
              />
            </ChartCard>
          )}

          {Object.keys(estadisticasCompletas.financieras.rangos_ingresos).length > 0 && (
            <ChartCard title="Rangos de Ingresos">
              <SimpleChart
                data={estadisticasCompletas.financieras.rangos_ingresos}
                type="bar"
              />
            </ChartCard>
          )}
        </div>
      </div>
    );
  };

  const renderUsersStatistics = () => {
    if (!estadisticasUsuarios) return null;

    return (
      <div className="space-y-6">
        {/* Cards de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatisticsCard
            title="Total Usuarios"
            value={estadisticasUsuarios.total_usuarios}
            icon={<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>}
          />
          <StatisticsCard
            title="Empresa"
            value={user?.empresa || 'N/A'}
            subtitle="Solo admin/supervisor"
            icon={<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2a1 1 0 01-1 1H6a1 1 0 01-1-1v-2h10z" clipRule="evenodd" /></svg>}
          />
          <StatisticsCard
            title="Rol Actual"
            value={user?.rol?.toUpperCase() || 'N/A'}
            subtitle="Tu nivel de acceso"
            icon={<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-0.257-0.257A6 6 0 1118 8zM2 8a8 8 0 1016 0A8 8 0 002 8zm8-3a3 3 0 100 6 3 3 0 000-6z" clipRule="evenodd" /></svg>}
          />
          <StatisticsCard
            title="Acceso Especial"
            value="✓ Autorizado"
            subtitle="Admin/Supervisor"
            icon={<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.keys(estadisticasUsuarios.usuarios_por_rol).length > 0 && (
            <ChartCard title="Usuarios por Rol">
              <SimpleChart
                data={estadisticasUsuarios.usuarios_por_rol}
                type="pie"
                colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']}
              />
            </ChartCard>
          )}

          {Object.keys(estadisticasUsuarios.usuarios_por_banco).length > 0 && (
            <ChartCard title="Usuarios por Banco">
              <SimpleChart
                data={estadisticasUsuarios.usuarios_por_banco}
                type="bar"
                colors={['#06B6D4', '#F97316', '#84CC16', '#EC4899']}
              />
            </ChartCard>
          )}

          {Object.keys(estadisticasUsuarios.usuarios_por_ciudad).length > 0 && (
            <ChartCard title="Usuarios por Ciudad">
              <SimpleChart
                data={estadisticasUsuarios.usuarios_por_ciudad}
                type="bar"
                colors={['#8B5CF6', '#06B6D4', '#F97316', '#10B981']}
              />
            </ChartCard>
          )}
        </div>

        {/* Información adicional para admin/supervisor */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-blue-800">Acceso Administrativo</h4>
              <p className="text-sm text-blue-600">
                Estas estadísticas solo están disponibles para usuarios con rol de administrador o supervisor.
                Los datos incluyen información sensible de usuarios de la empresa.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Estadísticas</h1>
        <p className="text-gray-600">
          Panel de estadísticas filtrado según tu rol: <span className="font-semibold">{user?.rol?.toUpperCase()}</span>
        </p>
      </div>

      {/* Controles de filtrado */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Estadísticas
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as StatisticsType)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="generales">Estadísticas Generales</option>
              <option value="rendimiento">Rendimiento</option>
              <option value="financieras">Estadísticas Financieras</option>
              <option value="completas">Vista Completa</option>
              {isAdminOrSupervisor && (
                <option value="usuarios">Estadísticas de Usuarios</option>
              )}
            </select>
          </div>

          {(selectedType === 'rendimiento' || selectedType === 'completas') && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período (días)
              </label>
              <select
                value={periodDays}
                onChange={(e) => setPeriodDays(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={7}>7 días</option>
                <option value={15}>15 días</option>
                <option value={30}>30 días</option>
                <option value={60}>60 días</option>
                <option value={90}>90 días</option>
              </select>
            </div>
          )}

          <div className="flex items-end">
            <button
              onClick={loadStatistics}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md transition-colors"
            >
              {loading ? 'Cargando...' : 'Actualizar'}
            </button>
          </div>
        </div>
      </div>

      {/* Contenido de estadísticas */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div>
          {selectedType === 'generales' && renderGeneralStatistics()}
          {selectedType === 'rendimiento' && renderPerformanceStatistics()}
          {selectedType === 'financieras' && renderFinancialStatistics()}
          {selectedType === 'completas' && renderCompleteStatistics()}
          {selectedType === 'usuarios' && renderUsersStatistics()}
        </div>
      )}
    </div>
  );
};

export default Statistics;
