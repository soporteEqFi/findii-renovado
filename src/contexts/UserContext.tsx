import React, { createContext, useContext } from 'react';

interface UserContextType {
  cedula: string;
  // otros datos del usuario...
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser debe ser usado dentro de un UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Aquí obtienes los datos del usuario logueado
  const userData = {
    cedula: '123456789', // Este valor vendría de tu sistema de autenticación
    // otros datos...
  };

  return (
    <UserContext.Provider value={userData}>
      {children}
    </UserContext.Provider>
  );
}; 