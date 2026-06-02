'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Star, CheckCircle, AlertTriangle, XCircle, Clock,
  MapPin, Phone, Mail, Globe, Building2, FileText, Users, TrendingUp,
  ShieldCheck, Award, Calendar, Briefcase,
} from 'lucide-react';
import { Topbar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DEMO_SUPPLIERS } from '@/lib/demo-data';
import type { Supplier, SupplierGrade } from '@/types';

const PROVINCE_LABELS: Record<string, string> = {
  GP: 'Gauteng', WC: 'Western Cape', KZN: 'KwaZulu-Natal', EC: 'Eastern Cape',
  FS: 'Free State', LP: 'Limpopo', MP: 'Mpumalanga', NC: 'Northern Cape', NW: 'North West',
};

const CATEGORY_LABELS: Record<string, string> = {
  it_equipment: 'IT Equipment', office_supplies: 'Office Supplies', construction: 'Construction',
  professional_services: 'Professional Services', facilities: 'Facilities', logistics: 'Logistics',
  security: 'Security', healthcare: 'Healthcare', marketing: 'Marketing', other: 'Other',
};

const TURNOVER_LABELS: Record<string, string> = {
  under_1m: 'Under R1M', '1m_10m': 'R1M – R10M', '10m_50m': 'R10M – R50M',
  '50m_100m': 'R50M – R100M', over_100m: 'Over R100M',
};

function statusConfig(status: string) {
  const map: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    approved:    { label: 'Approved',    color: 'bg-green-100 text-green-800 border-green-200', icon: <CheckCircle className="w-3.5 h-3.5" /> },
    pending:     { label: 'Pending',     color: 'bg-amber-100 text-amber-800 border-amber-200', icon: <Clock className="w-3.5 h-3.5" /> },
    conditional: { label: 'Conditional', color: 'bg-blue-100 text-blue-800 border-blue-200',   icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    rejected:    { label: 'Rejected',    color: 'bg-red-100 text-red-800 border-red-200',       icon: <XCircle className="w-3.5 h-3.5" /> },
    suspended:   { label: 'Suspended',   color: 'bg-gray-100 text-gray-600 border-gray-200',   icon: <XCircle className="w-3.5 h-3.5" /> },
  };
  return map[status] ?? { label: status, color: 'bg-gray-100 text-gray-600 border-gray-200', icon: null };
}

function getBBBEEColor(level?: number) {
  if (!level) return 'bg-gray-100 text-gray-600';
  if (level <= 2) return 'bg-green-100 text-green-800';
  if (level <= 4) return 'bg-amber-100 text-amber-800';
  return 'bg-red-100 text-red-800';
}

function getGradeStyle(grade?: string) {
  const map: Record<string, string> = {
    A: 'text-green-700 bg-green-50 border-green-200',
    B: 'text-blue-700 bg-blue-50 border-blue-200',
    C: 'text-amber-700 bg-amber-50 border-amber-200',
    D: 'text-orange-700 bg-orange-50 border-orange-200',
    F: 'text-red-700 bg-red-50 border-red-200',
  };
  return map[grade ?? ''] ?? 'text-gray-600 bg-gray-50 border-gray-200';
}

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  const color = pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[var(--text-tertiary)] w-40 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-[var(--text-secondary)] w-12 text-right">{value}/{max}</span>
    </div>
  );
}

function KpiCard({ label, value, sub, icon }: { label: string; value: string | number; sub?: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white border border-[var(--border-default)] rounded-xl p-4 flex items-center gap-3">
      <div className="p-2.5 bg-gray-50 rounded-lg">{icon}</div>
      <div>
        <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wide">{label}</p>
        <p className="text-xl font-bold text-[var(--text-primary)] leading-tight">{value}</p>
        {sub && <p className="text-[10px] text-[var(--text-tertiary)]">{sub}</p>}
      </div>
    </div>
  );
}

