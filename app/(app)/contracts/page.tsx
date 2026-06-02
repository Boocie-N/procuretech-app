'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Topbar } from '@/components/layout/topbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { FileText, Search, Download, AlertTriangle, CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const CONTRACTS = [
  {
    id: 'CON/PT/2025/001', ref: 'RFQ/PT/2025/047', title: 'Office Furniture — Sandton HQ',
    supplier: 'Steelcase SA (Pty) Ltd', value: 315_000, start: '2025-02-01', end: '2025-03-31',
    type: 'Purchase Order', status: 'active', renewalDays: null, category: 'Facilities',
    signedBy: 'Naledi Dlamini', poNumber: 'PO/PT/2025/089',
  },
  {
    id: 'CON/PT/2025/002', ref: 'RFQ/PT/2025/046', title: 'Security Services — Sandton Complex',
    supplier: 'Ndalo Security Services', value: 540_000, start: '2025-02-01', end: '2026-01-31',
    type: 'Service Contract', status: 'active', renewalDays: 365, category: 'Security',
    signedBy: 'Zanele Motha', poNumber: 'PO/PT/2025/088',
  },
  {
    id: 'CON/PT/2024/015', ref: 'RFQ/PT/2024/060', title: 'IT Support & Maintenance',
    supplier: 'AfriTech Supply Co', value: 480_000, start: '2024-07-01', end: '2025-06-30',
    type: 'Service Contract', status: 'expiring_soon', renewalDays: 150, category: 'IT Equipment',
    signedBy: 'Zanele Motha', poNumber: 'PO/PT/2024/060',
  },
  {
    id: 'CON/PT/2024/008', ref: 'RFQ/PT/2024/030', title: 'Cleaning Services — All Sites',
    supplier: 'CleanPro SA (Pty) Ltd', value: 220_000, start: '2024-04-01', end: '2025-03-31',
    type: 'Service Contract', status: 'expiring_soon', renewalDays: 58, category: 'Facilities',
    signedBy: 'Zanele Motha', poNumber: 'PO/PT/2024/045',
  },
  {
    id: 'CON/PT/2023/022', ref: 'RFQ/PT/2023/045', title: 'Fleet Vehicle Maintenance',
    supplier: 'AutoServe SA', value: 185_000, start: '2023-10-01', end: '2024-09-30',
    type: 'Service Contract', status: 'expired', renewalDays: 0, category: 'Logistics',
    signedBy: 'Naledi Dlamini', poNumber: 'PO/PT/2023/099',
  },
];

const POS = [
  { number: 'PO/PT/2025/089', supplier: 'Steelcase SA', item: 'Office Furniture', value: 315_000, issued: '2025-01-14', status: 'delivered' },
  { number: 'PO/PT/2025/088', supplier: 'Ndalo Security', item: 'Security Services', value: 45_000, issued: '2025-01-15', status: 'active' },
  { number: 'PO/PT/2025/090', supplier: 'Mecer IT Solutions', item: '500× Laptops', value: 1_140_000, issued: null, status: 'pending_award' },
  { number: 'PO/PT/2024/060', supplier: 'AfriTech Supply Co', item: 'IT Support', value: 40_000, issued: '2024-07-01', status: 'active' },
];

const statusColor = (s: string) => ({
  active:        'bg-green-50 text-green-700 border-green-200',
  expiring_soon: 'bg-amber-50 text-amber-700 border-amber-200',
  expired:       'bg-red-50 text-red-700 border-red-200',
  delivered:     'bg-green-50 text-green-700 border-green-200',
  pending_award: 'bg-blue-50 text-blue-700 border-blue-200',
}[s] ?? 'bg-gray-100 text-gray-600 border-gray-200');

const statusLabel = (s: string) => ({
  active: 'Active', expiring_soon: 'Expiring Soon', expired: 'Expired',
  delivered: 'Delivered', pending_award: 'Pending Award',
}[s] ?? s);

export default function ContractsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = CONTRACTS.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.supplier.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPos = POS.filter(po =>
    po.number.toLowerCase().includes(search.toLowerCase()) ||
    po.supplier.toLowerCase().includes(search.toLowerCase()) ||
    po.item.toLowerCase().includes(search.toLowerCase())
  );

  const active       = filtered.filter(c => c.status === 'active');
  const expiring     = filtered.filter(c => c.status === 'expiring_soon');
  const expired      = filtered.filter(c => c.status === 'expired');

  const daysUntil = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(diff / 86_400_000);
  };

  function downloadContractPDF(contract: typeof CONTRACTS[0]) {
    toast.success(`Downloading ${contract.id}.pdf`);
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar
        title="Contracts"
        subtitle="Active contracts, purchase orders, and expiry tracking"
        actions={
          <Button variant="outline" size="sm" className="text-xs h-8 gap-1.5" onClick={() => toast.success('Contracts exported to CSV')}>
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Summary */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Active Contracts', value: active.length.toString(),       sub: 'Currently in force',    color: 'green', icon: CheckCircle2 },
            { label: 'Expiring Soon',    value: expiring.length.toString(),     sub: 'Within 6 months',       color: 'amber', icon: AlertTriangle },
            { label: 'Total Value',      value: 'R1.56M', sub: 'Active contracts',      color: 'blue',  icon: FileText },
            { label: 'Pending POs',      value: '1',      sub: 'Awaiting award sign-off', color: 'purple', icon: Clock },
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

        {/* Expiry alerts */}
        {expiring.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-semibold text-amber-800">{expiring.length} contract{expiring.length > 1 ? 's' : ''} expiring soon</h3>
            </div>
            <div className="space-y-1">
              {expiring.map(c => (
                <p key={c.id} className="text-xs text-amber-700">
                  <strong>{c.title}</strong> with {c.supplier} expires {formatDate(c.end)} — <strong>{daysUntil(c.end)} days</strong> remaining. Begin re-tender now.
                </p>
              ))}
            </div>
          </div>
        )}

        <Tabs defaultValue="contracts">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="contracts">Contracts ({filtered.length})</TabsTrigger>
              <TabsTrigger value="pos">Purchase Orders ({filteredPos.length})</TabsTrigger>
            </TabsList>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-tertiary)]" />
              <Input
                placeholder="Search contracts..."
                className="pl-8 h-8 text-xs w-56"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <TabsContent value="contracts">
            <div className="bg-white dark:bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-[var(--border-default)]">
                  <tr>{['Contract ID', 'Title & Supplier', 'Type', 'Value', 'Period', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-default)]">
                  {filtered.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-[var(--text-tertiary)]">{c.id}</td>
                      <td className="px-5 py-3">
                        <div className="text-sm font-medium text-[var(--text-primary)]">{c.title}</div>
                        <div className="text-xs text-[var(--text-tertiary)]">{c.supplier}</div>
                      </td>
                      <td className="px-5 py-3 text-xs text-[var(--text-secondary)]">{c.type}</td>
                      <td className="px-5 py-3 text-sm font-semibold text-[var(--text-primary)]">{formatCurrency(c.value, true)}</td>
                      <td className="px-5 py-3">
                        <div className="text-xs text-[var(--text-secondary)]">{formatDate(c.start)}</div>
                        <div className="text-xs text-[var(--text-tertiary)]">to {formatDate(c.end)}</div>
                        {c.status === 'expiring_soon' && (
                          <div className="text-[10px] text-amber-600 font-medium">{daysUntil(c.end)}d left</div>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', statusColor(c.status))}>
                          {statusLabel(c.status)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => downloadContractPDF(c)}>
                            <Download className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                          </Button>
                          {c.status === 'expiring_soon' && (
                            <Button size="sm" variant="outline" className="h-7 text-xs px-2 text-amber-600 border-amber-300" onClick={() => { toast.success('Opening new procurement for renewal...'); router.push('/procurements/new'); }}>
                              Renew
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="pos">
            <div className="bg-white dark:bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-[var(--border-default)]">
                  <tr>{['PO Number', 'Supplier', 'Item', 'Value', 'Issued', 'Status'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-default)]">
                  {filteredPos.map(po => (
                    <tr key={po.number} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-[var(--brand-blue)]">{po.number}</td>
                      <td className="px-5 py-3 text-sm font-medium text-[var(--text-primary)]">{po.supplier}</td>
                      <td className="px-5 py-3 text-xs text-[var(--text-secondary)]">{po.item}</td>
                      <td className="px-5 py-3 text-sm font-semibold text-[var(--text-primary)]">{formatCurrency(po.value, true)}</td>
                      <td className="px-5 py-3 text-xs text-[var(--text-secondary)]">{po.issued ? formatDate(po.issued) : '—'}</td>
                      <td className="px-5 py-3">
                        <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', statusColor(po.status))}>
                          {statusLabel(po.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
