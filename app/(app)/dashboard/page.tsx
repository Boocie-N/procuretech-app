'use client';

import { useMemo } from 'react';
import { Topbar } from '@/components/layout/topbar';
import { useAuth } from '@/lib/auth-context';
import { DEMO_PROCUREMENTS, DEMO_SUPPLIERS, DEMO_AUDIT_EVENTS, DEMO_BIDS } from '@/lib/demo-data';
import { formatCurrency, formatDate, getStatusColor, STATUS_LABELS, CIPS_STAGES, getStageIndex } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp, Clock, AlertTriangle, CheckCircle2,
  ArrowRight, Bot, FileText, BarChart3, ChevronRight, Zap,
  ShieldCheck, Scale, Banknote, Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { User } from '@/types';

const DOT_COLORS: Record<string, string> = {
  green: 'bg-green-500', amber: 'bg-amber-500', blue: 'bg-blue-500',
  red: 'bg-red-500', purple: 'bg-purple-500',
};

const ACCENT_CLASSES: Record<string, string> = {
  blue: 'accent-blue', amber: 'accent-amber', green: 'accent-green', red: 'accent-red',
};

// ── Role-specific dashboard config ──────────────────────────────────────────

function getDashboardConfig(user: User) {
  const myProcurements = DEMO_PROCUREMENTS.filter(p => p.assigned_to === user.id);
  const allProcurements = DEMO_PROCUREMENTS;
  const activeSets = ['rfq_sent', 'bids_received', 'evaluation', 'recommendation', 'market_research', 'strategy_approved', 'needs_identified'];
  const approvedSuppliers = DEMO_SUPPLIERS.filter(s => s.status === 'approved').length;

  // Procurements awaiting this role's approval
  const awaitingMyApproval = allProcurements.filter(p =>
    p.approval_chain.some(step => step.role === user.role && step.status === 'pending')
  );

  switch (user.role) {

    case 'procurement_officer': {
      const myActive = myProcurements.filter(p => activeSets.includes(p.status));
      const myAwaiting = myProcurements.filter(p => p.status === 'approval' || p.approval_chain[0]?.status === 'pending');
      const totalBudget = myProcurements.reduce((s, p) => s + p.budget, 0);
      const totalEstimated = myProcurements.reduce((s, p) => s + (p.estimated_value ?? p.budget), 0);
      const savings = totalBudget - totalEstimated;
      const savingsPct = totalBudget > 0 ? ((savings / totalBudget) * 100).toFixed(1) : '0';

      return {
        kpis: [
          { label: 'My Active Procurements', value: String(myActive.length), sub: `${myProcurements.length} total assigned`, delta: `${myAwaiting.length} awaiting action`, trend: 'neutral', accent: 'blue', icon: FileText },
          { label: 'Pending Evaluation', value: String(myProcurements.filter(p => p.status === 'evaluation').length), sub: 'Bids to score', delta: 'AI ready to assist', trend: 'neutral', accent: 'amber', icon: Clock },
          { label: 'Approved Suppliers', value: String(approvedSuppliers), sub: 'South Africa', delta: '+2 new this month', trend: 'up', accent: 'green', icon: CheckCircle2 },
          { label: 'Budget vs Estimated', value: `${savingsPct}%`, sub: 'Savings on my work', delta: formatCurrency(savings, true) + ' saved', trend: 'up', accent: 'green', icon: TrendingUp },
        ],
        insight: 'The Dell Laptop bid evaluation is complete — Mecer IT Solutions is recommended at R1,140,000, saving R60,000 vs budget. 1 procurement needs your action to move to the next CIPS stage.',
        insightLink: '/procurements',
        procurements: myProcurements,
        activity: [
          { color: 'green', text: 'AI evaluated 3 quotes for <b>Dell Laptops</b> — Mecer IT recommended', time: '2 min ago' },
          { color: 'amber', text: 'BBBEE certificate expired for <b>TechSupply Co</b>', time: '1 hour ago' },
          { color: 'blue', text: 'RFQ sent to 4 suppliers for <b>Concrete Supply</b>', time: '3 hours ago' },
          { color: 'red', text: 'PPE RFQ deadline passed — 0 responses received', time: 'Yesterday' },
          { color: 'purple', text: 'Approval request sent to <b>Naledi Dlamini</b> for Laptop RFQ', time: '2 days ago' },
        ],
        quickActions: [
          { href: '/procurements/new', icon: FileText, label: 'New Procurement', desc: 'Start the CIPS cycle', color: 'blue' },
          { href: '/copilot', icon: Bot, label: 'AI Copilot', desc: 'Generate documents', color: 'indigo' },
          { href: '/suppliers', icon: CheckCircle2, label: 'Supplier Directory', desc: 'Browse & evaluate', color: 'green' },
          { href: '/analytics', icon: BarChart3, label: 'Analytics', desc: 'Spend & performance', color: 'amber' },
        ],
      };
    }

    case 'manager': {
      const teamActive = allProcurements.filter(p => activeSets.includes(p.status));
      const totalBudget = allProcurements.reduce((s, p) => s + p.budget, 0);

      return {
        kpis: [
          { label: 'Team Active', value: String(teamActive.length), sub: `${allProcurements.length} total procurements`, delta: `${awaitingMyApproval.length} awaiting your approval`, trend: awaitingMyApproval.length > 0 ? 'up' : 'neutral', accent: 'blue', icon: FileText },
          { label: 'Pending Your Approval', value: String(awaitingMyApproval.length), sub: `${formatCurrency(awaitingMyApproval.reduce((s, p) => s + p.budget, 0), true)} in value`, delta: 'Action required', trend: 'neutral', accent: 'amber', icon: Clock },
          { label: 'Approved Suppliers', value: String(approvedSuppliers), sub: `${DEMO_SUPPLIERS.filter(s => s.status === 'conditional').length} conditional`, delta: 'Manage supplier base', trend: 'up', accent: 'green', icon: Users },
          { label: 'Total Portfolio', value: formatCurrency(totalBudget, true), sub: 'Active procurements', delta: `${allProcurements.filter(p => p.status === 'awarded').length} awarded`, trend: 'up', accent: 'green', icon: TrendingUp },
        ],
        insight: `${awaitingMyApproval.length} procurement${awaitingMyApproval.length !== 1 ? 's' : ''} await your approval. The Dell Laptop evaluation is complete — Mecer IT Solutions recommended at R1,140,000. Review and approve to keep the team on schedule.`,
        insightLink: '/approvals',
        procurements: allProcurements,
        activity: [
          { color: 'purple', text: '<b>Thabo Mokoena</b> submitted Dell Laptop RFQ for your approval', time: '2 min ago' },
          { color: 'green', text: 'AI evaluated 3 quotes for <b>Dell Laptops</b> — ready to review', time: '10 min ago' },
          { color: 'blue', text: '<b>Concrete Supply</b> RFQ sent to 4 suppliers by Thabo', time: '3 hours ago' },
          { color: 'amber', text: 'BBBEE certificate expired for <b>TechSupply Co</b>', time: '1 hour ago' },
          { color: 'green', text: '<b>Security Services</b> contract awarded to Ndalo Security', time: '2 days ago' },
        ],
        quickActions: [
          { href: '/approvals', icon: CheckCircle2, label: 'Approvals', desc: `${awaitingMyApproval.length} pending`, color: 'amber' },
          { href: '/analytics', icon: BarChart3, label: 'Analytics', desc: 'Team performance', color: 'blue' },
          { href: '/suppliers', icon: Users, label: 'Supplier Directory', desc: 'Approve suppliers', color: 'green' },
          { href: '/copilot', icon: Bot, label: 'AI Copilot', desc: 'Strategy & docs', color: 'indigo' },
        ],
      };
    }

    case 'cfo': {
      const pendingFinancial = awaitingMyApproval;
      const awardedTotal = allProcurements.filter(p => p.status === 'awarded' || p.status === 'contracted').reduce((s, p) => s + (p.estimated_value ?? p.budget), 0);
      const totalCommitted = allProcurements.reduce((s, p) => s + p.budget, 0);

      return {
        kpis: [
          { label: 'Pending Financial Approval', value: String(pendingFinancial.length), sub: formatCurrency(pendingFinancial.reduce((s, p) => s + p.budget, 0)) + ' in value', delta: 'Action required', trend: 'neutral', accent: 'amber', icon: Clock },
          { label: 'Committed Spend', value: formatCurrency(totalCommitted, true), sub: 'All active procurements', delta: `${allProcurements.length} procurements`, trend: 'neutral', accent: 'blue', icon: Banknote },
          { label: 'Awarded to Date', value: formatCurrency(awardedTotal, true), sub: 'Contracts & POs', delta: `${allProcurements.filter(p => p.status === 'awarded').length} active contracts`, trend: 'up', accent: 'green', icon: CheckCircle2 },
          { label: 'BBBEE Compliance', value: '82%', sub: 'Preferential spend', delta: 'Above 80% target', trend: 'up', accent: 'green', icon: ShieldCheck },
        ],
        insight: `${pendingFinancial.length} procurement${pendingFinancial.length !== 1 ? 's' : ''} await your financial sign-off. Total committed value: ${formatCurrency(totalCommitted)}. BBBEE preferential spend is tracking at 82% — above the 80% organisational target.`,
        insightLink: '/approvals',
        procurements: allProcurements,
        activity: [
          { color: 'purple', text: 'Financial approval required — <b>Dell Laptops</b> R1,140,000', time: '2 min ago' },
          { color: 'green', text: 'PO #PT-2025-089 issued — <b>Steelcase SA</b> R315,000', time: '1 day ago' },
          { color: 'blue', text: 'Contract value updated — <b>Security Services</b> R540,000', time: '2 days ago' },
          { color: 'amber', text: 'Budget variance flagged — <b>Concrete Supply</b> 8% over estimate', time: '3 days ago' },
          { color: 'green', text: 'Quarterly spend report generated — R2.1M total', time: '1 week ago' },
        ],
        quickActions: [
          { href: '/approvals', icon: CheckCircle2, label: 'Approvals', desc: `${pendingFinancial.length} pending`, color: 'amber' },
          { href: '/contracts', icon: Banknote, label: 'Contracts', desc: 'Active POs & contracts', color: 'blue' },
          { href: '/analytics', icon: BarChart3, label: 'Analytics', desc: 'Spend & BBBEE', color: 'green' },
          { href: '/compliance', icon: ShieldCheck, label: 'Compliance', desc: 'PPPFA tracker', color: 'indigo' },
        ],
      };
    }

    case 'legal': {
      const pendingLegal = awaitingMyApproval;

      return {
        kpis: [
          { label: 'Pending Legal Review', value: String(pendingLegal.length), sub: 'Contracts to review', delta: 'Action required', trend: 'neutral', accent: 'amber', icon: Scale },
          { label: 'Active Contracts', value: String(allProcurements.filter(p => p.status === 'contracted' || p.status === 'awarded').length), sub: 'Under active management', delta: 'Review for compliance', trend: 'neutral', accent: 'blue', icon: FileText },
          { label: 'COI Declarations', value: '0', sub: 'Conflicts of interest', delta: 'All clear', trend: 'up', accent: 'green', icon: ShieldCheck },
          { label: 'Deviations', value: '1', sub: 'Open deviation register', delta: 'Requires review', trend: 'neutral', accent: 'amber', icon: AlertTriangle },
        ],
        insight: `${pendingLegal.length} procurement${pendingLegal.length !== 1 ? 's' : ''} require legal review and sign-off. The Security Services contract and Dell Laptops award are pending your approval to complete the PPPFA compliance chain.`,
        insightLink: '/approvals',
        procurements: allProcurements,
        activity: [
          { color: 'purple', text: 'Legal approval required — <b>Dell Laptops</b> RFQ/PT/2025/048', time: '1 hour ago' },
          { color: 'green', text: '<b>Security Services</b> contract signed — all approvals complete', time: '2 days ago' },
          { color: 'blue', text: 'Audit trail reviewed — <b>Office Furniture</b> hash chain verified', time: '3 days ago' },
          { color: 'amber', text: 'Deviation register updated — <b>Concrete Supply</b> sole source', time: '1 week ago' },
          { color: 'green', text: 'COI declarations submitted by all 4 evaluation committee members', time: '1 week ago' },
        ],
        quickActions: [
          { href: '/approvals', icon: Scale, label: 'Approvals', desc: `${pendingLegal.length} pending`, color: 'amber' },
          { href: '/audit-trail', icon: ShieldCheck, label: 'Audit Trail', desc: 'Blockchain verified', color: 'blue' },
          { href: '/compliance', icon: AlertTriangle, label: 'Compliance', desc: 'Deviations & COI', color: 'indigo' },
          { href: '/contracts', icon: FileText, label: 'Contracts', desc: 'Active contracts', color: 'green' },
        ],
      };
    }

    case 'admin':
    default: {
      const activeAll = allProcurements.filter(p => activeSets.includes(p.status));
      const totalBudget = allProcurements.reduce((s, p) => s + p.budget, 0);
      const totalEstimated = allProcurements.reduce((s, p) => s + (p.estimated_value ?? p.budget), 0);
      const savings = totalBudget - totalEstimated;
      const savingsPct = totalBudget > 0 ? ((savings / totalBudget) * 100).toFixed(1) : '0';

      return {
        kpis: [
          { label: 'Active Procurements', value: String(activeAll.length), sub: `${allProcurements.length} total`, delta: `${awaitingMyApproval.length} awaiting approval`, trend: 'up', accent: 'blue', icon: FileText },
          { label: 'Pending Evaluation', value: String(allProcurements.filter(p => p.status === 'evaluation').length), sub: 'Bids to score', delta: 'AI ready to score', trend: 'neutral', accent: 'amber', icon: Clock },
          { label: 'Verified Suppliers', value: String(approvedSuppliers), sub: 'South Africa', delta: '+2 new this month', trend: 'up', accent: 'green', icon: CheckCircle2 },
          { label: 'Savings vs Budget', value: `${savingsPct}%`, sub: 'Across all procurements', delta: formatCurrency(savings, true) + ' saved', trend: 'up', accent: 'green', icon: TrendingUp },
        ],
        insight: '3 procurements are overdue for approval. The Dell Laptop bid evaluation is complete — Mecer IT Solutions is recommended at R1,140,000, saving R60,000 against budget. Approve now to stay on schedule.',
        insightLink: '/procurements',
        procurements: allProcurements,
        activity: [
          { color: 'green', text: 'AI evaluated 3 quotes for <b>Dell Laptops</b> — Mecer IT recommended', time: '2 min ago' },
          { color: 'amber', text: 'BBBEE certificate expired for <b>TechSupply Co</b>', time: '1 hour ago' },
          { color: 'blue', text: 'RFQ sent to 4 suppliers for <b>Concrete Supply</b>', time: '3 hours ago' },
          { color: 'red', text: 'PPE RFQ deadline passed — 0 responses received', time: 'Yesterday' },
          { color: 'green', text: 'PO #PT-2025-089 issued to <b>Steelcase SA</b>', time: 'Yesterday' },
          { color: 'purple', text: 'Approval request sent to <b>Naledi Dlamini</b> for Laptop RFQ', time: '2 days ago' },
        ],
        quickActions: [
          { href: '/procurements/new', icon: FileText, label: 'New Procurement', desc: 'Start the CIPS cycle', color: 'blue' },
          { href: '/copilot', icon: Bot, label: 'AI Copilot', desc: 'Generate documents', color: 'indigo' },
          { href: '/suppliers', icon: CheckCircle2, label: 'Supplier Directory', desc: 'Browse & evaluate', color: 'green' },
          { href: '/analytics', icon: BarChart3, label: 'Analytics', desc: 'Spend & performance', color: 'amber' },
        ],
      };
    }
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.full_name?.split(' ')[0] ?? 'there';

  const config = useMemo(() => {
    if (!user) return null;
    return getDashboardConfig(user);
  }, [user]);

  if (!config) return null;

  const { kpis, insight, insightLink, procurements, activity, quickActions } = config;

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
            <p className="text-xs text-[var(--text-secondary)] dark:text-blue-200 mt-0.5 leading-relaxed">{insight}</p>
          </div>
          <Link href={insightLink}>
            <Button size="sm" variant="outline" className="border-[var(--brand-blue)] text-[var(--brand-blue)] hover:bg-[var(--brand-blue)] hover:text-white text-xs h-8 shrink-0">
              Review
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          {kpis.map(card => (
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
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  {procurements.length} {user?.role === 'procurement_officer' ? 'assigned to you' : 'total'}
                </p>
              </div>
              <Link href="/procurements">
                <Button variant="ghost" size="sm" className="text-xs text-[var(--text-secondary)] h-7 gap-1">
                  View all <ChevronRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
            <div className="divide-y divide-[var(--border-default)]">
              {procurements.slice(0, 5).map(p => {
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
                      <div className="text-xs text-[var(--text-tertiary)] mt-0.5">{p.type.toUpperCase()}</div>
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
              {activity.map((a, i) => (
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
            {quickActions.map(action => (
              <Link key={action.href} href={action.href}>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border-default)] hover:border-[var(--border-brand)] hover:bg-[var(--brand-blue-light)] dark:hover:bg-blue-900/10 transition-all cursor-pointer group">
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                    action.color === 'blue'   ? 'bg-blue-100 dark:bg-blue-900/30' :
                    action.color === 'indigo' ? 'bg-indigo-100 dark:bg-indigo-900/30' :
                    action.color === 'green'  ? 'bg-green-100 dark:bg-green-900/30' :
                    action.color === 'amber'  ? 'bg-amber-100 dark:bg-amber-900/30' :
                    'bg-purple-100 dark:bg-purple-900/30'
                  )}>
                    <action.icon className={cn('w-4 h-4',
                      action.color === 'blue'   ? 'text-blue-600' :
                      action.color === 'indigo' ? 'text-indigo-600' :
                      action.color === 'green'  ? 'text-green-600' :
                      action.color === 'amber'  ? 'text-amber-600' :
                      'text-purple-600'
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
