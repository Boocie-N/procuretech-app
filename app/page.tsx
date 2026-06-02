'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function RootPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      router.replace(user ? '/dashboard' : '/login');
    }
  }, [user, isLoading, router]);

  // Show a branded loading screen while auth state resolves
  return (
    <div className="flex h-screen items-center justify-center bg-[#FAFAFA]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#1A56DB] flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-xl">P</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm font-semibold text-gray-800">
            ProcureTech<span className="text-[#1A56DB]">+</span>
          </p>
          <p className="text-xs text-gray-400">Loading…</p>
        </div>
        <div className="flex gap-1.5 mt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#1A56DB] animate-bounce [animation-delay:-0.3s]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#1A56DB] animate-bounce [animation-delay:-0.15s]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#1A56DB] animate-bounce" />
        </div>
      </div>
    </div>
  );
}
