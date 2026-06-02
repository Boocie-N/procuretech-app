/**
 * Demo data store — uses localStorage for persistence.
 * When Supabase is configured, swap calls here for supabase queries.
 * All data is realistic and South Africa-specific.
 */

import type { Procurement, Supplier, Bid, AuditEvent, LessonLearned, User } from '@/types';

// ─── Demo Users ───────────────────────────────────────────────────────────────
export const DEMO_USERS: User[] = [
  { id: 'u1', email: 'thabo@procuretech.co.za',  full_name: 'Thabo Mokoena',   role: 'procurement_officer', organisation_id: 'org1', created_at: '2024-01-15T08:00:00Z' },
  { id: 'u2', email: 'naledi@procuretech.co.za', full_name: 'Naledi Dlamini',  role: 'manager',             organisation_id: 'org1', created_at: '2024-01-10T08:00:00Z' },
  { id: 'u3', email: 'sipho@procuretech.co.za',  full_name: 'Sipho Khumalo',   role: 'cfo',                 organisation_id: 'org1', created_at: '2024-01-05T08:00:00Z' },
  { id: 'u4', email: 'admin@procuretech.co.za',  full_name: 'Admin User',      role: 'admin',               organisation_id: 'org1', created_at: '2024-01-01T08:00:00Z' },
  { id: 'u5', email: 'legal@procuretech.co.za',  full_name: 'Zanele Motha',    role: 'legal',               organisation_id: 'org1', created_at: '2024-01-10T08:00:00Z' },
  { id: 'u6', email: 'supplier@mecer.co.za',     full_name: 'Johan van Wyk',   role: 'supplier',            organisation_id: 'org1', created_at: '2024-02-01T08:00:00Z' },
];

