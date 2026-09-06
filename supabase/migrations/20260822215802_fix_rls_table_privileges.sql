-- Providers create their own draft businesses; RLS still enforces ownership.
GRANT INSERT ON TABLE public.businesses TO authenticated;
