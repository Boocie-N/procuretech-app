'use client';

import { Topbar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Upload, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const DOCS = [
  { label: 'CIPC Registration',    status: 'verified', expiry: null },
  { label: 'Tax Clearance (SARS)', status: 'verified', expiry: '2025-11-30' },
  { label: 'BBBEE Certificate',    status: 'expiring', expiry: '2025-03-31' },
  { label: 'Bank Confirmation',    status: 'verified', expiry: null },
  { label: 'Public Liability',     status: 'missing',  expiry: null },
];

const statusStyle = (s: string) =>
  s === 'verified' ? 'text-green-600 bg-green-50 border-green-200' :
  s === 'expiring' ? 'text-amber-600 bg-amber-50 border-amber-200' :
  'text-red-600 bg-red-50 border-red-200';

export default function SupplierDocumentsPage() {
  const pending = DOCS.filter(d => d.status !== 'verified').length;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar
        title="My Documents"
        subtitle="Keep all documents current to remain eligible for RFQ invitations"
        actions={
          <Link href="/supplier-portal/register">
            <Button size="sm" className="bg-[var(--brand-blue)] text-white text-xs h-8 gap-1.5">
              <Upload className="w-3.5 h-3.5" /> Upload Documents
            </Button>
          </Link>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {pending > 0 && (
          <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              <strong>{pending} document{pending > 1 ? 's' : ''}</strong> require attention.
              Suppliers with expired or missing documents may be excluded from RFQ invitations.
            </p>
          </div>
        )}

        <div className="bg-white dark:bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] shadow-sm overflow-hidden">
          <div className="divide-y divide-[var(--border-default)]">
            {DOCS.map(doc => (
              <div key={doc.label} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-[var(--text-primary)]">{doc.label}</div>
                  {doc.expiry && (
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5">Expires: {formatDate(doc.expiry)}</div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full border', statusStyle(doc.status))}>
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
      </div>
    </div>
  );
}
