-- P2.3 local-only repair. Apply only to the local Supabase database.
-- The claim RPC sets guaki.claiming for its transaction; ordinary provider
-- updates remain unable to mutate ownership or workflow fields.
create or replace function public.protect_business_workflow_fields()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  actor_role text := coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '');
  claim_operation boolean := current_setting('guaki.claiming', true) = 'on';
begin
  if actor_role = 'admin' then
    return new;
  end if;

  if claim_operation then
    if old.owner_id is not null or old.claim_status <> 'unclaimed' then
      raise exception 'BUSINESS_ALREADY_CLAIMED_OR_NOT_FOUND' using errcode = 'P0002';
    end if;
    return new;
  end if;

  if old.owner_id is distinct from new.owner_id
     or old.owner_email is distinct from new.owner_email
     or old.claim_status is distinct from new.claim_status
     or old.approved_at is distinct from new.approved_at
     or old.audit_notes is distinct from new.audit_notes then
    raise exception 'PROTECTED_WORKFLOW_FIELDS';
  end if;

  if old.status is distinct from new.status
     and not (old.status = 'draft' and new.status = 'in_audit') then
    raise exception 'PROTECTED_STATUS_TRANSITION';
  end if;

  return new;
end;
$$;
