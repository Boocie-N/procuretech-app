'use client';

import { useState } from 'react';
import { Plus, BookOpen, FileText, Star, ThumbsUp, TrendingUp, AlertTriangle, Shield, Users, Archive, Zap, ClipboardList, Lightbulb } from 'lucide-react';
import { Topbar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DEMO_LESSONS } from '@/lib/demo-data';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';

const CATEGORY_LABELS: Record<string, string> = {
  it_equipment: 'IT Equipment', office_supplies: 'Office Supplies', construction: 'Construction',
  professional_services: 'Professional Services', facilities: 'Facilities', logistics: 'Logistics',
  security: 'Security', healthcare: 'Healthcare', marketing: 'Marketing', other: 'Other',
};

const CATEGORY_COLORS: Record<string, string> = {
  it_equipment: 'bg-blue-100 text-blue-800', office_supplies: 'bg-teal-100 text-teal-800',
  construction: 'bg-amber-100 text-amber-800', professional_services: 'bg-purple-100 text-purple-800',
  facilities: 'bg-cyan-100 text-cyan-800', logistics: 'bg-orange-100 text-orange-800',
  security: 'bg-red-100 text-red-800', healthcare: 'bg-green-100 text-green-800',
  marketing: 'bg-pink-100 text-pink-800', other: 'bg-gray-100 text-gray-700',
};

const TEMPLATES = [
  { id: 't1', name: 'RFQ Template', type: 'rfq', description: 'Standard Request for Quotation document for goods and services under R500,000.' },
  { id: 't2', name: 'RFP Template', type: 'rfp', description: 'Request for Proposal template with technical and commercial evaluation criteria.' },
  { id: 't3', name: 'Tender Template', type: 'tender', description: 'Open tender document for procurements exceeding R500,000 (PFMA compliant).' },
  { id: 't4', name: 'SOW Template', type: 'sow', description: 'Scope of Work template with deliverables, timelines, and acceptance criteria.' },
  { id: 't5', name: 'TOR Template', type: 'tor', description: 'Terms of Reference for professional services and consulting engagements.' },
  { id: 't6', name: 'Evaluation Matrix', type: 'evaluation_matrix', description: 'PPPFA 90/10 bid evaluation scoring matrix with weighted criteria.' },
  { id: 't7', name: 'Purchase Order', type: 'po', description: 'Standard PO template compliant with National Treasury guidelines.' },
  { id: 't8', name: 'Contract Template', type: 'contract', description: 'Service level agreement and supply contract with standard SARS-compliant clauses.' },
];

const TEMPLATE_COLORS: Record<string, string> = {
  rfq: 'bg-blue-100 text-blue-800', rfp: 'bg-violet-100 text-violet-800',
  tender: 'bg-amber-100 text-amber-800', sow: 'bg-teal-100 text-teal-800',
  tor: 'bg-cyan-100 text-cyan-800', evaluation_matrix: 'bg-orange-100 text-orange-800',
  po: 'bg-green-100 text-green-800', contract: 'bg-red-100 text-red-800',
};

const TEMPLATE_TYPE_LABELS: Record<string, string> = {
  rfq: 'RFQ', rfp: 'RFP', tender: 'Tender', sow: 'SOW', tor: 'TOR',
  evaluation_matrix: 'Eval Matrix', po: 'Purchase Order', contract: 'Contract',
};

