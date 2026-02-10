// Enhanced client-side storage with validation and error handling

export interface Profile {
  name: string;
  email: string;
  monthlyIncome: string;
  fixedExpenses: string;
  variableExpenses: string;
  riskProfile: string;
  mainGoal: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  description: string;
  category: string;
  amount: number;
  date: string;
}

export interface StorageData {
  profile: Profile;
  transactions: Transaction[];
  savedAt?: string;
}

const STORAGE_KEYS = {
  profile: 'finance-app-profile',
  transactions: 'finance-app-transactions',
} as const;

class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

// Validate storage availability
function checkStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const test = '__storage_test__';
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// Safe JSON parse with fallback
function safeJSONParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    console.error('Failed to parse JSON from storage');
    return fallback;
  }
}

// Profile storage operations
export function getStoredProfile(defaultProfile: Profile): Profile {
  if (!checkStorageAvailable()) return defaultProfile;
  const stored = window.localStorage.getItem(STORAGE_KEYS.profile);
  return safeJSONParse(stored, defaultProfile);
}

export function saveProfile(profile: Profile): boolean {
  if (!checkStorageAvailable()) {
    throw new StorageError('localStorage não está disponível');
  }
  try {
    const data = { ...profile, savedAt: new Date().toISOString() };
    window.localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving profile:', error);
    throw new StorageError('Erro ao salvar perfil');
  }
}

export function getProfileSavedAt(): string | null {
  if (!checkStorageAvailable()) return null;
  const stored = window.localStorage.getItem(STORAGE_KEYS.profile);
  if (!stored) return null;
  try {
    const data = JSON.parse(stored);
    return data.savedAt || null;
  } catch {
    return null;
  }
}

// Transaction storage operations
export function getStoredTransactions(): Transaction[] {
  if (!checkStorageAvailable()) return [];
  const stored = window.localStorage.getItem(STORAGE_KEYS.transactions);
  return safeJSONParse(stored, []);
}

export function saveTransactions(transactions: Transaction[]): boolean {
  if (!checkStorageAvailable()) {
    throw new StorageError('localStorage não está disponível');
  }
  try {
    window.localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions));
    return true;
  } catch (error) {
    console.error('Error saving transactions:', error);
    throw new StorageError('Erro ao salvar transações');
  }
}

export function addTransaction(transaction: Transaction): Transaction[] {
  const transactions = getStoredTransactions();
  const updated = [transaction, ...transactions];
  saveTransactions(updated);
  return updated;
}

export function deleteTransaction(id: string): Transaction[] {
  const transactions = getStoredTransactions();
  const updated = transactions.filter(t => t.id !== id);
  saveTransactions(updated);
  return updated;
}

// Data export
export function exportAllData(): string {
  const profile = getStoredProfile({
    name: '',
    email: '',
    monthlyIncome: '',
    fixedExpenses: '',
    variableExpenses: '',
    riskProfile: 'moderado',
    mainGoal: 'equilibrar',
  });
  
  const transactions = getStoredTransactions();
  
  const data: StorageData = {
    profile,
    transactions,
    savedAt: new Date().toISOString(),
  };
  
  return JSON.stringify(data, null, 2);
}

// Data import
export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString) as StorageData;
    
    if (data.profile) {
      saveProfile(data.profile);
    }
    
    if (Array.isArray(data.transactions)) {
      saveTransactions(data.transactions);
    }
    
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    throw new StorageError('Dados inválidos para importação');
  }
}

// Clear all data
export function clearAllData(): void {
  if (!checkStorageAvailable()) return;
  window.localStorage.removeItem(STORAGE_KEYS.profile);
  window.localStorage.removeItem(STORAGE_KEYS.transactions);
}

// Calculate financial metrics
export interface FinancialMetrics {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number;
  monthlyFreeCashFlow: number;
  emergencyFundTarget: number;
}

export function calculateMetrics(profile: Profile, transactions: Transaction[]): FinancialMetrics {
  const monthlyIncome = parseFloat(profile.monthlyIncome) || 0;
  const fixedExpenses = parseFloat(profile.fixedExpenses) || 0;
  const variableExpenses = parseFloat(profile.variableExpenses) || 0;
  const monthlyExpenses = fixedExpenses + variableExpenses;
  
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = totalIncome - totalExpenses;
  const monthlyFreeCashFlow = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? (monthlyFreeCashFlow / monthlyIncome) * 100 : 0;
  const emergencyFundTarget = monthlyExpenses * 6;
  
  return {
    totalIncome,
    totalExpenses,
    balance,
    savingsRate,
    monthlyFreeCashFlow,
    emergencyFundTarget,
  };
}
