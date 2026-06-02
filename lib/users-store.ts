import { DEMO_USERS } from './demo-data';
import type { User } from '@/types';

const KEY = 'procuretech_users';

export function getUsers(): User[] {
  if (typeof window === 'undefined') return DEMO_USERS;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : DEMO_USERS;
  } catch {
    return DEMO_USERS;
  }
}

export function setUsers(users: User[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(users));
}
