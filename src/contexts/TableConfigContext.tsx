import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TableConfigContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const TableConfigContext = createContext<TableConfigContextType | undefined>(undefined);

export const useTableConfig = () => {
  const context = useContext(TableConfigContext);
  if (context === undefined) {
    throw new Error('useTableConfig must be used within a TableConfigProvider');
  }
  return context;
};

interface TableConfigProviderProps {
  children: ReactNode;
}

export const TableConfigProvider: React.FC<TableConfigProviderProps> = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <TableConfigContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </TableConfigContext.Provider>
  );
};
