import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ApiProvider = 'gemini' | 'openai';

interface SettingsContextType {
  apiProvider: ApiProvider;
  setApiProvider: (provider: ApiProvider) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiProvider, setApiProviderInternal] = useState<ApiProvider>('gemini');

  useEffect(() => {
    try {
      const storedProvider = localStorage.getItem('ai_apiProvider') as ApiProvider;
      if (storedProvider && ['gemini', 'openai'].includes(storedProvider)) {
        setApiProviderInternal(storedProvider);
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage", error);
    }
  }, []);

  const setApiProvider = (provider: ApiProvider) => {
    try {
      localStorage.setItem('ai_apiProvider', provider);
      setApiProviderInternal(provider);
    } catch (error) {
      console.error("Failed to save API provider to localStorage", error);
    }
  };

  return (
    <SettingsContext.Provider value={{ apiProvider, setApiProvider }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
