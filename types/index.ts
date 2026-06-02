// ─── User & Auth ─────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'procurement_officer' | 'manager' | 'cfo' | 'legal' | 'supplier';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  organisation_id: string;
  avatar_url?: string;
  created_at: string;
}

// ─── Organisation ─────────────────────────────────────────────────────────────

export interface Organisation {
  id: string;
  name: string;
  logo_url?: string;
  registration_number?: string;
  vat_number?: string;
  address?: string;
  province?: string;
  currency: 'ZAR';
  region: 'ZA';
}

// ─── Procurement ──────────────────────────────────────────────────────────────

export type ProcurementStatus =
  | 'draft'
  | 'needs_identified'
  | 'market_research'
  | 'strategy_approved'
  | 'rfq_sent'
  | 'bids_received'
  | 'evaluation'
  | 'recommendation'
  | 'approval'
  | 'awarded'
  | 'contracted'
  | 'delivered'
  | 'closed'
  | 'cancelled';

export type ProcurementType = 'rfq' | 'rfp' | 'tender' | 'sole_source' | 'emergency';

export type ProcurementCategory =
  | 'it_equipment'
  | 'office_supplies'
  | 'construction'
  | 'professional_services'
  | 'facilities'
  | 'logistics'
  | 'security'
  | 'healthcare'
  | 'marketing'
  | 'other';

// CIPS Procurement Cycle stages (mapped to CIPS standard + PPPFA)
export type CIPSStage =
  | 'identify_need'       // Stage 1 — Need identified, budget confirmed
  | 'specify'             // Stage 2 — SOW / TOR / Specifications drafted
  | 'market_intelligence' // Stage 3 — Market analysis, price benchmarking
  | 'strategy'            // Stage 4 — Procurement strategy & approach
  | 'source'              // Stage 5 — RFQ/RFP/Tender issued
  | 'assess'              // Stage 6 — Bid evaluation & scoring
  | 'recommend'           // Stage 7 — Recommendation report
  | 'approve'             // Stage 8 — Approval workflow
  | 'contract'            // Stage 9 — PO / Contract award
  | 'deliver_review';     // Stage 10 — Delivery, performance & lessons learned

export interface Procurement {
  id: string;
  reference: string;           // e.g. RFQ/PT/2025/048
  title: string;
  description: string;
  category: ProcurementCategory;
  type: ProcurementType;
  status: ProcurementStatus;
  current_stage: CIPSStage;
  budget: number;              // ZAR
  estimated_value?: number;    // AI-benchmarked market value
  currency: 'ZAR';
  delivery_location: string;
  delivery_province: SAProvince;
  required_by: string;         // ISO date
  bbbee_requirement: BBBEERequirement;
  min_quotes: number;
  organisation_id: string;
  created_by: string;          // user id
  assigned_to?: string;        // procurement officer
  sow?: string;                // Scope of Work (AI generated)
  rfq_document?: string;       // Full RFQ text
  market_analysis?: MarketAnalysis;
  approval_chain: ApprovalStep[];
  blockchain_hash?: string;
  created_at: string;
  updated_at: string;
}

// ─── Suppliers ────────────────────────────────────────────────────────────────

export type SupplierStatus = 'pending' | 'approved' | 'conditional' | 'rejected' | 'suspended';

export type BBBEELevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type BBBEERequirement = 'level_1_2' | 'level_1_4' | 'level_1_6' | 'any' | 'none';
export type BBBEEClassification = 'eme' | 'qse' | 'generic';

export type SAProvince =
  | 'GP' | 'WC' | 'KZN' | 'EC' | 'FS'
  | 'LP' | 'MP' | 'NC' | 'NW';

export interface SupplierDocument {
  id: string;
  supplier_id: string;
  type: SupplierDocumentType;
  file_name: string;
  file_url: string;
  expiry_date?: string;
  verified: boolean;
  uploaded_at: string;
}

export type SupplierDocumentType =
  | 'cipc_registration'
  | 'tax_clearance'
  | 'bbbee_certificate'
  | 'bank_confirmation'
  | 'liability_insurance'
  | 'professional_indemnity'
  | 'psira_certificate'       // Security providers
  | 'cif_certificate'         // Construction
  | 'other_licence';

