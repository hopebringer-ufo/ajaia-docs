-- Ajaia Docs: initial schema with RLS

create extension if not exists "pgcrypto";

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  created_at timestamptz not null default now()
);

create index profiles_email_idx on public.profiles (email);

-- Documents
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null default 'Untitled document',
  content text not null default '<p></p>',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index documents_owner_id_idx on public.documents (owner_id);
create index documents_updated_at_idx on public.documents (updated_at desc);

-- Document shares
create table public.document_shares (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents (id) on delete cascade,
  shared_with_user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (document_id, shared_with_user_id)
);

create index document_shares_document_id_idx on public.document_shares (document_id);
create index document_shares_shared_with_user_id_idx on public.document_shares (shared_with_user_id);

-- Auto-update updated_at on documents
create or replace function public.set_documents_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger documents_updated_at
  before update on public.documents
  for each row
  execute function public.set_documents_updated_at();

-- Create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Helper: user can access document (owner or shared)
create or replace function public.user_can_access_document(doc_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.documents d
    where d.id = doc_id
      and (
        d.owner_id = auth.uid()
        or exists (
          select 1
          from public.document_shares s
          where s.document_id = d.id
            and s.shared_with_user_id = auth.uid()
        )
      )
  );
$$;

create or replace function public.user_owns_document(doc_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.documents d
    where d.id = doc_id
      and d.owner_id = auth.uid()
  );
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.document_shares enable row level security;

-- Profiles: read for authenticated (sharing lookup + owner display)
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Documents
create policy "documents_select_access"
  on public.documents for select
  to authenticated
  using (public.user_can_access_document(id));

create policy "documents_insert_own"
  on public.documents for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "documents_update_access"
  on public.documents for update
  to authenticated
  using (public.user_can_access_document(id))
  with check (public.user_can_access_document(id));

create policy "documents_delete_owner"
  on public.documents for delete
  to authenticated
  using (owner_id = auth.uid());

-- Document shares
create policy "shares_select_involved"
  on public.document_shares for select
  to authenticated
  using (
    shared_with_user_id = auth.uid()
    or public.user_owns_document(document_id)
  );

create policy "shares_insert_owner"
  on public.document_shares for insert
  to authenticated
  with check (public.user_owns_document(document_id));

create policy "shares_delete_owner"
  on public.document_shares for delete
  to authenticated
  using (public.user_owns_document(document_id));
