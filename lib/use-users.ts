'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUsers, setUsers } from './users-store';
import { DEMO_USERS } from './demo-data';
import type { User } from '@/types';

export function useUsers() {
  const [users, setUsersState] = useState<User[]>(DEMO_USERS);

  useEffect(() => {
    setUsersState(getUsers());
  }, []);

  const addUser = useCallback((user: User) => {
    setUsersState(prev => {
      const next = [...prev, user];
      setUsers(next);
      return next;
    });
  }, []);

  const removeUser = useCallback((id: string) => {
    setUsersState(prev => {
      const next = prev.filter(u => u.id !== id);
      setUsers(next);
      return next;
    });
  }, []);

  return { users, addUser, removeUser };
}
