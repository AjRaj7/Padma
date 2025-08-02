// Padma Financial Calculations - Core logic for mindful money management

import { Stream, Transaction, AppState } from '@/types';

// Calculate remaining amount available to spend across all non-goal streams
export const calculateRemainingToSpend = (streams: Stream[], transactions: Transaction[]): number => {
  const spendableStreams = streams.filter(s => !s.isGoal);
  const totalAllocated = spendableStreams.reduce((sum, s) => sum + s.originalAmount, 0);
  
  const totalSpent = transactions
    .filter(t => spendableStreams.some(s => s.id === t.streamId))
    .reduce((sum, t) => sum + t.amount, 0);
    
  return Math.max(0, totalAllocated - totalSpent);
};

// Calculate total savings amount (monthly income - total allocated budget)
export const calculateSavingsAmount = (monthlyIncome: number, streams: Stream[], transactions: Transaction[]): number => {
  // Calculate total allocated budget across all spending streams (excluding Others and Savings)
  const totalAllocatedBudget = streams
    .filter(stream => stream.name !== 'Others' && stream.name !== 'Savings')
    .reduce((sum, stream) => sum + stream.originalAmount, 0);
  
  // Savings = Monthly Income - Total Allocated Budget
  return Math.max(0, monthlyIncome - totalAllocatedBudget);
};

// Calculate remaining balance for a specific stream
export const calculateStreamBalance = (stream: Stream, transactions: Transaction[]): number => {
  const streamTransactions = transactions.filter(t => t.streamId === stream.id);
  const totalSpent = streamTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  if (stream.isGoal) {
    // For savings goals, show how much has been withdrawn (positive balance)
    return totalSpent; // Positive to show withdrawals
  } else {
    // For spending streams, show remaining budget
    return Math.max(0, stream.originalAmount - totalSpent);
  }
};

// Calculate progress percentage for a stream (0-100)
export const calculateStreamProgress = (stream: Stream, transactions: Transaction[]): number => {
  const streamTransactions = transactions.filter(t => t.streamId === stream.id);
  const totalSpent = streamTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  if (stream.originalAmount === 0) return 0;
  
  if (stream.isGoal) {
    // For savings goals, progress is how much withdrawn from the goal
    return Math.min((totalSpent / stream.originalAmount) * 100, 100);
  } else {
    // For spending streams, progress is how much of budget used
    return Math.min((totalSpent / stream.originalAmount) * 100, 100);
  }
};

// Calculate monthly savings rate
export const calculateSavingsRate = (state: AppState): number => {
  const { user, streams, transactions } = state;
  
  if (user.monthlyIncome === 0) return 0;
  
  const savingsAmount = calculateSavingsAmount(user.monthlyIncome, streams, transactions);
  return (savingsAmount / user.monthlyIncome) * 100;
};

// Calculate total spent this month
export const calculateTotalSpent = (streams: Stream[], transactions: Transaction[]): number => {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
};

// Check if a stream has exceeded its budget
export const hasExceededBudget = (stream: Stream, transactions: Transaction[]): boolean => {
  if (stream.isGoal) return false; // Goals don't have budget limits
  
  const streamTransactions = transactions.filter(t => t.streamId === stream.id);
  const totalSpent = streamTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  return totalSpent >= stream.originalAmount;
};

// Get stream health score (0-100) based on consistency and mindfulness
export const calculateStreamHealth = (stream: Stream, transactions: Transaction[]): number => {
  const streamTransactions = transactions
    .filter(t => t.streamId === stream.id)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
  if (streamTransactions.length === 0) return 100; // New stream, perfect health
  
  let healthScore = 100;
  
  // Consistency factor: Regular transactions score higher
  const daysBetweenTransactions: number[] = [];
  for (let i = 1; i < streamTransactions.length; i++) {
    const daysDiff = (new Date(streamTransactions[i].timestamp).getTime() - 
                     new Date(streamTransactions[i-1].timestamp).getTime()) / (1000 * 60 * 60 * 24);
    daysBetweenTransactions.push(daysDiff);
  }
  
  if (daysBetweenTransactions.length > 0) {
    const avgDaysBetween = daysBetweenTransactions.reduce((a, b) => a + b, 0) / daysBetweenTransactions.length;
    const consistency = Math.max(0, 100 - (avgDaysBetween * 2)); // Penalty for large gaps
    healthScore = (healthScore + consistency) / 2;
  }
  
  // Mindfulness factor: Transactions with notes score higher
  const transactionsWithNotes = streamTransactions.filter(t => t.note.trim().length > 0).length;
  const mindfulnessScore = (transactionsWithNotes / streamTransactions.length) * 100;
  healthScore = (healthScore + mindfulnessScore) / 2;
  
  // Budget alignment factor: Staying within budget scores higher (for spending streams)
  if (!stream.isGoal) {
    const totalSpent = streamTransactions.reduce((sum, t) => sum + t.amount, 0);
    const budgetUsage = totalSpent / stream.originalAmount;
    
    if (budgetUsage <= 1) {
      // Within budget is good
      const alignmentScore = 100 - (budgetUsage * 20); // Gentle penalty for high usage
      healthScore = (healthScore + alignmentScore) / 2;
    } else {
      // Over budget significantly hurts health
      healthScore = healthScore * 0.5;
    }
  }
  
  return Math.max(0, Math.min(100, Math.round(healthScore)));
};

// Check if total allocated budget exceeds monthly income
export const checkBudgetExceedsIncome = (monthlyIncome: number, streams: Stream[]): boolean => {
  const totalAllocatedBudget = streams
    .filter(stream => stream.name !== 'Others')
    .reduce((sum, stream) => sum + stream.originalAmount, 0);
  return totalAllocatedBudget > monthlyIncome;
};

// Get spending velocity insights
export const getSpendingVelocity = (transactions: Transaction[]): {
  dailyAverage: number;
  weeklyTrend: 'increasing' | 'decreasing' | 'stable';
  forecast: number;
} => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysPassed = now.getDate();
  
  const monthTransactions = transactions.filter(t => 
    new Date(t.timestamp) >= monthStart && new Date(t.timestamp) <= now
  );
  
  const totalSpent = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
  const dailyAverage = daysPassed > 0 ? totalSpent / daysPassed : 0;
  
  // Calculate weekly trend
  const lastWeekTransactions = monthTransactions.filter(t => 
    (now.getTime() - new Date(t.timestamp).getTime()) <= 7 * 24 * 60 * 60 * 1000
  );
  const previousWeekTransactions = monthTransactions.filter(t => {
    const daysDiff = (now.getTime() - new Date(t.timestamp).getTime()) / (24 * 60 * 60 * 1000);
    return daysDiff > 7 && daysDiff <= 14;
  });
  
  const lastWeekSpending = lastWeekTransactions.reduce((sum, t) => sum + t.amount, 0);
  const previousWeekSpending = previousWeekTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  let weeklyTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (lastWeekSpending > previousWeekSpending * 1.1) {
    weeklyTrend = 'increasing';
  } else if (lastWeekSpending < previousWeekSpending * 0.9) {
    weeklyTrend = 'decreasing';
  }
  
  // Forecast end-of-month spending
  const forecast = dailyAverage * daysInMonth;
  
  return {
    dailyAverage,
    weeklyTrend,
    forecast,
  };
};

// Format currency for display
export const formatCurrency = (amount: number, currency: string = '₹'): string => {
  return `${currency}${amount.toLocaleString('en-IN', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 
  })}`;
};

// Utility to generate UUID
export const generateId = (): string => {
  return 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};