// Padma App State Management - Global context for mindful finance data

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, AppAction } from '@/types';
import { loadState, saveState, getInitialState } from '@/lib/storage';

// Create the context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Reducer function to handle state updates
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;
      
    case 'SET_INCOME':
      return {
        ...state,
        user: {
          ...state.user,
          monthlyIncome: action.payload,
        },
      };
      
    case 'ADD_STREAM':
      return {
        ...state,
        streams: [...state.streams, action.payload],
      };
      
    case 'UPDATE_STREAM':
      return {
        ...state,
        streams: state.streams.map(stream =>
          stream.id === action.payload.id
            ? { ...stream, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : stream
        ),
      };
      
    case 'DELETE_STREAM':
      return {
        ...state,
        streams: state.streams.filter(stream => stream.id !== action.payload),
        transactions: state.transactions.filter(transaction => transaction.streamId !== action.payload),
      };
      
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [...state.transactions, action.payload],
      };
      
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(transaction =>
          transaction.id === action.payload.id
            ? { ...transaction, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : transaction
        ),
      };
      
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(transaction => transaction.id !== action.payload),
      };
      
    case 'ADD_TEMPLATE':
      return {
        ...state,
        templates: [...state.templates, action.payload],
      };
      
    case 'COMPLETE_ONBOARDING':
      return {
        ...state,
        user: {
          ...state.user,
          setupComplete: true,
        },
      };
      
    case 'ARCHIVE_MONTH':
      // Implementation for archiving previous month's data
      const currentMonth = action.payload;
      const monthlyArchive = {
        month: currentMonth,
        totalIncome: state.user.monthlyIncome,
        totalSpent: state.transactions.reduce((sum, t) => sum + t.amount, 0),
        streamsSnapshot: [...state.streams],
        transactionCount: state.transactions.length,
        topInsights: [], // Could be calculated based on the month's data
      };
      
      return {
        ...state,
        archives: {
          ...state.archives,
          [currentMonth]: monthlyArchive,
        },
        meta: {
          ...state.meta,
          currentMonth: new Date().toISOString().slice(0, 7),
        },
      };
      
    case 'RESET_APP':
      return getInitialState();
      
    default:
      return state;
  }
};

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, getInitialState());

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = loadState();
    if (savedState) {
      dispatch({ type: 'LOAD_STATE', payload: savedState });
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the app context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// Custom hooks for specific data
export const useStreams = () => {
  const { state } = useAppContext();
  return state.streams;
};

export const useTransactions = () => {
  const { state } = useAppContext();
  return state.transactions;
};

export const useUser = () => {
  const { state } = useAppContext();
  return state.user;
};

export const useTemplates = () => {
  const { state } = useAppContext();
  return state.templates;
};