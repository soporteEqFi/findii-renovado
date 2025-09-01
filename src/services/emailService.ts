import { buildApiUrl } from '../config/constants';

export interface BankChangeEmailData {
  customerName: string;
  customerDocument: string;
  previousBank: string;
  newBank: string;
  solicitudId: number;
  changedBy: string;
  changeDate: string;
}

class EmailService {
  /**
   * Envía notificación por email cuando cambia el banco de un cliente
   */
  async sendBankChangeNotification(emailData: BankChangeEmailData, empresaId: number): Promise<boolean> {
    try {
      console.log('📧 Enviando notificación de cambio de banco:', emailData);

      const payload = {
        tipo: 'cambio_banco',
        destinatario: emailData.newBank, // El banco de destino
        datos: {
          nombre_cliente: emailData.customerName,
          documento_cliente: emailData.customerDocument,
          banco_anterior: emailData.previousBank,
          banco_nuevo: emailData.newBank,
          solicitud_id: emailData.solicitudId,
          modificado_por: emailData.changedBy,
          fecha_cambio: emailData.changeDate
        }
      };

      const response = await fetch(buildApiUrl(`/notificaciones/email?empresa_id=${empresaId}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': localStorage.getItem('user_id') || '1',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Email de cambio de banco enviado exitosamente:', result);
      return true;

    } catch (error) {
      console.error('❌ Error al enviar email de cambio de banco:', error);
      // No lanzar error para no interrumpir el flujo principal
      return false;
    }
  }

  /**
   * Crea una notificación interna del cambio de banco
   */
  async createBankChangeNotification(emailData: BankChangeEmailData, empresaId: number): Promise<boolean> {
    try {
      const notificationData = {
        tipo: 'cambio_banco',
        titulo: 'Cambio de Banco en Solicitud',
        mensaje: `El banco de la solicitud #${emailData.solicitudId} ha cambiado de "${emailData.previousBank}" a "${emailData.newBank}"`,
        solicitud_id: emailData.solicitudId,
        datos_adicionales: {
          cliente: emailData.customerName,
          documento: emailData.customerDocument,
          banco_anterior: emailData.previousBank,
          banco_nuevo: emailData.newBank,
          modificado_por: emailData.changedBy,
          fecha_cambio: emailData.changeDate
        },
        prioridad: 'media',
        estado: 'pendiente'
      };

      const response = await fetch(buildApiUrl(`/notificaciones?empresa_id=${empresaId}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': localStorage.getItem('user_id') || '1',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(notificationData)
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      console.log('✅ Notificación interna de cambio de banco creada');
      return true;

    } catch (error) {
      console.error('❌ Error al crear notificación interna:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