const BEST_PRACTICES = [
  {
    icon: <Shield className="w-5 h-5 text-blue-600" />,
    bg: 'bg-blue-50 border-blue-200',
    title: 'PPPFA Compliance',
    description: 'Apply the Preferential Procurement Policy Framework Act 90/10 or 80/20 scoring principle on all quotations. Verify BBBEE certificates against the CIPC portal before scoring.',
  },
  {
    icon: <Star className="w-5 h-5 text-green-600" />,
    bg: 'bg-green-50 border-green-200',
    title: 'BBBEE Verification',
    description: 'Only accept BBBEE certificates issued by SANAS-accredited verification agencies or sworn affidavits for EMEs. Certificates must be valid at the time of bid evaluation.',
  },
  {
    icon: <ClipboardList className="w-5 h-5 text-amber-600" />,
    bg: 'bg-amber-50 border-amber-200',
    title: 'Three-Quote Rule',
    description: 'For procurements between R30,000 and R500,000, obtain a minimum of three written quotations from the supplier database. Document all attempts to obtain quotes.',
  },
  {
    icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
    bg: 'bg-red-50 border-red-200',
    title: 'Conflict of Interest',
    description: 'All evaluators must sign a conflict of interest declaration before accessing bids. Any declared conflict requires immediate recusal and replacement of the evaluator.',
  },
  {
    icon: <Archive className="w-5 h-5 text-purple-600" />,
    bg: 'bg-purple-50 border-purple-200',
    title: 'Deviation Management',
    description: 'Any deviation from standard procurement processes must be approved by the Accounting Officer and recorded in the deviation register. Emergency procurement requires post-award reporting within 10 days.',
  },
  {
    icon: <TrendingUp className="w-5 h-5 text-teal-600" />,
    bg: 'bg-teal-50 border-teal-200',
    title: 'Supplier Performance Management',
    description: 'Evaluate supplier performance at the end of each contract and update the supplier database. Suppliers with persistent non-performance should be placed on a performance improvement plan.',
  },
  {
    icon: <BookOpen className="w-5 h-5 text-indigo-600" />,
    bg: 'bg-indigo-50 border-indigo-200',
    title: 'Record Keeping',
    description: 'Maintain all procurement records for a minimum of 5 years as required by the PFMA. Records must include all quotations received, evaluation reports, approval documents, and contracts.',
  },
  {
    icon: <Zap className="w-5 h-5 text-orange-600" />,
    bg: 'bg-orange-50 border-orange-200',
    title: 'Emergency Procurement',
    description: 'Emergency procurement is only permissible when there is a risk to health, safety, or operational continuity. It requires written Accounting Officer approval, post-award reporting, and deviation register entry.',
  },
];

