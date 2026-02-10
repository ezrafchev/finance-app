// Client-side API utilities for making requests to the backend

export interface Profile {
  name: string;
  email: string;
  monthlyIncome: number;
  fixedExpenses: number;
  variableExpenses: number;
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
  createdAt?: string;
}

class ApiClient {
  private baseUrl = '';

  async fetchProfile(): Promise<Profile> {
    const response = await fetch(`${this.baseUrl}/api/profile`, {
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Redirect to login
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
      throw new Error('Failed to fetch profile');
    }

    const data = await response.json();
    return data.profile;
  }

  async updateProfile(profile: Partial<Profile>): Promise<Profile> {
    const response = await fetch(`${this.baseUrl}/api/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
      throw new Error('Failed to update profile');
    }

    const data = await response.json();
    return data.profile;
  }

  async fetchTransactions(): Promise<Transaction[]> {
    const response = await fetch(`${this.baseUrl}/api/transactions`, {
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
      throw new Error('Failed to fetch transactions');
    }

    const data = await response.json();
    return data.transactions;
  }

  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    const response = await fetch(`${this.baseUrl}/api/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(transaction),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
      throw new Error('Failed to create transaction');
    }

    const data = await response.json();
    return data.transaction;
  }

  async deleteTransaction(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/transactions?id=${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
      throw new Error('Failed to delete transaction');
    }
  }

  async logout(): Promise<void> {
    await fetch(`${this.baseUrl}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    window.location.href = '/login';
  }
}

export const apiClient = new ApiClient();
