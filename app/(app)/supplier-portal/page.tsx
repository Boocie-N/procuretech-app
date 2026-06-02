'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Topbar } from '@/components/layout/topbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  FileText, Clock, CheckCircle2, Star, ChevronRight,
  Upload, Eye, AlertTriangle, Inbox, History, FolderOpen,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const INVITED_RFQS = [
  { id: 'p1', ref: 'RFQ/PT/2025/048', title: '500× Laptop Computers',       category: 'IT Equipment', budget: 1_200_000, closing: '2025-02-07', status: 'open',   daysLeft: 14, submitted: false },
  { id: 'p3', ref: 'RFQ/PT/2025/049', title: 'Concrete Supply (200 tons)',   category: 'Construction', budget: 890_000,   closing: '2025-02-14', status: 'open',   daysLeft: 21, submitted: false },
  { id: 'p4', ref: 'RFQ/PT/2025/046', title: 'Security Services — Sandton', category: 'Security',     budget: 560_000,   closing: '2025-01-15', status: 'closed', daysLeft: 0,  submitted: true  },
];

const MY_BIDS = [
  { ref: 'RFQ/PT/2025/048', title: '500× Laptop Computers', submitted: '2025-01-20', value: 1_140_000, status: 'recommended',    score: 92 },
  { ref: 'RFQ/PT/2025/045', title: 'Office Printer Fleet',  submitted: '2025-01-10', value: 285_000,   status: 'not_recommended', score: 61 },
  { ref: 'RFQ/PT/2025/042', title: 'IT Support Services',   submitted: '2024-12-15', value: 480_000,   status: 'awarded',         score: 88 },
];

const DOCS = [
  { label: 'CIPC Registration',    status: 'verified' },
  { label: 'Tax Clearance (SARS)', status: 'verified' },
  { label: 'BBBEE Certificate',    status: 'expiring' },
  { label: 'Bank Confirmation',    status: 'verified' },
  { label: 'Public Liability',     status: 'missing'  },
];

export default function SupplierDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && user && user.role !== 'supplier') router.push('/dashboard');
  }, [mounted, user, router]);

  if (!mounted || !user) return null;

  const openRFQs = INVITED_RFQS.filter(r => r.status === 'open' && !r.submitted).length;
  const pendingDocs = DOCS.filter(d => d.status !== 'verified').length;

  const quickLinks = [
    { href: '/supplier-portal/rfqs',      icon: Inbox,      label: 'Open RFQs',      desc: `${openRFQs} awaiting your bid`,    color: 'blue'  },
    { href: '/supplier-portal/bids',      icon: History,    label: 'My Bids',        desc: `${MY_BIDS.length} bids submitted`, color: 'green' },
    { href: '/supplier-portal/documents', icon: FolderOpen, label: 'Documents',      desc: `${pendingDocs} need attention`,   color: 'amber' },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar
        title="Supplier Dashboard"
        subtitle={`${user.full_name.split(' ')[0]} · Mecer IT Solutions · Level 1 BBBEE · Grade A`}
        actions={
          <Link href="/supplier-portal/register">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
              <Upload className="w-3.5 h-3.5" /> Update Documents
            </Button>
          </Link>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Doc alert banner */}
        {pendingDocs > 0 && (
          <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 dark:text-amber-300 flex-1">
              <strong>{pendingDocs} document{pendingDocs > 1 ? 's' : ''}</strong> require attention — expired or missing docs may exclude you from future RFQ invitations.
            </p>
            <Link href="/supplier-portal/documents">
              <Button size="sm" variant="outline" className="border-amber-400 text-amber-700 hover:bg-amber-100 text-xs h-7 shrink-0">
                Fix now
              </Button>
            </Link>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Open RFQs',   value: String(openRFQs), sub: 'Invited to respond', icon: FileText,     color: 'blue'   },
            { label: 'Active Bids', value: '1',              sub: 'Awaiting decision',  icon: Clock,        color: 'amber'  },
            { label: 'Awards Won',  value: '8',              sub: 'Last 12 months',     icon: CheckCircle2, color: 'green'  },
            { label: 'Avg Score',   value: '88',             sub: 'Out of 100',         icon: Star,         color: 'purple' },
          ].map(k => (
            <div key={k.label} className="bg-white dark:bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[var(--text-tertiary)]">{k.label}</span>
                <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center',
                  k.color === 'blue'   ? 'bg-blue-50'   :
                  k.color === 'amber'  ? 'bg-amber-50'  :
                  k.color === 'green'  ? 'bg-green-50'  : 'bg-purple-50'
                )}>
                  <k.icon className={cn('w-3.5 h-3.5',
                    k.color === 'blue'   ? 'text-blue-600'   :
                    k.color === 'amber'  ? 'text-amber-600'  :
                    k.color === 'green'  ? 'text-green-600'  : 'text-purple-600'
                  )} />
                </div>
              </div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">{k.value}</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-0.5">{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Quick nav */}
        <div className="grid grid-cols-3 gap-4">
          {quickLinks.map(card => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href}>
                <div className="flex items-center gap-4 p-4 bg-white dark:bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] shadow-sm hover:border-[var(--border-brand)] hover:bg-[var(--brand-blue-light)] dark:hover:bg-blue-900/10 transition-all cursor-pointer group">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                    card.color === 'blue'  ? 'bg-blue-100 dark:bg-blue-900/30'   :
                    card.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                    'bg-amber-100 dark:bg-amber-900/30'
                  )}>
                    <Icon className={cn('w-5 h-5',
                      card.color === 'blue'  ? 'text-blue-600'  :
                      card.color === 'green' ? 'text-green-600' :
                      'text-amber-600'
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)]">{card.label}</div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5">{card.desc}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--brand-blue)] transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Recent RFQ invitations */}
        <div className="bg-white dark:bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[var(--border-default)] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Recent RFQ Invitations</h3>
            <Link href="/supplier-portal/rfqs">
              <Button variant="ghost" size="sm" className="text-xs text-[var(--text-secondary)] h-7 gap-1">
                View all <ChevronRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
          <div className="divide-y divide-[var(--border-default)]">
            {INVITED_RFQS.slice(0, 2).map(rfq => (
              <div key={rfq.id} className="px-5 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-[var(--text-primary)]">{rfq.title}</span>
                    <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full',
                      rfq.status === 'open' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    )}>{rfq.status === 'open' ? 'Open' : 'Closed'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
                    <span>{rfq.ref}</span><span>·</span>
                    <span>{rfq.category}</span><span>·</span>
                    <span>Budget: {formatCurrency(rfq.budget, true)}</span>
                    {rfq.status === 'open' && <span className="text-amber-600 font-medium">· {rfq.daysLeft} days left</span>}
                  </div>
                </div>
                {rfq.submitted ? (
                  <span className="text-xs text-green-600 flex items-center gap-1 font-medium"><CheckCircle2 className="w-3.5 h-3.5" /> Submitted</span>
                ) : rfq.status === 'open' ? (
                  <Button size="sm" className="bg-[var(--brand-blue)] hover:bg-[var(--brand-blue-dark)] text-white text-xs h-8">Submit Bid</Button>
                ) : (
                  <Button size="sm" variant="outline" className="text-xs h-8 gap-1"><Eye className="w-3 h-3" /> View</Button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
