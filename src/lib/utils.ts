import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Item {
  id: number;
  sku: string;
  name: string;
  category_id: number;
  category_name?: string;
  quantity: number;
  unit: string;
  min_stock: number;
  location: string;
  description: string;
  serial_number?: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Transaction {
  id: number;
  item_id: number;
  item_name?: string;
  sku?: string;
  type: 'IN' | 'OUT';
  quantity: number;
  date: string;
  notes: string;
}

export interface DashboardStats {
  totalItems: number;
  totalStock: number;
  lowStock: number;
  recentTransactions: Transaction[];
}
