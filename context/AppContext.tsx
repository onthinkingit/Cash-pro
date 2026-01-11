
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Language, AppSettings, Transaction, PlayerLevel } from '../types';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  isLoggedIn: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_SETTINGS: AppSettings = {
  telegramLink: 'https://t.me/ludocashpro',
  minDeposit: 10,
  minWithdraw: 10,
  commissionRate: 0.06,
  bkashNumber: '01700000000',
  nagadNumber: '01800000000',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ludo_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('ludo_lang');
    return (saved as Language) || 'en';
  });
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('ludo_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('ludo_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (user) localStorage.setItem('ludo_user', JSON.stringify(user));
    else localStorage.removeItem('ludo_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('ludo_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('ludo_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('ludo_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (tx: Transaction) => {
    setTransactions(prev => [tx, ...prev]);
  };

  return (
    <AppContext.Provider value={{
      user, setUser,
      lang, setLang,
      settings, setSettings,
      transactions, addTransaction,
      isLoggedIn: !!user
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
