'use client';

import { useState } from 'react';
import { CheckCircle, RotateCcw, Clock, AlertCircle } from 'lucide-react';
import { Topbar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { DEMO_PROCUREMENTS } from '@/lib/demo-data';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency, formatDate, getStatusColor, STATUS_LABELS, ROLE_LABELS } from '@/lib/utils';
import { toast } from 'sonner';
import type { Procurement } from '@/types';

const TABS = [
  { label: 'Pending My Approval', value: 'mine' },
  { label: 'All Approvals', value: 'all' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400_000);
}

function getPendingStep(procurement: Procurement) {
  return procurement.approval_chain.find((s) => s.status === 'pending');
}

export default function ApprovalsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('mine');
  const [approveTarget, setApproveTarget] = useState<Procurement | null>(null);
  const [comment, setComment] = useState('');

  // Pending my approval: next pending step matches user's role
  const pendingMine = DEMO_PROCUREMENTS.filter((p) => {
    const pending = getPendingStep(p);
    return pending && user && pending.role === user.role;
  });

  // All approvals
  const allApprovals = DEMO_PROCUREMENTS;

  // Approved: all steps approved
  const fullyApproved = DEMO_PROCUREMENTS.filter((p) =>
    p.approval_chain.every((s) => s.status === 'approved')
  );

  // Rejected: any step rejected
  const rejected = DEMO_PROCUREMENTS.filter((p) =>
    p.approval_chain.some((s) => s.status === 'rejected')
  );

  function handleApprove() {
    if (!approveTarget) return;
    toast.success(`Procurement ${approveTarget.reference} approved. Notification sent to next approver.`);
    setApproveTarget(null);
    setComment('');
  }

  function handleReturn(proc: Procurement) {
    toast.success(`Procurement ${proc.reference} returned for revision.`);
  }

  function PendingCard({ proc }: { proc: Procurement }) {
    const pending = getPendingStep(proc);
    const days = daysSince(proc.updated_at);
    return (
      <div className="bg-white border border-[var(--border-default)] rounded-xl shadow-sm p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-[var(--brand-blue)] font-medium">{proc.reference}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(proc.status)}`}>
                {STATUS_LABELS[proc.status]}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">{proc.title}</h3>
          </div>
          <div className="text-right shrink-0">
            <p className="text-base font-bold text-[var(--text-primary)]">{formatCurrency(proc.budget)}</p>
            <p className="text-xs text-[var(--text-tertiary)]">Budget</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
          <div>
            <p className="text-xs text-[var(--text-tertiary)]">Required By</p>
            <p className="font-medium text-[var(--text-primary)]">{formatDate(proc.required_by)}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-tertiary)]">Submitted By</p>
            <p className="font-medium text-[var(--text-primary)]">Thabo Mokoena</p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-tertiary)]">Waiting</p>
            <p className={`font-medium ${days > 5 ? 'text-red-600' : 'text-[var(--text-primary)]'}`}>
              {days} day{days !== 1 ? 's' : ''}
              {days > 5 && <AlertCircle className="w-3.5 h-3.5 inline ml-1" />}
            </p>
          </div>
        </div>

        {pending && (
          <div className="flex items-center gap-2 mb-4 text-xs text-[var(--text-secondary)] bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            Awaiting: <span className="font-medium">{pending.role_label}</span> (Step {pending.step} of {proc.approval_chain.length})
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white gap-1.5 h-8 text-xs"
            onClick={() => setApproveTarget(proc)}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-amber-700 border-amber-300 hover:bg-amber-50 gap-1.5 h-8 text-xs"
            onClick={() => handleReturn(proc)}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Return for Revision
          </Button>
        </div>
      </div>
    );
  }

  function ApprovalChainTable({ procurements }: { procurements: Procurement[] }) {
    return (
      <div className="bg-white border border-[var(--border-default)] rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-default)] bg-gray-50">
              {['Reference', 'Title', 'Budget', 'Status', 'Officer', 'Manager', 'CFO', 'Legal'].map((h) => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {procurements.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-[var(--text-tertiary)]">No procurements found.</td></tr>
            )}
            {procurements.map((p, idx) => {
              const stepStatus = (step: number) => {
                const s = p.approval_chain.find((a) => a.step === step);
                if (!s) return null;
                const colors = { approved: 'text-green-600', pending: 'text-amber-600', rejected: 'text-red-600', returned: 'text-orange-600' };
                const icons = {
                  approved: <CheckCircle className="w-4 h-4 text-green-500" />,
                  pending: <Clock className="w-4 h-4 text-amber-400" />,
                  rejected: <AlertCircle className="w-4 h-4 text-red-500" />,
                  returned: <RotateCcw className="w-4 h-4 text-orange-500" />,
                };
                return (
                  <div className={`flex items-center gap-1 text-xs ${colors[s.status]}`}>
                    {icons[s.status]}
                    <span className="capitalize">{s.status}</span>
                  </div>
                );
              };
              return (
                <tr key={p.id} className={`border-b border-[var(--border-default)] hover:bg-gray-50 ${idx === procurements.length - 1 ? 'border-b-0' : ''}`}>
                  <td className="px-4 py-3"><span className="font-mono text-xs text-[var(--brand-blue)]">{p.reference}</span></td>
                  <td className="px-4 py-3"><span className="text-[var(--text-primary)] font-medium">{p.title.slice(0, 30)}{p.title.length > 30 ? '…' : ''}</span></td>
                  <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{formatCurrency(p.budget)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(p.status)}`}>{STATUS_LABELS[p.status]}</span>
                  </td>
                  <td className="px-4 py-3">{stepStatus(1)}</td>
                  <td className="px-4 py-3">{stepStatus(2)}</td>
                  <td className="px-4 py-3">{stepStatus(3)}</td>
                  <td className="px-4 py-3">{stepStatus(4)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Approvals" subtitle="Manage procurement approval workflows" />

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-[var(--border-default)]">
          {TABS.map((tab) => (
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
              {tab.value === 'mine' && pendingMine.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingMine.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'mine' && (
          <div className="space-y-4">
            {pendingMine.length === 0 ? (
              <div className="bg-white border border-[var(--border-default)] rounded-xl shadow-sm p-12 text-center">
                <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <p className="text-[var(--text-secondary)] font-medium">No pending approvals</p>
                <p className="text-sm text-[var(--text-tertiary)] mt-1">
                  {user ? `No procurements require approval from ${ROLE_LABELS[user.role]}.` : 'Log in to view your approvals.'}
                </p>
              </div>
            ) : (
              pendingMine.map((proc) => <PendingCard key={proc.id} proc={proc} />)
            )}
          </div>
        )}

        {activeTab === 'all' && <ApprovalChainTable procurements={allApprovals} />}
        {activeTab === 'approved' && <ApprovalChainTable procurements={fullyApproved} />}
        {activeTab === 'rejected' && <ApprovalChainTable procurements={rejected} />}
      </div>

      {/* Approval modal */}
      <Dialog open={!!approveTarget} onOpenChange={(open) => { if (!open) { setApproveTarget(null); setComment(''); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Approval</DialogTitle>
          </DialogHeader>
          {approveTarget && (
            <div className="space-y-4 py-2">
              <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">Reference</span>
                  <span className="font-mono font-medium text-[var(--brand-blue)]">{approveTarget.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">Title</span>
                  <span className="font-medium text-[var(--text-primary)] text-right max-w-[200px]">{approveTarget.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">Budget</span>
                  <span className="font-semibold text-[var(--text-primary)]">{formatCurrency(approveTarget.budget)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="comment">Comments (optional)</Label>
                <Textarea
                  id="comment"
                  placeholder="Add any notes or conditions for this approval..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="resize-none min-h-[80px]"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setApproveTarget(null); setComment(''); }}>Cancel</Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white gap-1.5" onClick={handleApprove}>
              <CheckCircle className="w-4 h-4" />
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
