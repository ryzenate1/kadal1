'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type UiContextType = {
  isNavVisible: boolean;
  setNavVisibility: (isVisible: boolean) => void;
};

const UiContext = createContext<UiContextType | undefined>(undefined);

export function UiProvider({ children }: { children: ReactNode }) {
  const [isNavVisible, setIsNavVisible] = useState(true);

  const setNavVisibility = (isVisible: boolean) => {
    setIsNavVisible(isVisible);
  };

  return (
    <UiContext.Provider value={{ isNavVisible, setNavVisibility }}>
      {children}
    </UiContext.Provider>
  );
}

export function useUi() {
  const context = useContext(UiContext);
  if (context === undefined) {
    throw new Error('useUi must be used within a UiProvider');
  }
  return context;
}