// ─── Demo Procurements ────────────────────────────────────────────────────────
export const DEMO_PROCUREMENTS: Procurement[] = [
  {
    id: 'p1',
    reference: 'RFQ/PT/2025/048',
    title: '500× Laptop Computers',
    description: 'Procurement of 500 Dell Latitude or equivalent laptops, Core i7, 16GB RAM, 512GB SSD, Windows 11 Pro for Johannesburg offices.',
    category: 'it_equipment',
    type: 'rfq',
    status: 'evaluation',
    current_stage: 'assess',
    budget: 1_200_000,
    estimated_value: 1_150_000,
    currency: 'ZAR',
    delivery_location: 'Johannesburg CBD',
    delivery_province: 'GP',
    required_by: '2025-03-15',
    bbbee_requirement: 'level_1_4',
    min_quotes: 3,
    organisation_id: 'org1',
    created_by: 'u1',
    assigned_to: 'u1',
    approval_chain: [
      { step: 1, role: 'procurement_officer', role_label: 'Procurement Officer', status: 'approved', approved_by: 'u1', approved_by_name: 'Thabo Mokoena', actioned_at: '2025-01-20T10:00:00Z' },
      { step: 2, role: 'manager',             role_label: 'Procurement Manager', status: 'pending' },
      { step: 3, role: 'cfo',                 role_label: 'CFO',                 status: 'pending' },
      { step: 4, role: 'legal',               role_label: 'Legal',               status: 'pending' },
    ],
    created_at: '2025-01-15T09:00:00Z',
    updated_at: '2025-01-22T14:30:00Z',
  },
  {
    id: 'p2',
    reference: 'RFQ/PT/2025/047',
    title: 'Office Furniture — Sandton HQ',
    description: 'Supply and delivery of ergonomic office furniture for 80 workstations at Sandton headquarters.',
    category: 'office_supplies',
    type: 'rfq',
    status: 'awarded',
    current_stage: 'contract',
    budget: 340_000,
    estimated_value: 315_000,
    currency: 'ZAR',
    delivery_location: 'Sandton, Johannesburg',
    delivery_province: 'GP',
    required_by: '2025-02-28',
    bbbee_requirement: 'level_1_4',
    min_quotes: 3,
    organisation_id: 'org1',
    created_by: 'u1',
    assigned_to: 'u1',
    approval_chain: [
      { step: 1, role: 'procurement_officer', role_label: 'Procurement Officer', status: 'approved', approved_by: 'u1', approved_by_name: 'Thabo Mokoena', actioned_at: '2025-01-10T10:00:00Z' },
      { step: 2, role: 'manager',             role_label: 'Procurement Manager', status: 'approved', approved_by: 'u2', approved_by_name: 'Naledi Dlamini', actioned_at: '2025-01-12T11:00:00Z' },
      { step: 3, role: 'cfo',                 role_label: 'CFO',                 status: 'approved', approved_by: 'u3', approved_by_name: 'Sipho Khumalo',  actioned_at: '2025-01-13T09:00:00Z' },
      { step: 4, role: 'legal',               role_label: 'Legal',               status: 'approved', approved_by: 'u5', approved_by_name: 'Zanele Motha',   actioned_at: '2025-01-14T14:00:00Z' },
    ],
    created_at: '2025-01-05T09:00:00Z',
    updated_at: '2025-01-14T15:00:00Z',
  },
  {
    id: 'p3',
    reference: 'TDR/PT/2025/049',
    title: 'Construction — Concrete Supply (200 tons)',
    description: 'Supply and delivery of 200 tons of 32MPa ready-mix concrete for the Durban warehouse expansion project.',
    category: 'construction',
    type: 'rfq',
    status: 'rfq_sent',
    current_stage: 'source',
    budget: 890_000,
    currency: 'ZAR',
    delivery_location: 'Durban, KwaZulu-Natal',
    delivery_province: 'KZN',
    required_by: '2025-04-01',
    bbbee_requirement: 'level_1_6',
    min_quotes: 3,
    organisation_id: 'org1',
    created_by: 'u1',
    assigned_to: 'u1',
    approval_chain: [
      { step: 1, role: 'procurement_officer', role_label: 'Procurement Officer', status: 'approved', approved_by: 'u1', approved_by_name: 'Thabo Mokoena', actioned_at: '2025-01-18T10:00:00Z' },
      { step: 2, role: 'manager',             role_label: 'Procurement Manager', status: 'pending' },
      { step: 3, role: 'cfo',                 role_label: 'CFO',                 status: 'pending' },
      { step: 4, role: 'legal',               role_label: 'Legal',               status: 'pending' },
    ],
    created_at: '2025-01-16T09:00:00Z',
    updated_at: '2025-01-20T11:00:00Z',
  },
  {
    id: 'p4',
    reference: 'RFQ/PT/2025/046',
    title: 'Security Services — 24/7 Sandton Complex',
    description: 'Provision of 3 armed security officers for 24/7 coverage at Sandton office complex. PSIRA-registered guards, Grade C minimum.',
    category: 'security',
    type: 'rfq',
    status: 'awarded',
    current_stage: 'deliver_review',
    budget: 560_000,
    estimated_value: 540_000,
    currency: 'ZAR',
    delivery_location: 'Sandton, Johannesburg',
    delivery_province: 'GP',
    required_by: '2025-02-01',
    bbbee_requirement: 'level_1_4',
    min_quotes: 3,
    organisation_id: 'org1',
    created_by: 'u1',
    assigned_to: 'u1',
    approval_chain: [
      { step: 1, role: 'procurement_officer', role_label: 'Procurement Officer', status: 'approved', approved_by: 'u1', approved_by_name: 'Thabo Mokoena', actioned_at: '2024-12-20T10:00:00Z' },
      { step: 2, role: 'manager',             role_label: 'Procurement Manager', status: 'approved', approved_by: 'u2', approved_by_name: 'Naledi Dlamini', actioned_at: '2024-12-22T11:00:00Z' },
      { step: 3, role: 'cfo',                 role_label: 'CFO',                 status: 'approved', approved_by: 'u3', approved_by_name: 'Sipho Khumalo',  actioned_at: '2024-12-23T09:00:00Z' },
      { step: 4, role: 'legal',               role_label: 'Legal',               status: 'approved', approved_by: 'u5', approved_by_name: 'Zanele Motha',   actioned_at: '2024-12-24T14:00:00Z' },
    ],
    created_at: '2024-12-15T09:00:00Z',
    updated_at: '2025-01-01T08:00:00Z',
  },
  {
    id: 'p5',
    reference: 'RFQ/PT/2025/050',
    title: 'PPE Supplies — Health & Safety',
    description: 'Emergency procurement of PPE: 500 hard hats, 1000 safety vests, 2000 pairs safety gloves.',
    category: 'healthcare',
    type: 'rfq',
    status: 'needs_identified',
    current_stage: 'identify_need',
    budget: 120_000,
    currency: 'ZAR',
    delivery_location: 'Cape Town',
    delivery_province: 'WC',
    required_by: '2025-02-15',
    bbbee_requirement: 'level_1_6',
    min_quotes: 3,
    organisation_id: 'org1',
    created_by: 'u1',
    assigned_to: 'u1',
    approval_chain: [
      { step: 1, role: 'procurement_officer', role_label: 'Procurement Officer', status: 'pending' },
      { step: 2, role: 'manager',             role_label: 'Procurement Manager', status: 'pending' },
      { step: 3, role: 'cfo',                 role_label: 'CFO',                 status: 'pending' },
      { step: 4, role: 'legal',               role_label: 'Legal',               status: 'pending' },
    ],
    created_at: '2025-01-22T09:00:00Z',
    updated_at: '2025-01-22T09:00:00Z',
  },
];

