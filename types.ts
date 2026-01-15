
export type Language = 'en' | 'bn';

export type PlayerColor = 'RED' | 'GREEN' | 'YELLOW' | 'BLUE';

export interface Token {
  id: number;
  color: PlayerColor;
  position: number; // -1 (Base), 0-51 (Main Path), 52-56 (Home Stretch), 57 (Finished)
  stackOffset: number; // For visual stacking when multiple tokens are on one spot
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderColor: PlayerColor;
  text: string;
  timestamp: string;
}

export interface Player {
  id: string;
  username: string;
  avatar?: string;
  level?: PlayerLevel;
  color: PlayerColor;
  tokens: Token[];
  isBot: boolean;
  isActive: boolean;
  missedTurns: number; // New property to track missed turns
}

export interface GameState {
  id: string;
  players: Player[];
  currentTurn: PlayerColor;
  diceValue: number | null;
  status: 'waiting' | 'rolling' | 'moving' | 'ended';
  history: string[];
  winner: PlayerColor | null;
  rollExtra: boolean;
  chatMessages: ChatMessage[]; // New property for in-game chat
}

export enum PlayerLevel {
  SILVER = 'Silver',
  GOLDEN = 'Golden',
  PLATINUM = 'Platinum',
  SUPERMAN = 'Super Man'
}

export interface User {
  id: string;
  phone: string;
  username: string;
  avatar?: string;
  customId: string;
  cashBalance: number; // In-game coins
  bonusBalance: number;
  referralCode: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  level: PlayerLevel;
  status: 'active' | 'banned';
  isAdmin?: boolean;
  lastWithdrawal?: string;
  referralCount: number;
  totalReferralBonus: number;
  referrals: string[];
}

export interface AppSettings {
  telegramLink: string;
  minDeposit: number;
  minWithdraw: number;
  commissionRate: number;
  matchFees: number[];
  bkashNumber: string;
  bkashType: 'Personal' | 'Agent';
  nagadNumber: string;
  nagadType: 'Personal' | 'Agent';
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdraw' | 'match_fee' | 'win' | 'referral';
  amount: number;
  bonusUsed: number;
  timestamp: string;
  status: 'pending' | 'completed' | 'rejected';
  txId?: string;
  method?: 'bkash' | 'nagad';
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
  screenshot?: string;
  status: 'pending' | 'approved' | 'rejected';
  bonusApplied: number;
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
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}
