import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

export interface UserData {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  profile: {
    name: string;
    monthlyIncome: number;
    fixedExpenses: number;
    variableExpenses: number;
    riskProfile: string;
    mainGoal: string;
  };
  transactions: Transaction[];
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  description: string;
  category: string;
  amount: number;
  date: string;
  createdAt: string;
}

function getFilePath(userId: string): string {
  return join(DATA_DIR, `${userId}.json`);
}

export function getUserData(userId: string): UserData | null {
  try {
    const filePath = getFilePath(userId);
    if (!existsSync(filePath)) {
      return null;
    }
    const data = readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading user data:', error);
    return null;
  }
}

export function saveUserData(userData: UserData): boolean {
  try {
    const filePath = getFilePath(userData.id);
    userData.updatedAt = new Date().toISOString();
    writeFileSync(filePath, JSON.stringify(userData, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving user data:', error);
    return false;
  }
}

export function createUser(
  email: string,
  passwordHash: string,
  salt: string,
  name: string
): UserData {
  const userId = Buffer.from(email).toString('base64url');
  const userData: UserData = {
    id: userId,
    email,
    passwordHash,
    salt,
    profile: {
      name,
      monthlyIncome: 0,
      fixedExpenses: 0,
      variableExpenses: 0,
      riskProfile: 'moderado',
      mainGoal: 'equilibrar',
    },
    transactions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveUserData(userData);
  return userData;
}

export function getUserByEmail(email: string): UserData | null {
  const userId = Buffer.from(email).toString('base64url');
  return getUserData(userId);
}

export function addTransaction(userId: string, transaction: Omit<Transaction, 'id' | 'createdAt'>): Transaction | null {
  const userData = getUserData(userId);
  if (!userData) {
    return null;
  }

  const newTransaction: Transaction = {
    ...transaction,
    id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };

  userData.transactions.push(newTransaction);
  saveUserData(userData);
  return newTransaction;
}

export function deleteTransaction(userId: string, transactionId: string): boolean {
  const userData = getUserData(userId);
  if (!userData) {
    return false;
  }

  const initialLength = userData.transactions.length;
  userData.transactions = userData.transactions.filter(t => t.id !== transactionId);
  
  if (userData.transactions.length < initialLength) {
    saveUserData(userData);
    return true;
  }
  return false;
}

export function updateProfile(
  userId: string,
  profile: Partial<UserData['profile']>
): boolean {
  const userData = getUserData(userId);
  if (!userData) {
    return false;
  }

  userData.profile = { ...userData.profile, ...profile };
  return saveUserData(userData);
}