// ─── Demo Suppliers ───────────────────────────────────────────────────────────
export const DEMO_SUPPLIERS: Supplier[] = [
  {
    id: 's1', company_name: 'Mecer IT Solutions (Pty) Ltd', trading_name: 'Mecer IT',
    cipc_number: '2015/234567/07', vat_number: '4870234567',
    contact_name: 'Johan van Wyk', contact_email: 'johan@mecer.co.za', contact_phone: '011 234 5678',
    physical_address: '14 Electron Ave, Randburg, Johannesburg', province: 'GP',
    bbbee_level: 1, bbbee_classification: 'qse', bbbee_expiry: '2025-12-31', bbbee_agency: 'Verified Ratings',
    categories: ['it_equipment'], provinces_covered: ['GP', 'WC', 'KZN'],
    years_in_operation: 12, annual_turnover_band: '10m_50m', max_contract_value: 5_000_000,
    references: [
      { company_name: 'Standard Bank SA', contact_name: 'IT Procurement', contact_email: 'it@standardbank.co.za', contact_phone: '011 636 9111', contract_value: 2_500_000, year: 2024 },
      { company_name: 'MTN South Africa',  contact_name: 'Supply Chain',  contact_email: 'sc@mtn.com',           contact_phone: '083 123 4567', contract_value: 1_800_000, year: 2023 },
      { company_name: 'Sasol Ltd',         contact_name: 'IT Manager',    contact_email: 'it@sasol.com',         contact_phone: '011 441 3111', contract_value: 900_000,   year: 2024 },
    ],
    status: 'approved',
    grade: { total: 94, bbbee_score: 20, tax_compliance_score: 20, cipc_score: 15, document_score: 15, financial_score: 9, reference_score: 10, certification_score: 5, performance_score: 0, grade: 'A' },
    documents: [],
    total_orders: 12, response_rate: 98, on_time_delivery_rate: 96, quality_rating: 4.8,
    organisation_id: 'org1', created_at: '2024-06-01T08:00:00Z', updated_at: '2025-01-01T08:00:00Z',
  },
  {
    id: 's2', company_name: 'TechPro Distributors (Pty) Ltd', cipc_number: '2018/456789/07',
    vat_number: '4780456789',
    contact_name: 'Sarah Botha', contact_email: 'sarah@techpro.co.za', contact_phone: '021 987 6543',
    physical_address: '5 Century Way, Century City, Cape Town', province: 'WC',
    bbbee_level: 3, bbbee_classification: 'qse', bbbee_expiry: '2025-08-31', bbbee_agency: 'EmpowerBEE',
    categories: ['it_equipment', 'office_supplies'], provinces_covered: ['WC', 'EC'],
    years_in_operation: 7, annual_turnover_band: '10m_50m',
    references: [
      { company_name: 'City of Cape Town', contact_name: 'Procurement', contact_email: 'proc@capetown.gov.za', contact_phone: '021 400 1234', contract_value: 1_200_000, year: 2023 },
      { company_name: 'Woolworths SA',     contact_name: 'IT Dept',     contact_email: 'it@woolworths.co.za',  contact_phone: '021 407 9111', contract_value: 650_000,   year: 2024 },
      { company_name: 'UCT',              contact_name: 'Procurement',  contact_email: 'proc@uct.ac.za',       contact_phone: '021 650 3101', contract_value: 400_000,   year: 2023 },
    ],
    status: 'approved',
    grade: { total: 76, bbbee_score: 14, tax_compliance_score: 20, cipc_score: 15, document_score: 13, financial_score: 8, reference_score: 6, certification_score: 0, performance_score: 0, grade: 'B' },
    documents: [],
    total_orders: 7, response_rate: 85, on_time_delivery_rate: 81, quality_rating: 4.1,
    organisation_id: 'org1', created_at: '2024-07-01T08:00:00Z', updated_at: '2025-01-01T08:00:00Z',
  },
  {
    id: 's3', company_name: 'AfriTech Supply Co (Pty) Ltd', cipc_number: '2012/123456/07',
    vat_number: '4560123456',
    contact_name: 'Mpho Sithole', contact_email: 'mpho@afritech.co.za', contact_phone: '012 345 6789',
    physical_address: '88 Pretorius St, Hatfield, Pretoria', province: 'GP',
    bbbee_level: 2, bbbee_classification: 'qse', bbbee_expiry: '2025-10-31', bbbee_agency: 'AQRate',
    categories: ['it_equipment'], provinces_covered: ['GP', 'NW', 'MP'],
    years_in_operation: 13, annual_turnover_band: '10m_50m',
    references: [
      { company_name: 'Nedbank Ltd',    contact_name: 'IT Procurement', contact_email: 'it@nedbank.co.za',   contact_phone: '010 249 1111', contract_value: 3_200_000, year: 2024 },
      { company_name: 'CSIR',          contact_name: 'Supply Chain',   contact_email: 'sc@csir.co.za',       contact_phone: '012 841 2911', contract_value: 1_500_000, year: 2023 },
      { company_name: 'Absa Bank',     contact_name: 'Procurement',    contact_email: 'proc@absa.africa',    contact_phone: '011 350 4000', contract_value: 2_100_000, year: 2024 },
    ],
    status: 'approved',
    grade: { total: 88, bbbee_score: 18, tax_compliance_score: 20, cipc_score: 15, document_score: 14, financial_score: 9, reference_score: 8, certification_score: 4, performance_score: 0, grade: 'A' },
    documents: [],
    total_orders: 21, response_rate: 92, on_time_delivery_rate: 90, quality_rating: 4.5,
    organisation_id: 'org1', created_at: '2024-05-01T08:00:00Z', updated_at: '2025-01-01T08:00:00Z',
  },
  {
    id: 's4', company_name: 'BuildRight Materials (Pty) Ltd', cipc_number: '2010/789012/07',
    vat_number: '4120789012',
    contact_name: 'Dumisani Nzama', contact_email: 'dumisani@buildright.co.za', contact_phone: '031 456 7890',
    physical_address: '22 Brickfield Rd, Durban North', province: 'KZN',
    bbbee_level: 1, bbbee_classification: 'generic', bbbee_expiry: '2025-11-30', bbbee_agency: 'SANAS-accredited',
    categories: ['construction'], provinces_covered: ['KZN', 'EC', 'MP'],
    years_in_operation: 15, annual_turnover_band: '50m_100m',
    references: [
      { company_name: 'eThekwini Municipality', contact_name: 'Infrastructure', contact_email: 'infra@ethekwini.gov.za', contact_phone: '031 311 1111', contract_value: 12_000_000, year: 2024 },
      { company_name: 'Transnet',               contact_name: 'Supply Chain',  contact_email: 'sc@transnet.net',         contact_phone: '011 308 3000', contract_value: 8_500_000,  year: 2023 },
      { company_name: 'SANRAL',                 contact_name: 'Procurement',   contact_email: 'proc@sanral.co.za',       contact_phone: '012 844 8000', contract_value: 5_200_000,  year: 2024 },
    ],
    status: 'approved',
    grade: { total: 96, bbbee_score: 20, tax_compliance_score: 20, cipc_score: 15, document_score: 15, financial_score: 10, reference_score: 10, certification_score: 6, performance_score: 0, grade: 'A' },
    documents: [],
    total_orders: 34, response_rate: 96, on_time_delivery_rate: 94, quality_rating: 4.7,
    organisation_id: 'org1', created_at: '2024-04-01T08:00:00Z', updated_at: '2025-01-01T08:00:00Z',
  },
  {
    id: 's5', company_name: 'Ndalo Security Services (Pty) Ltd', cipc_number: '2016/345678/07',
    vat_number: '4890345678',
    contact_name: 'Ndalo Mthembu', contact_email: 'ndalo@ndalosecurity.co.za', contact_phone: '011 567 8901',
    physical_address: '45 Protea Rd, Soweto, Johannesburg', province: 'GP',
    bbbee_level: 2, bbbee_classification: 'qse', bbbee_expiry: '2025-09-30', bbbee_agency: 'AQRate',
    categories: ['security', 'facilities'], provinces_covered: ['GP', 'NW'],
    years_in_operation: 9, annual_turnover_band: '10m_50m',
    references: [
      { company_name: 'Discovery Ltd',   contact_name: 'Facilities',   contact_email: 'facilities@discovery.co.za', contact_phone: '011 529 2888', contract_value: 1_800_000, year: 2024 },
      { company_name: 'Pick n Pay',      contact_name: 'Operations',   contact_email: 'ops@pnp.co.za',              contact_phone: '021 658 1000', contract_value: 950_000,   year: 2023 },
      { company_name: 'Old Mutual Ltd',  contact_name: 'Procurement',  contact_email: 'proc@oldmutual.com',         contact_phone: '021 509 9111', contract_value: 1_200_000, year: 2024 },
    ],
    status: 'approved',
    grade: { total: 91, bbbee_score: 18, tax_compliance_score: 20, cipc_score: 15, document_score: 14, financial_score: 9, reference_score: 10, certification_score: 5, performance_score: 0, grade: 'A' },
    documents: [],
    total_orders: 8, response_rate: 100, on_time_delivery_rate: 100, quality_rating: 4.9,
    organisation_id: 'org1', created_at: '2024-08-01T08:00:00Z', updated_at: '2025-01-01T08:00:00Z',
  },
  {
    id: 's6', company_name: 'GlobalTech SA (Pty) Ltd', cipc_number: '2020/901234/07',
    contact_name: 'Greg Smith', contact_email: 'greg@globaltech.co.za', contact_phone: '011 678 9012',
    physical_address: '12 Rivonia Rd, Sandton', province: 'GP',
    bbbee_level: 7, bbbee_classification: 'generic',
    categories: ['it_equipment'], provinces_covered: ['GP'],
    years_in_operation: 5, annual_turnover_band: '1m_10m',
    references: [
      { company_name: 'Small Firm A', contact_name: 'Owner', contact_email: 'info@smalla.co.za', contact_phone: '011 000 0001', year: 2023 },
    ],
    status: 'conditional',
    grade: { total: 38, bbbee_score: 4, tax_compliance_score: 10, cipc_score: 15, document_score: 6, financial_score: 3, reference_score: 0, certification_score: 0, performance_score: 0, grade: 'F' },
    documents: [],
    total_orders: 3, response_rate: 71, on_time_delivery_rate: 60, quality_rating: 3.2,
    organisation_id: 'org1', created_at: '2024-10-01T08:00:00Z', updated_at: '2025-01-01T08:00:00Z',
  },
];

