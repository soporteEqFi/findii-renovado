import { useState, useEffect } from 'react';
import { configuracionesService } from '../services/configuracionesService';

// Cache para evitar consultas repetidas
const configuracionesCache: Record<string, string[]> = {};

interface UseConfiguracionesReturn {
  ciudades: string[];
  bancos: string[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useConfiguraciones = (empresaId: number = 1): UseConfiguracionesReturn => {
  // Inicializar con valores por defecto básicos (solo para mostrar algo mientras carga)
  const [ciudades, setCiudades] = useState<string[]>(['Bogotá', 'Medellín', 'Cali', 'Barranquilla']);
  const [bancos, setBancos] = useState<string[]>(['Bancolombia', 'Banco de Bogotá', 'BBVA']);
  const [loading, setLoading] = useState(true); // Volver a true para cargar desde backend
  const [error, setError] = useState<string | null>(null);

    const cargarConfiguraciones = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔧 === CARGANDO CONFIGURACIONES DESDE BACKEND ===');
      console.log('🏢 Empresa ID:', empresaId);

      // Cargar ciudades y bancos en paralelo
      const [ciudadesData, bancosData] = await Promise.all([
        configuracionesService.obtenerCiudades(empresaId),
        configuracionesService.obtenerBancos(empresaId)
      ]);

      // Actualizar con los datos del backend y guardar en localStorage
      if (ciudadesData.length > 0) {
        setCiudades(ciudadesData);
        configuracionesCache[`ciudades_${empresaId}`] = ciudadesData;
        // Guardar en localStorage para uso futuro
        localStorage.setItem(`configuraciones_ciudades_${empresaId}`, JSON.stringify(ciudadesData));
        // console.log('🏙️ Ciudades cargadas desde backend y guardadas:', ciudadesData);
      }

      if (bancosData.length > 0) {
        setBancos(bancosData);
        configuracionesCache[`bancos_${empresaId}`] = bancosData;
        // Guardar en localStorage para uso futuro
        localStorage.setItem(`configuraciones_bancos_${empresaId}`, JSON.stringify(bancosData));
        console.log('🏦 Bancos cargados desde backend y guardados:', bancosData);
      }

      console.log('✅ Configuraciones cargadas desde backend y guardadas en localStorage');

    } catch (err: any) {
      console.error('❌ Error al cargar configuraciones desde backend:', err);
      setError(err.message || 'Error al cargar configuraciones');
      // Mantener valores por defecto si falla
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    // Limpiar cache y recargar
    delete configuracionesCache[`ciudades_${empresaId}`];
    delete configuracionesCache[`bancos_${empresaId}`];
    cargarConfiguraciones();
  };

  useEffect(() => {
    // Primero intentar cargar desde localStorage
    const ciudadesGuardadas = localStorage.getItem(`configuraciones_ciudades_${empresaId}`);
    const bancosGuardados = localStorage.getItem(`configuraciones_bancos_${empresaId}`);

    if (ciudadesGuardadas && bancosGuardados) {
      try {
        const ciudadesData = JSON.parse(ciudadesGuardadas);
        const bancosData = JSON.parse(bancosGuardados);

        console.log('📋 Usando configuraciones desde localStorage');
        setCiudades(ciudadesData);
        setBancos(bancosData);
        setLoading(false);

        // Guardar en cache también
        configuracionesCache[`ciudades_${empresaId}`] = ciudadesData;
        configuracionesCache[`bancos_${empresaId}`] = bancosData;

        // console.log('🏙️ Ciudades desde localStorage:', ciudadesData);
        // console.log('🏦 Bancos desde localStorage:', bancosData);
      } catch (error) {
        console.error('Error al parsear configuraciones de localStorage:', error);
        // Si falla el parseo, cargar desde backend
        cargarConfiguraciones();
      }
    } else {
      // Si no hay datos en localStorage, cargar desde backend
      console.log('🔄 No hay configuraciones en localStorage, cargando desde backend...');
      cargarConfiguraciones();
    }
  }, [empresaId]);

  return {
    ciudades,
    bancos,
    loading,
    error,
    refetch
  };
};
