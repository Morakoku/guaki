-- PostgREST needs SELECT as well as INSERT when the API returns inserted rows.
-- RLS policies remain the row-level authorization boundary.
GRANT SELECT ON public.inquiries, public.events TO authenticated;
