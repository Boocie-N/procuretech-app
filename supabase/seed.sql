-- ============================================================
-- ProcureTech+ Seed Data
-- Run this in Supabase SQL Editor AFTER schema.sql
-- ============================================================

-- ── Organisation ──────────────────────────────────────────
insert into organisations (id, name, reg_number, vat_number, address, province, currency, region)
values (
  'a0000000-0000-0000-0000-000000000001',
  'ProcureTech+ Demo Org',
  '2020/123456/07',
  '4890123456',
  '1 Maude Street, Sandton, Johannesburg',
  'GP',
  'ZAR',
  'ZA'
) on conflict (id) do nothing;

-- ── Users ─────────────────────────────────────────────────
-- NOTE: These are profile records only.
-- Real auth users are created via Supabase Auth (Settings > Authentication).
-- Insert these with placeholder UUIDs matching your auth users,
-- or use the demo IDs below for local/demo purposes.

insert into users (id, email, full_name, role, organisation_id, created_at) values
  ('u1000000-0000-0000-0000-000000000001', 'thabo@procuretech.co.za',  'Thabo Mokoena',  'procurement_officer', 'a0000000-0000-0000-0000-000000000001', '2025-03-10T08:00:00Z'),
  ('u1000000-0000-0000-0000-000000000002', 'naledi@procuretech.co.za', 'Naledi Dlamini', 'manager',             'a0000000-0000-0000-0000-000000000001', '2025-02-14T08:00:00Z'),
  ('u1000000-0000-0000-0000-000000000003', 'sipho@procuretech.co.za',  'Sipho Khumalo',  'cfo',                 'a0000000-0000-0000-0000-000000000001', '2025-01-20T08:00:00Z'),
  ('u1000000-0000-0000-0000-000000000004', 'admin@procuretech.co.za',  'Admin User',     'admin',               'a0000000-0000-0000-0000-000000000001', '2025-01-05T08:00:00Z'),
  ('u1000000-0000-0000-0000-000000000005', 'legal@procuretech.co.za',  'Zanele Motha',   'legal',               'a0000000-0000-0000-0000-000000000001', '2025-04-01T08:00:00Z'),
  ('u1000000-0000-0000-0000-000000000006', 'supplier@mecer.co.za',     'Johan van Wyk',  'supplier',            'a0000000-0000-0000-0000-000000000001', '2026-01-08T08:00:00Z')
on conflict (id) do nothing;

