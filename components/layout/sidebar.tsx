'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Bot, FileText, BarChart3,
  Link2, BookOpen, Settings, ShieldCheck, ChevronRight,
  LogOut, Building2, ListChecks, CheckSquare, Inbox, History,
  FolderOpen, UserCircle, AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

const INTERNAL_NAV_SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard',    label: 'Dashboard',       icon: LayoutDashboard },
      { href: '/analytics',    label: 'Analytics',       icon: BarChart3 },
    ],
  },
  {
    label: 'Procurement',
    items: [
      { href: '/procurements', label: 'My Procurements', icon: ListChecks, badge: '5' },
      { href: '/copilot',      label: 'AI Copilot',      icon: Bot,        badge: 'AI', badgeColor: 'blue' },
      { href: '/approvals',    label: 'Approvals',       icon: CheckSquare, badge: '2', badgeColor: 'amber' },
    ],
  },
  {
    label: 'Network',
    items: [
      { href: '/suppliers',    label: 'Suppliers',       icon: Building2 },
      { href: '/contracts',    label: 'Contracts',       icon: FileText },
    ],
  },
  {
    label: 'Governance',
    items: [
      { href: '/audit-trail',  label: 'Audit Trail',     icon: Link2 },
      { href: '/compliance',   label: 'Compliance',      icon: ShieldCheck },
    ],
  },
  {
    label: 'Knowledge',
    items: [
      { href: '/knowledge',    label: 'Knowledge Base',  icon: BookOpen },
    ],
  },
];

const SUPPLIER_NAV_SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Overview',
    items: [
      { href: '/supplier-portal',           label: 'Dashboard',   icon: LayoutDashboard },
    ],
  },
  {
    label: 'Bidding',
    items: [
      { href: '/supplier-portal/rfqs',      label: 'Open RFQs',   icon: Inbox,      badge: '2', badgeColor: 'blue' },
      { href: '/supplier-portal/bids',      label: 'My Bids',     icon: History },
    ],
  },
  {
    label: 'Compliance',
    items: [
      { href: '/supplier-portal/documents', label: 'Documents',   icon: FolderOpen, badge: '2', badgeColor: 'amber' },
      { href: '/supplier-portal/register',  label: 'My Profile',  icon: UserCircle },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isSupplier = user?.role === 'supplier';
  const sections = isSupplier ? SUPPLIER_NAV_SECTIONS : INTERNAL_NAV_SECTIONS;
  const homeHref = isSupplier ? '/supplier-portal' : '/dashboard';

  const initials = user?.full_name
    .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'U';

  return (
    <aside className="flex flex-col w-60 shrink-0 h-screen bg-white dark:bg-[var(--bg-surface)] border-r border-[var(--border-default)] overflow-hidden">

        {/* Logo */}
        <div className="px-5 py-4 border-b border-[var(--border-default)] shrink-0">
          <Link href={homeHref} className="flex items-center gap-2.5">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', isSupplier ? 'bg-emerald-600' : 'bg-[var(--brand-blue)]')}>
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <div>
              <div className="font-bold text-[var(--text-primary)] text-sm leading-none">
                ProcureTech<span className={isSupplier ? 'text-emerald-600' : 'text-[var(--brand-blue)]'}>+</span>
              </div>
              <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5 uppercase tracking-wider">
                {isSupplier ? 'Supplier Portal' : 'AI Procurement OS'}
              </div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {sections.map(section => (
            <div key={section.label} className="mb-5">
              <div className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-widest px-2 mb-1">
                {section.label}
              </div>
              <div className="flex flex-col gap-0.5">
                {section.items.map(item => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 group',
                        isActive
                          ? isSupplier
                            ? 'bg-emerald-50 text-emerald-700 font-medium dark:bg-emerald-900/20 dark:text-emerald-400'
                            : 'bg-[var(--brand-blue-light)] text-[var(--brand-blue)] font-medium dark:bg-blue-900/20 dark:text-blue-400'
                          : 'text-[var(--text-secondary)] hover:bg-gray-50 hover:text-[var(--text-primary)] dark:hover:bg-white/5 dark:hover:text-white'
                      )}
                    >
                      <Icon className={cn('w-4 h-4 shrink-0', isActive
                            ? isSupplier ? 'text-emerald-600' : 'text-[var(--brand-blue)]'
                            : 'text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]'
                          )} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span className={cn(
                          'text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center',
                          item.badgeColor === 'blue'  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                          item.badgeColor === 'amber' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                          'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                        )}>
                          {item.badge}
                        </span>
                      )}
                      {isActive && (
                        <ChevronRight className={cn('w-3 h-3 opacity-60', isSupplier ? 'text-emerald-600' : 'text-[var(--brand-blue)]')} />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-3 pb-1">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-gray-50 hover:text-[var(--text-primary)] dark:hover:bg-white/5 transition-all duration-150"
          >
            <Settings className="w-4 h-4 shrink-0 text-[var(--text-tertiary)]" />
            <span>Settings</span>
          </Link>
        </div>

        {/* User Footer */}
        <div className="px-3 py-3 border-t border-[var(--border-default)] shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-all group">
            <Avatar className="w-8 h-8 shrink-0">
              <AvatarFallback className="bg-[var(--brand-blue)] text-white text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[var(--text-primary)] truncate leading-tight">
                {user?.full_name ?? 'User'}
              </div>
              <div className="text-[11px] text-[var(--text-tertiary)] truncate capitalize">
                {user?.role?.replace('_', ' ') ?? ''}
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
            >
              <LogOut className="w-3.5 h-3.5 text-red-500" />
            </button>
          </div>
        </div>
    </aside>
  );
}
