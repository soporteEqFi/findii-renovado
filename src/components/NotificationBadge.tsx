import React, { useEffect, useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { Bell } from 'lucide-react';
import { NotificationPanel } from './NotificationPanel';
import { Notification } from '../types/notification';

interface NotificationBadgeProps {
  empresaId: number;
  onEditNotification?: (notification: Notification) => void;
  loading?: boolean;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  empresaId, 
  onEditNotification,
  loading = false
}) => {
  const { notifications, loadPendingNotifications } = useNotifications(empresaId);
  const [pendingCount, setPendingCount] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    loadPendingNotifications();
  }, [loadPendingNotifications]);

  useEffect(() => {
    const pending = notifications.filter(n => n.estado === 'pendiente').length;
    setPendingCount(pending);
  }, [notifications]);

  const handleBellClick = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  return (
    <>
      <div className="relative inline-block">
        <button
          onClick={handleBellClick}
          disabled={loading}
          className="relative p-2 hover:bg-gray-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          title={loading ? "Cargando..." : "Ver notificaciones"}
        >
          <Bell className={`w-5 h-5 ${pendingCount > 0 ? 'text-yellow-400' : 'text-gray-400'}`} />
          {pendingCount > 0 && !loading && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
              {pendingCount > 99 ? '99+' : pendingCount}
            </span>
          )}
          {loading && (
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              ...
            </span>
          )}
        </button>
      </div>

      <NotificationPanel
        empresaId={empresaId}
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        onEditNotification={onEditNotification}
      />
    </>
  );
};
