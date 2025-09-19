import { useState, useEffect } from 'react';
import { configuracionesService } from '../services/configuracionesService';

interface UseConfiguracionesReturn {
  ciudades: string[];
  bancos: string[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Cache global - UNA SOLA VEZ
let datosCargados = false;
let cacheCiudades: string[] = [];
let cacheBancos: string[] = [];

export const useConfiguraciones = (empresaId?: string | number): UseConfiguracionesReturn => {
  const [ciudades, setCiudades] = useState<string[]>(cacheCiudades);
  const [bancos, setBancos] = useState<string[]>(cacheBancos);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!empresaId) return;

    // Si ya se cargaron los datos, no hacer nada
    if (datosCargados) {
      setCiudades(cacheCiudades);
      setBancos(cacheBancos);
      return;
    }

    setLoading(true);
    datosCargados = true; // Marcar como cargando

    const cargarDatos = async () => {
      try {
        const empresaIdNumber = typeof empresaId === 'string' ? parseInt(empresaId, 10) : empresaId;

        const [ciudadesData, bancosData] = await Promise.all([
          configuracionesService.obtenerCiudades(empresaIdNumber),
          configuracionesService.obtenerBancos(empresaIdNumber)
        ]);

        // Extraer valores
        let ciudadesArray = Array.isArray(ciudadesData) ? ciudadesData : ((ciudadesData as any)?.valores || []);
        let bancosArray = Array.isArray(bancosData) ? bancosData : ((bancosData as any)?.valores || []);

        // Filtrar primer elemento
        if (ciudadesArray.length > 0 && ciudadesArray[0] === 'ciudades') {
          ciudadesArray = ciudadesArray.slice(1);
        }
        if (bancosArray.length > 0 && bancosArray[0] === 'bancos') {
          bancosArray = bancosArray.slice(1);
        }

        // Guardar en cache global
        cacheCiudades = ciudadesArray;
        cacheBancos = bancosArray;

        setCiudades(ciudadesArray);
        setBancos(bancosArray);

      } catch (err: any) {
        console.error('❌ Error:', err);
        setError(err.message || 'Error');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [empresaId]);

  const refetch = () => {
    datosCargados = false;
    cacheCiudades = [];
    cacheBancos = [];
  };

  return {
    ciudades,
    bancos,
    loading,
    error,
    refetch
  };
};