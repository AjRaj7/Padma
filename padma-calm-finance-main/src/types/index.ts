// Padma Core Data Models - Complete type definitions for mindful finance

export interface AppState {
  // User Profile
  user: {
    monthlyIncome: number;
    currency: string; // "₹"
    setupComplete: boolean;
    onboardingStep: number;
  };
  
  // Financial Streams (Budget Categories)
  streams: Stream[];
  
  // Transaction Records
  transactions: Transaction[];
  
  // Recurring Templates
  templates: Template[];
  
  // Monthly Archives
  archives: Record<string, MonthlyArchive>; // "2025-01" format
  
  // Analytics Cache
  analytics: AnalyticsData;
  
  // App Metadata
  meta: {
    currentMonth: string;
    lastSavedDate: string;
    version: string;
  };
}

export interface Stream {
  id: string; // UUID
  name: string;
  originalAmount: number;
  isGoal: boolean; // true for savings goals
  color?: string; // optional custom color
  icon?: string; // optional emoji icon
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  streamId: string;
  amount: number;
  note: string;
  tags: string[];
  location?: {
    name: string;
    coordinates?: [number, number];
  };
  paymentMethod: 'cash' | 'card' | 'upi' | 'other';
  mood?: 'satisfied' | 'regret' | 'necessary' | 'joy';
  isRecurring: boolean;
  templateId?: string;
  timestamp: string;
  updatedAt?: string;
}

export interface Template {
  id: string;
  name: string;
  amount: number;
  streamId: string;
  note: string;
  tags: string[];
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  isActive: boolean;
  usageCount: number;
  lastUsed: string;
}

export interface MonthlyArchive {
  month: string; // "2025-01"
  totalIncome: number;
  totalSpent: number;
  streamsSnapshot: Stream[];
  transactionCount: number;
  topInsights: string[];
}

export interface AnalyticsData {
  monthlyTrends: {
    month: string;
    totalSpent: number;
    savingsRate: number;
    topStreams: { streamId: string; amount: number }[];
  }[];
  insights: {
    id: string;
    type: 'pattern' | 'achievement' | 'suggestion';
    message: string;
    priority: 'high' | 'medium' | 'low';
    timestamp: string;
  }[];
  lastCalculated: string;
}

// Action types for state management
export type AppAction = 
  | { type: 'SET_INCOME'; payload: number }
  | { type: 'ADD_STREAM'; payload: Stream }
  | { type: 'UPDATE_STREAM'; payload: { id: string; updates: Partial<Stream> } }
  | { type: 'DELETE_STREAM'; payload: string }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: { id: string; updates: Partial<Transaction> } }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'ADD_TEMPLATE'; payload: Template }
  | { type: 'ARCHIVE_MONTH'; payload: string }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'RESET_APP' }
  | { type: 'LOAD_STATE'; payload: AppState };

// Component Props Interfaces
export interface StreamCardProps {
  stream: Stream;
  balance: number;
  progress: number;
  onTap: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export interface TransactionCardProps {
  transaction: Transaction;
  stream: Stream;
  onEdit: () => void;
  onDelete: () => void;
  showStream?: boolean;
}

// Utility types
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'other';
export type TransactionMood = 'satisfied' | 'regret' | 'necessary' | 'joy';
export type TemplateFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';

// Error handling
export interface AppError {
  code: string;
  message: string;
  context?: Record<string, any>;
}