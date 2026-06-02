'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, UserRole } from '@/types';
import { DEMO_USERS } from '@/lib/demo-data';

interface AuthContextType {
  user: User | null;
  login: (userId: string) => void;
  logout: () => void;
  isLoading: boolean;
  can: (action: Permission) => boolean;
}

export type Permission =
  | 'create_procurement'
  | 'generate_documents'
  | 'send_rfq'
  | 'score_bids'
  | 'approve_report'
  | 'issue_po'
  | 'view_all_procurements'
  | 'manage_suppliers'
  | 'approve_suppliers'
  | 'manage_users'
  | 'view_financials'
  | 'manage_deviation'
  | 'approve_deviation'
  | 'view_audit_trail';

const PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'create_procurement','generate_documents','send_rfq','score_bids',
    'approve_report','issue_po','view_all_procurements','manage_suppliers',
    'approve_suppliers','manage_users','view_financials','manage_deviation',
    'approve_deviation','view_audit_trail',
  ],
  procurement_officer: [
    'create_procurement','generate_documents','send_rfq','score_bids',
    'manage_deviation','view_audit_trail',
  ],
  manager: [
    'create_procurement','generate_documents','send_rfq','score_bids',
    'approve_report','view_all_procurements','manage_suppliers',
    'view_financials','manage_deviation','approve_deviation','view_audit_trail',
  ],
  cfo: [
    'approve_report','issue_po','view_all_procurements',
    'view_financials','approve_deviation','view_audit_trail',
  ],
  legal: [
    'approve_report','view_all_procurements','view_audit_trail',
  ],
  supplier: [],
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
  can: () => false,
});

const STORAGE_KEY = 'procuretech_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    setIsLoading(false);
  }, []);

  function login(userId: string) {
    const found = DEMO_USERS.find(u => u.id === userId);
    if (found) {
      setUser(found);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
    }
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  function can(action: Permission): boolean {
    if (!user) return false;
    return PERMISSIONS[user.role]?.includes(action) ?? false;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, can }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
