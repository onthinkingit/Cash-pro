
export type Language = 'en' | 'bn';

export enum PlayerLevel {
  SILVER = 'Silver',
  PLUTONIUM = 'Plutonium',
  GOLDEN = 'Golden',
  SUPERMAN = 'Super Man'
}

export interface User {
  id: string;
  phone: string;
  username: string;
  cashBalance: number;
  bonusBalance: number;
  referralCode: string;
  referredBy?: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  level: PlayerLevel;
  referralCount: number;
  totalReferralBonus: number;
  isAdmin?: boolean;
  status: 'active' | 'banned';
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdraw' | 'match_fee' | 'win' | 'referral_bonus';
  amount: number;
  bonusUsed: number;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface AppSettings {
  telegramLink: string;
  minDeposit: number;
  minWithdraw: number;
  commissionRate: number; // e.g. 0.06
  bkashNumber: string;
  nagadNumber: string;
}

export interface Match {
  id: string;
  players: string[]; // User IDs
  entryFee: number;
  prizePool: number;
  mode: '2P' | '4P';
  status: 'waiting' | 'playing' | 'completed';
  winnerId?: string;
  startTime: string;
}
