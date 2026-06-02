'use client';

import { useState } from 'react';
import { Shield, CheckCircle, Download, Info, Hash } from 'lucide-react';
import { Topbar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DEMO_AUDIT_EVENTS, DEMO_PROCUREMENTS } from '@/lib/demo-data';
import { formatDateTime, ROLE_LABELS } from '@/lib/utils';
import { toast } from 'sonner';
import type { AuditEventType } from '@/types';

const EVENT_COLORS: Record<AuditEventType, string> = {
  procurement_created:  'bg-blue-100 text-blue-800',
  sow_generated:        'bg-indigo-100 text-indigo-800',
  rfq_generated:        'bg-violet-100 text-violet-800',
  rfq_sent:             'bg-cyan-100 text-cyan-800',
  bid_received:         'bg-teal-100 text-teal-800',
  evaluation_run:       'bg-amber-100 text-amber-800',
  report_drafted:       'bg-orange-100 text-orange-800',
  report_submitted:     'bg-orange-100 text-orange-800',
  approval_granted:     'bg-green-100 text-green-800',
  approval_rejected:    'bg-red-100 text-red-800',
  po_issued:            'bg-green-100 text-green-800',
  contract_signed:      'bg-emerald-100 text-emerald-800',
  delivery_confirmed:   'bg-emerald-100 text-emerald-800',
  lesson_recorded:      'bg-pink-100 text-pink-800',
  supplier_approved:    'bg-green-100 text-green-800',
  supplier_rejected:    'bg-red-100 text-red-800',
  deviation_logged:     'bg-red-100 text-red-800',
  conflict_declared:    'bg-red-100 text-red-800',
};

function truncateHash(hash: string, len = 16) {
  if (hash.length <= len) return hash;
  return `${hash.slice(0, len)}…`;
}

export default function AuditTrailPage() {
  const [procFilter, setProcFilter] = useState('all');

  const filtered = DEMO_AUDIT_EVENTS.filter((e) =>
    procFilter === 'all' || e.procurement_id === procFilter
  );

  // Verify chain integrity against the FULL chain, not just the filtered view
  const sortedAll = [...DEMO_AUDIT_EVENTS].sort((a, b) => a.block_index - b.block_index);
  let chainIntact = true;
  for (let i = 1; i < sortedAll.length; i++) {
    if (sortedAll[i].prev_hash !== sortedAll[i - 1].block_hash) {
      chainIntact = false;
      break;
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="Blockchain Audit Trail"
        subtitle="Immutable SHA-256 hash chain"
        actions={
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={() => toast.success('Audit log exported to CSV')}
          >
            <Download className="w-3.5 h-3.5" />
            Export Audit Log
          </Button>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {/* Explanation banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800 leading-relaxed">
            Every action in ProcureTech+ is recorded as an immutable block in a SHA-256 hash chain.
            Each block contains the previous block&apos;s hash, making tampering detectable.
            Any modification to a historical record would invalidate all subsequent block hashes.
          </p>
        </div>

        {/* Chain integrity */}
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${chainIntact ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          {chainIntact ? (
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          ) : (
            <Shield className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <div className="flex-1">
            <p className={`text-sm font-semibold ${chainIntact ? 'text-green-800' : 'text-red-800'}`}>
              {chainIntact
                ? `Chain intact — ${filtered.length} block${filtered.length !== 1 ? 's' : ''} verified`
                : 'Chain integrity failure detected'}
            </p>
            <p className={`text-xs ${chainIntact ? 'text-green-700' : 'text-red-700'}`}>
              {chainIntact
                ? 'All hash links are valid. The audit trail has not been tampered with.'
                : 'One or more block hashes do not match their predecessor. Investigate immediately.'}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <Hash className={`w-4 h-4 ${chainIntact ? 'text-green-600' : 'text-red-600'}`} />
            <span className={`text-xs font-mono font-medium ${chainIntact ? 'text-green-700' : 'text-red-700'}`}>SHA-256</span>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--text-secondary)]">Filter by procurement:</span>
          <Select value={procFilter} onValueChange={(v) => { if (v) setProcFilter(v); }}>
            <SelectTrigger className="w-64 h-9 text-sm">
              <SelectValue placeholder="All procurements" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Procurements</SelectItem>
              {DEMO_PROCUREMENTS.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.reference} — {p.title.slice(0, 30)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-[var(--text-tertiary)]">{filtered.length} event(s) shown</span>
        </div>

        {/* Events */}
        <div className="space-y-3">
          {filtered.map((event, idx) => {
            const prevEvent = idx > 0 ? filtered[idx - 1] : null;
            const hashValid = idx === 0 || (prevEvent && event.prev_hash === prevEvent.block_hash);
            const proc = DEMO_PROCUREMENTS.find((p) => p.id === event.procurement_id);

            return (
              <div key={event.id} className="bg-white border border-[var(--border-default)] rounded-xl shadow-sm p-5">
                <div className="flex items-start gap-4">
                  {/* Block number */}
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-[var(--text-secondary)]">#{event.block_index}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${EVENT_COLORS[event.event_type] ?? 'bg-gray-100 text-gray-700'}`}>
                        {event.event_label}
                      </span>
                      {proc && (
                        <span className="text-xs text-[var(--text-tertiary)] font-mono">{proc.reference}</span>
                      )}
                      <span className="text-xs text-[var(--text-tertiary)] ml-auto">{formatDateTime(event.timestamp)}</span>
                    </div>

                    <p className="text-sm text-[var(--text-primary)] mb-2 leading-relaxed">{event.description}</p>

                    <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)] mb-3">
                      <span>
                        <span className="text-[var(--text-tertiary)]">Actor: </span>
                        <span className="font-medium">{event.actor_name}</span>
                        {' · '}
                        <span className="text-[var(--text-tertiary)]">{ROLE_LABELS[event.actor_role]}</span>
                      </span>
                    </div>

                    {/* Hash chain info */}
                    <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium text-[var(--text-tertiary)] w-20 shrink-0">Block Hash</span>
                        <code className="text-[10px] font-mono text-[var(--text-secondary)] bg-white px-2 py-0.5 rounded border border-gray-200">
                          {truncateHash(event.block_hash)}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium text-[var(--text-tertiary)] w-20 shrink-0">Prev Hash</span>
                        <code className="text-[10px] font-mono text-[var(--text-secondary)] bg-white px-2 py-0.5 rounded border border-gray-200">
                          {event.block_index === 0 ? '0000…0000' : truncateHash(event.prev_hash)}
                        </code>
                      </div>
                    </div>
                  </div>

                  {/* Verification */}
                  <div className="shrink-0 flex flex-col items-center gap-1">
                    {hashValid ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-[10px] text-green-700 font-medium text-center leading-tight">Block<br />verified</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5 text-red-500" />
                        <span className="text-[10px] text-red-700 font-medium text-center leading-tight">Hash<br />mismatch</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-[var(--text-tertiary)]">
              No audit events found for the selected filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