-- ── Suppliers ─────────────────────────────────────────────
insert into suppliers (
  id, organisation_id, company_name, trading_name, cipc_number, vat_number,
  contact_name, contact_email, contact_phone, physical_address, province,
  bbbee_level, bbbee_classification, bbbee_expiry, bbbee_agency,
  categories, provinces_covered, years_in_operation, annual_turnover_band, max_contract_value,
  client_references, status, grade_total, grade_letter, grade_breakdown,
  total_orders, response_rate, on_time_delivery_rate, quality_rating,
  created_at, updated_at
) values
(
  's1000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Mecer IT Solutions (Pty) Ltd', 'Mecer IT',
  '2015/234567/07', '4870234567',
  'Johan van Wyk', 'johan@mecer.co.za', '011 234 5678',
  '14 Electron Ave, Randburg, Johannesburg', 'GP',
  1, 'qse', '2025-12-31', 'Verified Ratings',
  ARRAY['it_equipment'], ARRAY['GP','WC','KZN'],
  12, '10m_50m', 5000000,
  '[{"company_name":"Standard Bank SA","contact_name":"IT Procurement","contact_email":"it@standardbank.co.za","contact_phone":"011 636 9111","contract_value":2500000,"year":2024},{"company_name":"MTN South Africa","contact_name":"Supply Chain","contact_email":"sc@mtn.com","contact_phone":"083 123 4567","contract_value":1800000,"year":2023},{"company_name":"Sasol Ltd","contact_name":"IT Manager","contact_email":"it@sasol.com","contact_phone":"011 441 3111","contract_value":900000,"year":2024}]',
  'approved', 94, 'A',
  '{"total":94,"bbbee_score":20,"tax_compliance_score":20,"cipc_score":15,"document_score":15,"financial_score":9,"reference_score":10,"certification_score":5,"performance_score":0}',
  12, 98, 96, 4.8,
  '2024-06-01T08:00:00Z', '2025-01-01T08:00:00Z'
),
(
  's1000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000001',
  'TechPro Distributors (Pty) Ltd', null,
  '2018/456789/07', '4780456789',
  'Sarah Botha', 'sarah@techpro.co.za', '021 987 6543',
  '5 Century Way, Century City, Cape Town', 'WC',
  3, 'qse', '2025-08-31', 'EmpowerBEE',
  ARRAY['it_equipment','office_supplies'], ARRAY['WC','EC'],
  7, '10m_50m', null,
  '[{"company_name":"City of Cape Town","contact_name":"Procurement","contact_email":"proc@capetown.gov.za","contact_phone":"021 400 1234","contract_value":1200000,"year":2023},{"company_name":"Woolworths SA","contact_name":"IT Dept","contact_email":"it@woolworths.co.za","contact_phone":"021 407 9111","contract_value":650000,"year":2024}]',
  'approved', 76, 'B',
  '{"total":76,"bbbee_score":14,"tax_compliance_score":20,"cipc_score":15,"document_score":13,"financial_score":8,"reference_score":6,"certification_score":0,"performance_score":0}',
  7, 85, 81, 4.1,
  '2024-07-01T08:00:00Z', '2025-01-01T08:00:00Z'
),
(
  's1000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000001',
  'AfriTech Supply Co (Pty) Ltd', null,
  '2012/123456/07', '4560123456',
  'Mpho Sithole', 'mpho@afritech.co.za', '012 345 6789',
  '88 Pretorius St, Hatfield, Pretoria', 'GP',
  2, 'qse', '2025-10-31', 'AQRate',
  ARRAY['it_equipment'], ARRAY['GP','NW','MP'],
  13, '10m_50m', null,
  '[{"company_name":"Nedbank Ltd","contact_name":"IT Procurement","contact_email":"it@nedbank.co.za","contact_phone":"010 249 1111","contract_value":3200000,"year":2024},{"company_name":"CSIR","contact_name":"Supply Chain","contact_email":"sc@csir.co.za","contact_phone":"012 841 2911","contract_value":1500000,"year":2023}]',
  'approved', 88, 'A',
  '{"total":88,"bbbee_score":18,"tax_compliance_score":20,"cipc_score":15,"document_score":14,"financial_score":9,"reference_score":8,"certification_score":4,"performance_score":0}',
  21, 92, 90, 4.5,
  '2024-05-01T08:00:00Z', '2025-01-01T08:00:00Z'
),
(
  's1000000-0000-0000-0000-000000000004',
  'a0000000-0000-0000-0000-000000000001',
  'BuildRight Materials (Pty) Ltd', null,
  '2010/789012/07', '4120789012',
  'Dumisani Nzama', 'dumisani@buildright.co.za', '031 456 7890',
  '22 Brickfield Rd, Durban North', 'KZN',
  1, 'generic', '2025-11-30', 'SANAS-accredited',
  ARRAY['construction'], ARRAY['KZN','EC','MP'],
  15, '50m_100m', null,
  '[{"company_name":"eThekwini Municipality","contact_name":"Infrastructure","contact_email":"infra@ethekwini.gov.za","contact_phone":"031 311 1111","contract_value":12000000,"year":2024},{"company_name":"Transnet","contact_name":"Supply Chain","contact_email":"sc@transnet.net","contact_phone":"011 308 3000","contract_value":8500000,"year":2023}]',
  'approved', 96, 'A',
  '{"total":96,"bbbee_score":20,"tax_compliance_score":20,"cipc_score":15,"document_score":15,"financial_score":10,"reference_score":10,"certification_score":6,"performance_score":0}',
  34, 96, 94, 4.7,
  '2024-04-01T08:00:00Z', '2025-01-01T08:00:00Z'
),
(
  's1000000-0000-0000-0000-000000000005',
  'a0000000-0000-0000-0000-000000000001',
  'Ndalo Security Services (Pty) Ltd', null,
  '2016/345678/07', '4890345678',
  'Ndalo Mthembu', 'ndalo@ndalosecurity.co.za', '011 567 8901',
  '45 Protea Rd, Soweto, Johannesburg', 'GP',
  2, 'qse', '2025-09-30', 'AQRate',
  ARRAY['security','facilities'], ARRAY['GP','NW'],
  9, '10m_50m', null,
  '[{"company_name":"Discovery Ltd","contact_name":"Facilities","contact_email":"facilities@discovery.co.za","contact_phone":"011 529 2888","contract_value":1800000,"year":2024},{"company_name":"Pick n Pay","contact_name":"Operations","contact_email":"ops@pnp.co.za","contact_phone":"021 658 1000","contract_value":950000,"year":2023}]',
  'approved', 91, 'A',
  '{"total":91,"bbbee_score":18,"tax_compliance_score":20,"cipc_score":15,"document_score":14,"financial_score":9,"reference_score":10,"certification_score":5,"performance_score":0}',
  8, 100, 100, 4.9,
  '2024-08-01T08:00:00Z', '2025-01-01T08:00:00Z'
),
(
  's1000000-0000-0000-0000-000000000006',
  'a0000000-0000-0000-0000-000000000001',
  'GlobalTech SA (Pty) Ltd', null,
  '2020/901234/07', null,
  'Greg Smith', 'greg@globaltech.co.za', '011 678 9012',
  '12 Rivonia Rd, Sandton', 'GP',
  7, 'generic', null, null,
  ARRAY['it_equipment'], ARRAY['GP'],
  5, '1m_10m', null,
  '[{"company_name":"Small Firm A","contact_name":"Owner","contact_email":"info@smalla.co.za","contact_phone":"011 000 0001","year":2023}]',
  'conditional', 38, 'F',
  '{"total":38,"bbbee_score":4,"tax_compliance_score":10,"cipc_score":15,"document_score":6,"financial_score":3,"reference_score":0,"certification_score":0,"performance_score":0}',
  3, 71, 60, 3.2,
  '2024-10-01T08:00:00Z', '2025-01-01T08:00:00Z'
)
on conflict (id) do nothing;

