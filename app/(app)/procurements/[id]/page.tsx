'use client';

import { use, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, CheckCircle, Clock, XCircle, Bot, FileText, Shield,
  MapPin, Calendar, Tag, Building2, TrendingUp, TrendingDown,
  Minus, BarChart3, Users, Package, Star, Zap, AlertTriangle,
} from 'lucide-react';
import { Topbar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DEMO_PROCUREMENTS, DEMO_BIDS, DEMO_USERS } from '@/lib/demo-data';
import {
  formatCurrency, formatDate, formatDateTime, getStatusColor,
  STATUS_LABELS, CIPS_STAGES, getStageIndex, PROVINCE_LABELS, cn,
} from '@/lib/utils';
import type { ApprovalStep, Bid, MarketAnalysis } from '@/types';
import { generateEvaluationPDF } from '@/lib/export';
import { toast } from 'sonner';

// ── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  it_equipment: 'IT Equipment', office_supplies: 'Office Supplies', construction: 'Construction',
  professional_services: 'Professional Services', facilities: 'Facilities', logistics: 'Logistics',
  security: 'Security', healthcare: 'Healthcare', marketing: 'Marketing', other: 'Other',
};
const BBBEE_REQ_LABELS: Record<string, string> = {
  level_1_2: 'Level 1–2 only', level_1_4: 'Level 1–4', level_1_6: 'Level 1–6', any: 'Any level', none: 'None required',
};
const TYPE_LABELS: Record<string, string> = {
  rfq: 'RFQ', rfp: 'RFP', tender: 'Tender', sole_source: 'Sole Source', emergency: 'Emergency',
};
const TYPE_RATIONALE: Record<string, string> = {
  rfq: 'RFQ selected — procurement is below R500k threshold and specifications are clear and measurable.',
  rfp: 'RFP selected — complex requirement where methodology and approach need to be evaluated, not just price.',
  tender: 'Open tender selected — procurement exceeds R500k and requires competitive public bidding process per PPPFA.',
  sole_source: 'Sole source deviation approved — only one capable supplier exists or emergency circumstances apply.',
  emergency: 'Emergency procurement declared — deviation register entry required per SCM policy.',
};

// ── Sub-components ───────────────────────────────────────────────────────────

