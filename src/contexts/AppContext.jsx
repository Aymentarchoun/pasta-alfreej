import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [activeScreen, setActiveScreen] = useState('menu');
  const [selectedBranch, setSelectedBranch] = useState(null);

  return (
    <AppContext.Provider value={{ cartOpen, setCartOpen, activeScreen, setActiveScreen, selectedBranch, setSelectedBranch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
