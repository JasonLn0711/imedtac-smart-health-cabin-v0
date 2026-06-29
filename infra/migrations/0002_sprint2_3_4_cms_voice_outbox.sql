create table if not exists questionnaire_templates (
  id text primary key,
  tenant_id text not null default 'demo',
  code text not null,
  title text not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, code)
);

alter table questionnaire_versions
  add column if not exists template_id text,
  add column if not exists scoring_config_code text not null default 'phq9_public_v1',
  add column if not exists is_active boolean not null default false,
  add column if not exists archived_at timestamptz;

alter table report_sections
  add column if not exists response_id uuid references questionnaire_responses(id),
  add column if not exists title text,
  add column if not exists public_status_code text,
  add column if not exists safe_summary text,
  add column if not exists disclaimer text,
  add column if not exists sort_order int not null default 1;

alter table report_access_tokens
  add column if not exists response_id uuid references questionnaire_responses(id),
  add column if not exists token_hash text,
  add column if not exists revoked_at timestamptz;

alter table outbox_events
  add column if not exists topic text,
  add column if not exists attempts int not null default 0,
  add column if not exists next_attempt_at timestamptz,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists last_error text;

create table if not exists agent_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null default 'demo',
  kiosk_id text not null default 'kiosk_demo',
  session_id text references sessions(id),
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists agent_turns (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null default 'demo',
  agent_session_id uuid references agent_sessions(id),
  session_id text,
  turn_type text not null,
  question_name text,
  transcript text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

insert into questionnaire_templates (id, tenant_id, code, title, description)
values ('qtpl_phq9', 'demo', 'phq9', '病人健康狀況問卷-9（PHQ-9）', '健康自我檢測問卷')
on conflict (tenant_id, code) do update set
  title = excluded.title,
  description = excluded.description,
  updated_at = now();

update questionnaire_versions
set template_id = 'qtpl_phq9',
    scoring_config_code = 'phq9_public_v1'
where tenant_id = 'demo'
  and questionnaire_code = 'phq9'
  and template_id is null;

update questionnaire_versions
set is_active = true
where tenant_id = 'demo'
  and questionnaire_code = 'phq9'
  and version = '0.1.0'
  and status = 'published'
  and not exists (
    select 1
    from questionnaire_versions active
    where active.tenant_id = questionnaire_versions.tenant_id
      and active.questionnaire_code = questionnaire_versions.questionnaire_code
      and active.status = 'published'
      and active.is_active = true
  );