// ─── Demo Bids ────────────────────────────────────────────────────────────────
export const DEMO_BIDS: Bid[] = [
  {
    id: 'b1', procurement_id: 'p1', supplier_id: 's1', supplier_name: 'Mecer IT Solutions',
    unit_price: 2_280, total_price: 1_140_000, delivery_days: 14, warranty_months: 36,
    technical_compliance: 98,
    notes: 'Units pre-configured with Windows 11 Pro. On-site warranty included. Asset tagging service included at no extra cost.',
    documents: [], submitted_at: '2025-01-20T09:00:00Z',
    ai_score: {
      total: 92, price_score: 38, bbbee_score: 20, delivery_score: 18, technical_score: 16,
      price_weight: 40, bbbee_weight: 20, delivery_weight: 20, technical_weight: 20,
      strengths: ['Best BBBEE Level 1 status', 'Competitive pricing R60k below budget', '36-month on-site warranty', 'Fast 14-day delivery', 'Includes asset tagging'],
      weaknesses: ['Slightly higher unit price than GlobalTech (not accounting for compliance)'],
      risks: [],
      compliance_gaps: [],
      ai_narrative: 'Mecer IT Solutions presents the strongest overall bid. Their BBBEE Level 1 status maximises the preferential procurement score, and their 36-month on-site warranty significantly reduces total cost of ownership. The 14-day delivery timeline is well within the required schedule.',
    },
    recommendation: 'recommended',
  },
  {
    id: 'b2', procurement_id: 'p1', supplier_id: 's2', supplier_name: 'TechPro Distributors',
    unit_price: 2_450, total_price: 1_225_000, delivery_days: 21, warranty_months: 24,
    technical_compliance: 85,
    notes: '2-year on-site warranty. Delivery from Cape Town warehouse.',
    documents: [], submitted_at: '2025-01-19T14:00:00Z',
    ai_score: {
      total: 71, price_score: 28, bbbee_score: 14, delivery_score: 15, technical_score: 14,
      price_weight: 40, bbbee_weight: 20, delivery_weight: 20, technical_weight: 20,
      strengths: ['VAT registered and SARS compliant', 'Established company 7 years'],
      weaknesses: ['Highest unit price in the bid', 'Level 3 BBBEE — below preferred Level 1–2', '21-day delivery is slowest', '2-year warranty vs 3-year from competitors'],
      risks: ['Price exceeds budget if awarded'],
      compliance_gaps: [],
      ai_narrative: 'TechPro Distributors is compliant but not competitive on this bid. Their Level 3 BBBEE status reduces the preferential score, and their pricing exceeds the available budget.',
    },
    recommendation: 'second',
  },
  {
    id: 'b3', procurement_id: 'p1', supplier_id: 's6', supplier_name: 'GlobalTech SA',
    unit_price: 2_190, total_price: 1_095_000, delivery_days: 35, warranty_months: 12,
    technical_compliance: 70,
    notes: '1-year collect warranty. Units may ship from China — allow 5 weeks.',
    documents: [], submitted_at: '2025-01-21T11:00:00Z',
    ai_score: {
      total: 54, price_score: 40, bbbee_score: 4, delivery_score: 4, technical_score: 6,
      price_weight: 40, bbbee_weight: 20, delivery_weight: 20, technical_weight: 20,
      strengths: ['Lowest unit price'],
      weaknesses: ['Level 7 BBBEE — fails minimum requirement', 'VAT not verified', '35-day delivery too slow', '1-year collect warranty is inadequate', 'Unverified origin of units'],
      risks: ['VAT fraud risk', 'Counterfeit or grey-market units', 'Supply chain unreliability'],
      compliance_gaps: ['BBBEE Level 7 does not meet RFQ minimum of Level 1–4', 'VAT registration unverified — cannot issue compliant tax invoice'],
      ai_narrative: 'GlobalTech SA is excluded from consideration due to critical compliance failures: unverified VAT registration and a BBBEE Level 7 rating that does not meet the minimum requirement specified in the RFQ. Their lower price does not compensate for these disqualifying factors.',
    },
    recommendation: 'not_recommended',
  },
];

