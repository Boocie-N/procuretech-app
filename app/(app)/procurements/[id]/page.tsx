'use client';

import { use, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Clock, XCircle, Bot, FileText, Shield, MapPin, Calendar, Tag, Building2, TrendingUp } from 'lucide-react';
import { Topbar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DEMO_PROCUREMENTS, DEMO_BIDS, DEMO_USERS } from '@/lib/demo-data';
import {
  formatCurrency,
  formatDate,
  getStatusColor,
  STATUS_LABELS,
  CIPS_STAGES,
  getStageIndex,
  ROLE_LABELS,
  PROVINCE_LABELS,
} from '@/lib/utils';
import type { ApprovalStep, Bid } from '@/types';
import { generateEvaluationPDF } from '@/lib/export';
import { toast } from 'sonner';

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

function ApprovalStepRow({ step }: { step: ApprovalStep }) {
  const icons = {
    approved: <CheckCircle className="w-5 h-5 text-green-500" />,
    pending: <Clock className="w-5 h-5 text-amber-400" />,
    rejected: <XCircle className="w-5 h-5 text-red-500" />,
    returned: <XCircle className="w-5 h-5 text-orange-500" />,
  };
  const colors = {
    approved: 'text-green-700 bg-green-50',
    pending: 'text-amber-700 bg-amber-50',
    rejected: 'text-red-700 bg-red-50',
    returned: 'text-orange-700 bg-orange-50',
  };
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[var(--border-default)] last:border-0">
      <div className="shrink-0">{icons[step.status]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)]">{step.role_label}</p>
        {step.approved_by_name && (
          <p className="text-xs text-[var(--text-tertiary)]">{step.approved_by_name}</p>
        )}
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${colors[step.status]}`}>
        {step.status}
      </span>
    </div>
  );
}

function BidCard({ bid }: { bid: Bid }) {
  const recColors = {
    recommended: 'bg-green-50 text-green-700 border-green-200',
    second: 'bg-blue-50 text-blue-700 border-blue-200',
    not_recommended: 'bg-red-50 text-red-700 border-red-200',
  };
  const recLabel = {
    recommended: 'Recommended',
    second: '2nd Choice',
    not_recommended: 'Not Recommended',
  };
  return (
    <div className={`border rounded-lg p-4 ${bid.recommendation === 'recommended' ? 'border-green-300 bg-green-50/30' : 'border-[var(--border-default)] bg-white'}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="font-semibold text-[var(--text-primary)]">{bid.supplier_name}</p>
          <p className="text-sm text-[var(--text-secondary)]">Submitted {formatDate(bid.submitted_at)}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {bid.ai_score && (
            <span className="text-sm font-bold text-[var(--brand-blue)]">{bid.ai_score.total}/100</span>
          )}
          {bid.recommendation && (
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${recColors[bid.recommendation]}`}>
              {recLabel[bid.recommendation]}
            </span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-xs text-[var(--text-tertiary)]">Total Price</p>
          <p className="font-semibold text-[var(--text-primary)]">{formatCurrency(bid.total_price)}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-tertiary)]">Delivery</p>
          <p className="font-medium text-[var(--text-primary)]">{bid.delivery_days} days</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-tertiary)]">Technical</p>
          <p className="font-medium text-[var(--text-primary)]">{bid.technical_compliance}%</p>
        </div>
      </div>
      {bid.ai_score && (
        <div className="mt-3 pt-3 border-t border-[var(--border-default)]">
          <p className="text-xs text-[var(--text-tertiary)] mb-1 flex items-center gap-1">
            <Bot className="w-3 h-3" /> AI Narrative
          </p>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{bid.ai_score.ai_narrative}</p>
        </div>
      )}
    </div>
  );
}

export default function ProcurementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const procurement = DEMO_PROCUREMENTS.find((p) => p.id === id);
  const bids = DEMO_BIDS.filter((b) => b.procurement_id === id);

  if (!procurement) {
    return (
      <div className="flex flex-col h-full">
        <Topbar title="Procurement Not Found" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-[var(--text-secondary)] mb-4">Procurement with ID &quot;{id}&quot; was not found.</p>
            <Link href="/procurements">
              <Button variant="outline">Back to Procurements</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const stageIdx = getStageIndex(procurement.current_stage);
  const recommendedBid = bids.find((b) => b.recommendation === 'recommended');

  // Scroll refs for each section
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  function scrollToStage(stageId: string) {
    const el = sectionRefs.current[stageId];
    const container = scrollAreaRef.current;
    if (el && container) {
      const top = el.offsetTop - 16;
      container.scrollTo({ top, behavior: 'smooth' });
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Topbar
        title={procurement.reference}
        subtitle={procurement.title}
        actions={
          <Link href="/procurements">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </Button>
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-6" ref={scrollAreaRef}>
        <div className="flex gap-6 max-w-7xl mx-auto">
          {/* Left — 2/3 */}
          <div className="flex-1 space-y-5 min-w-0">

            {/* CIPS Stage stepper */}
            <div className="bg-white border border-[var(--border-default)] rounded-xl shadow-sm p-5">
              <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">CIPS Procurement Cycle — click a stage to jump to it</h2>
              <div className="flex items-center gap-0">
                {CIPS_STAGES.map((stage, idx) => {
                  const isCompleted = idx < stageIdx;
                  const isCurrent = idx === stageIdx;
                  return (
                    <div key={stage.id} className="flex items-center flex-1">
                      <div className="flex flex-col items-center gap-1 flex-1">
                        <button
                          onClick={() => scrollToStage(stage.id)}
                          title={stage.description}
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer hover:scale-110 hover:shadow-md ${
                            isCompleted ? 'bg-[var(--brand-blue)] text-white' :
                            isCurrent ? 'bg-[var(--brand-blue)] text-white ring-4 ring-blue-100' :
                            'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          {isCompleted ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                        </button>
                        <button
                          onClick={() => scrollToStage(stage.id)}
                          className={`text-center leading-tight text-[10px] w-14 cursor-pointer hover:underline bg-transparent border-0 p-0 ${
                            isCurrent ? 'text-[var(--brand-blue)] font-semibold' :
                            isCompleted ? 'text-[var(--text-secondary)]' :
                            'text-[var(--text-tertiary)]'
                          }`}
                        >
                          {stage.label}
                        </button>
                      </div>
                      {idx < CIPS_STAGES.length - 1 && (
                        <div className={`h-0.5 flex-1 mt-[-18px] ${idx < stageIdx ? 'bg-[var(--brand-blue)]' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
              {CIPS_STAGES[stageIdx] && (
                <p className="mt-4 text-xs text-[var(--text-tertiary)] border-t border-[var(--border-default)] pt-3">
                  <span className="font-medium text-[var(--text-secondary)]">Current stage:</span> {CIPS_STAGES[stageIdx].description}
                </p>
              )}
            </div>

            {/* Procurement Details */}
            <div
              className="bg-white border border-[var(--border-default)] rounded-xl shadow-sm p-5"
              ref={(el) => { sectionRefs.current['identify_need'] = el; }}
            >
              <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Procurement Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Tag className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)]">Category</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{CATEGORY_LABELS[procurement.category]}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)]">Budget</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{formatCurrency(procurement.budget)}</p>
                    {procurement.estimated_value && (
                      <p className="text-xs text-[var(--text-tertiary)]">Market est. {formatCurrency(procurement.estimated_value)}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)]">Delivery Location</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{procurement.delivery_location}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{PROVINCE_LABELS[procurement.delivery_province]}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)]">Required By</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{formatDate(procurement.required_by)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)]">BBBEE Requirement</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{BBBEE_REQ_LABELS[procurement.bbbee_requirement]}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Building2 className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)]">Procurement Type</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{TYPE_LABELS[procurement.type]}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--border-default)]">
                <p className="text-xs text-[var(--text-tertiary)] mb-1">Description</p>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{procurement.description}</p>
              </div>
            </div>

            {/* Bids */}
            {bids.length > 0 && (
              <div
                className="bg-white border border-[var(--border-default)] rounded-xl shadow-sm p-5"
                ref={(el) => { sectionRefs.current['assess'] = el; sectionRefs.current['source'] = el; }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">Bids Received ({bids.length})</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(procurement.status)}`}>
                    {STATUS_LABELS[procurement.status]}
                  </span>
                </div>
                <div className="space-y-3">
                  {bids.map((bid) => <BidCard key={bid.id} bid={bid} />)}
                </div>
              </div>
            )}

            {/* AI Evaluation Summary */}
            {recommendedBid?.ai_score && (
              <div
                className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm p-5"
                ref={(el) => { sectionRefs.current['recommend'] = el; sectionRefs.current['approve'] = el; }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="w-5 h-5 text-[var(--brand-blue)]" />
                  <h2 className="text-sm font-semibold text-[var(--brand-blue)]">AI Evaluation Summary</h2>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                  <span className="font-semibold text-[var(--text-primary)]">Recommended: {recommendedBid.supplier_name}</span>
                  {' '}— Score {recommendedBid.ai_score.total}/100
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-green-700 mb-1">Strengths</p>
                    <ul className="space-y-1">
                      {recommendedBid.ai_score.strengths.slice(0, 3).map((s, i) => (
                        <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-1.5">
                          <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {recommendedBid.ai_score.risks.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-amber-700 mb-1">Risks to Monitor</p>
                      <ul className="space-y-1">
                        {recommendedBid.ai_score.risks.slice(0, 3).map((r, i) => (
                          <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-1.5">
                            <Clock className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right — 1/3 */}
          <div className="w-72 shrink-0 space-y-4">
            {/* Approval chain */}
            <div
              className="bg-white border border-[var(--border-default)] rounded-xl shadow-sm p-4"
              ref={(el) => { sectionRefs.current['approve'] = sectionRefs.current['approve'] ?? el; }}
            >
              <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Approval Chain</h2>
              <div>
                {procurement.approval_chain.map((step) => (
                  <ApprovalStepRow key={step.step} step={step} />
                ))}
              </div>
            </div>

            {/* Document Actions */}
            <div className="bg-white border border-[var(--border-default)] rounded-xl shadow-sm p-5">
              <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Document Actions</h2>
              <div className="space-y-2.5">

                <Link href="/copilot" className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border-default)] hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20 transition-colors group">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <Bot className="w-4.5 h-4.5 text-[var(--brand-blue)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--brand-blue)] transition-colors">Generate RFQ with AI</p>
                    <p className="text-[11px] text-[var(--text-tertiary)]">Open AI Copilot</p>
                  </div>
                </Link>

                <Link href="/audit-trail" className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border-default)] hover:bg-purple-50 hover:border-purple-200 dark:hover:bg-purple-900/20 transition-colors group">
                  <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-purple-600 transition-colors">View Audit Trail</p>
                    <p className="text-[11px] text-[var(--text-tertiary)]">Blockchain-verified log</p>
                  </div>
                </Link>

                <button
                  disabled={bids.length === 0}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-[var(--border-default)] hover:bg-gray-50 hover:border-gray-300 dark:hover:bg-white/5 transition-colors group text-left disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-[var(--border-default)]"
                  onClick={async () => {
                    await generateEvaluationPDF(procurement, bids);
                    toast.success('Evaluation report downloaded');
                  }}
                >
                  <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center shrink-0">
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
                <div className="flex justify-between items-center">
                  <dt className="text-xs text-[var(--text-tertiary)]">Created</dt>
                  <dd className="text-xs font-medium text-[var(--text-primary)]">{formatDate(procurement.created_at)}</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-xs text-[var(--text-tertiary)]">Assigned To</dt>
                  <dd className="text-xs font-medium text-[var(--text-primary)]">
                    {DEMO_USERS.find(u => u.id === procurement.assigned_to)?.full_name ?? '—'}
                  </dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-xs text-[var(--text-tertiary)]">Type</dt>
                  <dd>
                    <Badge variant="outline" className="text-xs">{TYPE_LABELS[procurement.type]}</Badge>
                  </dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-xs text-[var(--text-tertiary)]">Min Quotes</dt>
                  <dd className="text-xs font-medium text-[var(--text-primary)]">{procurement.min_quotes}</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-xs text-[var(--text-tertiary)]">Status</dt>
                  <dd>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(procurement.status)}`}>
                      {STATUS_LABELS[procurement.status]}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
