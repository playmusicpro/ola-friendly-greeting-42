-- ============================================================
-- PLAY MUSIC PRO — Schema completo (Supabase / Postgres)
-- Execute no SQL Editor do Supabase. Idempotente.
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 0) FUNÇÃO DE updated_at
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------
-- 1) PROFILES (ajuste da tabela existente)
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'nome do musico',
  email text,
  plan text not null default 'free'
);

alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();
alter table public.profiles add column if not exists whatsapp text;
alter table public.profiles add column if not exists google_calendar_enabled boolean not null default false;
alter table public.profiles add column if not exists google_calendar_status text not null default 'disconnected';
alter table public.profiles add column if not exists google_connected_at timestamptz;

grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Cria o profile automaticamente ao registrar um usuário
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', 'nome do musico'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- 2) ROLES / ADMIN (tabela separada — NUNCA em profiles)
-- ------------------------------------------------------------
do $$ begin
  create type public.app_role as enum ('owner', 'admin', 'user');
exception when duplicate_object then null; end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

-- Função SECURITY DEFINER (evita recursão em RLS)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

create or replace function public.is_admin(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role in ('owner','admin')
  );
$$;

drop policy if exists "user_roles_select_own" on public.user_roles;
create policy "user_roles_select_own" on public.user_roles
  for select to authenticated
  using (auth.uid() = user_id or public.is_admin(auth.uid()));

-- Somente owner pode conceder/remover papéis
drop policy if exists "user_roles_owner_manage" on public.user_roles;
create policy "user_roles_owner_manage" on public.user_roles
  for all to authenticated
  using (public.has_role(auth.uid(), 'owner'))
  with check (public.has_role(auth.uid(), 'owner'));

-- Admins podem ler todos os profiles
drop policy if exists "profiles_admin_select_all" on public.profiles;
create policy "profiles_admin_select_all" on public.profiles
  for select to authenticated using (public.is_admin(auth.uid()));

-- ------------------------------------------------------------
-- 3) SHOWS
-- ------------------------------------------------------------
create table if not exists public.shows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  time text,
  local text not null,
  tipo text not null default 'Bar',
  cache numeric(12,2) not null default 0,
  num_musicos integer not null default 1,
  consumacao numeric(12,2) not null default 0,
  km_rodados numeric(10,2) not null default 0,
  combustivel numeric(12,2) not null default 0,
  pedagio numeric(12,2) not null default 0,
  roupas numeric(12,2) not null default 0,
  equipamentos numeric(12,2) not null default 0,
  outros_custos numeric(12,2) not null default 0,
  pagamento_musicos numeric(12,2) not null default 0,
  realizado boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_shows_user_date on public.shows(user_id, date desc);

-- ------------------------------------------------------------
-- 4) DESPESAS (gastos gerais / categorias)
-- ------------------------------------------------------------
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  show_id uuid references public.shows(id) on delete set null,
  descricao text not null,
  categoria text not null default 'outros',
  valor numeric(12,2) not null default 0,
  data date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_expenses_user_data on public.expenses(user_id, data desc);

-- ------------------------------------------------------------
-- 5) DESPESAS FIXAS
-- ------------------------------------------------------------
create table if not exists public.fixed_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  descricao text not null,
  valor numeric(12,2) not null default 0,
  dia_vencimento integer not null default 1 check (dia_vencimento between 1 and 31),
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_fixed_expenses_user on public.fixed_expenses(user_id);

-- ------------------------------------------------------------
-- 6) RECEITAS
-- ------------------------------------------------------------
create table if not exists public.incomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  descricao text not null,
  valor numeric(12,2) not null default 0,
  data date not null default current_date,
  categoria text,
  source text not null default 'other' check (source in ('lessons','freelance','other')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_incomes_user_data on public.incomes(user_id, data desc);

-- ------------------------------------------------------------
-- 7) METAS FINANCEIRAS
-- ------------------------------------------------------------
create table if not exists public.financial_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  valor_meta numeric(12,2) not null default 0,
  periodo text not null default 'mensal' check (periodo in ('mensal','semanal')),
  data_inicio date not null default current_date,
  data_fim date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_goals_user on public.financial_goals(user_id);

