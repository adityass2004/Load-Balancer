-- ==============================================================================
-- Secure Supabase / PostgreSQL Tables
-- Enable Row Level Security (RLS) and revoke unauthorized public/anon access
-- ==============================================================================

-- 1. Enable Row Level Security (RLS) on all public tables
ALTER TABLE IF EXISTS public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.request_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."AdminUser" ENABLE ROW LEVEL SECURITY;

-- 2. Revoke all permissions from anon and authenticated roles
REVOKE ALL ON TABLE public.projects FROM anon, authenticated;
REVOKE ALL ON TABLE public.servers FROM anon, authenticated;
REVOKE ALL ON TABLE public.settings FROM anon, authenticated;
REVOKE ALL ON TABLE public.request_logs FROM anon, authenticated;
REVOKE ALL ON TABLE public."AdminUser" FROM anon, authenticated;

-- 3. Prevent automatic grant of permissions to anon/authenticated on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
