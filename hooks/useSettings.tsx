import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ApiProvider = 'gemini' | 'openai';

interface SettingsContextType {
  apiKey: string;
  apiProvider: ApiProvider;
  setApiKey: (key: string) => void;
  setApiProvider: (provider: ApiProvider) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiKey, setApiKeyInternal] = useState<string>('');
  const [apiProvider, setApiProviderInternal] = useState<ApiProvider>('gemini');

  useEffect(() => {
    try {
      const storedKey = localStorage.getItem('ai_apiKey');
      const storedProvider = localStorage.getItem('ai_apiProvider') as ApiProvider;
      if (storedKey) setApiKeyInternal(storedKey);
      if (storedProvider && ['gemini', 'openai'].includes(storedProvider)) {
        setApiProviderInternal(storedProvider);
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage", error);
    }
  }, []);

  const setApiKey = (key: string) => {
    try {
      localStorage.setItem('ai_apiKey', key);
      setApiKeyInternal(key);
    } catch (error) {
      console.error("Failed to save API key to localStorage", error);
    }
  };

  const setApiProvider = (provider: ApiProvider) => {
    try {
      localStorage.setItem('ai_apiProvider', provider);
      setApiProviderInternal(provider);
    } catch (error) {
      console.error("Failed to save API provider to localStorage", error);
    }
  };

  return (
    <SettingsContext.Provider value={{ apiKey, apiProvider, setApiKey, setApiProvider }}>
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
