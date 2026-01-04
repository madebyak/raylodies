-- Supabase Advisor hardening: fix "Function Search Path Mutable" warnings
-- Date: 2026-01-04
--
-- Why:
-- Supabase flags SECURITY DEFINER functions that do not set an explicit search_path.
-- A role-mutable search_path can be abused in some setups (search-path hijacking).
--
-- This migration pins the search_path to safe schemas for our SECURITY DEFINER functions.
-- Run in Supabase Dashboard → SQL Editor.

ALTER FUNCTION public.is_admin() SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_order_stats() SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_customers_with_stats() SET search_path = pg_catalog, public;
ALTER FUNCTION public.handle_new_user() SET search_path = pg_catalog, public;


