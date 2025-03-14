import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PageContextType {
  isTransitioning: boolean;
  setIsTransitioning: (value: boolean) => void;
  previousPath: string | null;
  setPreviousPath: (value: string | null) => void;
}

const PageContext = createContext<PageContextType | null>(null);

interface PageProviderProps {
  children: ReactNode;
}

export const PageProvider: React.FC<PageProviderProps> = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousPath, setPreviousPath] = useState<string | null>(null);

  const value = {
    isTransitioning,
    setIsTransitioning,
    previousPath,
    setPreviousPath
  };

  return (
    <PageContext.Provider value={value}>
      {children}
    </PageContext.Provider>
  );
};

export const usePage = () => {
  const context = useContext(PageContext);
  
  if (!context) {
    throw new Error('usePage must be used within a PageProvider');
  }
  
  return context;
};