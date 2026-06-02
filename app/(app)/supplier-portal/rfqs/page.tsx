'use client';

import { Topbar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CheckCircle2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

const INVITED_RFQS = [
  { id: 'p1', ref: 'RFQ/PT/2025/048', title: '500× Laptop Computers',       category: 'IT Equipment', budget: 1_200_000, closing: '2025-02-07', status: 'open',   daysLeft: 14, submitted: false },
  { id: 'p3', ref: 'RFQ/PT/2025/049', title: 'Concrete Supply (200 tons)',   category: 'Construction', budget: 890_000,   closing: '2025-02-14', status: 'open',   daysLeft: 21, submitted: false },
  { id: 'p4', ref: 'RFQ/PT/2025/046', title: 'Security Services — Sandton', category: 'Security',     budget: 560_000,   closing: '2025-01-15', status: 'closed', daysLeft: 0,  submitted: true  },
];

export default function SupplierRFQsPage() {
  const open = INVITED_RFQS.filter(r => r.status === 'open' && !r.submitted).length;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Open RFQs" subtitle={`${open} open · respond before the closing date`} />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white dark:bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[var(--border-default)] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">RFQs You've Been Invited To</h3>
            <Badge variant="outline" className="text-xs">{open} open</Badge>
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
                    {rfq.status === 'open' && (
                      <span className="text-amber-600 font-semibold">· {rfq.daysLeft} days remaining</span>
                    )}
                  </div>
                </div>
                <div className="shrink-0">
                  {rfq.submitted ? (
                    <span className="text-xs text-green-600 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Bid Submitted
                    </span>
                  ) : rfq.status === 'open' ? (
                    <Button size="sm" className="bg-[var(--brand-blue)] hover:bg-[var(--brand-blue-dark)] text-white text-xs h-8">
                      Submit Bid
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="text-xs h-8 gap-1">
                      <Eye className="w-3 h-3" /> View Results
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
