create extension if not exists pgcrypto;

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.company_members (
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','manager','employee')),
  created_at timestamptz not null default now(),
  primary key (company_id, user_id)
);

create table if not exists public.workspace_state (
  company_id uuid primary key references public.companies(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.workspace_state enable row level security;

create or replace function public.is_company_member(target_company uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.company_members m
    where m.company_id = target_company and m.user_id = auth.uid()
  );
$$;

create policy "members can view own companies" on public.companies
for select using (public.is_company_member(id));

create policy "members can view own membership" on public.company_members
for select using (user_id = auth.uid() or public.is_company_member(company_id));

create policy "members can view workspace" on public.workspace_state
for select using (public.is_company_member(company_id));

create policy "owners managers can insert workspace" on public.workspace_state
for insert with check (
  exists(select 1 from public.company_members m where m.company_id = workspace_state.company_id and m.user_id = auth.uid() and m.role in ('owner','manager'))
);

create policy "owners managers can update workspace" on public.workspace_state
for update using (
  exists(select 1 from public.company_members m where m.company_id = workspace_state.company_id and m.user_id = auth.uid() and m.role in ('owner','manager'))
) with check (
  exists(select 1 from public.company_members m where m.company_id = workspace_state.company_id and m.user_id = auth.uid() and m.role in ('owner','manager'))
);

create or replace function public.handle_new_buildflow_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  new_company_id uuid;
  company_name text;
begin
  company_name := coalesce(new.raw_user_meta_data->>'company_name', split_part(new.email, '@', 1) || ' Company');
  insert into public.companies(name) values (company_name) returning id into new_company_id;
  insert into public.company_members(company_id,user_id,role) values (new_company_id,new.id,'owner');
  insert into public.workspace_state(company_id,data) values (new_company_id,'{}'::jsonb);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_buildflow on auth.users;
create trigger on_auth_user_created_buildflow
after insert on auth.users
for each row execute procedure public.handle_new_buildflow_user();
