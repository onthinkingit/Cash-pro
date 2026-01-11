
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Language, AppSettings, Transaction, PlayerLevel, DepositRequest, WithdrawalRequest, Notification } from '../types';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  allUsers: User[];
  setAllUsers: React.Dispatch<React.SetStateAction<User[]>>;
  updateUserBalance: (userId: string, cashAdd: number, bonusAdd: number) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  depositRequests: DepositRequest[];
  setDepositRequests: React.Dispatch<React.SetStateAction<DepositRequest[]>>;
  withdrawalRequests: WithdrawalRequest[];
  setWithdrawalRequests: React.Dispatch<React.SetStateAction<WithdrawalRequest[]>>;
  notifications: Notification[];
  addNotification: (userId: string, message: string) => void;
  markNotificationsRead: (userId: string) => void;
  isLoggedIn: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_SETTINGS: AppSettings = {
  telegramLink: 'https://t.me/ludocashpro',
  minDeposit: 10,
  minWithdraw: 10, // Updated to 10 as per requirement
  commissionRate: 0.06, // Default to 6% as per requirement
  bkashNumber: '01XXXXXXXXX',
  bkashType: 'Personal',
  nagadNumber: '01XXXXXXXXX',
  nagadType: 'Personal',
  matchFees: [12, 20, 55, 108, 220, 500],
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ludo_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('ludo_all_users');
    return saved ? JSON.parse(saved) : [];
  });

  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('ludo_lang');
    if (saved) return saved as Language;
    return navigator.language.startsWith('bn') ? 'bn' : 'en';
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('ludo_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('ludo_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>(() => {
    const saved = localStorage.getItem('ludo_deposits');
    return saved ? JSON.parse(saved) : [];
  });

  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>(() => {
    const saved = localStorage.getItem('ludo_withdrawals');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('ludo_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('ludo_user', JSON.stringify(user));
      setAllUsers(prev => {
        const index = prev.findIndex(u => u.id === user.id);
        if (index === -1) return [...prev, user];
        const updated = [...prev];
        updated[index] = user;
        return updated;
      });
    } else {
      localStorage.removeItem('ludo_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('ludo_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => localStorage.setItem('ludo_lang', lang), [lang]);
  useEffect(() => localStorage.setItem('ludo_settings', JSON.stringify(settings)), [settings]);
  useEffect(() => localStorage.setItem('ludo_transactions', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('ludo_deposits', JSON.stringify(depositRequests)), [depositRequests]);
  useEffect(() => localStorage.setItem('ludo_withdrawals', JSON.stringify(withdrawalRequests)), [withdrawalRequests]);
  useEffect(() => localStorage.setItem('ludo_notifications', JSON.stringify(notifications)), [notifications]);

  const addTransaction = (tx: Transaction) => {
    setTransactions(prev => [tx, ...prev]);
  };

  const addNotification = (userId: string, message: string) => {
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      message,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationsRead = (userId: string) => {
    setNotifications(prev => prev.map(n => n.userId === userId ? { ...n, isRead: true } : n));
  };

  const updateUserBalance = (userId: string, cashAdd: number, bonusAdd: number) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updated = {
          ...u,
          cashBalance: u.cashBalance + cashAdd,
          bonusBalance: u.bonusBalance + bonusAdd
        };
        if (user && user.id === userId) {
          setUser(updated);
        }
        return updated;
      }
      return u;
    }));
  };

  return (
    <AppContext.Provider value={{
      user, setUser,
      allUsers, setAllUsers,
      updateUserBalance,
      lang, setLang,
      settings, setSettings,
      transactions, addTransaction,
      depositRequests, setDepositRequests,
      withdrawalRequests, setWithdrawalRequests,
      notifications, addNotification, markNotificationsRead,
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
