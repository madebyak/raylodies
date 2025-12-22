-- Raylodies DB migration (2025-12-22)
-- Run this in Supabase Dashboard → SQL Editor.
-- Safe to run on existing DBs (mostly idempotent).

------------------------------------------------------------
-- 1) Ensure SEO columns exist (if your DB was created before these fields)
------------------------------------------------------------
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS meta_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS og_image TEXT;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS meta_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS og_image TEXT;

------------------------------------------------------------
-- 2) Webhook idempotency: prevent duplicate order_items per (order_id, product_id)
-- IMPORTANT: If this fails, you likely have duplicates. See the duplicate check below.
------------------------------------------------------------
-- Check duplicates (run this first if you suspect duplicates):
-- SELECT order_id, product_id, COUNT(*)
-- FROM public.order_items
-- GROUP BY 1,2
-- HAVING COUNT(*) > 1;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'order_items_order_id_product_id_unique'
  ) THEN
    ALTER TABLE public.order_items
      ADD CONSTRAINT order_items_order_id_product_id_unique UNIQUE (order_id, product_id);
  END IF;
END $$;

------------------------------------------------------------
-- 3) Admin-only RPC functions used by the dashboard (fast at scale)
------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_order_stats()
RETURNS TABLE (
  total_revenue NUMERIC,
  total_orders BIGINT,
  completed_orders BIGINT
) AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT
    COALESCE(SUM(o.total) FILTER (WHERE o.status = 'completed'), 0) AS total_revenue,
    COUNT(*) AS total_orders,
    COUNT(*) FILTER (WHERE o.status = 'completed') AS completed_orders
  FROM public.orders o;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_customers_with_stats()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  total_orders BIGINT,
  total_spent NUMERIC
) AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email,
    u.full_name,
    u.avatar_url,
    u.role,
    u.created_at,
    u.updated_at,
    COALESCE(COUNT(o.id) FILTER (WHERE o.status = 'completed'), 0) AS total_orders,
    COALESCE(SUM(o.total) FILTER (WHERE o.status = 'completed'), 0) AS total_spent
  FROM public.users u
  LEFT JOIN public.orders o ON o.user_id = u.id
  GROUP BY u.id
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional hardening: explicitly grant EXECUTE (safe even if already granted)
GRANT EXECUTE ON FUNCTION public.get_order_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_customers_with_stats() TO authenticated;


