'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Bell, X, CheckCheck, FileText, AlertTriangle, CheckCircle2, Clock, Building2 } from 'lucide-react';
import { cn, timeAgo } from '@/lib/utils';
import type { UserRole } from '@/types';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'action';
  title: string;
  body: string;
  time: string;
  href: string;
  icon: React.ElementType;
}

const NOTIFICATIONS_BY_ROLE: Record<UserRole, Notification[]> = {
  admin: [
    { id: 'a1', type: 'warning', title: 'Supplier document expired',  body: 'TechSupply Co BBBEE certificate expired 3 days ago. Supplier flagged for review.',                            time: new Date(Date.now() - 1800000).toISOString(),   href: '/suppliers',    icon: AlertTriangle },
    { id: 'a2', type: 'info',    title: 'New supplier registered',    body: 'Omega Tech Solutions submitted a registration. Pending compliance review.',                                    time: new Date(Date.now() - 7200000).toISOString(),   href: '/suppliers',    icon: Building2 },
    { id: 'a3', type: 'success', title: 'System health: all good',    body: 'All platform services operational. Blockchain audit chain verified — 142 blocks intact.',                     time: new Date(Date.now() - 86400000).toISOString(),  href: '/audit-trail',  icon: CheckCircle2 },
    { id: 'a4', type: 'action',  title: 'Deviation pending approval', body: 'DEV/PT/2025/002 — IT Maintenance extension requires your approval.',                                          time: new Date(Date.now() - 172800000).toISOString(), href: '/compliance',   icon: Clock },
  ],
  procurement_officer: [
    { id: 'o1', type: 'success', title: 'AI evaluation complete',  body: 'Bid evaluation for RFQ/PT/2025/048 (Laptop Computers) is ready. Mecer IT recommended at 92/100.',              time: new Date(Date.now() - 120000).toISOString(),    href: '/procurements/p1', icon: CheckCircle2 },
    { id: 'o2', type: 'warning', title: 'RFQ closing soon',        body: 'RFQ/PT/2025/049 (Concrete Supply) closes in 14 days — only 2 of 3 required quotes received.',                   time: new Date(Date.now() - 3600000).toISOString(),   href: '/procurements/p3', icon: AlertTriangle },
    { id: 'o3', type: 'info',    title: 'Approval granted',        body: 'Your recommendation report for Office Furniture (RFQ/PT/2025/047) has been approved by Naledi Dlamini.',        time: new Date(Date.now() - 14400000).toISOString(),  href: '/procurements/p2', icon: FileText },
    { id: 'o4', type: 'action',  title: 'Market insight',          body: 'AI detected a 12% price increase in IT equipment since last quarter. Review your laptop budget.',               time: new Date(Date.now() - 86400000).toISOString(),  href: '/analytics',       icon: Clock },
  ],
  manager: [
    { id: 'm1', type: 'action',  title: 'Approval required',       body: 'RFQ/PT/2025/048 recommendation awaiting your approval. Value: R1,140,000.',                                     time: new Date(Date.now() - 900000).toISOString(),    href: '/approvals',    icon: Clock },
    { id: 'm2', type: 'action',  title: 'Deviation approval needed',body: 'DEV/PT/2025/002 — Contract extension for IT Maintenance. Review and approve or reject.',                        time: new Date(Date.now() - 7200000).toISOString(),   href: '/compliance',   icon: AlertTriangle },
    { id: 'm3', type: 'warning', title: 'PPPFA target missed',      body: 'October 2024 BBBEE L1-4 spend was 87% — below the 90% target. Review supplier mix.',                           time: new Date(Date.now() - 172800000).toISOString(), href: '/analytics',    icon: AlertTriangle },
    { id: 'm4', type: 'success', title: 'PO issued',                body: 'PO/PT/2025/089 issued to Steelcase SA for R315,000 — Office Furniture procurement complete.',                   time: new Date(Date.now() - 259200000).toISOString(), href: '/contracts',    icon: CheckCircle2 },
  ],
  cfo: [
    { id: 'c1', type: 'action',  title: 'Financial approval required', body: 'RFQ/PT/2025/048 — Laptop procurement R1,140,000 awaiting CFO sign-off.',                                    time: new Date(Date.now() - 1800000).toISOString(),   href: '/approvals',    icon: Clock },
    { id: 'c2', type: 'info',    title: 'Monthly spend summary',       body: 'January 2025 procurement spend: R1.2M (84% of monthly budget). YTD savings: R184k vs market benchmark.',    time: new Date(Date.now() - 86400000).toISOString(),  href: '/analytics',    icon: FileText },
    { id: 'c3', type: 'warning', title: 'Budget alert',                body: 'IT Equipment category is at 94% of annual budget with 8 months remaining.',                                  time: new Date(Date.now() - 172800000).toISOString(), href: '/analytics',    icon: AlertTriangle },
    { id: 'c4', type: 'success', title: 'Savings target achieved',     body: 'Q1 savings target of R150k exceeded — actual savings R184k (11.4% below benchmark).',                       time: new Date(Date.now() - 345600000).toISOString(), href: '/analytics',    icon: CheckCircle2 },
  ],
  legal: [
    { id: 'l1', type: 'action',  title: 'Contract review required', body: 'Security Services 12-month contract (R540,000) submitted for legal review. SLA deadline: 3 days.',             time: new Date(Date.now() - 3600000).toISOString(),   href: '/approvals',    icon: Clock },
    { id: 'l2', type: 'warning', title: 'Contract expiring',        body: 'Cleaning Services contract (CleanPro SA) expires in 58 days. Re-tender recommended.',                           time: new Date(Date.now() - 86400000).toISOString(),  href: '/contracts',    icon: AlertTriangle },
    { id: 'l3', type: 'info',    title: 'COI declaration received', body: 'Naledi Dlamini declared a conflict of interest on RFQ/PT/2025/047 and has been recused.',                      time: new Date(Date.now() - 259200000).toISOString(), href: '/compliance',   icon: FileText },
    { id: 'l4', type: 'success', title: 'Contract signed',          body: 'Office Furniture contract signed by all parties. Archived to document store.',                                  time: new Date(Date.now() - 345600000).toISOString(), href: '/contracts',    icon: CheckCircle2 },
  ],
  supplier: [
    { id: 's1', type: 'action',  title: 'RFQ invitation',          body: "You've been invited to quote on RFQ/PT/2025/049 — Concrete Supply (200 tons). Closing: 14 Feb 2025.",           time: new Date(Date.now() - 3600000).toISOString(),   href: '/supplier-portal', icon: FileText },
    { id: 's2', type: 'success', title: 'Bid recommended!',        body: 'Your bid for RFQ/PT/2025/048 (Laptop Computers) has been recommended. Awaiting PO.',                            time: new Date(Date.now() - 86400000).toISOString(),  href: '/supplier-portal', icon: CheckCircle2 },
    { id: 's3', type: 'warning', title: 'BBBEE certificate expiring', body: 'Your BBBEE certificate expires on 31 March 2025 — 58 days remaining. Please renew.',                         time: new Date(Date.now() - 172800000).toISOString(), href: '/supplier-portal', icon: AlertTriangle },
  ],
};

