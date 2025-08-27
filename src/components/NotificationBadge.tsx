import React, { useEffect, useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { Bell } from 'lucide-react';

interface NotificationBadgeProps {
  empresaId: number;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ empresaId }) => {
  const { notifications, loadPendingNotifications } = useNotifications(empresaId);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    loadPendingNotifications();
  }, [loadPendingNotifications]);

  useEffect(() => {
    const pending = notifications.filter(n => n.estado === 'pendiente').length;
    setPendingCount(pending);
  }, [notifications]);

  if (pendingCount === 0) {
    return null;
  }

  return (
    <div className="relative inline-block">
      <Bell className="w-5 h-5 text-gray-600" />
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
        {pendingCount > 99 ? '99+' : pendingCount}
      </span>
    </div>
  );
};