function ApprovalStepRow({ step }: { step: ApprovalStep }) {
  const icon = {
    approved: <CheckCircle className="w-5 h-5 text-green-500" />,
    pending:  <Clock className="w-5 h-5 text-amber-400" />,
    rejected: <XCircle className="w-5 h-5 text-red-500" />,
    returned: <XCircle className="w-5 h-5 text-orange-500" />,
  }[step.status];
  const badge = {
    approved: 'text-green-700 bg-green-50',
    pending:  'text-amber-700 bg-amber-50',
    rejected: 'text-red-700 bg-red-50',
    returned: 'text-orange-700 bg-orange-50',
  }[step.status];
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[var(--border-default)] last:border-0">
      <div className="shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)]">{step.role_label}</p>
        {step.approved_by_name && <p className="text-xs text-[var(--text-tertiary)]">{step.approved_by_name}</p>}
        {step.actioned_at && <p className="text-xs text-[var(--text-tertiary)]">{formatDate(step.actioned_at)}</p>}
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${badge}`}>{step.status}</span>
    </div>
  );
}

function BidCard({ bid }: { bid: Bid }) {
  const recColors = {
    recommended:     'bg-green-50 text-green-700 border-green-200',
    second:          'bg-blue-50 text-blue-700 border-blue-200',
    not_recommended: 'bg-red-50 text-red-700 border-red-200',
  };
  const recLabel = { recommended: 'Recommended', second: '2nd Choice', not_recommended: 'Not Recommended' };
  return (
    <div className={`border rounded-lg p-4 ${bid.recommendation === 'recommended' ? 'border-green-300 bg-green-50/30' : 'border-[var(--border-default)] bg-white'}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-semibold text-[var(--text-primary)]">{bid.supplier_name}</p>
          <p className="text-xs text-[var(--text-secondary)]">Submitted {formatDate(bid.submitted_at)}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {bid.ai_score && <span className="text-sm font-bold text-[var(--brand-blue)]">{bid.ai_score.total}/100</span>}
          {bid.recommendation && (
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${recColors[bid.recommendation]}`}>
              {recLabel[bid.recommendation]}
            </span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 text-sm mb-3">
        <div><p className="text-xs text-[var(--text-tertiary)]">Total Price</p><p className="font-semibold text-[var(--text-primary)]">{formatCurrency(bid.total_price)}</p></div>
        <div><p className="text-xs text-[var(--text-tertiary)]">Delivery</p><p className="font-medium text-[var(--text-primary)]">{bid.delivery_days} days</p></div>
        <div><p className="text-xs text-[var(--text-tertiary)]">Technical</p><p className="font-medium text-[var(--text-primary)]">{bid.technical_compliance}%</p></div>
      </div>
      {bid.ai_score && (
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            { label: 'Price', val: bid.ai_score.price_score, max: 40 },
            { label: 'BBBEE', val: bid.ai_score.bbbee_score, max: 20 },
            { label: 'Delivery', val: bid.ai_score.delivery_score, max: 20 },
            { label: 'Technical', val: bid.ai_score.technical_score, max: 20 },
          ].map(({ label, val, max }) => (
            <div key={label} className="text-center bg-gray-50 rounded-lg p-2">
              <p className="text-xs font-semibold text-[var(--text-primary)]">{val}/{max}</p>
              <p className="text-[10px] text-[var(--text-tertiary)]">{label}</p>
            </div>
          ))}
        </div>
      )}
      {bid.ai_score && bid.ai_score.strengths.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {bid.ai_score.strengths.slice(0, 2).map((s, i) => (
            <span key={i} className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded">{s}</span>
          ))}
          {bid.ai_score.weaknesses.slice(0, 1).map((w, i) => (
            <span key={i} className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded">{w}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function UpcomingState({ description }: { description: string }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
      <Clock className="w-4 h-4 text-gray-400 shrink-0" />
      <div>
        <p className="text-sm font-medium text-gray-500">Not started yet</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function StageSection({
  idx, currentIdx, sectionRef, children,
}: {
  idx: number; currentIdx: number;
  sectionRef: (el: HTMLDivElement | null) => void;
  children: React.ReactNode;
}) {
  const stage = CIPS_STAGES[idx];
  const isCompleted = idx < currentIdx;
  const isCurrent   = idx === currentIdx;
  const isUpcoming  = idx > currentIdx;
  return (
    <div
      ref={sectionRef}
      className={cn(
        'rounded-xl border shadow-sm overflow-hidden',
        isCurrent  ? 'border-blue-300'                       :
        isCompleted ? 'border-[var(--border-default)] bg-white' :
        'border-gray-200 bg-gray-50/40',
      )}
    >
      {/* Header bar */}
      <div className={cn(
        'flex items-center justify-between px-5 py-3 border-b',
        isCurrent  ? 'bg-blue-50 border-blue-200'                      :
        isCompleted ? 'bg-white border-[var(--border-default)]'          :
        'bg-gray-50 border-gray-200',
      )}>
        <div className="flex items-center gap-2.5">
          <div className={cn(
            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
            isCompleted ? 'bg-[var(--brand-blue)] text-white'                      :
            isCurrent   ? 'bg-[var(--brand-blue)] text-white ring-4 ring-blue-100' :
            'bg-gray-200 text-gray-500',
          )}>
            {isCompleted ? <CheckCircle className="w-3.5 h-3.5" /> : idx + 1}
          </div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">{stage.label}</h2>
        </div>
        <span className={cn(
          'text-xs px-2.5 py-0.5 rounded-full font-medium',
          isCompleted ? 'bg-green-100 text-green-700' :
          isCurrent   ? 'bg-blue-100 text-blue-700'   :
          'bg-gray-100 text-gray-500',
        )}>
          {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Upcoming'}
        </span>
      </div>
      <div className="p-5">
        {isUpcoming ? <UpcomingState description={stage.description} /> : children}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ProcurementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const procurement = DEMO_PROCUREMENTS.find((p) => p.id === id);
  const bids = DEMO_BIDS.filter((b) => b.procurement_id === id);

  const sectionRefs = useRef<(HTMLDivElement | null)[]>(Array(CIPS_STAGES.length).fill(null));
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  if (!procurement) {
    return (
      <div className="flex flex-col h-full">
        <Topbar title="Procurement Not Found" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-[var(--text-secondary)] mb-4">Procurement &quot;{id}&quot; was not found.</p>
            <Link href="/procurements"><Button variant="outline">Back to Procurements</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  const stageIdx       = getStageIndex(procurement.current_stage);
  const recommendedBid = bids.find((b) => b.recommendation === 'recommended');

  function scrollToStage(idx: number) {
    const el        = sectionRefs.current[idx];
    const container = scrollAreaRef.current;
    if (el && container) {
      container.scrollTo({ top: el.offsetTop - 12, behavior: 'smooth' });
    }
  }

  // ── Market analysis helpers ──────────────────────────────────────────────
  const ma = procurement.market_analysis;
  const trendIcon = ma?.price_trend === 'rising'  ? <TrendingUp className="w-4 h-4 text-red-500" />   :
                    ma?.price_trend === 'falling' ? <TrendingDown className="w-4 h-4 text-green-500" /> :
                    <Minus className="w-4 h-4 text-amber-500" />;
  const trendColor = ma?.price_trend === 'rising' ? 'text-red-600' : ma?.price_trend === 'falling' ? 'text-green-600' : 'text-amber-600';

  return (
    <div className="flex flex-col h-full">
      <Topbar
        title={procurement.reference}
        subtitle={procurement.title}
        actions={
          <Link href="/procurements">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Button>
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-6" ref={scrollAreaRef}>
        <div className="flex gap-6 max-w-7xl mx-auto">

          {/* ── Left — main content ─────────────────────────────────────── */}
          <div className="flex-1 space-y-4 min-w-0">

            {/* CIPS Stepper */}
            <div className="bg-white border border-[var(--border-default)] rounded-xl shadow-sm p-5">
              <p className="text-xs text-[var(--text-tertiary)] mb-4">Click any stage to jump to it</p>
              <div className="flex items-start">
                {CIPS_STAGES.map((stage, idx) => {
                  const isCompleted = idx < stageIdx;
                  const isCurrent   = idx === stageIdx;
                  return (
                    <div key={stage.id} className="flex items-start flex-1">
                      <div className="flex flex-col items-center gap-1 flex-1">
                        <button
                          onClick={() => scrollToStage(idx)}
                          title={stage.description}
                          className={cn(
                            'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all hover:scale-110 hover:shadow-md shrink-0',
                            isCompleted ? 'bg-[var(--brand-blue)] text-white'                      :
                            isCurrent   ? 'bg-[var(--brand-blue)] text-white ring-4 ring-blue-100' :
                            'bg-gray-100 text-gray-400 hover:bg-gray-200',
                          )}
                        >
                          {isCompleted ? <CheckCircle className="w-3.5 h-3.5" /> : idx + 1}
                        </button>
                        {/* Fixed-height label box prevents misalignment */}
                        <div className="h-8 flex items-start justify-center w-full">
                          <button
                            onClick={() => scrollToStage(idx)}
                            className={cn(
                              'text-center text-[9px] leading-tight w-full px-0.5 bg-transparent border-0 cursor-pointer hover:underline',
                              isCurrent   ? 'text-[var(--brand-blue)] font-semibold' :
                              isCompleted ? 'text-[var(--text-secondary)]'           :
                              'text-[var(--text-tertiary)]',
                            )}
                          >
                            {stage.label}
                          </button>
                        </div>
                      </div>
                      {idx < CIPS_STAGES.length - 1 && (
                        <div className={`h-0.5 flex-1 mt-[13px] ${idx < stageIdx ? 'bg-[var(--brand-blue)]' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Stage 1: Identify Need ───────────────────────────────── */}
            <StageSection idx={0} currentIdx={stageIdx} sectionRef={(el) => { sectionRefs.current[0] = el; }}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <Tag className="w-4 h-4" />,       label: 'Category',          value: CATEGORY_LABELS[procurement.category] },
                  { icon: <TrendingUp className="w-4 h-4" />, label: 'Budget',            value: formatCurrency(procurement.budget), sub: procurement.estimated_value ? `Market est. ${formatCurrency(procurement.estimated_value)}` : undefined },
                  { icon: <MapPin className="w-4 h-4" />,     label: 'Delivery Location', value: procurement.delivery_location, sub: PROVINCE_LABELS[procurement.delivery_province] },
                  { icon: <Calendar className="w-4 h-4" />,   label: 'Required By',       value: formatDate(procurement.required_by) },
                  { icon: <Shield className="w-4 h-4" />,     label: 'BBBEE Requirement', value: BBBEE_REQ_LABELS[procurement.bbbee_requirement] },
                  { icon: <Building2 className="w-4 h-4" />,  label: 'Type',              value: TYPE_LABELS[procurement.type] },
                ].map(({ icon, label, value, sub }) => (
                  <div key={label} className="flex items-start gap-2">
                    <div className="text-[var(--text-tertiary)] mt-0.5 shrink-0">{icon}</div>
                    <div>
                      <p className="text-xs text-[var(--text-tertiary)]">{label}</p>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{value}</p>
                      {sub && <p className="text-xs text-[var(--text-tertiary)]">{sub}</p>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--border-default)]">
                <p className="text-xs text-[var(--text-tertiary)] mb-1">Description</p>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{procurement.description}</p>
              </div>
            </StageSection>

            {/* ── Stage 2: Specify (SOW) ───────────────────────────────── */}
            <StageSection idx={1} currentIdx={stageIdx} sectionRef={(el) => { sectionRefs.current[1] = el; }}>
              {procurement.sow ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-[var(--brand-blue)]" />
                    <span className="text-xs font-medium text-[var(--text-secondary)]">Scope of Work — approved document</span>
                  </div>
                  <pre className="whitespace-pre-wrap text-xs text-[var(--text-secondary)] leading-relaxed bg-gray-50 border border-[var(--border-default)] rounded-lg p-4 font-sans">
                    {procurement.sow}
                  </pre>
                </div>
              ) : (
                <div className="space-y-3">
                  <UpcomingState description="Scope of Work has not been drafted yet." />
                  <Link href="/copilot">
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8 mt-2">
                      <Bot className="w-3.5 h-3.5" /> Draft SOW with AI Copilot
                    </Button>
                  </Link>
                </div>
              )}
            </StageSection>

            {/* ── Stage 3: Market Intelligence ────────────────────────── */}
            <StageSection idx={2} currentIdx={stageIdx} sectionRef={(el) => { sectionRefs.current[2] = el; }}>
              {ma ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-[var(--brand-blue)]" />
                    <span className="text-xs text-[var(--text-tertiary)]">AI analysis · {formatDate(ma.analysed_at)}</span>
                  </div>

                  {/* Price range */}
                  <div className="bg-gray-50 border border-[var(--border-default)] rounded-lg p-4">
                    <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide mb-3">Market Price Range (ZAR per unit)</p>
                    <div className="flex items-end gap-4 mb-2">
                      <div className="text-center">
                        <p className="text-xs text-[var(--text-tertiary)]">Min</p>
                        <p className="text-lg font-bold text-[var(--text-primary)]">{formatCurrency(ma.price_min)}</p>
                      </div>
                      <div className="flex-1 flex flex-col justify-center pb-1">
                        <div className="relative h-3 bg-gradient-to-r from-green-200 via-amber-200 to-red-200 rounded-full">
                          {/* Median marker */}
                          <div
                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[var(--brand-blue)] rounded-full border-2 border-white shadow"
                            style={{ left: `${((ma.price_median - ma.price_min) / (ma.price_max - ma.price_min)) * 100}%` }}
                          />
                        </div>
                        <p className="text-center text-[10px] text-[var(--text-tertiary)] mt-1">Median: {formatCurrency(ma.price_median)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-[var(--text-tertiary)]">Max</p>
                        <p className="text-lg font-bold text-[var(--text-primary)]">{formatCurrency(ma.price_max)}</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-medium ${trendColor} mt-2`}>
                      {trendIcon}
                      <span>Price trend: {ma.price_trend}{ma.trend_pct ? ` (+${ma.trend_pct}% YoY)` : ''}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Recommended suppliers */}
                    <div>
                      <p className="text-xs font-medium text-[var(--text-secondary)] mb-2 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" /> Recommended Suppliers
                      </p>
                      <ul className="space-y-1">
                        {ma.recommended_suppliers.map((s, i) => (
                          <li key={i} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                            <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {/* OEMs */}
                    {ma.oems_and_manufacturers[0] !== 'N/A — Service industry' && (
                      <div>
                        <p className="text-xs font-medium text-[var(--text-secondary)] mb-2 flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5" /> OEMs & Manufacturers
                        </p>
                        <ul className="space-y-1">
                          {ma.oems_and_manufacturers.map((o, i) => (
                            <li key={i} className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />{o}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Market notes */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-amber-800 mb-1 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> Market Notes
                    </p>
                    <p className="text-xs text-amber-900 leading-relaxed">{ma.market_notes}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <UpcomingState description="Market intelligence analysis has not been run yet." />
                  <Link href="/copilot">
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8 mt-2">
                      <Bot className="w-3.5 h-3.5" /> Run Market Analysis with AI
                    </Button>
                  </Link>
                </div>
              )}
            </StageSection>

            {/* ── Stage 4: Strategy ────────────────────────────────────── */}
            <StageSection idx={3} currentIdx={stageIdx} sectionRef={(el) => { sectionRefs.current[3] = el; }}>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <p className="text-xs text-blue-600 mb-1">Approach</p>
                    <p className="text-lg font-bold text-blue-800">{TYPE_LABELS[procurement.type]}</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                    <p className="text-xs text-green-600 mb-1">BBBEE Requirement</p>
                    <p className="text-sm font-bold text-green-800">{BBBEE_REQ_LABELS[procurement.bbbee_requirement]}</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                    <p className="text-xs text-purple-600 mb-1">Min. Quotes</p>
                    <p className="text-lg font-bold text-purple-800">{procurement.min_quotes}</p>
                  </div>
                </div>

                <div className="bg-gray-50 border border-[var(--border-default)] rounded-lg p-4">
                  <p className="text-xs font-medium text-[var(--text-secondary)] mb-1">Strategy Rationale</p>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{TYPE_RATIONALE[procurement.type]}</p>
                </div>

                <div className="bg-gray-50 border border-[var(--border-default)] rounded-lg p-4">
                  <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">Evaluation Criteria (PPPFA 90/10)</p>
                  <div className="space-y-2">
                    {[
                      { label: 'Price', pct: 40 },
                      { label: 'BBBEE Status Level Contribution', pct: 20 },
                      { label: 'Delivery Period', pct: 20 },
                      { label: 'Technical Compliance', pct: 20 },
                    ].map(({ label, pct }) => (
                      <div key={label} className="flex items-center gap-3">
                        <span className="text-xs text-[var(--text-secondary)] w-52 shrink-0">{label}</span>
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-[var(--brand-blue)] rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-medium text-[var(--text-primary)] w-8 text-right">{pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </StageSection>

            {/* ── Stage 5: Source Bids ─────────────────────────────────── */}
            <StageSection idx={4} currentIdx={stageIdx} sectionRef={(el) => { sectionRefs.current[4] = el; }}>
              {procurement.rfq_document ? (
                <div className="space-y-4">
                  {bids.length > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                      <p className="text-xs text-green-800 font-medium">
                        {bids.length} bid{bids.length !== 1 ? 's' : ''} received from: {bids.map(b => b.supplier_name).join(', ')}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium text-[var(--text-secondary)] mb-2 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> Issued RFQ Document
                    </p>
                    <pre className="whitespace-pre-wrap text-xs text-[var(--text-secondary)] leading-relaxed bg-gray-50 border border-[var(--border-default)] rounded-lg p-4 font-sans max-h-64 overflow-y-auto">
                      {procurement.rfq_document}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <UpcomingState description="RFQ has not been issued to suppliers yet." />
                  <Link href="/copilot">
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8 mt-2">
                      <Bot className="w-3.5 h-3.5" /> Generate RFQ with AI
                    </Button>
                  </Link>
                </div>
              )}
            </StageSection>

            {/* ── Stage 6: Assess Bids ─────────────────────────────────── */}
            <StageSection idx={5} currentIdx={stageIdx} sectionRef={(el) => { sectionRefs.current[5] = el; }}>
              {bids.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs text-[var(--text-tertiary)]">{bids.length} bid{bids.length !== 1 ? 's' : ''} received and scored</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(procurement.status)}`}>
                      {STATUS_LABELS[procurement.status]}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {bids.map((bid) => <BidCard key={bid.id} bid={bid} />)}
                  </div>
                </div>
              ) : (
                <UpcomingState description="No bids have been received yet. Issue the RFQ to invite suppliers." />
              )}
            </StageSection>

            {/* ── Stage 7: AI Evaluation ───────────────────────────────── */}
            <StageSection idx={6} currentIdx={stageIdx} sectionRef={(el) => { sectionRefs.current[6] = el; }}>
              {recommendedBid?.ai_score ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Bot className="w-4 h-4 text-[var(--brand-blue)] shrink-0" />
                    <p className="text-sm text-[var(--brand-blue)] font-medium">
                      Recommended: {recommendedBid.supplier_name} — Score {recommendedBid.ai_score.total}/100
                    </p>
                  </div>

                  {/* Score comparison table */}
                  {bids.length > 1 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-[var(--border-default)]">
                            <th className="text-left py-2 text-[var(--text-tertiary)] font-medium">Supplier</th>
                            <th className="text-center py-2 text-[var(--text-tertiary)] font-medium">Total</th>
                            <th className="text-center py-2 text-[var(--text-tertiary)] font-medium">Price /40</th>
                            <th className="text-center py-2 text-[var(--text-tertiary)] font-medium">BBBEE /20</th>
                            <th className="text-center py-2 text-[var(--text-tertiary)] font-medium">Delivery /20</th>
                            <th className="text-center py-2 text-[var(--text-tertiary)] font-medium">Technical /20</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bids.sort((a, b) => (b.ai_score?.total ?? 0) - (a.ai_score?.total ?? 0)).map((bid) => (
                            <tr key={bid.id} className={`border-b border-[var(--border-default)] ${bid.recommendation === 'recommended' ? 'bg-green-50/50' : ''}`}>
                              <td className="py-2 font-medium text-[var(--text-primary)]">
                                {bid.supplier_name}
                                {bid.recommendation === 'recommended' && <span className="ml-1.5 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">✓ Rec</span>}
                              </td>
                              <td className="py-2 text-center font-bold text-[var(--brand-blue)]">{bid.ai_score?.total ?? '—'}</td>
                              <td className="py-2 text-center">{bid.ai_score?.price_score ?? '—'}</td>
                              <td className="py-2 text-center">{bid.ai_score?.bbbee_score ?? '—'}</td>
                              <td className="py-2 text-center">{bid.ai_score?.delivery_score ?? '—'}</td>
                              <td className="py-2 text-center">{bid.ai_score?.technical_score ?? '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-green-700 mb-2">Strengths</p>
                      <ul className="space-y-1">
                        {recommendedBid.ai_score.strengths.map((s, i) => (
                          <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-1.5">
                            <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {recommendedBid.ai_score.risks.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-amber-700 mb-2">Risks to Monitor</p>
                        <ul className="space-y-1">
                          {recommendedBid.ai_score.risks.map((r, i) => (
                            <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-1.5">
                              <Clock className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />{r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <UpcomingState description="AI evaluation will run once bids have been received and scored." />
              )}
            </StageSection>

            {/* ── Stage 8: Approve ─────────────────────────────────────── */}
            <StageSection idx={7} currentIdx={stageIdx} sectionRef={(el) => { sectionRefs.current[7] = el; }}>
              <div className="divide-y divide-[var(--border-default)]">
                {procurement.approval_chain.map((step) => (
                  <ApprovalStepRow key={step.step} step={step} />
                ))}
              </div>
              {procurement.approval_chain.every(s => s.status === 'approved') && (
                <div className="mt-4 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                  <p className="text-xs text-green-800 font-medium">All approvals complete — procurement cleared to proceed</p>
                </div>
              )}
            </StageSection>

            {/* ── Stage 9: Contract ────────────────────────────────────── */}
            <StageSection idx={8} currentIdx={stageIdx} sectionRef={(el) => { sectionRefs.current[8] = el; }}>
              {(procurement.status === 'awarded' || procurement.status === 'contracted' || procurement.status === 'delivered' || procurement.status === 'closed') && recommendedBid ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-xs text-green-600 mb-1">Awarded To</p>
                      <p className="text-sm font-bold text-green-800">{recommendedBid.supplier_name}</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-600 mb-1">Contract Value</p>
                      <p className="text-sm font-bold text-blue-800">{formatCurrency(recommendedBid.total_price)}</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <p className="text-xs text-purple-600 mb-1">Savings vs Budget</p>
                      <p className="text-sm font-bold text-purple-800">
                        {formatCurrency(procurement.budget - recommendedBid.total_price)}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-[var(--border-default)] rounded-lg p-4">
                    <dl className="grid grid-cols-2 gap-3 text-sm">
                      <div><dt className="text-xs text-[var(--text-tertiary)]">Delivery Period</dt><dd className="font-medium">{recommendedBid.delivery_days} days from PO</dd></div>
                      {recommendedBid.warranty_months && <div><dt className="text-xs text-[var(--text-tertiary)]">Warranty</dt><dd className="font-medium">{recommendedBid.warranty_months} months</dd></div>}
                      <div><dt className="text-xs text-[var(--text-tertiary)]">Award Date</dt><dd className="font-medium">{formatDate(procurement.updated_at)}</dd></div>
                      <div><dt className="text-xs text-[var(--text-tertiary)]">Status</dt>
                        <dd><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(procurement.status)}`}>{STATUS_LABELS[procurement.status]}</span></dd>
                      </div>
                    </dl>
                  </div>
                </div>
              ) : (
                <UpcomingState description="Contract will be issued once all approvals are complete and the bid is awarded." />
              )}
            </StageSection>

            {/* ── Stage 10: Deliver ────────────────────────────────────── */}
            <StageSection idx={9} currentIdx={stageIdx} sectionRef={(el) => { sectionRefs.current[9] = el; }}>
              {(procurement.status === 'delivered' || procurement.status === 'closed') ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                    <p className="text-xs text-green-800 font-medium">Delivery confirmed and accepted</p>
                  </div>
                  <Link href="/knowledge">
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8">
                      <Star className="w-3.5 h-3.5" /> View Lessons Learned
                    </Button>
                  </Link>
                </div>
              ) : procurement.status === 'awarded' || procurement.status === 'contracted' ? (
                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Package className="w-4 h-4 text-blue-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Awaiting delivery</p>
                    <p className="text-xs text-blue-600 mt-0.5">Contract awarded — delivery in progress. Confirm receipt once goods or services are delivered.</p>
                  </div>
                </div>
              ) : (
                <UpcomingState description="Delivery tracking and supplier performance rating will appear here once the contract is active." />
              )}
            </StageSection>

          </div>{/* end left column */}

          {/* ── Right sidebar ────────────────────────────────────────────── */}
          <div className="w-72 shrink-0 space-y-4">

            {/* Document Actions */}
            <div className="bg-white border border-[var(--border-default)] rounded-xl shadow-sm p-5">
              <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Document Actions</h2>
              <div className="space-y-2.5">
                <Link href="/copilot" className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border-default)] hover:bg-blue-50 hover:border-blue-200 transition-colors group">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-[var(--brand-blue)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--brand-blue)] transition-colors">Generate RFQ with AI</p>
                    <p className="text-[11px] text-[var(--text-tertiary)]">Open AI Copilot</p>
                  </div>
                </Link>
                <Link href="/audit-trail" className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border-default)] hover:bg-purple-50 hover:border-purple-200 transition-colors group">
                  <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-purple-600 transition-colors">View Audit Trail</p>
                    <p className="text-[11px] text-[var(--text-tertiary)]">Blockchain-verified log</p>
                  </div>
                </Link>
                <button
                  disabled={bids.length === 0}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-[var(--border-default)] hover:bg-gray-50 transition-colors group text-left disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  onClick={async () => { await generateEvaluationPDF(procurement, bids); toast.success('Evaluation report downloaded'); }}
                >
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)]">Download Evaluation PDF</p>
                    <p className="text-[11px] text-[var(--text-tertiary)]">{bids.length > 0 ? 'Bid scoring report' : 'No bids received yet'}</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-white border border-[var(--border-default)] rounded-xl shadow-sm p-4">
              <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Quick Info</h2>
              <dl className="space-y-2.5">
                {[
                  { label: 'Created',     value: formatDate(procurement.created_at) },
                  { label: 'Last updated', value: formatDate(procurement.updated_at) },
                  { label: 'Assigned To', value: DEMO_USERS.find(u => u.id === procurement.assigned_to)?.full_name ?? '—' },
                  { label: 'Min Quotes',  value: String(procurement.min_quotes) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center">
                    <dt className="text-xs text-[var(--text-tertiary)]">{label}</dt>
                    <dd className="text-xs font-medium text-[var(--text-primary)]">{value}</dd>
                  </div>
                ))}
                <div className="flex justify-between items-center">
                  <dt className="text-xs text-[var(--text-tertiary)]">Status</dt>
                  <dd><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(procurement.status)}`}>{STATUS_LABELS[procurement.status]}</span></dd>
                </div>
              </dl>
            </div>

            {/* Compact approval status */}
            <div className="bg-white border border-[var(--border-default)] rounded-xl shadow-sm p-4">
              <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Approval Status</h2>
              <div className="space-y-0">
                {procurement.approval_chain.map((step) => (
                  <ApprovalStepRow key={step.step} step={step} />
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
