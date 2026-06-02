'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './theme-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationsDropdown } from './notifications';

interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Topbar({ title, subtitle, actions }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between px-6 py-3.5 bg-white dark:bg-[var(--bg-surface)] border-b border-[var(--border-default)] shrink-0 h-[60px]">

      {/* Left — title */}
      <div>
        <h1 className="text-base font-semibold text-[var(--text-primary)] leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs gap-1.5 text-[var(--text-secondary)] border-[var(--border-default)]">
          <span className="w-2 h-2 rounded-full bg-green-500 pulse-dot inline-block" />
          ZAR · South Africa
        </Badge>

        {actions}

        {/* Notifications dropdown */}
        <NotificationsDropdown />

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'light'
            ? <Moon className="w-4 h-4 text-[var(--text-secondary)]" />
            : <Sun className="w-4 h-4 text-[var(--text-secondary)]" />
          }
        </button>
      </div>
    </header>
  );
}
