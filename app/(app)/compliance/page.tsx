'use client';

import { useState } from 'react';
import { Topbar } from '@/components/layout/topbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatDate, formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ShieldCheck, AlertTriangle, FileText, Plus, CheckCircle2, XCircle, Clock } from 'lucide-react';

const DEVIATIONS = [
  {
    id: 'DEV/PT/2025/001', procurement: 'Emergency PPE Supply', ref: 'RFQ/PT/2025/050',
    type: 'Single Source', reason: 'Urgent health & safety requirement — no time for competitive bidding. Lives at risk on site.',
    value: 120_000, status: 'approved', requestedBy: 'Thabo Mokoena', approvedBy: 'Naledi Dlamini',
    date: '2025-01-22', riskLevel: 'low',
  },
  {
    id: 'DEV/PT/2025/002', procurement: 'IT Maintenance — Server Room', ref: 'RFQ/PT/2024/089',
    type: 'Extension of Contract', reason: 'Incumbent supplier performing well. Re-tendering would disrupt operations during critical Q4 period.',
    value: 340_000, status: 'pending', requestedBy: 'Thabo Mokoena', approvedBy: null,
    date: '2025-01-18', riskLevel: 'medium',
  },
  {
    id: 'DEV/PT/2024/015', procurement: 'Legal Services Retainer', ref: 'RFQ/PT/2024/060',
    type: 'Proprietary Source', reason: 'Specialised legal firm with exclusive knowledge of company IP matters.',
    value: 850_000, status: 'rejected', requestedBy: 'Thabo Mokoena', approvedBy: 'Naledi Dlamini',
    date: '2024-11-15', riskLevel: 'high',
  },
];

const COI_REGISTER = [
  {
    id: 'COI/PT/2025/001', declaredBy: 'Thabo Mokoena', role: 'Procurement Officer',
    procurement: '500× Laptop Computers', ref: 'RFQ/PT/2025/048',
    relationship: 'None — no conflict declared', action: 'Cleared to proceed',
    date: '2025-01-15', status: 'cleared',
  },
  {
    id: 'COI/PT/2025/002', declaredBy: 'Naledi Dlamini', role: 'Procurement Manager',
    procurement: 'Office Furniture — Sandton', ref: 'RFQ/PT/2025/047',
    relationship: 'Spouse is director of Steelcase SA (bidder)',
    action: 'Recused from evaluation panel. Decision delegated to CFO.',
    date: '2025-01-08', status: 'recused',
  },
];

const PPPFA_TRACKER = [
  { month: 'Jan 2025', totalSpend: 1_200_000, bbbeeL1: 68, bbbeeL2: 20, bbbeeL3: 8, bbbeeL4plus: 4, target90: true },
  { month: 'Dec 2024', totalSpend: 940_000,   bbbeeL1: 55, bbbeeL2: 28, bbbeeL3: 12, bbbeeL4plus: 5, target90: true },
  { month: 'Nov 2024', totalSpend: 580_000,   bbbeeL1: 72, bbbeeL2: 15, bbbeeL3: 10, bbbeeL4plus: 3, target90: true },
  { month: 'Oct 2024', totalSpend: 450_000,   bbbeeL1: 45, bbbeeL2: 22, bbbeeL3: 25, bbbeeL4plus: 8, target90: false },
];

const statusBadge = (s: string) => ({
  approved: 'bg-green-50 text-green-700 border-green-200',
  pending:  'bg-amber-50 text-amber-700 border-amber-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  cleared:  'bg-green-50 text-green-700 border-green-200',
  recused:  'bg-blue-50 text-blue-700 border-blue-200',
}[s] ?? 'bg-gray-100 text-gray-600');

const riskBadge = (r: string) => ({
  low:    'bg-green-50 text-green-700',
  medium: 'bg-amber-50 text-amber-700',
  high:   'bg-red-50 text-red-700',
}[r] ?? '');

