'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Building2, FileText, CreditCard, Users, CheckCircle2,
  ArrowRight, ArrowLeft, Upload, Shield, Info, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { Logomark } from '@/components/logomark';

const STEPS = [
  { id: 1, label: 'Company Info',   icon: Building2 },
  { id: 2, label: 'BBBEE & Tax',    icon: Shield },
  { id: 3, label: 'Capabilities',   icon: FileText },
  { id: 4, label: 'Documents',      icon: Upload },
  { id: 5, label: 'References',     icon: Users },
  { id: 6, label: 'Review',         icon: CheckCircle2 },
];

const CATEGORIES = [
  'IT Equipment', 'Office Supplies', 'Construction Materials', 'Professional Services',
  'Facilities Management', 'Logistics & Transport', 'Security Services',
  'Healthcare & PPE', 'Marketing & Printing', 'Other',
];

const SA_PROVINCES = [
  { value: 'GP', label: 'Gauteng' }, { value: 'WC', label: 'Western Cape' },
  { value: 'KZN', label: 'KwaZulu-Natal' }, { value: 'EC', label: 'Eastern Cape' },
  { value: 'FS', label: 'Free State' }, { value: 'LP', label: 'Limpopo' },
  { value: 'MP', label: 'Mpumalanga' }, { value: 'NC', label: 'Northern Cape' },
  { value: 'NW', label: 'North West' },
];

const REQUIRED_DOCS = [
  { id: 'cipc',      label: 'CIPC Company Registration Certificate', required: true, hint: 'Must show active status. Available from cipc.co.za' },
  { id: 'tax',       label: 'SARS Tax Clearance Certificate / PIN',  required: true, hint: 'Must be valid and active at time of submission' },
  { id: 'bbbee',     label: 'BBBEE Verification Certificate',        required: true, hint: 'Issued by SANAS-accredited agency. EME affidavit accepted for <R10M turnover' },
  { id: 'bank',      label: 'Bank Confirmation Letter',              required: true, hint: 'Bank-stamped, not older than 3 months. Must show account holder name' },
  { id: 'liability', label: 'Public Liability Insurance',            required: false, hint: 'Minimum R2M cover recommended. Required for construction and services' },
  { id: 'indemnity', label: 'Professional Indemnity Insurance',      required: false, hint: 'Required for professional services, IT, consulting' },
];

interface FormData {
  // Step 1
  company_name: string; trading_name: string; cipc_number: string;
  vat_number: string; contact_name: string; contact_email: string;
  contact_phone: string; website: string; physical_address: string;
  province: string; years_in_operation: string;
  // Step 2
  bbbee_level: string; bbbee_classification: string; bbbee_agency: string;
  bbbee_expiry: string; turnover_band: string; max_contract_value: string;
  // Step 3
  categories: string[]; provinces_covered: string[];
  // Step 4
  documents: Record<string, File | null>;
  // Step 5
  ref1_company: string; ref1_contact: string; ref1_email: string; ref1_phone: string;
  ref2_company: string; ref2_contact: string; ref2_email: string; ref2_phone: string;
  ref3_company: string; ref3_contact: string; ref3_email: string; ref3_phone: string;
}

const INITIAL: FormData = {
  company_name: '', trading_name: '', cipc_number: '', vat_number: '',
  contact_name: '', contact_email: '', contact_phone: '', website: '',
  physical_address: '', province: '', years_in_operation: '',
  bbbee_level: '', bbbee_classification: '', bbbee_agency: '', bbbee_expiry: '', turnover_band: '', max_contract_value: '',
  categories: [], provinces_covered: [],
  documents: {},
  ref1_company: '', ref1_contact: '', ref1_email: '', ref1_phone: '',
  ref2_company: '', ref2_contact: '', ref2_email: '', ref2_phone: '',
  ref3_company: '', ref3_contact: '', ref3_email: '', ref3_phone: '',
};

