'use client';

import { Topbar } from '@/components/layout/topbar';
import { useAuth } from '@/lib/auth-context';
import { DEMO_PROCUREMENTS, DEMO_BIDS } from '@/lib/demo-data';
import { formatCurrency, formatDate, getStatusColor, STATUS_LABELS, CIPS_STAGES, getStageIndex, timeAgo } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp, TrendingDown, Clock, AlertTriangle, CheckCircle2,
  ArrowRight, Bot, FileText, BarChart3, ChevronRight, Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const STAT_CARDS = [
  {
    label: 'Active Procurements',
    value: '12',
    sub: '4 awaiting quotes',
    delta: '+3 this week',
    trend: 'up',
    accent: 'blue',
    icon: FileText,
  },
  {
    label: 'Pending Evaluation',
    value: '3',
    sub: 'R2.4M in value',
    delta: 'AI ready to score',
    trend: 'neutral',
    accent: 'amber',
    icon: Clock,
  },
  {
    label: 'Verified Suppliers',
    value: '284',
    sub: 'South Africa',
    delta: '+18 new this month',
    trend: 'up',
    accent: 'green',
    icon: CheckCircle2,
  },
  {
    label: 'Savings vs Market',
    value: '11.4%',
    sub: 'Last 30 days',
    delta: 'R184k saved',
    trend: 'up',
    accent: 'green',
    icon: TrendingUp,
  },
];

const ACTIVITY = [
  { color: 'green',  text: 'AI evaluated 3 quotes for <b>Dell Laptops</b> — Mecer IT recommended', time: '2 min ago' },
  { color: 'amber',  text: 'BBBEE certificate expired for <b>TechSupply Co</b>', time: '1 hour ago' },
  { color: 'blue',   text: 'RFQ sent to 4 suppliers for <b>Concrete Supply</b>', time: '3 hours ago' },
  { color: 'red',    text: 'PPE RFQ deadline passed — 0 responses received', time: 'Yesterday' },
  { color: 'green',  text: 'PO #PT-2025-089 issued to <b>Steelcase SA</b>', time: 'Yesterday' },
  { color: 'purple', text: 'Approval request sent to <b>Naledi Dlamini</b> for Laptop RFQ', time: '2 days ago' },
];

const DOT_COLORS: Record<string, string> = {
  green: 'bg-green-500', amber: 'bg-amber-500', blue: 'bg-blue-500',
  red: 'bg-red-500', purple: 'bg-purple-500',
};