export default function KnowledgePage() {
  const [activeTab, setActiveTab] = useState('lessons');
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [newLesson, setNewLesson] = useState({ title: '', category: '', well: '', improve: '', recommendations: '' });

  function handleAddLesson() {
    if (!newLesson.title || !newLesson.category) {
      toast.error('Please fill in at least the title and category.');
      return;
    }
    toast.success('Lesson learned recorded successfully.');
    setShowAddLesson(false);
    setNewLesson({ title: '', category: '', well: '', improve: '', recommendations: '' });
  }

  function handleUseTemplate(name: string) {
    toast.success(`Template "${name}" loaded in AI Copilot.`);
  }

  const TABS = [
    { label: 'Lessons Learned', value: 'lessons', count: DEMO_LESSONS.length },
    { label: 'Document Templates', value: 'templates', count: TEMPLATES.length },
    { label: 'Best Practices', value: 'practices', count: BEST_PRACTICES.length },
  ];

  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="Knowledge Repository"
        subtitle="Lessons learned, templates, and best practices"
        actions={
          activeTab === 'lessons' ? (
            <Button
              size="sm"
              className="bg-[var(--brand-blue)] hover:bg-blue-700 text-white gap-1.5 h-8 text-xs"
              onClick={() => setShowAddLesson(true)}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Lesson
            </Button>
          ) : undefined
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-5">
        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-[var(--border-default)]">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px flex items-center gap-2 ${
                activeTab === tab.value
                  ? 'border-[var(--brand-blue)] text-[var(--brand-blue)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.value ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Lessons Learned */}
        {activeTab === 'lessons' && (
          <div className="space-y-4">
            {DEMO_LESSONS.map((lesson) => (
              <div key={lesson.id} className="bg-white border border-[var(--border-default)] rounded-xl shadow-sm p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">{lesson.procurement_title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[lesson.category] ?? 'bg-gray-100 text-gray-700'}`}>
                        {CATEGORY_LABELS[lesson.category] ?? lesson.category}
                      </span>
                      <span className="text-xs text-[var(--text-tertiary)]">
                        Recorded by {lesson.recorded_by} · {formatDate(lesson.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <ThumbsUp className="w-3.5 h-3.5 text-green-600" />
                      <p className="text-xs font-semibold text-green-800">What Went Well</p>
                    </div>
                    <p className="text-xs text-green-900 leading-relaxed">{lesson.what_went_well}</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                      <p className="text-xs font-semibold text-amber-800">What Could Improve</p>
                    </div>
                    <p className="text-xs text-amber-900 leading-relaxed">{lesson.what_could_improve}</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Lightbulb className="w-3.5 h-3.5 text-blue-600" />
                      <p className="text-xs font-semibold text-blue-800">Recommendations</p>
                    </div>
                    <p className="text-xs text-blue-900 leading-relaxed">{lesson.recommendations}</p>
                  </div>
                </div>
              </div>
            ))}
            {DEMO_LESSONS.length === 0 && (
              <div className="text-center py-16 text-[var(--text-tertiary)]">
                No lessons recorded yet. Click &quot;Add Lesson&quot; to get started.
              </div>
            )}
          </div>
        )}

        {/* Document Templates */}
        {activeTab === 'templates' && (
          <div className="grid grid-cols-3 gap-4">
            {TEMPLATES.map((template) => (
              <div key={template.id} className="bg-white border border-[var(--border-default)] rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="p-2.5 bg-gray-50 rounded-lg border border-[var(--border-default)]">
                    <FileText className="w-5 h-5 text-[var(--brand-blue)]" />
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TEMPLATE_COLORS[template.type] ?? 'bg-gray-100 text-gray-700'}`}>
                    {TEMPLATE_TYPE_LABELS[template.type] ?? template.type.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1.5">{template.name}</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">{template.description}</p>
                <Link href="/copilot">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-8 text-xs gap-1.5"
                    onClick={() => handleUseTemplate(template.name)}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Use Template
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Best Practices */}
        {activeTab === 'practices' && (
          <div className="grid grid-cols-2 gap-4">
            {BEST_PRACTICES.map((practice, idx) => (
              <div key={idx} className={`border rounded-xl p-5 ${practice.bg}`}>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                    {practice.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1.5">{practice.title}</h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{practice.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Lesson Dialog */}
      <Dialog open={showAddLesson} onOpenChange={setShowAddLesson}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Lesson Learned</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Procurement Title <span className="text-red-500">*</span></Label>
              <Input
                placeholder="e.g. Security Services — Cape Town Offices"
                value={newLesson.title}
                onChange={(e) => setNewLesson((p) => ({ ...p, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Category <span className="text-red-500">*</span></Label>
              <Select value={newLesson.category} onValueChange={(v) => setNewLesson((p) => ({ ...p, category: v ?? "" }))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>What Went Well</Label>
              <Textarea
                placeholder="Describe successes and positive outcomes..."
                className="resize-none min-h-[72px]"
                value={newLesson.well}
                onChange={(e) => setNewLesson((p) => ({ ...p, well: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>What Could Improve</Label>
              <Textarea
                placeholder="Describe challenges and areas for improvement..."
                className="resize-none min-h-[72px]"
                value={newLesson.improve}
                onChange={(e) => setNewLesson((p) => ({ ...p, improve: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Recommendations</Label>
              <Textarea
                placeholder="Specific recommendations for future procurements..."
                className="resize-none min-h-[72px]"
                value={newLesson.recommendations}
                onChange={(e) => setNewLesson((p) => ({ ...p, recommendations: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddLesson(false)}>Cancel</Button>
            <Button className="bg-[var(--brand-blue)] hover:bg-blue-700 text-white" onClick={handleAddLesson}>
              Record Lesson
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