-- ── Procurements ──────────────────────────────────────────
insert into procurements (
  id, organisation_id, reference, title, description, category, type,
  status, current_stage, budget, estimated_value, currency,
  delivery_location, delivery_province, required_by, bbbee_requirement,
  min_quotes, created_by, assigned_to, approval_chain, created_at, updated_at
) values
(
  'p1000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'RFQ/PT/2025/048', '500× Laptop Computers',
  'Procurement of 500 Dell Latitude or equivalent laptops, Core i7, 16GB RAM, 512GB SSD, Windows 11 Pro for Johannesburg offices.',
  'it_equipment', 'rfq', 'evaluation', 'assess',
  1200000, 1150000, 'ZAR',
  'Johannesburg CBD', 'GP', '2025-03-15', 'level_1_4', 3,
  'u1000000-0000-0000-0000-000000000001',
  'u1000000-0000-0000-0000-000000000001',
  '[{"step":1,"role":"procurement_officer","role_label":"Procurement Officer","status":"approved","approved_by":"u1000000-0000-0000-0000-000000000001","approved_by_name":"Thabo Mokoena","actioned_at":"2025-01-20T10:00:00Z"},{"step":2,"role":"manager","role_label":"Procurement Manager","status":"pending"},{"step":3,"role":"cfo","role_label":"CFO","status":"pending"},{"step":4,"role":"legal","role_label":"Legal","status":"pending"}]',
  '2025-01-15T09:00:00Z', '2025-01-22T14:30:00Z'
),
(
  'p1000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000001',
  'RFQ/PT/2025/047', 'Office Furniture — Sandton HQ',
  'Supply and delivery of ergonomic office furniture for 80 workstations at Sandton headquarters.',
  'office_supplies', 'rfq', 'awarded', 'contract',
  340000, 315000, 'ZAR',
  'Sandton, Johannesburg', 'GP', '2025-02-28', 'level_1_4', 3,
  'u1000000-0000-0000-0000-000000000001',
  'u1000000-0000-0000-0000-000000000001',
  '[{"step":1,"role":"procurement_officer","role_label":"Procurement Officer","status":"approved","approved_by":"u1000000-0000-0000-0000-000000000001","approved_by_name":"Thabo Mokoena","actioned_at":"2025-01-10T10:00:00Z"},{"step":2,"role":"manager","role_label":"Procurement Manager","status":"approved","approved_by":"u1000000-0000-0000-0000-000000000002","approved_by_name":"Naledi Dlamini","actioned_at":"2025-01-12T11:00:00Z"},{"step":3,"role":"cfo","role_label":"CFO","status":"approved","approved_by":"u1000000-0000-0000-0000-000000000003","approved_by_name":"Sipho Khumalo","actioned_at":"2025-01-13T09:00:00Z"},{"step":4,"role":"legal","role_label":"Legal","status":"approved","approved_by":"u1000000-0000-0000-0000-000000000005","approved_by_name":"Zanele Motha","actioned_at":"2025-01-14T14:00:00Z"}]',
  '2025-01-05T09:00:00Z', '2025-01-14T15:00:00Z'
),
(
  'p1000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000001',
  'TDR/PT/2025/049', 'Construction — Concrete Supply (200 tons)',
  'Supply and delivery of 200 tons of 32MPa ready-mix concrete for the Durban warehouse expansion project.',
  'construction', 'rfq', 'rfq_sent', 'source',
  890000, null, 'ZAR',
  'Durban, KwaZulu-Natal', 'KZN', '2025-04-01', 'level_1_6', 3,
  'u1000000-0000-0000-0000-000000000001',
  'u1000000-0000-0000-0000-000000000001',
  '[{"step":1,"role":"procurement_officer","role_label":"Procurement Officer","status":"approved","approved_by":"u1000000-0000-0000-0000-000000000001","approved_by_name":"Thabo Mokoena","actioned_at":"2025-01-18T10:00:00Z"},{"step":2,"role":"manager","role_label":"Procurement Manager","status":"pending"},{"step":3,"role":"cfo","role_label":"CFO","status":"pending"},{"step":4,"role":"legal","role_label":"Legal","status":"pending"}]',
  '2025-01-16T09:00:00Z', '2025-01-20T11:00:00Z'
),
(
  'p1000000-0000-0000-0000-000000000004',
  'a0000000-0000-0000-0000-000000000001',
  'RFQ/PT/2025/046', 'Security Services — 24/7 Sandton Complex',
  'Provision of 3 armed security officers for 24/7 coverage at Sandton office complex. PSIRA-registered guards, Grade C minimum.',
  'security', 'rfq', 'awarded', 'deliver_review',
  560000, 540000, 'ZAR',
  'Sandton, Johannesburg', 'GP', '2025-02-01', 'level_1_4', 3,
  'u1000000-0000-0000-0000-000000000001',
  'u1000000-0000-0000-0000-000000000001',
  '[{"step":1,"role":"procurement_officer","role_label":"Procurement Officer","status":"approved","approved_by":"u1000000-0000-0000-0000-000000000001","approved_by_name":"Thabo Mokoena","actioned_at":"2024-12-20T10:00:00Z"},{"step":2,"role":"manager","role_label":"Procurement Manager","status":"approved","approved_by":"u1000000-0000-0000-0000-000000000002","approved_by_name":"Naledi Dlamini","actioned_at":"2024-12-22T11:00:00Z"},{"step":3,"role":"cfo","role_label":"CFO","status":"approved","approved_by":"u1000000-0000-0000-0000-000000000003","approved_by_name":"Sipho Khumalo","actioned_at":"2024-12-23T09:00:00Z"},{"step":4,"role":"legal","role_label":"Legal","status":"approved","approved_by":"u1000000-0000-0000-0000-000000000005","approved_by_name":"Zanele Motha","actioned_at":"2024-12-24T14:00:00Z"}]',
  '2024-12-15T09:00:00Z', '2025-01-01T08:00:00Z'
),
(
  'p1000000-0000-0000-0000-000000000005',
  'a0000000-0000-0000-0000-000000000001',
  'RFQ/PT/2025/050', 'PPE Supplies — Health & Safety',
  'Emergency procurement of PPE: 500 hard hats, 1000 safety vests, 2000 pairs safety gloves.',
  'healthcare', 'rfq', 'needs_identified', 'identify_need',
  120000, null, 'ZAR',
  'Cape Town', 'WC', '2025-02-15', 'level_1_6', 3,
  'u1000000-0000-0000-0000-000000000001',
  'u1000000-0000-0000-0000-000000000001',
  '[{"step":1,"role":"procurement_officer","role_label":"Procurement Officer","status":"pending"},{"step":2,"role":"manager","role_label":"Procurement Manager","status":"pending"},{"step":3,"role":"cfo","role_label":"CFO","status":"pending"},{"step":4,"role":"legal","role_label":"Legal","status":"pending"}]',
  '2025-01-22T09:00:00Z', '2025-01-22T09:00:00Z'
)
on conflict (id) do nothing;

