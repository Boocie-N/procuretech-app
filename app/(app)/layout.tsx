'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Sidebar } from '@/components/layout/sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  // Track whether we've mounted on the client
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !user) {
      router.push('/login');
    }
  }, [mounted, user, isLoading, router]);

  // ─── Before client mount ────────────────────────────────────
  // Render the shell structure identically on server AND client
  // so React hydration never sees a mismatch and always attaches
  // event listeners correctly.
  if (!mounted) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#FAFAFA] dark:bg-[#0F1117]">
        {/* Sidebar placeholder — same dimensions, no content */}
        <div className="w-60 shrink-0 bg-white dark:bg-[#1C1F26] border-r border-gray-200 dark:border-gray-800" />
        {/* Main area placeholder */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Topbar placeholder */}
          <div className="h-[60px] bg-white dark:bg-[#1C1F26] border-b border-gray-200 dark:border-gray-800" />
        </div>
      </div>
    );
  }

  // ─── After mount — redirect if not authenticated ────────────
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1A56DB] flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <p className="text-xs text-gray-400">Redirecting…</p>
        </div>
      </div>
    );
  }

  // ─── Authenticated — render full app shell ──────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAFA] dark:bg-[#0F1117]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