const TYPE_STYLES = {
  info:    { dot: 'bg-blue-500',   bg: 'hover:bg-blue-50 dark:hover:bg-blue-900/10' },
  success: { dot: 'bg-green-500',  bg: 'hover:bg-green-50 dark:hover:bg-green-900/10' },
  warning: { dot: 'bg-amber-500',  bg: 'hover:bg-amber-50 dark:hover:bg-amber-900/10' },
  action:  { dot: 'bg-purple-500', bg: 'hover:bg-purple-50 dark:hover:bg-purple-900/10' },
};

function storageKey(userId: string) {
  return `procuretech_notif_${userId}`;
}

interface NotifState {
  read: string[];
  dismissed: string[];
}

export function NotificationsDropdown() {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<NotifState>({ read: [], dismissed: [] });
  const [mounted, setMounted] = useState(false);

  const baseNotifs = NOTIFICATIONS_BY_ROLE[user?.role ?? 'procurement_officer'] ?? [];

  // Load persisted state from localStorage once mounted
  useEffect(() => {
    setMounted(true);
    if (!user) return;
    try {
      const raw = localStorage.getItem(storageKey(user.id));
      if (raw) setState(JSON.parse(raw));
    } catch {}
  }, [user]);

  const persist = useCallback((next: NotifState) => {
    setState(next);
    if (user) {
      try { localStorage.setItem(storageKey(user.id), JSON.stringify(next)); } catch {}
    }
  }, [user]);

  const notifications = baseNotifs.filter(n => !state.dismissed.includes(n.id));
  const unreadCount = notifications.filter(n => !state.read.includes(n.id)).length;

  function markAllRead() {
    persist({ ...state, read: baseNotifs.map(n => n.id) });
  }

  function markRead(id: string) {
    if (state.read.includes(id)) return;
    persist({ ...state, read: [...state.read, id] });
  }

  function dismiss(id: string) {
    persist({ ...state, dismissed: [...state.dismissed, id], read: [...state.read, id] });
  }

  function handleClick(n: Notification) {
    markRead(n.id);
    setOpen(false);
    router.push(n.href);
  }

  // Don't show badge until mounted (avoids hydration mismatch)
  const displayCount = mounted ? unreadCount : 0;

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4 text-[var(--text-secondary)]" />
        {displayCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
            {displayCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl shadow-lg z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)]">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Notifications</h3>
                {displayCount > 0 && (
                  <span className="bg-[var(--brand-blue)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{displayCount}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {displayCount > 0 && (
                  <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-[var(--brand-blue)] hover:underline px-2 py-1 rounded">
                    <CheckCheck className="w-3 h-3" /> Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/10">
                  <X className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[420px] overflow-y-auto divide-y divide-[var(--border-default)]">
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-2 opacity-40" />
                  <p className="text-sm text-[var(--text-tertiary)]">No notifications</p>
                </div>
              ) : notifications.map(n => {
                const isRead = state.read.includes(n.id);
                const Icon = n.icon;
                const style = TYPE_STYLES[n.type];
                return (
                  <div
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={cn(
                      'flex gap-3 px-4 py-3 cursor-pointer transition-colors group',
                      style.bg,
                      !isRead ? 'bg-gray-50 dark:bg-white/5' : ''
                    )}
                  >
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                      n.type === 'info'    ? 'bg-blue-100 dark:bg-blue-900/30'   :
                      n.type === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
                      n.type === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30' :
                      'bg-purple-100 dark:bg-purple-900/30'
                    )}>
                      <Icon className={cn('w-4 h-4',
                        n.type === 'info'    ? 'text-blue-600'   :
                        n.type === 'success' ? 'text-green-600'  :
                        n.type === 'warning' ? 'text-amber-600'  :
                        'text-purple-600'
                      )} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn('text-xs font-semibold leading-tight', !isRead ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]')}>
                          {n.title}
                        </p>
                        <div className="flex items-center gap-1 shrink-0">
                          {!isRead && <span className={cn('w-2 h-2 rounded-full shrink-0', style.dot)} />}
                          <button
                            onClick={e => { e.stopPropagation(); dismiss(n.id); }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
                          >
                            <X className="w-3 h-3 text-[var(--text-tertiary)]" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
                      <p className="text-[10px] text-[var(--text-tertiary)] mt-1">{timeAgo(n.time)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-4 py-2.5 border-t border-[var(--border-default)] bg-gray-50 dark:bg-white/5">
              <button className="text-xs text-[var(--brand-blue)] hover:underline w-full text-center">
                View all notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