// ─── Demo Audit Events ────────────────────────────────────────────────────────
export const DEMO_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'ae1', procurement_id: 'p1', event_type: 'procurement_created',
    event_label: 'Procurement Created',
    actor_id: 'u1', actor_name: 'Thabo Mokoena', actor_role: 'procurement_officer',
    description: 'New procurement RFQ/PT/2025/048 created for 500× Laptop Computers.',
    prev_hash: '0000000000000000000000000000000000000000000000000000000000000000',
    block_hash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    block_index: 0, timestamp: '2025-01-15T09:00:00Z',
  },
  {
    id: 'ae2', procurement_id: 'p1', event_type: 'sow_generated',
    event_label: 'Scope of Work Generated',
    actor_id: 'u1', actor_name: 'Thabo Mokoena', actor_role: 'procurement_officer',
    description: 'AI generated Scope of Work for laptop procurement. Reviewed and approved by Thabo Mokoena.',
    prev_hash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    block_hash: 'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
    block_index: 1, timestamp: '2025-01-15T10:30:00Z',
  },
  {
    id: 'ae3', procurement_id: 'p1', event_type: 'rfq_generated',
    event_label: 'RFQ Document Generated',
    actor_id: 'u1', actor_name: 'Thabo Mokoena', actor_role: 'procurement_officer',
    description: 'AI generated RFQ document RFQ/PT/2025/048. Evaluation criteria: Price 40%, BBBEE 20%, Delivery 20%, Technical 20%.',
    prev_hash: 'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
    block_hash: 'e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6',
    block_index: 2, timestamp: '2025-01-15T11:00:00Z',
  },
  {
    id: 'ae4', procurement_id: 'p1', event_type: 'rfq_sent',
    event_label: 'RFQ Sent to Suppliers',
    actor_id: 'u1', actor_name: 'Thabo Mokoena', actor_role: 'procurement_officer',
    description: 'RFQ sent to 3 suppliers: Mecer IT Solutions, TechPro Distributors, GlobalTech SA. Closing date: 21 January 2025.',
    prev_hash: 'e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6',
    block_hash: 'f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1',
    block_index: 3, timestamp: '2025-01-15T12:00:00Z',
  },
  {
    id: 'ae5', procurement_id: 'p1', event_type: 'bid_received',
    event_label: 'Bid Received — TechPro Distributors',
    actor_id: 'u1', actor_name: 'System', actor_role: 'procurement_officer',
    description: 'Bid received from TechPro Distributors. Total value: R1,225,000.',
    prev_hash: 'f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1',
    block_hash: '1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3',
    block_index: 4, timestamp: '2025-01-19T14:00:00Z',
  },
  {
    id: 'ae6', procurement_id: 'p1', event_type: 'evaluation_run',
    event_label: 'AI Evaluation Completed',
    actor_id: 'u1', actor_name: 'ProcureTech+ AI', actor_role: 'procurement_officer',
    description: 'AI evaluated 3 bids. Scores: Mecer 92/100 (Recommended), TechPro 71/100, GlobalTech 54/100 (Excluded — compliance failure).',
    prev_hash: '1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3',
    block_hash: '2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
    block_index: 5, timestamp: '2025-01-22T09:00:00Z',
  },
];