export default function CompliancePage() {
  const [deviationOpen, setDeviationOpen] = useState(false);
  const [coiOpen, setCoiOpen] = useState(false);

  // Compute KPIs from real data
  const currentYear = new Date().getFullYear();
  const deviationsYTD = DEVIATIONS.filter(d => new Date(d.date).getFullYear() >= currentYear - 1).length;
  const pendingDeviations = DEVIATIONS.filter(d => d.status === 'pending').length;
  const coiCount = COI_REGISTER.length;
  const activeRecusals = COI_REGISTER.filter(c => c.status === 'recused').length;
  const latestMonth = PPPFA_TRACKER[0];
  const pppfaCompliance = latestMonth ? latestMonth.bbbeeL1 + latestMonth.bbbeeL2 : 0;
  const allCompliant = PPPFA_TRACKER.every(m => m.target90);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar
        title="Compliance"
        subtitle="Deviation register · Conflict of interest · PPPFA tracker"
        actions={
          <div className="flex gap-2">
            <Dialog open={coiOpen} onOpenChange={setCoiOpen}>
              <DialogTrigger render={<Button variant="outline" size="sm" className="text-xs h-8 gap-1.5" />}>
                <Plus className="w-3.5 h-3.5" /> Declare COI
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Declare Conflict of Interest</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                    You are legally required to declare any conflict of interest before participating in a procurement process. Failure to do so is a criminal offence under the PFMA and Prevention and Combating of Corrupt Activities Act.
                  </div>
                  <div className="space-y-1.5"><Label>Procurement Reference</Label><Input placeholder="e.g. RFQ/PT/2025/048" /></div>
                  <div className="space-y-1.5"><Label>Nature of Relationship</Label><Textarea placeholder="Describe your relationship with the supplier or any financial interest..." className="min-h-[80px]" /></div>
                  <div className="space-y-1.5"><Label>Proposed Action</Label><Input placeholder="e.g. Recuse myself from evaluation" /></div>
                  <Button className="w-full bg-[var(--brand-blue)] text-white" onClick={() => { setCoiOpen(false); toast.success('Conflict of interest declared and recorded'); }}>
                    Submit Declaration
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={deviationOpen} onOpenChange={setDeviationOpen}>
              <DialogTrigger render={<Button size="sm" className="bg-[var(--brand-blue)] text-white text-xs h-8 gap-1.5" />}>
                <Plus className="w-3.5 h-3.5" /> Log Deviation
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Log Procurement Deviation</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                    Deviations from normal procurement processes must be approved by the relevant authority per National Treasury SCM guidelines. All deviations are recorded in the immutable audit trail.
                  </div>
                  <div className="space-y-1.5"><Label>Procurement Title</Label><Input placeholder="What are you procuring?" /></div>
                  <div className="space-y-1.5"><Label>Deviation Type</Label>
                    <select className="w-full border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm bg-white">
                      <option>Single Source / Sole Supplier</option>
                      <option>Emergency Procurement</option>
                      <option>Extension of Contract</option>
                      <option>Proprietary Source</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-1.5"><Label>Estimated Value (ZAR)</Label><Input type="number" placeholder="0" /></div>
                  <div className="space-y-1.5"><Label>Justification</Label><Textarea placeholder="Provide detailed justification for the deviation..." className="min-h-[80px]" /></div>
                  <Button className="w-full bg-[var(--brand-blue)] text-white" onClick={() => { setDeviationOpen(false); toast.success('Deviation logged and sent for approval'); }}>
                    Submit for Approval
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Deviations YTD',   value: String(deviationsYTD),        sub: `${pendingDeviations} pending approval`,  color: 'amber', icon: AlertTriangle },
            { label: 'COI Declarations', value: String(coiCount),              sub: `${activeRecusals} recusal${activeRecusals !== 1 ? 's' : ''} active`, color: 'blue', icon: FileText },
            { label: 'PPPFA Compliance', value: `${pppfaCompliance}%`,         sub: 'L1–2 spend (latest month)',              color: 'green', icon: ShieldCheck },
            { label: 'Compliance Score', value: allCompliant ? 'A' : 'B',      sub: allCompliant ? 'All months on target' : 'One month below target', color: allCompliant ? 'green' : 'amber', icon: CheckCircle2 },
          ].map(c => (
            <div key={c.label} className="bg-white dark:bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[var(--text-tertiary)]">{c.label}</span>
                <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', `bg-${c.color}-50`)}>
                  <c.icon className={cn('w-3.5 h-3.5', `text-${c.color}-600`)} />
                </div>
              </div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">{c.value}</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-0.5">{c.sub}</div>
            </div>
          ))}
        </div>

        <Tabs defaultValue="deviations">
          <TabsList className="mb-5">
            <TabsTrigger value="deviations">Deviation Register</TabsTrigger>
            <TabsTrigger value="coi">Conflict of Interest</TabsTrigger>
            <TabsTrigger value="pppfa">PPPFA Tracker</TabsTrigger>
          </TabsList>

          {/* Deviation Register */}
          <TabsContent value="deviations">
            <div className="bg-white dark:bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] shadow-sm overflow-hidden">
              <div className="divide-y divide-[var(--border-default)]">
                {DEVIATIONS.map(d => (
                  <div key={d.id} className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-[var(--text-tertiary)]">{d.id}</span>
                          <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize', statusBadge(d.status))}>{d.status}</span>
                          <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', riskBadge(d.riskLevel))}>{d.riskLevel} risk</span>
                        </div>
                        <h4 className="text-sm font-semibold text-[var(--text-primary)]">{d.procurement}</h4>
                        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{d.ref} · {d.type} · {formatCurrency(d.value, true)}</p>
                      </div>
                      <span className="text-xs text-[var(--text-tertiary)]">{formatDate(d.date)}</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed bg-gray-50 dark:bg-white/5 rounded-lg px-3 py-2">{d.reason}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-tertiary)]">
                      <span>Requested by: <strong className="text-[var(--text-primary)]">{d.requestedBy}</strong></span>
                      {d.approvedBy && <span>{d.status === 'rejected' ? 'Rejected' : 'Approved'} by: <strong className="text-[var(--text-primary)]">{d.approvedBy}</strong></span>}
                      {d.status === 'pending' && (
                        <div className="flex gap-2 ml-auto">
                          <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white" onClick={() => toast.success('Deviation approved')}>Approve</Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 border-red-300" onClick={() => toast.error('Deviation rejected')}>Reject</Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* COI Register */}
          <TabsContent value="coi">
            <div className="bg-white dark:bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] shadow-sm overflow-hidden">
              <div className="divide-y divide-[var(--border-default)]">
                {COI_REGISTER.map(c => (
                  <div key={c.id} className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-[var(--text-tertiary)]">{c.id}</span>
                          <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize', statusBadge(c.status))}>{c.status}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-[var(--text-primary)]">{c.declaredBy} <span className="font-normal text-[var(--text-tertiary)]">({c.role})</span></h4>
                        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{c.procurement} · {c.ref}</p>
                      </div>
                      <span className="text-xs text-[var(--text-tertiary)]">{formatDate(c.date)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div className="bg-gray-50 dark:bg-white/5 rounded-lg px-3 py-2">
                        <p className="text-[10px] text-[var(--text-tertiary)] uppercase mb-1">Declared Relationship</p>
                        <p className="text-xs text-[var(--text-secondary)]">{c.relationship}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-white/5 rounded-lg px-3 py-2">
                        <p className="text-[10px] text-[var(--text-tertiary)] uppercase mb-1">Action Taken</p>
                        <p className="text-xs text-[var(--text-secondary)]">{c.action}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* PPPFA Tracker */}
          <TabsContent value="pppfa">
            <div className="bg-white dark:bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-[var(--border-default)] bg-blue-50 dark:bg-blue-900/20">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>PPPFA 2017 requirement:</strong> For contracts below R50M, a minimum of 90 points for price and 10 points for BBBEE preference. Target: ≥80% of spend with Level 1–4 BBBEE suppliers.
                </p>
              </div>
              <table className="w-full">
                <thead className="border-b border-[var(--border-default)]">
                  <tr>{['Month', 'Total Spend', 'L1 %', 'L2 %', 'L3 %', 'L4+ %', 'L1-4 Total', 'Target Met'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-default)]">
                  {PPPFA_TRACKER.map(row => {
                    const l14 = row.bbbeeL1 + row.bbbeeL2 + row.bbbeeL3 + row.bbbeeL4plus;
                    return (
                      <tr key={row.month} className="hover:bg-gray-50 dark:hover:bg-white/5">
                        <td className="px-5 py-3 text-sm font-medium text-[var(--text-primary)]">{row.month}</td>
                        <td className="px-5 py-3 text-sm text-[var(--text-secondary)]">{formatCurrency(row.totalSpend, true)}</td>
                        <td className="px-5 py-3 text-sm text-green-600 font-medium">{row.bbbeeL1}%</td>
                        <td className="px-5 py-3 text-sm text-green-500">{row.bbbeeL2}%</td>
                        <td className="px-5 py-3 text-sm text-amber-600">{row.bbbeeL3}%</td>
                        <td className="px-5 py-3 text-sm text-red-500">{row.bbbeeL4plus}%</td>
                        <td className="px-5 py-3 text-sm font-semibold text-[var(--text-primary)]">{l14}%</td>
                        <td className="px-5 py-3">
                          {row.target90
                            ? <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle2 className="w-3.5 h-3.5" /> Met</span>
                            : <span className="flex items-center gap-1 text-xs text-red-500"><XCircle className="w-3.5 h-3.5" /> Missed</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
