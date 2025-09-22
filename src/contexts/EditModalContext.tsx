import React, { createContext, useContext, useState, ReactNode } from 'react';

interface EditModalContextType {
  isOpen: boolean;
  solicitanteId: number | null;
  title: string;
  openModal: (solicitanteId: number, title?: string) => void;
  closeModal: () => void;
  onSaved?: () => void;
  setOnSaved: (callback?: () => void) => void;
}

const EditModalContext = createContext<EditModalContextType | undefined>(undefined);

interface EditModalProviderProps {
  children: ReactNode;
}

export const EditModalProvider: React.FC<EditModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [solicitanteId, setSolicitanteId] = useState<number | null>(null);
  const [title, setTitle] = useState('Editar Registro');
  const [onSaved, setOnSaved] = useState<(() => void) | undefined>();

  const openModal = (id: number, modalTitle: string = 'Editar Registro') => {
    setSolicitanteId(id);
    setTitle(modalTitle);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSolicitanteId(null);
    setTitle('Editar Registro');
    setOnSaved(undefined);
  };

  return (
    <EditModalContext.Provider
      value={{
        isOpen,
        solicitanteId,
        title,
        openModal,
        closeModal,
        onSaved,
        setOnSaved,
      }}
    >
      {children}
    </EditModalContext.Provider>
  );
};

export const useEditModal = () => {
  const context = useContext(EditModalContext);
  if (context === undefined) {
    throw new Error('useEditModal must be used within an EditModalProvider');
  }
  return context;
};
