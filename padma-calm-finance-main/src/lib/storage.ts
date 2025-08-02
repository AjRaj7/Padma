// Padma Local Storage Management - Elegant data persistence

import { AppState, AppAction } from '@/types';

const STORAGE_KEY = 'padma-app-state';
const STORAGE_VERSION = '1.0.0';

// Default app state for first-time users
export const getInitialState = (): AppState => ({
  user: {
    monthlyIncome: 0,
    currency: '₹',
    setupComplete: false,
    onboardingStep: 0,
  },
  streams: [],
  transactions: [],
  templates: [],
  archives: {},
  analytics: {
    monthlyTrends: [],
    insights: [],
    lastCalculated: new Date().toISOString(),
  },
  meta: {
    currentMonth: new Date().toISOString().slice(0, 7), // YYYY-MM
    lastSavedDate: new Date().toISOString(),
    version: STORAGE_VERSION,
  },
});

// Load state from localStorage with error handling
export const loadState = (): AppState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return getInitialState();
    }

    const parsed = JSON.parse(stored) as AppState;
    
    // Version compatibility check
    if (!parsed.meta?.version || parsed.meta.version !== STORAGE_VERSION) {
      console.log('Migrating app state to new version');
      return migrateState(parsed);
    }

    return parsed;
  } catch (error) {
    console.error('Failed to load app state:', error);
    return getInitialState();
  }
};

// Save state to localStorage with error handling
export const saveState = (state: AppState): void => {
  try {
    const stateToSave = {
      ...state,
      meta: {
        ...state.meta,
        lastSavedDate: new Date().toISOString(),
        version: STORAGE_VERSION,
      },
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  } catch (error) {
    console.error('Failed to save app state:', error);
    // Could trigger a user notification about storage issues
  }
};

// Migrate state from older versions
const migrateState = (oldState: any): AppState => {
  const newState = getInitialState();
  
  // Preserve user data that's compatible
  if (oldState.user) {
    newState.user = {
      ...newState.user,
      ...oldState.user,
    };
  }
  
  if (oldState.streams && Array.isArray(oldState.streams)) {
    newState.streams = oldState.streams;
  }
  
  if (oldState.transactions && Array.isArray(oldState.transactions)) {
    newState.transactions = oldState.transactions;
  }
  
  return newState;
};

// Export app data for backup
export const exportAppData = (state: AppState) => {
  const exportData = {
    ...state,
    exportedAt: new Date().toISOString(),
    exportVersion: STORAGE_VERSION,
  };
  
  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `padma-backup-${new Date().toISOString().slice(0, 10)}.json`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

// Import app data from backup
export const importAppData = (file: File): Promise<AppState> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        // Validate imported data structure
        if (!importedData.user || !importedData.streams || !importedData.transactions) {
          throw new Error('Invalid backup file structure');
        }
        
        // Remove export metadata
        const { exportedAt, exportVersion, ...appState } = importedData;
        
        resolve(appState as AppState);
      } catch (error) {
        reject(new Error('Failed to parse backup file'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read backup file'));
    reader.readAsText(file);
  });
};

// Clear all app data (factory reset)
export const clearAppData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear app data:', error);
  }
};