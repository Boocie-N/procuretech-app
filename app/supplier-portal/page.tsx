'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/layout/theme-provider';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Building2, FileText, Clock, CheckCircle2,
  LogOut, Moon, Sun, ChevronRight, Upload, Package,
  Star, Eye, LayoutDashboard, Inbox, History, FolderOpen, Settings,
  AlertCircle, AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const INVITED_RFQS = [
  { id: 'p1', ref: 'RFQ/PT/2025/048', title: '500× Laptop Computers',        category: 'IT Equipment', budget: 1_200_000, closing: '2025-02-07', status: 'open',   daysLeft: 14, submitted: false },
  { id: 'p3', ref: 'RFQ/PT/2025/049', title: 'Concrete Supply (200 tons)',    category: 'Construction', budget: 890_000,   closing: '2025-02-14', status: 'open',   daysLeft: 21, submitted: false },
  { id: 'p4', ref: 'RFQ/PT/2025/046', title: 'Security Services — Sandton',  category: 'Security',     budget: 560_000,   closing: '2025-01-15', status: 'closed', daysLeft: 0,  submitted: true  },
];

const MY_BIDS = [
  { ref: 'RFQ/PT/2025/048', title: '500× Laptop Computers', submitted: '2025-01-20', value: 1_140_000, status: 'recommended',    score: 92 },
  { ref: 'RFQ/PT/2025/045', title: 'Office Printer Fleet',  submitted: '2025-01-10', value: 285_000,   status: 'not_recommended', score: 61 },
  { ref: 'RFQ/PT/2025/042', title: 'IT Support Services',   submitted: '2024-12-15', value: 480_000,   status: 'awarded',         score: 88 },
];

const DOCS = [
  { label: 'CIPC Registration',    status: 'verified', expiry: null },
  { label: 'Tax Clearance (SARS)', status: 'verified', expiry: '2025-11-30' },
  { label: 'BBBEE Certificate',    status: 'expiring', expiry: '2025-03-31' },
  { label: 'Bank Confirmation',    status: 'verified', expiry: null },
  { label: 'Public Liability',     status: 'missing',  expiry: null },
];

type Tab = 'dashboard' | 'rfqs' | 'bids' | 'documents';

const NAV_TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
  { id: 'rfqs',       label: 'Open RFQs',   icon: Inbox },
  { id: 'bids',       label: 'My Bids',     icon: History },
  { id: 'documents',  label: 'Documents',   icon: FolderOpen },
];

