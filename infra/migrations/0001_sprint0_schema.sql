create extension if not exists pgcrypto;

create table if not exists sessions (
  id text primary key,
  tenant_id text not null default 'demo',
  status text not null default 'created',
  created_at timestamptz not null default now()
);

create table if not exists questionnaire_versions (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null default 'demo',
  questionnaire_code text not null,
  version text not null,
  status text not null,
  title text not null,
  surveyjs_json jsonb not null,
  scoring_config jsonb not null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique (tenant_id, questionnaire_code, version)
);

create table if not exists questionnaire_responses (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null default 'demo',
  session_id text not null references sessions(id),
  questionnaire_version_id uuid not null references questionnaire_versions(id),
  raw_answers jsonb not null,
  internal_score_json jsonb not null,
  safety_flags jsonb not null,
  public_summary_json jsonb not null,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists report_sections (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null default 'demo',
  session_id text not null references sessions(id),
  section_type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists report_access_tokens (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null default 'demo',
  session_id text not null references sessions(id),
  token text not null unique,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists outbox_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null default 'demo',
  aggregate_type text not null,
  aggregate_id text not null,
  event_type text not null,
  payload jsonb not null,
  status text not null default 'pending',
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists audit_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null default 'demo',
  actor text not null default 'system',
  action text not null,
  target_type text not null,
  target_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
