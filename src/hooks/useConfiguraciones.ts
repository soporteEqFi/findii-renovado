import { useState, useEffect } from 'react';
import { getConfiguracionesLocales, cargarConfiguracionesDesdeAPI, subscribeToConfiguraciones, refrescarConfiguraciones } from '../data/configuraciones';

interface UseConfiguracionesReturn {
  ciudades: string[];
  bancos: string[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  refrescar: () => Promise<void>;
}

export const useConfiguraciones = (empresaId?: string | number): UseConfiguracionesReturn => {
  // Cargar datos locales INMEDIATAMENTE
  const datosLocales = getConfiguracionesLocales();
  const [ciudades, setCiudades] = useState<string[]>(datosLocales.ciudades);
  const [bancos, setBancos] = useState<string[]>(datosLocales.bancos);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!empresaId) return;

    // Cargar desde API (automáticamente si el cache está expirado)
    const empresaIdNumber = typeof empresaId === 'string' ? parseInt(empresaId, 10) : empresaId;

    setLoading(true);
    cargarConfiguracionesDesdeAPI(empresaIdNumber).then((nuevosDatos) => {
      setCiudades(nuevosDatos.ciudades);
      setBancos(nuevosDatos.bancos);
      setLoading(false);
    }).catch((err) => {
      setError(err.message);
      setLoading(false);
      console.error('Error en useConfiguraciones:', err);
    });
  }, [empresaId]); // Solo depende de empresaId

  // Efecto para suscribirse a cambios en las configuraciones globales
  useEffect(() => {
    const unsubscribe = subscribeToConfiguraciones((nuevasCiudades, nuevosBancos) => {
      setCiudades(nuevasCiudades);
      setBancos(nuevosBancos);
    });

    // Limpiar suscripción al desmontar
    return unsubscribe;
  }, []);

  const refetch = () => {
    if (empresaId) {
      const empresaIdNumber = typeof empresaId === 'string' ? parseInt(empresaId, 10) : empresaId;
      cargarConfiguracionesDesdeAPI(empresaIdNumber);
    }
  };

  const refrescar = async () => {
    if (empresaId) {
      const empresaIdNumber = typeof empresaId === 'string' ? parseInt(empresaId, 10) : empresaId;
      setLoading(true);
      try {
        await refrescarConfiguraciones(empresaIdNumber);
      } catch (error) {
        console.error('Error refrescando configuraciones:', error);
        setError('Error al refrescar configuraciones');
      } finally {
        setLoading(false);
      }
    }
  };

  return {
    ciudades,
    bancos,
    loading,
    error,
    refetch,
    refrescar
  };
};