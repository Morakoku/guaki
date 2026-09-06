ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS claim_status TEXT NOT NULL DEFAULT 'unclaimed'
    CHECK (claim_status IN ('unclaimed', 'pending', 'verified', 'rejected'));

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS owner_email TEXT;

CREATE INDEX IF NOT EXISTS idx_businesses_claim_status ON public.businesses(claim_status);

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

  UPDATE public.businesses
  SET owner_id = auth.uid(),
      owner_email = NULLIF(lower(trim(p_owner_email)), ''),
      claim_status = 'pending',
      status = 'in_audit',
      submitted_at = COALESCE(submitted_at, now()),
      updated_at = now()
  WHERE id = p_business_id
    AND owner_id IS NULL
  RETURNING * INTO claimed;

  IF claimed.id IS NULL THEN
    RAISE EXCEPTION 'BUSINESS_ALREADY_CLAIMED_OR_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  RETURN claimed;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_business(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_business(TEXT, TEXT) TO authenticated;