const ACCENT_CLASSES: Record<string, string> = {
  blue:  'accent-blue',
  amber: 'accent-amber',
  green: 'accent-green',
  red:   'accent-red',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.full_name?.split(' ')[0] ?? 'there';

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Dashboard" subtitle={`Welcome back, ${firstName}`} />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* AI Insight Banner */}
        <div className="flex items-start gap-3 bg-[var(--brand-blue-light)] dark:bg-blue-900/20 border border-[var(--border-brand)] dark:border-blue-800 rounded-xl px-4 py-3">
          <div className="w-7 h-7 rounded-lg bg-[var(--brand-blue)] flex items-center justify-center shrink-0 mt-0.5">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--brand-blue)] dark:text-blue-300">AI Insight</p>
            <p className="text-xs text-[var(--text-secondary)] dark:text-blue-200 mt-0.5 leading-relaxed">
              3 procurements are overdue for approval. The Dell Laptop bid evaluation is complete — Mecer IT Solutions is recommended at R1,140,000, saving R60,000 against budget. Approve now to stay on schedule.
            </p>
          </div>
          <Link href="/procurements">
            <Button size="sm" variant="outline" className="border-[var(--brand-blue)] text-[var(--brand-blue)] hover:bg-[var(--brand-blue)] hover:text-white text-xs h-8 shrink-0">
              Review
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          {STAT_CARDS.map(card => (
            <div key={card.label} className={cn('status-bar-top bg-white dark:bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-4 shadow-sm', ACCENT_CLASSES[card.accent])}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">{card.label}</span>
                <div className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center',
                  card.accent === 'blue'  ? 'bg-blue-50 dark:bg-blue-900/30' :
                  card.accent === 'amber' ? 'bg-amber-50 dark:bg-amber-900/30' :
                  'bg-green-50 dark:bg-green-900/30'
                )}>
                  <card.icon className={cn('w-3.5 h-3.5',
                    card.accent === 'blue'  ? 'text-blue-600' :
                    card.accent === 'amber' ? 'text-amber-600' :
                    'text-green-600'
                  )} />
                </div>
              </div>
              <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">{card.value}</div>
              <div className="text-xs text-[var(--text-tertiary)]">{card.sub}</div>
              <div className={cn('flex items-center gap-1 mt-2 text-xs font-medium',
                card.trend === 'up' ? 'text-green-600' : 'text-[var(--text-tertiary)]'
              )}>
                {card.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                {card.delta}
              </div>
            </div>
          ))}
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-3 gap-4">

          {/* Procurement pipeline — spans 2 cols */}
          <div className="col-span-2 bg-white dark:bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-default)]">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Recent Procurements</h3>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Last 30 days</p>
              </div>
              <Link href="/procurements">
                <Button variant="ghost" size="sm" className="text-xs text-[var(--text-secondary)] h-7 gap-1">
                  View all <ChevronRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
            <div className="divide-y divide-[var(--border-default)]">
              {DEMO_PROCUREMENTS.slice(0, 5).map(p => {
                const stageIdx = getStageIndex(p.current_stage);
                const progressPct = Math.round((stageIdx / (CIPS_STAGES.length - 1)) * 100);
                return (
                  <Link key={p.id} href={`/procurements/${p.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-[var(--text-primary)] truncate">{p.title}</span>
                        <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full whitespace-nowrap', getStatusColor(p.status))}>
                          {STATUS_LABELS[p.status]}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[var(--text-tertiary)]">{p.reference}</span>
                        <span className="text-xs text-[var(--text-tertiary)]">·</span>
                        <span className="text-xs text-[var(--text-tertiary)]">Due {formatDate(p.required_by)}</span>
                      </div>
                      <div className="mt-1.5">
                        <Progress value={progressPct} className="h-1" />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold text-[var(--text-primary)]">{formatCurrency(p.budget, true)}</div>
                      <div className="text-xs text-[var(--text-tertiary)] mt-0.5 capitalize">{p.type.toUpperCase()}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white dark:bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[var(--border-default)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Activity Feed</h3>
            </div>
            <div className="divide-y divide-[var(--border-default)]">
              {ACTIVITY.map((a, i) => (
                <div key={i} className="flex gap-3 px-4 py-3">
                  <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', DOT_COLORS[a.color])} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed" dangerouslySetInnerHTML={{ __html: a.text.replace(/<b>/g, '<strong class="text-gray-800 dark:text-gray-200">').replace(/<\/b>/g, '</strong>') }} />
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] shadow-sm p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              { href: '/procurements/new', icon: FileText, label: 'New Procurement', desc: 'Start the CIPS cycle', color: 'blue' },
              { href: '/copilot',          icon: Bot,      label: 'AI Copilot',       desc: 'Generate documents', color: 'indigo' },
              { href: '/suppliers',        icon: CheckCircle2, label: 'Supplier Directory', desc: 'Browse & evaluate', color: 'green' },
              { href: '/analytics',        icon: BarChart3, label: 'Analytics',       desc: 'Spend & performance', color: 'amber' },
            ].map(action => (
              <Link key={action.href} href={action.href}>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border-default)] hover:border-[var(--border-brand)] hover:bg-[var(--brand-blue-light)] dark:hover:bg-blue-900/10 transition-all cursor-pointer group">
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                    action.color === 'blue'   ? 'bg-blue-100 dark:bg-blue-900/30' :
                    action.color === 'indigo' ? 'bg-indigo-100 dark:bg-indigo-900/30' :
                    action.color === 'green'  ? 'bg-green-100 dark:bg-green-900/30' :
                    'bg-amber-100 dark:bg-amber-900/30'
                  )}>
                    <action.icon className={cn('w-4 h-4',
                      action.color === 'blue'   ? 'text-blue-600' :
                      action.color === 'indigo' ? 'text-indigo-600' :
                      action.color === 'green'  ? 'text-green-600' :
                      'text-amber-600'
                    )} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[var(--text-primary)]">{action.label}</div>
                    <div className="text-[11px] text-[var(--text-tertiary)]">{action.desc}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
