'use client';

import { Topbar } from '@/components/layout/topbar';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

const MY_BIDS = [
  { ref: 'RFQ/PT/2025/048', title: '500× Laptop Computers', submitted: '2025-01-20', value: 1_140_000, status: 'recommended',    score: 92 },
  { ref: 'RFQ/PT/2025/045', title: 'Office Printer Fleet',  submitted: '2025-01-10', value: 285_000,   status: 'not_recommended', score: 61 },
  { ref: 'RFQ/PT/2025/042', title: 'IT Support Services',   submitted: '2024-12-15', value: 480_000,   status: 'awarded',         score: 88 },
];

const statusColor = (s: string) =>
  s === 'recommended' ? 'bg-blue-50 text-blue-700' :
  s === 'awarded'     ? 'bg-green-50 text-green-700' :
  'bg-gray-100 text-gray-500';

export default function SupplierBidsPage() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="My Bids" subtitle={`${MY_BIDS.length} bids submitted`} />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white dark:bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] shadow-sm overflow-hidden">
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
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full', bid.score >= 80 ? 'bg-green-500' : bid.score >= 60 ? 'bg-amber-500' : 'bg-red-500')}
                          style={{ width: `${bid.score}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-[var(--text-secondary)]">{bid.score}/100</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full capitalize', statusColor(bid.status))}>
                      {bid.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