-- ------------------------------------------------------------
-- 8) COFRINHOS + HISTÓRICO
-- ------------------------------------------------------------
create table if not exists public.piggy_banks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  valor_atual numeric(12,2) not null default 0,
  objetivo numeric(12,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_piggy_user on public.piggy_banks(user_id);

create table if not exists public.piggy_bank_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  piggy_bank_id uuid not null references public.piggy_banks(id) on delete cascade,
  tipo text not null check (tipo in ('deposito','retirada')),
  valor numeric(12,2) not null check (valor > 0),
  data date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_piggy_tx on public.piggy_bank_transactions(piggy_bank_id, data desc);

-- ------------------------------------------------------------
-- 9) PROJETO AUDIOVISUAL
-- ------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  total_value numeric(12,2) not null default 0,
  saved_value numeric(12,2) not null default 0,
  weekly_deposit numeric(12,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_projects_user on public.projects(user_id);

-- ------------------------------------------------------------
-- 10) AGENDA / EVENTOS
-- ------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  tipo text not null default 'Show'
    check (tipo in ('Show','Ensaio','Aula','Gravação','Compromisso','Outro')),
  date date not null,
  start_time text not null,
  end_time text,
  local text,
  notes text,
  linked_show_id uuid references public.shows(id) on delete set null,
  playlist_id uuid,
  realizado boolean not null default false,
  google_event_id text,
  google_calendar_id text,
  sync_status text not null default 'local_only'
    check (sync_status in ('synced','pending','error','local_only')),
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_events_user_date on public.events(user_id, date);

-- ------------------------------------------------------------
-- 11) REPERTÓRIO: MÚSICAS E SETLISTS
-- (sem letras/cifras protegidas — apenas metadados e links)
-- ------------------------------------------------------------
create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  artist text,
  tone text,
  how_you_play text,
  cifra_club_link text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_songs_user on public.songs(user_id);

create table if not exists public.setlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_setlists_user on public.setlists(user_id);

create table if not exists public.setlist_songs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  setlist_id uuid not null references public.setlists(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  tom_escolhido text,
  posicao integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (setlist_id, song_id)
);
create index if not exists idx_setlist_songs on public.setlist_songs(setlist_id, posicao);

-- ------------------------------------------------------------
-- 12) CONFIGURAÇÕES DE NOTIFICAÇÃO E LOGS
-- ------------------------------------------------------------
create table if not exists public.notification_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  enable_whatsapp boolean not null default false,
  whatsapp_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null default 'whatsapp',
  event_id uuid,
  message_body text,
  delivery_status text not null default 'pending'
    check (delivery_status in ('sent','failed','pending')),
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_notif_logs_user on public.notification_logs(user_id, created_at desc);

-- ============================================================
-- 13) GRANTS + RLS + POLICIES + TRIGGERS (todas as tabelas do usuário)
-- ============================================================
do $$
declare
  t text;
  user_tables text[] := array[
    'shows','expenses','fixed_expenses','incomes','financial_goals',
    'piggy_banks','piggy_bank_transactions','projects','events',
    'songs','setlists','setlist_songs','notification_settings','notification_logs'
  ];
begin
  foreach t in array user_tables loop
    -- Grants (sem anon: todo acesso é escopado por auth.uid())
    execute format('grant select, insert, update, delete on public.%I to authenticated;', t);
    execute format('grant all on public.%I to service_role;', t);

    -- RLS
    execute format('alter table public.%I enable row level security;', t);

    -- Policies: dono total + admin somente leitura
    execute format('drop policy if exists "%1$s_owner_all" on public.%1$I;', t);
    execute format($f$
      create policy "%1$s_owner_all" on public.%1$I
        for all to authenticated
        using (auth.uid() = user_id)
        with check (auth.uid() = user_id);
    $f$, t);

    execute format('drop policy if exists "%1$s_admin_read" on public.%1$I;', t);
    execute format($f$
      create policy "%1$s_admin_read" on public.%1$I
        for select to authenticated
        using (public.is_admin(auth.uid()));
    $f$, t);

    -- Trigger updated_at
    execute format('drop trigger if exists trg_%1$s_updated_at on public.%1$I;', t);
    execute format($f$
      create trigger trg_%1$s_updated_at before update on public.%1$I
        for each row execute function public.set_updated_at();
    $f$, t);
  end loop;
end $$;

-- ============================================================
-- 14) DEFINIR O OWNER (execute depois de criar seu usuário)
-- Substitua o e-mail abaixo pelo seu.
-- ============================================================
-- insert into public.user_roles (user_id, role)
-- select id, 'owner'::public.app_role from auth.users where email = 'seu@email.com'
-- on conflict (user_id, role) do nothing;
