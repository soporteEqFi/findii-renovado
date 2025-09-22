import React from 'react';
import { useEditModal } from '../contexts/EditModalContext';
import { DynamicEditModal } from './customers/DynamicEditModal';

export const GlobalEditModal: React.FC = () => {
  const { isOpen, solicitanteId, title, closeModal, onSaved } = useEditModal();

  return (
    <DynamicEditModal
      open={isOpen}
      solicitanteId={solicitanteId}
      title={title}
      onClose={closeModal}
      onSaved={() => {
        onSaved?.();
        closeModal();
      }}
    />
  );
};
