'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Search, Eye } from 'lucide-react';
import { Topbar } from '@/components/layout/topbar';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DEMO_PROCUREMENTS } from '@/lib/demo-data';
import {
  formatCurrency,
  formatDate,
  getStatusColor,
  STATUS_LABELS,
  CIPS_STAGES,
  getStageIndex,
} from '@/lib/utils';
import type { ProcurementStatus, ProcurementCategory } from '@/types';

const TAB_FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Pending Approval', value: 'approval' },
  { label: 'Awarded', value: 'awarded' },
  { label: 'Completed', value: 'completed' },
];

const CATEGORY_LABELS: Record<ProcurementCategory, string> = {
  it_equipment: 'IT Equipment',
  office_supplies: 'Office Supplies',
  construction: 'Construction',
  professional_services: 'Professional Services',
  facilities: 'Facilities',
  logistics: 'Logistics',
  security: 'Security',
  healthcare: 'Healthcare',
  marketing: 'Marketing',
  other: 'Other',
};

function matchesTab(status: ProcurementStatus, tab: string): boolean {
  if (tab === 'all') return true;
  if (tab === 'active') return ['rfq_sent', 'bids_received', 'evaluation', 'recommendation', 'market_research', 'strategy_approved'].includes(status);
  if (tab === 'approval') return status === 'approval';
  if (tab === 'awarded') return status === 'awarded' || status === 'contracted';
  if (tab === 'completed') return status === 'closed' || status === 'delivered';
  return true;
}

export default function ProcurementsPage() {
  const { user, can } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Officers see only their own; roles with view_all_procurements see everything
  const baseProcurements = useMemo(() => {
    if (!user) return DEMO_PROCUREMENTS;
    if (can('view_all_procurements')) return DEMO_PROCUREMENTS;
    return DEMO_PROCUREMENTS.filter(p => p.assigned_to === user.id || p.created_by === user.id);
  }, [user, can]);

  const filtered = useMemo(() => {
    return baseProcurements.filter((p) => {
      if (!matchesTab(p.status, activeTab)) return false;
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !p.reference.toLowerCase().includes(q) &&
          !p.title.toLowerCase().includes(q) &&
          !p.category.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [baseProcurements, activeTab, search, categoryFilter]);

  const categories = Array.from(new Set(baseProcurements.map((p) => p.category)));

  const pageTitle = can('view_all_procurements') ? 'All Procurements' : 'My Procurements';
  const pageSubtitle = `${baseProcurements.length} ${can('view_all_procurements') ? 'total' : 'assigned to you'}`;

  return (
    <div className="flex flex-col h-full">
      <Topbar
        title={pageTitle}
        subtitle={pageSubtitle}
        actions={
          <Link href="/procurements/new">
            <Button size="sm" className="bg-[var(--brand-blue)] hover:bg-blue-700 text-white gap-1.5 h-8 text-xs">
              <Plus className="w-3.5 h-3.5" />
              New Procurement
            </Button>
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-[var(--border-default)]">
          {TAB_FILTERS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.value
                  ? 'border-[var(--brand-blue)] text-[var(--brand-blue)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <Input
              placeholder="Search procurements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <Select value={categoryFilter} onValueChange={(v) => { if (v) setCategoryFilter(v); }}>
            <SelectTrigger className="w-44 h-9 text-sm">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white border border-[var(--border-default)] rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-default)] bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)] text-xs uppercase tracking-wide">Reference</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)] text-xs uppercase tracking-wide">Title</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)] text-xs uppercase tracking-wide">Category</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)] text-xs uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)] text-xs uppercase tracking-wide">Budget</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)] text-xs uppercase tracking-wide w-44">Stage</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)] text-xs uppercase tracking-wide">Required By</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)] text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[var(--text-tertiary)] text-sm">
                    No procurements found.
                  </td>
                </tr>
              )}
              {filtered.map((p, idx) => {
                const stageIdx = getStageIndex(p.current_stage);
                const stagePct = Math.round(((stageIdx + 1) / CIPS_STAGES.length) * 100);
                const stageLabel = CIPS_STAGES[stageIdx]?.label ?? p.current_stage;
                return (
                  <tr
                    key={p.id}
                    className={`border-b border-[var(--border-default)] hover:bg-gray-50 transition-colors ${idx === filtered.length - 1 ? 'border-b-0' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-[var(--brand-blue)] font-medium">{p.reference}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-[var(--text-primary)] line-clamp-1">{p.title}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[var(--text-secondary)]">{CATEGORY_LABELS[p.category]}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(p.status)}`}>
                        {STATUS_LABELS[p.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-[var(--text-primary)]">{formatCurrency(p.budget)}</span>
                    </td>
                    <td className="px-4 py-3 w-44">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[var(--text-secondary)] truncate">{stageLabel}</span>
                          <span className="text-xs text-[var(--text-tertiary)] ml-1">{stagePct}%</span>
                        </div>
                        <Progress value={stagePct} className="h-1.5" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[var(--text-secondary)]">{formatDate(p.required_by)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/procurements/${p.id}`}>
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                          <Eye className="w-3 h-3" />
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <p className="text-xs text-[var(--text-tertiary)] text-right">
          Showing {filtered.length} of {baseProcurements.length} procurements
        </p>
      </div>
    </div>
  );
}
