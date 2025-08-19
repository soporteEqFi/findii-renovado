import { useState, useCallback } from 'react';
import { Customer } from '../types/customer';
import { buildApiUrl, API_CONFIG } from '../config/constants';

interface ApiResponse {
  data: any[];
  message?: string;
}

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);

  const loadCustomers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const empresaId = localStorage.getItem('empresa_id') || '1';
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DASHBOARD_TABLA}?empresa_id=${empresaId}`;
      console.log('🌐 Llamando endpoint:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch customers');
      }

      const responseData: ApiResponse = await response.json();
      console.log('🔍 === DIAGNÓSTICO BACKEND ===');
      console.log('📦 API Response raw:', responseData);
      console.log('📊 Primer cliente (si existe):', responseData.data?.[0]);
      console.log('📋 Estructura del primer cliente:');
      if (responseData.data?.[0]) {
        const cliente = responseData.data[0];
        console.log('  - solicitante:', cliente.solicitante);
        console.log('  - ubicacion:', cliente.ubicacion);
        console.log('  - actividad_economica:', cliente.actividad_economica);
        console.log('  - informacion_financiera:', cliente.informacion_financiera);
        console.log('  - solicitud:', cliente.solicitud);
      }
      console.log('🔍 === FIN DIAGNÓSTICO BACKEND ===');

      // Handle the response structure
      if (!responseData.data || !Array.isArray(responseData.data)) {
        throw new Error('Invalid response format: missing data array');
      }

      // Map the API response to the Customer type
      const mappedCustomers = responseData.data.map((item, index) => {
        console.log(`🔍 Mapeando cliente ${index + 1}:`, item);

        const s = item.solicitante || {};
        const ue = item.ubicacion || {};
        const act = item.actividad_economica || {};
        const fin = item.informacion_financiera || {};
        const sol = item.solicitud || {};

        console.log(`📊 Datos del cliente ${index + 1}:`);
        console.log('  - Solicitante:', s);
        console.log('  - Ubicación:', ue);
        console.log('  - Actividad Económica:', act);
        console.log('  - Información Financiera:', fin);
        console.log('  - Solicitud:', sol);

        // Build full name from available name fields
        const fullName = [
          s.nombres || '',
          s.primer_apellido || '',
          s.segundo_apellido || ''
        ].filter(Boolean).join(' ');

        return {
          id: s.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
          id_solicitante: s.id,
          solicitante_id: s.id,
          nombre: fullName || 'Sin nombre',
          nombre_completo: fullName || 'Sin nombre',
          correo: s.correo || '',
          correo_electronico: s.correo || '',
          numero_documento: s.numero_documento || '',
          tipo_documento: s.tipo_identificacion || '',
          fecha_nacimiento: s.fecha_nacimiento || '',
          genero: s.genero || '',
          numero_celular: ue.detalle_direccion?.celular || ue.celular || '',
          ciudad_gestion: ue.ciudad_residencia || ue.ciudad || '',
          direccion: ue.detalle_direccion?.direccion_residencia || ue.direccion || '',
          direccion_residencia: ue.detalle_direccion?.direccion_residencia || ue.direccion || '',
          tipo_vivienda: ue.detalle_direccion?.tipo_vivienda || ue.tipo_vivienda || '',
          barrio: ue.barrio || '',
          departamento: ue.departamento_residencia || ue.departamento || '',
          estrato: ue.estrato || '',
          estado_civil: s.info_extra?.estado_civil || '',
          personas_a_cargo: String(s.info_extra?.personas_a_cargo || 0),
          nivel_estudio: s.info_extra?.nivel_estudio || '',
          profesion: s.info_extra?.profesion || '',
          tipo_contrato: act.detalle_actividad?.tipo_contrato || act.tipo_contrato || '',
          tipo_de_contrato: act.detalle_actividad?.tipo_contrato || act.tipo_contrato || '',
          actividad_economica: act.sector_economico || act.actividad_economica || '',
          empresa_labora: act.detalle_actividad?.empresa || act.empresa || '',
          direccion_empresa: act.detalle_actividad?.direccion_empresa || act.direccion_empresa || '',
          telefono_empresa: act.detalle_actividad?.telefono_empresa || act.telefono_empresa || '',
          fecha_vinculacion: act.detalle_actividad?.fecha_ingreso || act.fecha_ingreso || '',
          cargo_actual: act.cargo_actual || '',
          banco: sol.banco || '',
          tipo_credito: sol.tipo_credito || '',
          tipo_de_credito: sol.tipo_credito || '',
          valor_inmueble: fin.valor_inmueble || 0,
          total_egresos: fin.total_egresos_mensuales || fin.total_egresos || 0,
          egresos: fin.total_egresos_mensuales || fin.total_egresos || 0,
          total_activos: fin.total_activos || 0,
          total_pasivos: fin.total_pasivos || 0,
          plazo_meses: fin.plazo_meses || '',
          ingresos: fin.total_ingresos_mensuales || fin.ingresos || 0,
          estado: sol.estado || 'Pendiente',
          created_at: sol.created_at || new Date().toISOString(),
          observacion: sol.observacion || '',
          archivos: '',
          asesor_usuario: '',
          informacion_producto: '',
          cuota_inicial: 0,
          porcentaje_financiar: 0,
          segundo_titular: ''
        } as Customer;

        console.log(`✅ Cliente ${index + 1} mapeado:`, {
          nombre_completo: fullName,
          correo_electronico: s.correo,
          numero_celular: ue.detalle_direccion?.celular || ue.celular,
          tipo_credito: sol.tipo_credito,
          banco: sol.banco,
          estado: sol.estado,
          ingresos: fin.total_ingresos_mensuales || fin.ingresos,
          valor_inmueble: fin.valor_inmueble,
          cuota_inicial: 0
        });
      });

      setCustomers(mappedCustomers);
      setTotalRecords(mappedCustomers.length);
      setError(null);
    } catch (error) {
      console.error('Error loading customers:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar los clientes');
      setCustomers([]);
      setTotalRecords(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCustomer = async (customer: Customer) => {
    try {
      setIsLoading(true);
      setError(null);

      // Get advisor ID
      const cedula = localStorage.getItem('cedula') || '';
      if (!cedula) {
        throw new Error('No se encontró la información del asesor');
      }

      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.EDIT_RECORD), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          ...customer,
          cedula: cedula
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar el cliente');
      }

      // Refresh the customers list
      await loadCustomers();
      return true;
    } catch (error) {
      console.error('Error updating customer:', error);
      setError(error instanceof Error ? error.message : 'Error al actualizar el cliente');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCustomer = async (id: string | number) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DELETE_CUSTOMER}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al eliminar el cliente');
      }

      // Refresh the customers list
      await loadCustomers();
      return true;
    } catch (error) {
      console.error('Error deleting customer:', error);
      setError(error instanceof Error ? error.message : 'Error al eliminar el cliente');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (customer: Customer, newStatus: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EDIT_STATUS}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          id: customer.id,
          estado: newStatus
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar el estado');
      }

      // Update local state
      setCustomers(prev =>
        prev.map(c =>
          c.id === customer.id ? { ...c, estado: newStatus } : c
        )
      );
      return true;
    } catch (error) {
      console.error('Error updating status:', error);
      setError(error instanceof Error ? error.message : 'Error al actualizar el estado');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    customers,
    isLoading,
    error,
    totalRecords,
    loadCustomers,
    updateCustomer,
    deleteCustomer,
    updateStatus
  };
};