-- Fix create-document RLS failures for users missing profiles + safe create RPC

-- Allow authenticated users to create their own profile row (needed if signup
-- happened before migrations / trigger existed).
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

-- Backfill profiles for any auth users that already exist
insert into public.profiles (id, email, full_name)
select
  u.id,
  coalesce(u.email, u.id::text || '@unknown.local'),
  coalesce(
    u.raw_user_meta_data ->> 'full_name',
    split_part(coalesce(u.email, 'user'), '@', 1)
  )
from auth.users u
on conflict (id) do nothing;

-- Recreate insert policy (explicit authenticated + non-null uid)
drop policy if exists "documents_insert_own" on public.documents;
create policy "documents_insert_own"
  on public.documents for insert
  to authenticated
  with check (
    auth.uid() is not null
    and owner_id = auth.uid()
  );

-- Reliable create path used by the app (bypasses RLS after auth check)
create or replace function public.create_document(
  p_title text default 'Untitled document',
  p_content text default '<p></p>'
)
returns public.documents
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  doc public.documents;
  user_email text;
  user_name text;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  user_email := coalesce(auth.jwt() ->> 'email', uid::text || '@unknown.local');
  user_name := coalesce(
    auth.jwt() -> 'user_metadata' ->> 'full_name',
    split_part(user_email, '@', 1)
  );

  insert into public.profiles (id, email, full_name)
  values (uid, user_email, user_name)
  on conflict (id) do update
    set email = excluded.email
  where public.profiles.email is distinct from excluded.email;

  insert into public.documents (owner_id, title, content)
  values (
    uid,
    coalesce(nullif(trim(p_title), ''), 'Untitled document'),
    coalesce(p_content, '<p></p>')
  )
  returning * into doc;

  return doc;
end;
$$;

revoke all on function public.create_document(text, text) from public;
grant execute on function public.create_document(text, text) to authenticated;
