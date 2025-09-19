// Sistema global simple para configuraciones
// Una sola carga, datos compartidos entre todos los componentes

import { buildApiUrl } from '../config/constants';

// Variables globales para evitar múltiples cargas
let configuracionesCargadas = false;
let ciudadesGlobales: string[] = [];
let bancosGlobales: string[] = [];
let cargandoGlobal = false;
let ultimaCargaTimestamp = 0;

// Tiempo de vida del cache en milisegundos (5 minutos)
const CACHE_LIFETIME = 5 * 60 * 1000;

// Sistema de eventos para notificar cambios
type ConfiguracionesListener = (ciudades: string[], bancos: string[]) => void;
const listeners: ConfiguracionesListener[] = [];

const notifyListeners = () => {
  listeners.forEach(listener => listener(ciudadesGlobales, bancosGlobales));
};

// Función para verificar si el cache está expirado
const isCacheExpired = (): boolean => {
  if (!configuracionesCargadas) return true;
  const now = Date.now();
  const timeSinceLastLoad = now - ultimaCargaTimestamp;
  return timeSinceLastLoad > CACHE_LIFETIME;
};

// Función para obtener datos (inmediato si ya están cargados y no expirados)
export const getConfiguracionesLocales = (): { ciudades: string[], bancos: string[] } => {
  return { ciudades: ciudadesGlobales, bancos: bancosGlobales };
};

// Función para cargar datos desde la API
export const cargarConfiguracionesDesdeAPI = async (empresaId: number, forzarRecarga: boolean = false): Promise<{ ciudades: string[], bancos: string[] }> => {
  const cacheExpired = isCacheExpired();

  // Si ya se están cargando, no hacer nada
  if (cargandoGlobal) {
    return { ciudades: ciudadesGlobales, bancos: bancosGlobales };
  }

  // Si ya están cargadas, no están expiradas y no se fuerza recarga, no hacer nada
  if (configuracionesCargadas && !cacheExpired && !forzarRecarga) {
    return { ciudades: ciudadesGlobales, bancos: bancosGlobales };
  }

  // Si el cache expiró o se fuerza recarga, limpiar cache
  if (cacheExpired || forzarRecarga) {
    configuracionesCargadas = false;
    ciudadesGlobales = [];
    bancosGlobales = [];
  }

  cargandoGlobal = true;

  try {
    // Obtener ciudades
    const ciudadesResponse = await fetch(buildApiUrl(`/configuraciones/ciudades?empresa_id=${empresaId}`), {
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': localStorage.getItem('user_id') || '1',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });

    if (ciudadesResponse.ok) {
      const data = await ciudadesResponse.json();
      if (data.ok && data.data && data.data.valores && Array.isArray(data.data.valores)) {
        ciudadesGlobales = data.data.valores;
      }
    }
  } catch (error) {
    console.error('Error obteniendo ciudades:', error);
  }

  try {
    // Obtener bancos
    const bancosResponse = await fetch(buildApiUrl(`/configuraciones/bancos?empresa_id=${empresaId}`), {
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': localStorage.getItem('user_id') || '1',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });

    if (bancosResponse.ok) {
      const data = await bancosResponse.json();
      if (data.ok && data.data && data.data.valores && Array.isArray(data.data.valores)) {
        bancosGlobales = data.data.valores;
      }
    }
  } catch (error) {
    console.error('Error obteniendo bancos:', error);
  }

  configuracionesCargadas = true;
  ultimaCargaTimestamp = Date.now();
  cargandoGlobal = false;

  // Notificar a todos los listeners
  notifyListeners();

  return { ciudades: ciudadesGlobales, bancos: bancosGlobales };
};

// Función para suscribirse a cambios en las configuraciones
export const subscribeToConfiguraciones = (listener: ConfiguracionesListener): (() => void) => {
  listeners.push(listener);

  // Retornar función de desuscripción
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};

// Función para refrescar configuraciones (forzar recarga)
export const refrescarConfiguraciones = async (empresaId: number): Promise<{ ciudades: string[], bancos: string[] }> => {
  return cargarConfiguracionesDesdeAPI(empresaId, true);
};

// Función global para limpiar cache desde la consola
(window as any).limpiarCacheConfiguraciones = () => {
  configuracionesCargadas = false;
  ciudadesGlobales = [];
  bancosGlobales = [];
  cargandoGlobal = false;
  ultimaCargaTimestamp = 0;
};

// Función global para verificar estado del cache
(window as any).estadoCacheConfiguraciones = () => {
  const expired = isCacheExpired();
  const timeSinceLastLoad = Date.now() - ultimaCargaTimestamp;
  return {
    cargadas: configuracionesCargadas,
    expirado: expired,
    tiempoDesdeUltimaCarga: timeSinceLastLoad,
    tiempoRestante: expired ? 0 : CACHE_LIFETIME - timeSinceLastLoad,
    ciudades: ciudadesGlobales.length,
    bancos: bancosGlobales.length
  };
};

// Función global para refrescar configuraciones desde la consola
(window as any).refrescarConfiguraciones = async (empresaId: number = 1) => {
  try {
    const resultado = await refrescarConfiguraciones(empresaId);
    return resultado;
  } catch (error) {
    console.error('Error refrescando configuraciones:', error);
  }
};
