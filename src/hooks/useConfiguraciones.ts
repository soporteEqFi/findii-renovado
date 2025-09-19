import { useState, useEffect, useCallback } from 'react';
import { configuracionesService } from '../services/configuracionesService';

// Cache global para evitar consultas repetidas
const configuracionesCache: Record<string, string[]> = {};
let cargandoConfiguraciones = false; // Flag para evitar múltiples cargas simultáneas

interface UseConfiguracionesReturn {
  ciudades: string[];
  bancos: string[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useConfiguraciones = (empresaId?: number): UseConfiguracionesReturn => {
  // Inicializar con valores por defecto básicos (solo para mostrar algo mientras carga)
  const [ciudades, setCiudades] = useState<string[]>(['Bogotá', 'Medellín', 'Cali', 'Barranquilla']);
  const [bancos, setBancos] = useState<string[]>(['Bancolombia', 'Banco de Bogotá', 'BBVA']);
  const [loading, setLoading] = useState(false); // Cambiar a false para evitar loading permanente
  const [error, setError] = useState<string | null>(null);

  // DEBUG: Log cuando se inicializa el hook
  console.log('🚀 useConfiguraciones inicializado con empresaId:', empresaId);

  const cargarConfiguraciones = useCallback(async () => {
    // Evitar múltiples cargas simultáneas
    if (cargandoConfiguraciones) {
      console.log('⏳ Ya se están cargando configuraciones, esperando...');
      return;
    }

    cargandoConfiguraciones = true;
    setLoading(true);
    setError(null);

    try {
      const empresaIdToUse = empresaId || parseInt(localStorage.getItem('empresa_id') || '1', 10);
      console.log('🔧 === CARGANDO CONFIGURACIONES DESDE BACKEND ===');
      console.log('🏢 Empresa ID:', empresaIdToUse);

      // Cargar ciudades y bancos en paralelo
      const [ciudadesData, bancosData] = await Promise.all([
        configuracionesService.obtenerCiudades(empresaIdToUse),
        configuracionesService.obtenerBancos(empresaIdToUse)
      ]);

      // Actualizar con los datos del backend y guardar en localStorage
      // El backend devuelve un objeto con {categoria, total, valores}, necesitamos extraer .valores
      const ciudadesArray = Array.isArray(ciudadesData) ? ciudadesData : ((ciudadesData as any)?.valores || []);
      const bancosArray = Array.isArray(bancosData) ? bancosData : ((bancosData as any)?.valores || []);

      setCiudades(ciudadesArray);
      configuracionesCache[`ciudades_${empresaId}`] = ciudadesArray;
      localStorage.setItem(`configuraciones_ciudades_${empresaId}`, JSON.stringify(ciudadesArray));
      console.log('🏙️ Ciudades cargadas desde backend:', ciudadesArray);

      setBancos(bancosArray);
      configuracionesCache[`bancos_${empresaId}`] = bancosArray;
      localStorage.setItem(`configuraciones_bancos_${empresaId}`, JSON.stringify(bancosArray));
      console.log('🏦 Bancos cargados desde backend:', bancosArray);

      console.log('✅ Configuraciones cargadas desde backend y guardadas en localStorage');

    } catch (err: any) {
      console.error('❌ Error al cargar configuraciones desde backend:', err);
      setError(err.message || 'Error al cargar configuraciones');
      // Mantener valores por defecto si falla
    } finally {
      setLoading(false);
      cargandoConfiguraciones = false;
    }
  }, [empresaId]);

  const refetch = () => {
    // Limpiar cache y recargar
    delete configuracionesCache[`ciudades_${empresaId}`];
    delete configuracionesCache[`bancos_${empresaId}`];
    cargarConfiguraciones();
  };

  useEffect(() => {
    // DEBUG: Log cuando se ejecuta el useEffect
    console.log('🔄 useConfiguraciones useEffect ejecutándose con empresaId:', empresaId);

    // Primero intentar cargar desde localStorage
    const ciudadesGuardadas = localStorage.getItem(`configuraciones_ciudades_${empresaId}`);
    const bancosGuardados = localStorage.getItem(`configuraciones_bancos_${empresaId}`);

    if (ciudadesGuardadas && bancosGuardados) {
      try {
        const ciudadesData = JSON.parse(ciudadesGuardadas);
        const bancosData = JSON.parse(bancosGuardados);

        console.log('📋 Usando configuraciones desde localStorage');

        // Extraer arrays de los objetos si es necesario
        const ciudadesArray = Array.isArray(ciudadesData) ? ciudadesData : (ciudadesData?.valores || []);
        const bancosArray = Array.isArray(bancosData) ? bancosData : (bancosData?.valores || []);

        setCiudades(ciudadesArray);
        setBancos(bancosArray);
        setLoading(false);

        // Guardar en cache también
        configuracionesCache[`ciudades_${empresaId}`] = ciudadesArray;
        configuracionesCache[`bancos_${empresaId}`] = bancosArray;

        console.log('🏙️ Ciudades desde localStorage:', ciudadesArray);
        console.log('🏦 Bancos desde localStorage:', bancosArray);
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
  }, [empresaId]); // Remover cargarConfiguraciones de las dependencias

  return {
    ciudades,
    bancos,
    loading,
    error,
    refetch
  };
};
