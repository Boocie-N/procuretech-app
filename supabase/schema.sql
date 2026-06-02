-- ============================================================
-- ProcureTech+ Database Schema
-- Run this in your Supabase SQL editor (once, in order)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Organisations ──────────────────────────────────────────
create table organisations (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  logo_url      text,
  reg_number    text,
  vat_number    text,
  address       text,
  province      text,
  currency      text default 'ZAR',
  region        text default 'ZA',
  created_at    timestamptz default now()
);

-- ── Users (extends Supabase auth.users) ────────────────────
create table users (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text not null,
  full_name       text not null,
  role            text not null check (role in ('admin','procurement_officer','manager','cfo','legal','supplier')),
  organisation_id uuid references organisations(id),
  avatar_url      text,
  created_at      timestamptz default now()
);

-- Auto-create user profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into users (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'procurement_officer');
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ── Suppliers ──────────────────────────────────────────────
create table suppliers (
  id                    uuid primary key default uuid_generate_v4(),
  organisation_id       uuid references organisations(id),
  company_name          text not null,
  trading_name          text,
  cipc_number           text not null,
  vat_number            text,
  contact_name          text not null,
  contact_email         text not null,
  contact_phone         text not null,
  website               text,
  physical_address      text,
  province              text,
  bbbee_level           int check (bbbee_level between 1 and 8),
  bbbee_classification  text check (bbbee_classification in ('eme','qse','generic')),
  bbbee_expiry          date,
  bbbee_agency          text,
  categories            text[],
  provinces_covered     text[],
  years_in_operation    int,
  annual_turnover_band  text,
  max_contract_value    numeric,
  references            jsonb default '[]',
  status                text default 'pending' check (status in ('pending','approved','conditional','rejected','suspended')),
  grade_total           int,
  grade_letter          text,
  grade_breakdown       jsonb,
  total_orders          int default 0,
  response_rate         numeric default 0,
  on_time_delivery_rate numeric default 0,
  quality_rating        numeric default 0,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now(),
  approved_at           timestamptz,
  approved_by           uuid references users(id)
);

-- ── Supplier Documents ─────────────────────────────────────
create table supplier_documents (
  id          uuid primary key default uuid_generate_v4(),
  supplier_id uuid references suppliers(id) on delete cascade,
  type        text not null,
  file_name   text not null,
  file_url    text not null,
  expiry_date date,
  verified    boolean default false,
  uploaded_at timestamptz default now()
);

-- ── Procurements ───────────────────────────────────────────
create table procurements (
  id                  uuid primary key default uuid_generate_v4(),
  organisation_id     uuid references organisations(id),
  reference           text unique not null,
  title               text not null,
  description         text,
  category            text not null,
  type                text not null check (type in ('rfq','rfp','tender','sole_source','emergency')),
  status              text not null default 'draft',
  current_stage       text not null default 'identify_need',
  budget              numeric not null,
  estimated_value     numeric,
  currency            text default 'ZAR',
  delivery_location   text,
  delivery_province   text,
  required_by         date,
  bbbee_requirement   text,
  min_quotes          int default 3,
  created_by          uuid references users(id),
  assigned_to         uuid references users(id),
  sow                 text,
  rfq_document        text,
  market_analysis     jsonb,
  approval_chain      jsonb default '[]',
  blockchain_hash     text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ── Bids ───────────────────────────────────────────────────
create table bids (
  id                    uuid primary key default uuid_generate_v4(),
  procurement_id        uuid references procurements(id) on delete cascade,
  supplier_id           uuid references suppliers(id),
  supplier_name         text not null,
  unit_price            numeric,
  total_price           numeric not null,
  delivery_days         int,
  warranty_months       int,
  technical_compliance  numeric,
  notes                 text,
  documents             text[],
  submitted_at          timestamptz default now(),
  ai_score              jsonb,
  recommendation        text check (recommendation in ('recommended','second','not_recommended'))
);

-- ── Audit Trail ────────────────────────────────────────────
create table audit_events (
  id              uuid primary key default uuid_generate_v4(),
  procurement_id  uuid references procurements(id),
  event_type      text not null,
  event_label     text not null,
  actor_id        uuid references users(id),
  actor_name      text not null,
  actor_role      text not null,
  description     text not null,
  metadata        jsonb,
  prev_hash       text not null,
  block_hash      text not null,
  block_index     int not null,
  timestamp       timestamptz default now()
);

-- ── Lessons Learned ────────────────────────────────────────
create table lessons_learned (
  id                   uuid primary key default uuid_generate_v4(),
  procurement_id       uuid references procurements(id),
  procurement_title    text,
  category             text,
  what_went_well       text,
  what_could_improve   text,
  recommendations      text,
  recorded_by          text,
  created_at           timestamptz default now()
);

-- ── Document Templates ─────────────────────────────────────
create table document_templates (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  type        text not null,
  description text,
  content     text,
  version     text default '1.0',
  created_at  timestamptz default now()
);

-- ── Row Level Security ─────────────────────────────────────
alter table organisations      enable row level security;
alter table users              enable row level security;
alter table suppliers          enable row level security;
alter table supplier_documents enable row level security;
alter table procurements       enable row level security;
alter table bids               enable row level security;
alter table audit_events       enable row level security;
alter table lessons_learned    enable row level security;

-- Policies (adjust per your auth strategy)
-- For demo: authenticated users can read all in their org
create policy "org_read" on procurements for select
  using (auth.role() = 'authenticated');
create policy "org_insert" on procurements for insert
  with check (auth.role() = 'authenticated');
create policy "org_update" on procurements for update
  using (auth.role() = 'authenticated');

create policy "supplier_read" on suppliers for select
  using (auth.role() = 'authenticated');
create policy "supplier_insert" on suppliers for insert
  with check (auth.role() = 'authenticated');
create policy "supplier_update" on suppliers for update
  using (auth.role() = 'authenticated');

create policy "audit_read" on audit_events for select
  using (auth.role() = 'authenticated');
create policy "audit_insert" on audit_events for insert
  with check (auth.role() = 'authenticated');

create policy "bids_read" on bids for select
  using (auth.role() = 'authenticated');
create policy "bids_insert" on bids for insert
  with check (auth.role() = 'authenticated');

create policy "users_read" on users for select
  using (auth.role() = 'authenticated');
create policy "users_self_update" on users for update
  using (auth.uid() = id);

create policy "lessons_read" on lessons_learned for select
  using (auth.role() = 'authenticated');
create policy "lessons_insert" on lessons_learned for insert
  with check (auth.role() = 'authenticated');

-- ── Storage buckets ────────────────────────────────────────
-- Run separately in Supabase Storage tab:
-- Create bucket: "supplier-documents" (private)
-- Create bucket: "procurement-files" (private)

-- ── Indexes ────────────────────────────────────────────────
create index on procurements (organisation_id, status);
create index on procurements (created_by);
create index on suppliers (organisation_id, status);
create index on bids (procurement_id);
create index on audit_events (procurement_id, block_index);
