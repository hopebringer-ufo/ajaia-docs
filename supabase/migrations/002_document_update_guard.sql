-- Restrict shared collaborators to content-only updates (prevent owner_id/title escalation)

create or replace function public.enforce_document_update_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if old.owner_id = auth.uid() then
    return new;
  end if;

  if public.user_can_access_document(old.id) then
    if new.owner_id is distinct from old.owner_id
      or new.title is distinct from old.title then
      raise exception 'Shared users may only update document content';
    end if;
    return new;
  end if;

  raise exception 'Access denied';
end;
$$;

drop trigger if exists documents_enforce_update_columns on public.documents;

create trigger documents_enforce_update_columns
  before update on public.documents
  for each row
  execute function public.enforce_document_update_columns();

-- Owner-only metadata updates (title); content updates for owners + shared users
drop policy if exists "documents_update_access" on public.documents;

create policy "documents_update_owner"
  on public.documents for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "documents_update_shared_content"
  on public.documents for update
  to authenticated
  using (
    exists (
      select 1
      from public.document_shares s
      where s.document_id = documents.id
        and s.shared_with_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.document_shares s
      where s.document_id = documents.id
        and s.shared_with_user_id = auth.uid()
    )
  );
