import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ApiProvider = 'gemini' | 'openai';

interface SettingsContextType {
  apiProvider: ApiProvider;
  setApiProvider: (provider: ApiProvider) => void;
  geminiKey: string;
  setGeminiKey: (key: string) => void;
  openaiKey: string;
  setOpenaiKey: (key: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiProvider, setApiProviderInternal] = useState<ApiProvider>('gemini');
  const [geminiKey, setGeminiKeyInternal] = useState<string>('');
  const [openaiKey, setOpenaiKeyInternal] = useState<string>('');

  useEffect(() => {
    try {
      const storedProvider = localStorage.getItem('ai_apiProvider') as ApiProvider;
      if (storedProvider && ['gemini', 'openai'].includes(storedProvider)) {
        setApiProviderInternal(storedProvider);
      }
      
      const storedGeminiKey = localStorage.getItem('ai_geminiKey');
      if (storedGeminiKey) setGeminiKeyInternal(storedGeminiKey);
      
      const storedOpenaiKey = localStorage.getItem('ai_openaiKey');
      if (storedOpenaiKey) setOpenaiKeyInternal(storedOpenaiKey);
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

  const setGeminiKey = (key: string) => {
    try {
      localStorage.setItem('ai_geminiKey', key);
      setGeminiKeyInternal(key);
    } catch (error) {
      console.error("Failed to save Gemini key to localStorage", error);
    }
  };

  const setOpenaiKey = (key: string) => {
    try {
      localStorage.setItem('ai_openaiKey', key);
      setOpenaiKeyInternal(key);
    } catch (error) {
      console.error("Failed to save OpenAI key to localStorage", error);
    }
  };

  return (
    <SettingsContext.Provider value={{ 
      apiProvider, 
      setApiProvider, 
      geminiKey, 
      setGeminiKey, 
      openaiKey, 
      setOpenaiKey 
    }}>
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