export interface SupplierGrade {
  total: number;               // 0–100
  bbbee_score: number;         // /20
  tax_compliance_score: number;// /20
  cipc_score: number;          // /15
  document_score: number;      // /15
  financial_score: number;     // /10
  reference_score: number;     // /10
  certification_score: number; // /10
  performance_score: number;   // grows with orders
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface Supplier {
  id: string;
  // Company
  company_name: string;
  trading_name?: string;
  cipc_number: string;
  vat_number?: string;
  // Contact
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  website?: string;
  // Address
  physical_address: string;
  province: SAProvince;
  // BBBEE
  bbbee_level?: BBBEELevel;
  bbbee_classification?: BBBEEClassification;
  bbbee_expiry?: string;
  bbbee_agency?: string;
  // Capability
  categories: ProcurementCategory[];
  provinces_covered: SAProvince[];
  years_in_operation: number;
  annual_turnover_band: TurnoverBand;
  max_contract_value?: number;
  // References (at least 3 required)
  references: SupplierReference[];
  // Platform
  status: SupplierStatus;
  grade?: SupplierGrade;
  documents: SupplierDocument[];
  // Performance (populated as orders placed)
  total_orders: number;
  response_rate: number;       // 0–100
  on_time_delivery_rate: number;
  quality_rating: number;      // 0–5
  // Meta
  organisation_id: string;
  created_at: string;
  updated_at: string;
  approved_at?: string;
  approved_by?: string;
}

export type TurnoverBand =
  | 'under_1m'
  | '1m_10m'
  | '10m_50m'
  | '50m_100m'
  | 'over_100m';

export interface SupplierReference {
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  contract_value?: number;
  year?: number;
}

// ─── Bids & Evaluation ────────────────────────────────────────────────────────

export interface Bid {
  id: string;
  procurement_id: string;
  supplier_id: string;
  supplier_name: string;
  unit_price: number;
  total_price: number;
  delivery_days: number;
  warranty_months?: number;
  technical_compliance: number; // 0–100
  notes?: string;
  documents: string[];
  submitted_at: string;
  ai_score?: EvaluationScore;
  recommendation?: 'recommended' | 'second' | 'not_recommended';
}

export interface EvaluationScore {
  total: number;               // 0–100
  price_score: number;         // 0–40
  bbbee_score: number;         // 0–20
  delivery_score: number;      // 0–20
  technical_score: number;     // 0–20
  price_weight: number;        // 40
  bbbee_weight: number;        // 20
  delivery_weight: number;     // 20
  technical_weight: number;    // 20
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  compliance_gaps: string[];
  ai_narrative: string;
}

// ─── Approvals ────────────────────────────────────────────────────────────────

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'returned';

export interface ApprovalStep {
  step: number;
  role: UserRole;
  role_label: string;
  status: ApprovalStatus;
  approved_by?: string;
  approved_by_name?: string;
  comments?: string;
  actioned_at?: string;
}

// ─── Market Intelligence ──────────────────────────────────────────────────────

export interface MarketAnalysis {
  category: ProcurementCategory;
  item_description: string;
  price_min: number;
  price_max: number;
  price_median: number;
  price_trend: 'rising' | 'stable' | 'falling';
  trend_pct?: number;
  currency: 'ZAR';
  recommended_suppliers: string[];
  oems_and_manufacturers: string[];
  market_notes: string;
  analysed_at: string;
  source: 'ai' | 'manual';
}

// ─── Audit Trail ─────────────────────────────────────────────────────────────

export interface AuditEvent {
  id: string;
  procurement_id: string;
  event_type: AuditEventType;
  event_label: string;
  actor_id: string;
  actor_name: string;
  actor_role: UserRole;
  description: string;
  metadata?: Record<string, unknown>;
  prev_hash: string;
  block_hash: string;
  block_index: number;
  timestamp: string;
}

export type AuditEventType =
  | 'procurement_created'
  | 'sow_generated'
  | 'rfq_generated'
  | 'rfq_sent'
  | 'bid_received'
  | 'evaluation_run'
  | 'report_drafted'
  | 'report_submitted'
  | 'approval_granted'
  | 'approval_rejected'
  | 'po_issued'
  | 'contract_signed'
  | 'delivery_confirmed'
  | 'lesson_recorded'
  | 'supplier_approved'
  | 'supplier_rejected'
  | 'deviation_logged'
  | 'conflict_declared';

// ─── Knowledge ────────────────────────────────────────────────────────────────

export interface LessonLearned {
  id: string;
  procurement_id: string;
  procurement_title: string;
  category: ProcurementCategory;
  what_went_well: string;
  what_could_improve: string;
  recommendations: string;
  recorded_by: string;
  created_at: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  type: 'rfq' | 'rfp' | 'tender' | 'sow' | 'tor' | 'po' | 'contract' | 'evaluation_matrix';
  description: string;
  content: string;
  version: string;
  created_at: string;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface SpendData {
  category: string;
  amount: number;
  count: number;
}

export interface SavingsData {
  month: string;
  savings: number;
  benchmark: number;
  actual: number;
}

export interface SupplierPerformanceData {
  supplier_name: string;
  response_rate: number;
  on_time: number;
  quality: number;
  orders: number;
}
