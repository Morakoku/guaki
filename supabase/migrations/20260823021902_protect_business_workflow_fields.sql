CREATE OR REPLACE FUNCTION public.protect_business_workflow_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  actor_role TEXT := COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '');
BEGIN
  IF actor_role = 'admin' THEN
    RETURN NEW;
  END IF;

  IF OLD.owner_id IS DISTINCT FROM NEW.owner_id
     OR OLD.owner_email IS DISTINCT FROM NEW.owner_email
     OR OLD.claim_status IS DISTINCT FROM NEW.claim_status
     OR OLD.approved_at IS DISTINCT FROM NEW.approved_at
     OR OLD.audit_notes IS DISTINCT FROM NEW.audit_notes THEN
    RAISE EXCEPTION 'PROTECTED_WORKFLOW_FIELDS';
  END IF;

  IF OLD.status IS DISTINCT FROM NEW.status
     AND NOT (OLD.status = 'draft' AND NEW.status = 'in_audit') THEN
    RAISE EXCEPTION 'PROTECTED_STATUS_TRANSITION';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_business_workflow_fields_trigger ON public.businesses;
CREATE TRIGGER protect_business_workflow_fields_trigger
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_business_workflow_fields();

-- The claim RPC is the only non-admin path allowed to set ownership/claim fields.
CREATE OR REPLACE FUNCTION public.claim_business(p_business_id TEXT, p_owner_email TEXT)
RETURNS public.businesses
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claimed public.businesses;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '42501';
  END IF;
  PERFORM set_config('guaki.claiming', 'on', true);
  UPDATE public.businesses
  SET owner_id = auth.uid(),
      owner_email = NULLIF(lower(trim(p_owner_email)), ''),
      claim_status = 'pending',
      status = 'in_audit',
      submitted_at = COALESCE(submitted_at, now()),
      updated_at = now()
  WHERE id = p_business_id AND owner_id IS NULL
  RETURNING * INTO claimed;
  IF claimed.id IS NULL THEN
    RAISE EXCEPTION 'BUSINESS_ALREADY_CLAIMED_OR_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;
  RETURN claimed;
END;
$$;

REVOKE ALL ON FUNCTION public.protect_business_workflow_fields() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_business(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_business(TEXT, TEXT) TO authenticated;