// ─── Demo Lessons Learned ─────────────────────────────────────────────────────
export const DEMO_LESSONS: LessonLearned[] = [
  {
    id: 'l1', procurement_id: 'p4', procurement_title: 'Security Services — Sandton Complex',
    category: 'security',
    what_went_well: 'Clear SOW reduced ambiguity. PSIRA licence verification upfront eliminated non-compliant suppliers early. Evaluation was fast and transparent.',
    what_could_improve: 'Should have required proof of labour compliance (MEIBC) upfront. Two suppliers submitted late due to unclear submission instructions.',
    recommendations: 'Add labour compliance documents to standard security RFQ checklist. Extend submission window by 3 days for service-type procurements.',
    recorded_by: 'Thabo Mokoena', created_at: '2025-01-10T09:00:00Z',
  },
  {
    id: 'l2', procurement_id: 'p2', procurement_title: 'Office Furniture — Sandton HQ',
    category: 'office_supplies',
    what_went_well: 'Market benchmarking identified 15% price anomaly in first quote received, which was flagged and the supplier was asked to revise.',
    what_could_improve: 'Delivery address was unclear — caused delays on delivery day. Always include floor number, loading bay instructions.',
    recommendations: 'Create a standard delivery instruction template with building access info, loading times, contact person on-site.',
    recorded_by: 'Thabo Mokoena', created_at: '2025-01-15T10:00:00Z',
  },
];

// ─── localStorage store ───────────────────────────────────────────────────────

const KEY = 'procuretech_demo_v1';

interface Store {
  procurements: Procurement[];
  suppliers: Supplier[];
  bids: Bid[];
  auditEvents: AuditEvent[];
  lessons: LessonLearned[];
  currentUser: User | null;
}

function defaultStore(): Store {
  return {
    procurements: DEMO_PROCUREMENTS,
    suppliers: DEMO_SUPPLIERS,
    bids: DEMO_BIDS,
    auditEvents: DEMO_AUDIT_EVENTS,
    lessons: DEMO_LESSONS,
    currentUser: null,
  };
}

export function getStore(): Store {
  if (typeof window === 'undefined') return defaultStore();
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : defaultStore();
  } catch {
    return defaultStore();
  }
}

export function setStore(store: Store) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(store));
}

export function updateStore(partial: Partial<Store>) {
  const store = getStore();
  setStore({ ...store, ...partial });
}

export function resetStore() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}