function calculateGrade(form: FormData): { score: number; breakdown: Record<string, number>; grade: string } {
  const bbbee = parseInt(form.bbbee_level || '8');
  const bbbeeScores: Record<number, number> = { 1: 20, 2: 18, 3: 14, 4: 11, 5: 8, 6: 6, 7: 4, 8: 2 };
  const bbbeeScore = bbbeeScores[bbbee] ?? 2;

  const docCount = Object.values(form.documents).filter(Boolean).length;
  const docScore = Math.round((docCount / REQUIRED_DOCS.length) * 15);
  const taxScore = form.cipc_number ? 20 : 0;
  const cipcScore = form.cipc_number ? 15 : 0;
  const refCount = [form.ref1_company, form.ref2_company, form.ref3_company].filter(Boolean).length;
  const refScore = Math.round((refCount / 3) * 10);
  const finScore = form.turnover_band ? 8 : 0;

  const total = bbbeeScore + taxScore + cipcScore + docScore + refScore + finScore;
  const grade = total >= 85 ? 'A' : total >= 70 ? 'B' : total >= 55 ? 'C' : total >= 40 ? 'D' : 'F';

  return { score: total, breakdown: { bbbee: bbbeeScore, tax: taxScore, cipc: cipcScore, docs: docScore, refs: refScore, financial: finScore }, grade };
}

