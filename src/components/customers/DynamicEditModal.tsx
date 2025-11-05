import React from 'react';
import { X } from 'lucide-react';
import { CustomerFormDinamicoEdit } from './CustomerFormDinamicoEdit';

interface DynamicEditModalProps {
  open: boolean;
  solicitanteId: number | null;
  title?: string;
  onClose: () => void;
  onSaved?: () => void;
}

export const DynamicEditModal: React.FC<DynamicEditModalProps> = ({
  open,
  solicitanteId,
  title = 'Editar Registro',
  onClose,
  onSaved,
}) => {
  if (!open || !solicitanteId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto">
      {/* Backdrop con blur */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Contenedor del modal centrado horizontal, con margen vertical y sin scroll interno */}
      <div className="relative z-10 my-8 w-[90vw] max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-white/10 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h3 className="text-gray-900 dark:text-gray-100 text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido sin scroll interno; el scroll se maneja en la página/overlay */}
        <div className="p-5 bg-white dark:bg-gray-900">
          <CustomerFormDinamicoEdit
            solicitanteId={Number(solicitanteId)}
            onSaved={() => {
              onSaved?.();
              onClose();
            }}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};
