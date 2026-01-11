
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
  avatar?: string;
  customId: string;
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
  lastWithdrawal?: string;
  referrals: string[];
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdraw' | 'match_fee' | 'win' | 'referral_bonus';
  amount: number;
  bonusUsed: number;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  txId?: string;
  method?: 'bkash' | 'nagad';
  accountType?: 'Personal' | 'Agent';
  receiverNumber?: string;
}

export interface DepositRequest {
  id: string;
  userId: string;
  username: string;
  phone: string;
  amount: number;
  method: 'bkash' | 'nagad';
  txId: string;
  screenshot?: string; // Base64
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  bonusApplied?: number;
  timestamp: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  username: string;
  amount: number;
  method: 'bkash' | 'nagad';
  accountType: 'Personal' | 'Agent';
  receiverNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface AppSettings {
  telegramLink: string;
  minDeposit: number;
  minWithdraw: number;
  commissionRate: number;
  bkashNumber: string;
  bkashType: 'Personal' | 'Agent';
  nagadNumber: string;
  nagadType: 'Personal' | 'Agent';
  matchFees: number[];
}

export interface Match {
  id: string;
  players: string[];
  entryFee: number;
  prizePool: number;
  mode: '2P' | '4P';
  status: 'waiting' | 'playing' | 'completed';
  winnerId?: string;
  startTime: string;
}