export default function SupplierRegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [submitted, setSubmitted] = useState(false);

  function update(field: keyof FormData, value: string) {
    setForm(p => ({ ...p, [field]: value }));
  }

  function toggleCategory(cat: string) {
    setForm(p => ({
      ...p,
      categories: p.categories.includes(cat)
        ? p.categories.filter(c => c !== cat)
        : [...p.categories, cat],
    }));
  }

  function toggleProvince(prov: string) {
    setForm(p => ({
      ...p,
      provinces_covered: p.provinces_covered.includes(prov)
        ? p.provinces_covered.filter(v => v !== prov)
        : [...p.provinces_covered, prov],
    }));
  }

  function handleDocUpload(docId: string, file: File | null) {
    setForm(p => ({ ...p, documents: { ...p.documents, [docId]: file } }));
  }

  function handleSubmit() {
    setSubmitted(true);
    toast.success('Application submitted! Our team will review within 3–5 business days.');
  }

  const gradeResult = calculateGrade(form);

  if (submitted) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Application Submitted!</h1>
          <p className="text-[var(--text-secondary)] text-sm mb-1">
            Thank you for registering with ProcureTech+. Your application reference is:
          </p>
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg px-4 py-2 inline-block mb-6 font-mono text-sm font-semibold text-[var(--brand-blue)]">
            SUP/PT/{new Date().getFullYear()}/
            {String(Math.floor(Math.random() * 900) + 100).padStart(3,'0')}
          </div>
          <div className="bg-white border border-[var(--border-default)] rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">Preliminary Grade Assessment</p>
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold',
                gradeResult.grade === 'A' ? 'bg-green-100 text-green-700' :
                gradeResult.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                gradeResult.grade === 'C' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
              )}>{gradeResult.grade}</div>
              <div>
                <div className="font-semibold text-[var(--text-primary)]">{gradeResult.score}/100</div>
                <div className="text-xs text-[var(--text-tertiary)]">Preliminary score — subject to verification</div>
              </div>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              {gradeResult.grade === 'A' || gradeResult.grade === 'B'
                ? 'Excellent profile! You are likely to be approved and included in our verified supplier network.'
                : 'Your application will be reviewed. You may be asked to provide additional documentation.'}
            </p>
          </div>
          <div className="space-y-2 text-left text-xs text-[var(--text-secondary)] mb-6">
            <p>✓ You will receive a confirmation email within 24 hours</p>
            <p>✓ Our compliance team will verify your documents within 3–5 business days</p>
            <p>✓ Once approved, you will receive RFQ invitations matching your categories</p>
          </div>
          <Link href="/login">
            <Button className="w-full bg-[var(--brand-blue)] hover:bg-[var(--brand-blue-dark)] text-white">
              Go to Supplier Portal
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--border-default)] px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logomark size={32} />
            <div>
              <div className="font-bold text-sm text-[var(--text-primary)]">ProcureTech<span className="text-[var(--brand-blue)]">+</span></div>
              <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Supplier Registration</div>
            </div>
          </div>
          <Link href="/login" className="text-xs text-[var(--text-secondary)] hover:text-[var(--brand-blue)]">
            Already registered? Sign in
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all',
                  step > s.id  ? 'bg-[var(--brand-blue)] border-[var(--brand-blue)] text-white' :
                  step === s.id ? 'border-[var(--brand-blue)] text-[var(--brand-blue)] bg-white' :
                  'border-[var(--border-default)] text-[var(--text-tertiary)] bg-white'
                )}>
                  {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                </div>
                <span className={cn('text-[10px] font-medium whitespace-nowrap', step === s.id ? 'text-[var(--brand-blue)]' : 'text-[var(--text-tertiary)]')}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('flex-1 h-px mx-2 mb-4', step > s.id ? 'bg-[var(--brand-blue)]' : 'bg-[var(--border-default)]')} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white border border-[var(--border-default)] rounded-xl shadow-sm p-6">

          {/* Step 1 — Company Info */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Company Information</h2>
                <p className="text-sm text-[var(--text-secondary)] mt-0.5">Enter your company details exactly as they appear on your CIPC registration.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Legal Company Name *</Label>
                  <Input placeholder="As registered with CIPC" value={form.company_name} onChange={e => update('company_name', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Trading Name (if different)</Label>
                  <Input placeholder="Optional" value={form.trading_name} onChange={e => update('trading_name', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>CIPC Registration Number *</Label>
                  <Input placeholder="e.g. 2015/234567/07" value={form.cipc_number} onChange={e => update('cipc_number', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>VAT Registration Number</Label>
                  <Input placeholder="e.g. 4870234567" value={form.vat_number} onChange={e => update('vat_number', e.target.value)} />
                  <p className="text-xs text-[var(--text-tertiary)]">Required if VAT registered</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Contact Person *</Label>
                  <Input placeholder="Full name" value={form.contact_name} onChange={e => update('contact_name', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Email Address *</Label>
                  <Input type="email" placeholder="contact@company.co.za" value={form.contact_email} onChange={e => update('contact_email', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone Number *</Label>
                  <Input placeholder="011 234 5678" value={form.contact_phone} onChange={e => update('contact_phone', e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Physical Address *</Label>
                <Input placeholder="Street, City, Postal Code" value={form.physical_address} onChange={e => update('physical_address', e.target.value)} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Province *</Label>
                  <Select value={form.province} onValueChange={(v) => { if (v) update('province', v); }}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{SA_PROVINCES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Years in Operation *</Label>
                  <Input type="number" min="0" placeholder="e.g. 8" value={form.years_in_operation} onChange={e => update('years_in_operation', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Website</Label>
                  <Input type="url" placeholder="https://yourcompany.co.za" value={form.website} onChange={e => update('website', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — BBBEE & Financial */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">BBBEE & Financial Information</h2>
                <p className="text-sm text-[var(--text-secondary)] mt-0.5">BBBEE status is a key evaluation criterion under PPPFA 2017 regulations.</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">EME (Exempt Micro Enterprises with &lt;R10M annual turnover) and QSE (&lt;R50M) can self-certify BBBEE via sworn affidavit from a commissioner of oaths. Generic enterprises require verification by a SANAS-accredited agency.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>BBBEE Level *</Label>
                  <Select value={form.bbbee_level} onValueChange={(v) => { if (v) update('bbbee_level', v); }}>
                    <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8].map(l => <SelectItem key={l} value={String(l)}>Level {l}</SelectItem>)}
                      <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Enterprise Classification *</Label>
                  <Select value={form.bbbee_classification} onValueChange={(v) => { if (v) update('bbbee_classification', v); }}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eme">EME (under R10M turnover)</SelectItem>
                      <SelectItem value="qse">QSE (R10M–R50M turnover)</SelectItem>
                      <SelectItem value="generic">Generic (over R50M turnover)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Verification Agency</Label>
                  <Input placeholder="e.g. AQRate, Verified Ratings" value={form.bbbee_agency} onChange={e => update('bbbee_agency', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Certificate Expiry Date</Label>
                  <Input type="date" value={form.bbbee_expiry} onChange={e => update('bbbee_expiry', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Annual Turnover Band *</Label>
                  <Select value={form.turnover_band} onValueChange={(v) => { if (v) update('turnover_band', v); }}>
                    <SelectTrigger><SelectValue placeholder="Select band" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under_1m">Under R1M</SelectItem>
                      <SelectItem value="1m_10m">R1M – R10M</SelectItem>
                      <SelectItem value="10m_50m">R10M – R50M</SelectItem>
                      <SelectItem value="50m_100m">R50M – R100M</SelectItem>
                      <SelectItem value="over_100m">Over R100M</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Maximum Contract Value</Label>
                  <Input type="number" placeholder="e.g. 5000000" value={form.max_contract_value} onChange={e => update('max_contract_value', e.target.value)} />
                  <p className="text-xs text-[var(--text-tertiary)]">Maximum single contract you can deliver</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Capabilities */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Supply Categories & Coverage</h2>
                <p className="text-sm text-[var(--text-secondary)] mt-0.5">Select all categories you supply and the provinces you can deliver to. You will only receive RFQs matching your selections.</p>
              </div>
              <div className="space-y-2">
                <Label>Supply Categories * (select all that apply)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={cn(
                        'flex items-center gap-2 p-2.5 rounded-lg border text-sm text-left transition-all',
                        form.categories.includes(cat)
                          ? 'border-[var(--brand-blue)] bg-[var(--brand-blue-light)] text-[var(--brand-blue)]'
                          : 'border-[var(--border-default)] bg-white text-[var(--text-secondary)] hover:border-gray-400'
                      )}
                    >
                      <div className={cn('w-4 h-4 rounded border-2 flex items-center justify-center shrink-0',
                        form.categories.includes(cat) ? 'border-[var(--brand-blue)] bg-[var(--brand-blue)]' : 'border-gray-300'
                      )}>
                        {form.categories.includes(cat) && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Provinces You Can Supply To * (select all that apply)</Label>
                <div className="grid grid-cols-3 gap-2">
                  {SA_PROVINCES.map(prov => (
                    <button
                      key={prov.value}
                      type="button"
                      onClick={() => toggleProvince(prov.value)}
                      className={cn(
                        'p-2 rounded-lg border text-sm text-center transition-all',
                        form.provinces_covered.includes(prov.value)
                          ? 'border-[var(--brand-blue)] bg-[var(--brand-blue-light)] text-[var(--brand-blue)]'
                          : 'border-[var(--border-default)] bg-white text-[var(--text-secondary)] hover:border-gray-400'
                      )}
                    >
                      {prov.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4 — Documents */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Compliance Documents</h2>
                <p className="text-sm text-[var(--text-secondary)] mt-0.5">Upload your compliance documents. Required documents must be uploaded to complete registration. All documents are stored securely.</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">Documents will be verified by our compliance team. Ensure all documents are valid, legible, and not expired. Uploading fraudulent documents is a criminal offence.</p>
              </div>
              <div className="space-y-3">
                {REQUIRED_DOCS.map(doc => (
                  <div key={doc.id} className="border border-[var(--border-default)] rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[var(--text-primary)]">{doc.label}</span>
                          {doc.required && <Badge variant="outline" className="text-[10px] text-red-600 border-red-300">Required</Badge>}
                        </div>
                        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{doc.hint}</p>
                      </div>
                      {form.documents[doc.id] && (
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      )}
                    </div>
                    <label className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed cursor-pointer transition-colors text-sm',
                      form.documents[doc.id]
                        ? 'border-green-400 bg-green-50 text-green-700'
                        : 'border-[var(--border-default)] hover:border-[var(--brand-blue)] text-[var(--text-tertiary)]'
                    )}>
                      <Upload className="w-4 h-4" />
                      {form.documents[doc.id]
                        ? `✓ ${(form.documents[doc.id] as File).name}`
                        : 'Click to upload (PDF, JPG, PNG — max 10MB)'}
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={e => handleDocUpload(doc.id, e.target.files?.[0] ?? null)}
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 5 — References */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Business References</h2>
                <p className="text-sm text-[var(--text-secondary)] mt-0.5">Provide at least 3 verifiable business references from clients you have supplied in the past 3 years. References will be contacted during verification.</p>
              </div>
              {[1, 2, 3].map(n => (
                <div key={n} className="border border-[var(--border-default)] rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[var(--brand-blue-light)] text-[var(--brand-blue)] flex items-center justify-center text-xs font-bold">{n}</div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">Reference {n} {n <= 2 ? '*' : ''}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Company Name</Label>
                      <Input placeholder="Client company name" value={form[`ref${n}_company` as keyof FormData] as string} onChange={e => update(`ref${n}_company` as keyof FormData, e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Contact Person</Label>
                      <Input placeholder="Full name" value={form[`ref${n}_contact` as keyof FormData] as string} onChange={e => update(`ref${n}_contact` as keyof FormData, e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Email Address</Label>
                      <Input type="email" placeholder="contact@client.co.za" value={form[`ref${n}_email` as keyof FormData] as string} onChange={e => update(`ref${n}_email` as keyof FormData, e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Phone Number</Label>
                      <Input placeholder="011 234 5678" value={form[`ref${n}_phone` as keyof FormData] as string} onChange={e => update(`ref${n}_phone` as keyof FormData, e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 6 — Review */}
          {step === 6 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Review & Submit</h2>
                <p className="text-sm text-[var(--text-secondary)] mt-0.5">Review your application before submitting. Our compliance team will verify your details and respond within 3–5 business days.</p>
              </div>

              {/* Preliminary Grade */}
              <div className="border border-[var(--border-default)] rounded-xl p-4">
                <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">Preliminary Supplier Grade</p>
                <div className="flex items-center gap-4 mb-3">
                  <div className={cn('w-16 h-16 rounded-xl flex flex-col items-center justify-center',
                    gradeResult.grade === 'A' ? 'bg-green-100' : gradeResult.grade === 'B' ? 'bg-blue-100' : 'bg-amber-100'
                  )}>
                    <span className={cn('text-3xl font-bold', gradeResult.grade === 'A' ? 'text-green-700' : gradeResult.grade === 'B' ? 'text-blue-700' : 'text-amber-700')}>{gradeResult.grade}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{gradeResult.score}/100</div>
                    <div className="text-xs text-[var(--text-tertiary)]">Preliminary score — final score set after verification</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {Object.entries(gradeResult.breakdown).map(([key, val]) => (
                    <div key={key} className="flex justify-between bg-gray-50 rounded px-2 py-1">
                      <span className="text-[var(--text-tertiary)] capitalize">{key}</span>
                      <span className="font-medium text-[var(--text-primary)]">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="border border-[var(--border-default)] rounded-xl divide-y divide-[var(--border-default)]">
                {[
                  ['Company', form.company_name || '—'],
                  ['CIPC Number', form.cipc_number || '—'],
                  ['VAT Number', form.vat_number || 'Not provided'],
                  ['Contact', `${form.contact_name} · ${form.contact_email}`],
                  ['BBBEE Level', form.bbbee_level ? `Level ${form.bbbee_level} (${form.bbbee_classification?.toUpperCase()})` : '—'],
                  ['Categories', form.categories.join(', ') || '—'],
                  ['Provinces', form.provinces_covered.join(', ') || '—'],
                  ['Documents uploaded', `${Object.values(form.documents).filter(Boolean).length} / ${REQUIRED_DOCS.length}`],
                  ['References provided', [form.ref1_company, form.ref2_company, form.ref3_company].filter(Boolean).length.toString()],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-[var(--text-tertiary)]">{label}</span>
                    <span className="text-xs font-medium text-[var(--text-primary)] text-right max-w-[60%]">{value}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                <input type="checkbox" id="agree" className="mt-0.5" />
                <label htmlFor="agree">
                  I confirm that all information provided is accurate and I authorise ProcureTech+ to verify my company details, documents, and references. I understand that providing false information may result in rejection or legal action.
                </label>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6 pt-4 border-t border-[var(--border-default)]">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(s => s - 1)} className="gap-1.5">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
            ) : (
              <Link href="/login"><Button variant="ghost" className="text-[var(--text-secondary)]">← Login instead</Button></Link>
            )}
            {step < 6 ? (
              <Button onClick={() => setStep(s => s + 1)} className="bg-[var(--brand-blue)] hover:bg-[var(--brand-blue-dark)] text-white gap-1.5">
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Submit Application
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