export default function SupplierPortalPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && !user) router.push('/login');
    if (mounted && user && user.role !== 'supplier') router.push('/dashboard');
  }, [mounted, user, router]);

  if (!mounted || !user) return null;

  const docStatusColor = (s: string) =>
    s === 'verified' ? 'text-green-600 bg-green-50 border-green-200' :
    s === 'expiring' ? 'text-amber-600 bg-amber-50 border-amber-200' :
    'text-red-600 bg-red-50 border-red-200';

  const bidStatusColor = (s: string) =>
    s === 'recommended' ? 'bg-blue-50 text-blue-700' :
    s === 'awarded'     ? 'bg-green-50 text-green-700' :
    'bg-gray-100 text-gray-500';

  const openRFQs = INVITED_RFQS.filter(r => r.status === 'open' && !r.submitted).length;
  const pendingDocs = DOCS.filter(d => d.status !== 'verified').length;

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Top header */}
      <header className="bg-white dark:bg-[var(--bg-surface)] border-b border-[var(--border-default)] px-6 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--brand-blue)] flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <div>
            <div className="font-bold text-sm text-[var(--text-primary)]">ProcureTech<span className="text-[var(--brand-blue)]">+</span></div>
            <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Supplier Portal</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs gap-1.5 hidden sm:flex">
            <Building2 className="w-3 h-3" /> Mecer IT Solutions
          </Badge>
          {/* Pending doc alert */}
          {pendingDocs > 0 && (
            <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-xs gap-1">
              <AlertTriangle className="w-3 h-3" /> {pendingDocs} doc{pendingDocs > 1 ? 's' : ''} need attention
            </Badge>
          )}
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
            {theme === 'light' ? <Moon className="w-4 h-4 text-[var(--text-secondary)]" /> : <Sun className="w-4 h-4 text-[var(--text-secondary)]" />}
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </header>

      {/* Navigation tabs */}
      <nav className="bg-white dark:bg-[var(--bg-surface)] border-b border-[var(--border-default)] px-6 sticky top-[53px] z-10">
        <div className="max-w-6xl mx-auto flex items-center gap-1">
          {NAV_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                  isActive
                    ? 'border-[var(--brand-blue)] text-[var(--brand-blue)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-gray-300'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.id === 'rfqs' && openRFQs > 0 && (
                  <span className="ml-1 w-4 h-4 bg-[var(--brand-blue)] text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                    {openRFQs}
                  </span>
                )}
                {tab.id === 'documents' && pendingDocs > 0 && (
                  <span className="ml-1 w-4 h-4 bg-amber-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                    {pendingDocs}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

        {/* ── DASHBOARD TAB ── */}
        {activeTab === 'dashboard' && (
          <>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Welcome back, {user.full_name.split(' ')[0]}</h1>
                <p className="text-sm text-[var(--text-secondary)] mt-0.5">Mecer IT Solutions · Level 1 BBBEE · Grade A (94/100)</p>
              </div>
              <Link href="/supplier-portal/register">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Upload className="w-3.5 h-3.5" /> Update Documents
                </Button>
              </Link>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Open RFQs',    value: '2',  sub: 'Invited to respond', icon: FileText,     color: 'blue'   },
                { label: 'Active Bids',  value: '1',  sub: 'Awaiting decision',  icon: Clock,        color: 'amber'  },
                { label: 'Awards Won',   value: '8',  sub: 'Last 12 months',     icon: CheckCircle2, color: 'green'  },
                { label: 'Avg Score',    value: '88', sub: 'Out of 100',         icon: Star,         color: 'purple' },
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

            {/* Quick nav cards */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { tab: 'rfqs' as Tab,      icon: Inbox,      label: 'Open RFQs',        desc: `${openRFQs} awaiting your bid`,           color: 'blue'   },
                { tab: 'bids' as Tab,      icon: History,    label: 'My Bid History',   desc: `${MY_BIDS.length} bids submitted`,         color: 'green'  },
                { tab: 'documents' as Tab, icon: FolderOpen, label: 'My Documents',     desc: `${pendingDocs} need attention`,            color: 'amber'  },
              ].map(card => {
                const Icon = card.icon;
                return (
                  <button
                    key={card.tab}
                    onClick={() => setActiveTab(card.tab)}
                    className="flex items-center gap-4 p-4 bg-white dark:bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] shadow-sm hover:border-[var(--border-brand)] hover:bg-[var(--brand-blue-light)] dark:hover:bg-blue-900/10 transition-all text-left group"
                  >
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                      card.color === 'blue'  ? 'bg-blue-100 dark:bg-blue-900/30'  :
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
                  </button>
                );
              })}
            </div>

            {/* Recent RFQ invitations preview */}
            <div className="bg-white dark:bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[var(--border-default)] flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Recent RFQ Invitations</h3>
                <button onClick={() => setActiveTab('rfqs')} className="text-xs text-[var(--brand-blue)] hover:underline flex items-center gap-1">
                  View all <ChevronRight className="w-3 h-3" />
                </button>
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
                      <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Submitted</span>
                    ) : rfq.status === 'open' ? (
                      <Button size="sm" className="bg-[var(--brand-blue)] hover:bg-[var(--brand-blue-dark)] text-white text-xs h-8">Submit Bid</Button>
                    ) : (
                      <Button size="sm" variant="outline" className="text-xs h-8 gap-1"><Eye className="w-3 h-3" /> View</Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── OPEN RFQs TAB ── */}
        {activeTab === 'rfqs' && (
          <div className="bg-white dark:bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[var(--border-default)] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">RFQs You've Been Invited To</h3>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{openRFQs} open · respond before closing date</p>
              </div>
              <Badge variant="outline" className="text-xs">{openRFQs} open</Badge>
            </div>
            <div className="divide-y divide-[var(--border-default)]">
              {INVITED_RFQS.map(rfq => (
                <div key={rfq.id} className="px-5 py-5 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-[var(--text-primary)]">{rfq.title}</span>
                      <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full',
                        rfq.status === 'open' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                      )}>{rfq.status === 'open' ? 'Open' : 'Closed'}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-tertiary)]">
                      <span className="font-mono text-[var(--brand-blue)]">{rfq.ref}</span>
                      <span>·</span><span>{rfq.category}</span>
                      <span>·</span><span>Budget: <strong className="text-[var(--text-primary)]">{formatCurrency(rfq.budget)}</strong></span>
                      <span>·</span><span>Closes: <strong className="text-[var(--text-primary)]">{formatDate(rfq.closing)}</strong></span>
                      {rfq.status === 'open' && <span className="text-amber-600 font-semibold">· {rfq.daysLeft} days remaining</span>}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {rfq.submitted ? (
                      <span className="text-xs text-green-600 flex items-center gap-1 font-medium"><CheckCircle2 className="w-3.5 h-3.5" /> Bid Submitted</span>
                    ) : rfq.status === 'open' ? (
                      <Button size="sm" className="bg-[var(--brand-blue)] hover:bg-[var(--brand-blue-dark)] text-white text-xs h-8">
                        Submit Bid
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="text-xs h-8 gap-1"><Eye className="w-3 h-3" /> View Results</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MY BIDS TAB ── */}
        {activeTab === 'bids' && (
          <div className="bg-white dark:bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[var(--border-default)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">My Bid History</h3>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{MY_BIDS.length} bids submitted</p>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-default)] bg-gray-50 dark:bg-white/5">
                  {['Reference', 'Procurement', 'Submitted', 'Bid Value', 'AI Score', 'Outcome'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-default)]">
                {MY_BIDS.map(bid => (
                  <tr key={bid.ref} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3 text-xs text-[var(--brand-blue)] font-mono">{bid.ref}</td>
                    <td className="px-5 py-3 text-sm font-medium text-[var(--text-primary)]">{bid.title}</td>
                    <td className="px-5 py-3 text-xs text-[var(--text-secondary)]">{formatDate(bid.submitted)}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-[var(--text-primary)]">{formatCurrency(bid.value, true)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={cn('h-full rounded-full', bid.score >= 80 ? 'bg-green-500' : bid.score >= 60 ? 'bg-amber-500' : 'bg-red-500')} style={{ width: `${bid.score}%` }} />
                        </div>
                        <span className="text-xs font-medium text-[var(--text-secondary)] w-8">{bid.score}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full capitalize', bidStatusColor(bid.status))}>
                        {bid.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── DOCUMENTS TAB ── */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[var(--border-default)] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">Document Status</h3>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Keep all documents current to remain eligible for RFQs</p>
                </div>
                <Link href="/supplier-portal/register">
                  <Button size="sm" className="bg-[var(--brand-blue)] text-white text-xs h-8 gap-1.5">
                    <Upload className="w-3.5 h-3.5" /> Upload Documents
                  </Button>
                </Link>
              </div>
              <div className="divide-y divide-[var(--border-default)]">
                {DOCS.map(doc => (
                  <div key={doc.label} className="px-5 py-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-[var(--text-primary)]">{doc.label}</div>
                      {doc.expiry && (
                        <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                          Expires: {formatDate(doc.expiry)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full border', docStatusColor(doc.status))}>
                        {doc.status === 'verified' ? '✓ Verified' : doc.status === 'expiring' ? '⚠ Expiring Soon' : '✗ Missing'}
                      </span>
                      {doc.status !== 'verified' && (
                        <Link href="/supplier-portal/register">
                          <Button size="sm" variant="outline" className="text-xs h-7 gap-1">
                            <Upload className="w-3 h-3" /> {doc.status === 'missing' ? 'Upload' : 'Renew'}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {pendingDocs > 0 && (
              <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  <strong>{pendingDocs} document{pendingDocs > 1 ? 's' : ''}</strong> require attention.
                  Suppliers with expired or missing documents may be excluded from RFQ invitations.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