export default function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supplier = DEMO_SUPPLIERS.find((s) => s.id === id);
  if (!supplier) notFound();

  const st = statusConfig(supplier.status);
  const g = supplier.grade;

  return (
    <div className="flex flex-col h-full">
      <Topbar
        title={supplier.company_name}
        subtitle={supplier.trading_name ? `t/a ${supplier.trading_name}` : 'Supplier Profile'}
        actions={
          <Link href="/suppliers">
            <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Network
            </Button>
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-5">

        {/* Header card */}
        <div className="bg-white border border-[var(--border-default)] rounded-xl p-5">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center text-2xl font-black shrink-0 ${getGradeStyle(g?.grade)}`}>
              {g?.grade ?? '?'}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-bold text-[var(--text-primary)] leading-tight">{supplier.company_name}</h1>
                  {supplier.trading_name && (
                    <p className="text-sm text-[var(--text-tertiary)] mt-0.5">Trading as: {supplier.trading_name}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  {supplier.bbbee_level && (
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${getBBBEEColor(supplier.bbbee_level)}`}>
                      BBBEE Level {supplier.bbbee_level}
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-semibold ${st.color}`}>
                    {st.icon}{st.label}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-[var(--text-secondary)]">
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />{supplier.physical_address}</span>
                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />{supplier.contact_phone}</span>
                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />{supplier.contact_email}</span>
                {supplier.website && (
                  <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />{supplier.website}</span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {supplier.categories.map((c) => (
                  <span key={c} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{CATEGORY_LABELS[c] ?? c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-4 gap-4">
          <KpiCard label="Grade Score" value={`${g?.total ?? 0}/100`} sub={`Grade ${g?.grade ?? '–'}`} icon={<Award className="w-5 h-5 text-purple-500" />} />
          <KpiCard label="Response Rate" value={`${supplier.response_rate}%`} sub="RFQ replies" icon={<TrendingUp className="w-5 h-5 text-blue-500" />} />
          <KpiCard label="On-Time Delivery" value={`${supplier.on_time_delivery_rate}%`} sub="of orders" icon={<CheckCircle className="w-5 h-5 text-green-500" />} />
          <KpiCard label="Quality Rating" value={supplier.quality_rating.toFixed(1)} sub="out of 5.0" icon={<Star className="w-5 h-5 text-amber-400" />} />
        </div>

        <div className="grid grid-cols-3 gap-5">

          {/* Left column */}
          <div className="col-span-2 space-y-5">

            {/* Grading breakdown */}
            {g && (
              <div className="bg-white border border-[var(--border-default)] rounded-xl p-5">
                <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-500" />Grading Breakdown
                </h2>
                <div className="space-y-3">
                  <ScoreBar label="BBBEE Compliance" value={g.bbbee_score} max={20} />
                  <ScoreBar label="Tax Compliance (SARS)" value={g.tax_compliance_score} max={20} />
                  <ScoreBar label="CIPC Registration" value={g.cipc_score} max={15} />
                  <ScoreBar label="Document Completeness" value={g.document_score} max={15} />
                  <ScoreBar label="Financial Stability" value={g.financial_score} max={10} />
                  <ScoreBar label="References" value={g.reference_score} max={10} />
                  <ScoreBar label="Certifications" value={g.certification_score} max={10} />
                  <ScoreBar label="Performance History" value={g.performance_score} max={10} />
                </div>
                <div className="mt-4 pt-4 border-t border-[var(--border-default)] flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Total Score</span>
                  <div className="flex items-center gap-3">
                    <div className="w-40 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${g.total >= 80 ? 'bg-green-500' : g.total >= 60 ? 'bg-amber-400' : 'bg-red-400'}`}
                        style={{ width: `${g.total}%` }}
                      />
                    </div>
                    <span className={`text-lg font-bold border rounded-lg px-2.5 py-0.5 ${getGradeStyle(g.grade)}`}>
                      {g.grade} <span className="text-sm font-normal">({g.total}/100)</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* References */}
            <div className="bg-white border border-[var(--border-default)] rounded-xl p-5">
              <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />Client References
              </h2>
              <div className="space-y-3">
                {supplier.references.map((ref, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-lg bg-white border border-[var(--border-default)] flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-[var(--text-tertiary)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)]">{ref.company_name}</p>
                      <p className="text-xs text-[var(--text-tertiary)]">{ref.contact_name} · {ref.contact_email}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {ref.contract_value && (
                        <p className="text-xs font-semibold text-[var(--text-primary)]">
                          R{ref.contract_value.toLocaleString()}
                        </p>
                      )}
                      {ref.year && <p className="text-[10px] text-[var(--text-tertiary)]">{ref.year}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right column */}
          <div className="space-y-5">

            {/* Company details */}
            <div className="bg-white border border-[var(--border-default)] rounded-xl p-5">
              <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[var(--text-tertiary)]" />Company Details
              </h2>
              <dl className="space-y-3 text-sm">
                {[
                  { label: 'CIPC Number', value: supplier.cipc_number },
                  { label: 'VAT Number', value: supplier.vat_number ?? '—' },
                  { label: 'Contact Person', value: supplier.contact_name },
                  { label: 'Province', value: PROVINCE_LABELS[supplier.province] ?? supplier.province },
                  { label: 'Years Operating', value: `${supplier.years_in_operation} years` },
                  { label: 'Annual Turnover', value: TURNOVER_LABELS[supplier.annual_turnover_band] ?? supplier.annual_turnover_band },
                  { label: 'Max Contract', value: supplier.max_contract_value ? `R${supplier.max_contract_value.toLocaleString()}` : '—' },
                  { label: 'Total Orders', value: supplier.total_orders },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-2">
                    <dt className="text-[var(--text-tertiary)] shrink-0">{label}</dt>
                    <dd className="text-[var(--text-primary)] font-medium text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* BBBEE details */}
            {supplier.bbbee_level && (
              <div className="bg-white border border-[var(--border-default)] rounded-xl p-5">
                <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-500" />BBBEE Details
                </h2>
                <dl className="space-y-3 text-sm">
                  {[
                    { label: 'Level', value: `Level ${supplier.bbbee_level}` },
                    { label: 'Classification', value: supplier.bbbee_classification?.toUpperCase() ?? '—' },
                    { label: 'Rating Agency', value: supplier.bbbee_agency ?? '—' },
                    { label: 'Certificate Expiry', value: supplier.bbbee_expiry ? new Date(supplier.bbbee_expiry).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long' }) : '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between gap-2">
                      <dt className="text-[var(--text-tertiary)] shrink-0">{label}</dt>
                      <dd className="text-[var(--text-primary)] font-medium text-right">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Provinces covered */}
            <div className="bg-white border border-[var(--border-default)] rounded-xl p-5">
              <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--text-tertiary)]" />Coverage
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {supplier.provinces_covered.map((p) => (
                  <span key={p} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                    {PROVINCE_LABELS[p] ?? p}
                  </span>
                ))}
              </div>
            </div>

            {/* Member since */}
            <div className="bg-gray-50 border border-[var(--border-default)] rounded-xl p-4 flex items-center gap-3">
              <Calendar className="w-4 h-4 text-[var(--text-tertiary)]" />
              <div>
                <p className="text-xs text-[var(--text-tertiary)]">Registered on ProcureTech+</p>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {new Date(supplier.created_at).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
