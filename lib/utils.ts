import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { BBBEELevel, ProcurementStatus, CIPSStage, SAProvince, TurnoverBand, UserRole } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Currency ─────────────────────────────────────────────────────────────────
export function formatCurrency(amount: number, compact = false): string {
  if (compact) {
    if (amount >= 1_000_000) return `R${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000)     return `R${(amount / 1_000).toFixed(0)}k`;
    return `R${amount.toLocaleString('en-ZA')}`;
  }
  return `R${amount.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// ─── Dates ────────────────────────────────────────────────────────────────────
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });
}
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
export function timeAgo(date: string | Date): string {
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (secs < 60)    return 'just now';
  if (secs < 3600)  return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

// ─── BBBEE ────────────────────────────────────────────────────────────────────
export function getBBBEEColor(level?: BBBEELevel): 'success' | 'warning' | 'danger' | 'default' {
  if (!level) return 'default';
  if (level <= 2) return 'success';
  if (level <= 4) return 'warning';
  return 'danger';
}
export function getBBBEEScore(level?: BBBEELevel): number {
  if (!level) return 0;
  const scores: Record<BBBEELevel, number> = { 1: 20, 2: 18, 3: 14, 4: 11, 5: 8, 6: 6, 7: 4, 8: 2 };
  return scores[level];
}

// ─── Status ───────────────────────────────────────────────────────────────────
export const STATUS_LABELS: Record<ProcurementStatus, string> = {
  draft: 'Draft', needs_identified: 'Need Identified', market_research: 'Market Research',
  strategy_approved: 'Strategy Approved', rfq_sent: 'RFQ Sent', bids_received: 'Bids Received',
  evaluation: 'Under Evaluation', recommendation: 'Recommendation Ready', approval: 'Pending Approval',
  awarded: 'Awarded', contracted: 'Contracted', delivered: 'Delivered', closed: 'Closed', cancelled: 'Cancelled',
};
export function getStatusColor(status: ProcurementStatus): string {
  const map: Partial<Record<ProcurementStatus, string>> = {
    draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
    rfq_sent: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    evaluation: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    approval: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    awarded: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    contracted: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    cancelled: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  };
  return map[status] ?? 'bg-gray-100 text-gray-600';
}

// ─── CIPS Stages ──────────────────────────────────────────────────────────────
export const CIPS_STAGES: { id: CIPSStage; label: string; description: string }[] = [
  { id: 'identify_need',       label: 'Identify Need',   description: 'Define the requirement, confirm budget and get approval to proceed' },
  { id: 'specify',             label: 'Specify',         description: 'Draft the Scope of Work, TOR and technical specifications' },
  { id: 'market_intelligence', label: 'Market Intel',    description: 'AI price benchmarking, supplier landscape analysis and OEM comparison' },
  { id: 'strategy',            label: 'Strategy',        description: 'Choose procurement approach: RFQ, RFP, tender or sole source' },
  { id: 'source',              label: 'Source Bids',     description: 'Invite suppliers and issue RFQ / RFP / Tender documents' },
  { id: 'assess',              label: 'Assess Bids',     description: 'Evaluate received bids on price, BBBEE, technical compliance and delivery' },
  { id: 'recommend',           label: 'AI Evaluation',   description: 'AI-assisted recommendation report — review, edit and finalise' },
  { id: 'approve',             label: 'Approve',         description: 'Approval workflow: Officer → Manager → CFO → Legal sign-off' },
  { id: 'contract',            label: 'Contract',        description: 'Issue purchase order or contract and notify all suppliers' },
  { id: 'deliver_review',      label: 'Deliver',         description: 'Delivery confirmation, supplier performance rating and lessons learned' },
];
export function getStageIndex(stage: CIPSStage): number {
  return CIPS_STAGES.findIndex(s => s.id === stage);
}

// ─── Labels ───────────────────────────────────────────────────────────────────
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator', procurement_officer: 'Procurement Officer',
  manager: 'Procurement Manager', cfo: 'CFO', legal: 'Legal', supplier: 'Supplier',
};
export const PROVINCE_LABELS: Record<SAProvince, string> = {
  GP: 'Gauteng', WC: 'Western Cape', KZN: 'KwaZulu-Natal', EC: 'Eastern Cape',
  FS: 'Free State', LP: 'Limpopo', MP: 'Mpumalanga', NC: 'Northern Cape', NW: 'North West',
};
export const TURNOVER_LABELS: Record<TurnoverBand, string> = {
  under_1m: 'Under R1M', '1m_10m': 'R1M – R10M', '10m_50m': 'R10M – R50M',
  '50m_100m': 'R50M – R100M', over_100m: 'Over R100M',
};

// ─── Scoring (PPPFA 90/10) ────────────────────────────────────────────────────
export function calculatePriceScore(bidPrice: number, lowestPrice: number, weight = 80): number {
  return Math.max(0, weight * (1 - (bidPrice - lowestPrice) / lowestPrice));
}
export function gradeFromScore(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

// ─── Blockchain ───────────────────────────────────────────────────────────────
export async function sha256(data: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
export async function createBlockHash(prevHash: string, index: number, timestamp: string, payload: object): Promise<string> {
  return sha256(JSON.stringify({ prevHash, index, timestamp, payload }));
}

// ─── Reference generator ─────────────────────────────────────────────────────
let refCounter = 48;
export function generateRef(type: 'RFQ' | 'RFP' | 'TDR' | 'PO'): string {
  return `${type}/PT/${new Date().getFullYear()}/${String(++refCounter).padStart(3, '0')}`;
}

export const DEMO_USER_ID = 'demo-user-001';
export const DEMO_ORG_ID  = 'demo-org-001';