-- ── Bids ──────────────────────────────────────────────────
insert into bids (
  id, procurement_id, supplier_id, supplier_name,
  unit_price, total_price, delivery_days, warranty_months,
  technical_compliance, notes, submitted_at, ai_score, recommendation
) values
(
  'b1000000-0000-0000-0000-000000000001',
  'p1000000-0000-0000-0000-000000000001',
  's1000000-0000-0000-0000-000000000001',
  'Mecer IT Solutions',
  2280, 1140000, 14, 36, 98,
  'Dell Latitude 5540, Core i7-1365U, 16GB DDR4, 512GB NVMe. All units ICASA certified. 3-year on-site warranty included.',
  '2025-01-20T10:00:00Z',
  '{"total":91,"price_score":36,"bbbee_score":20,"delivery_score":18,"technical_score":17,"strengths":["Best BBBEE Level 1","Strongest technical compliance at 98%","Fastest delivery at 14 days","Comprehensive warranty"],"weaknesses":["Price slightly above median"],"risks":["Supply chain dependency on single OEM"]}',
  'recommended'
),
(
  'b1000000-0000-0000-0000-000000000002',
  'p1000000-0000-0000-0000-000000000001',
  's1000000-0000-0000-0000-000000000003',
  'AfriTech Supply Co',
  2350, 1175000, 21, 24, 91,
  'Lenovo ThinkPad E15, Core i7-1255U, 16GB, 512GB SSD. Good BBBEE Level 2. 2-year warranty.',
  '2025-01-19T14:00:00Z',
  '{"total":78,"price_score":30,"bbbee_score":18,"delivery_score":14,"technical_score":16,"strengths":["BBBEE Level 2","Good technical compliance"],"weaknesses":["Higher price","Longer delivery","Shorter warranty"],"risks":["Less experience with large volume orders"]}',
  'second'
),
(
  'b1000000-0000-0000-0000-000000000003',
  'p1000000-0000-0000-0000-000000000001',
  's1000000-0000-0000-0000-000000000006',
  'GlobalTech SA',
  2150, 1075000, 35, 12, 72,
  'Generic brand laptops, Core i7 equivalent. VAT registration unverified.',
  '2025-01-21T09:00:00Z',
  '{"total":52,"price_score":40,"bbbee_score":4,"delivery_score":8,"technical_score":0,"strengths":["Lowest price"],"weaknesses":["BBBEE Level 7","Unverified VAT","Poor technical compliance","Slowest delivery"],"risks":["VAT compliance risk","BBBEE non-compliant","Unknown brand reliability"]}',
  'not_recommended'
),
(
  'b1000000-0000-0000-0000-000000000004',
  'p1000000-0000-0000-0000-000000000002',
  's1000000-0000-0000-0000-000000000004',
  'BuildRight Materials',
  null, 315000, 10, null, 95,
  'Steelcase Series 1 chairs and Haworth desks. Full installation included. BBBEE Level 1.',
  '2025-01-08T10:00:00Z',
  '{"total":89,"price_score":35,"bbbee_score":20,"delivery_score":17,"technical_score":17,"strengths":["BBBEE Level 1","Fast delivery","Installation included","Strong references"],"weaknesses":[],"risks":[]}',
  'recommended'
),
(
  'b1000000-0000-0000-0000-000000000005',
  'p1000000-0000-0000-0000-000000000004',
  's1000000-0000-0000-0000-000000000005',
  'Ndalo Security Services',
  null, 540000, 7, null, 100,
  'PSIRA-registered Grade C guards. Armed response on call. 24/7 coverage. Public liability R10M.',
  '2024-12-18T10:00:00Z',
  '{"total":96,"price_score":38,"bbbee_score":18,"delivery_score":20,"technical_score":20,"strengths":["100% PSIRA compliant","BBBEE Level 2","Fastest mobilisation","Perfect technical score","Strong local references"],"weaknesses":[],"risks":[]}',
  'recommended'
)
on conflict (id) do nothing;
