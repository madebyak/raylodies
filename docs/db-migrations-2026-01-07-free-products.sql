-- Raylodies: Free products (login-required) + per-user entitlements
-- Date: 2026-01-07
--
-- Goal:
-- - Allow products to be marked as "free" (no Paddle checkout)
-- - Still require users to sign in before downloading
-- - Track access per user so we can show items in /account/downloads
--
-- Run in Supabase Dashboard → SQL Editor.
-- This migration is safe to run on existing DBs.

------------------------------------------------------------
-- 1) Mark products as free (explicit flag)
------------------------------------------------------------
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_free BOOLEAN NOT NULL DEFAULT FALSE;

-- Keep data consistent: free products must have price 0.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_free_price_zero'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_free_price_zero
      CHECK (NOT is_free OR price = 0);
  END IF;
END $$;

------------------------------------------------------------
-- 2) Per-user entitlements (who can download which product)
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'free' CHECK (source IN ('free', 'admin_grant', 'migration')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotency: user can only have one entitlement per product.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'product_entitlements_user_product_unique'
  ) THEN
    ALTER TABLE public.product_entitlements
      ADD CONSTRAINT product_entitlements_user_product_unique UNIQUE (user_id, product_id);
  END IF;
END $$;

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_product_entitlements_user_id
  ON public.product_entitlements (user_id);
CREATE INDEX IF NOT EXISTS idx_product_entitlements_product_id
  ON public.product_entitlements (product_id);

------------------------------------------------------------
-- 3) RLS (recommended). If you already have public.is_admin(), this is fast.
------------------------------------------------------------
ALTER TABLE public.product_entitlements ENABLE ROW LEVEL SECURITY;

-- Drop-and-create to keep this migration re-runnable.
DROP POLICY IF EXISTS "Users/Admins view product entitlements" ON public.product_entitlements;
DROP POLICY IF EXISTS "Users claim free products" ON public.product_entitlements;
DROP POLICY IF EXISTS "Admins manage product entitlements" ON public.product_entitlements;

-- Users can view their own entitlements; admins can view all.
CREATE POLICY "Users/Admins view product entitlements"
ON public.product_entitlements
FOR SELECT
USING ( (select public.is_admin()) OR user_id = (select auth.uid()) );

-- Users can claim an entitlement only for free + published products.
CREATE POLICY "Users claim free products"
ON public.product_entitlements
FOR INSERT
WITH CHECK (
  user_id = (select auth.uid())
  AND EXISTS (
    SELECT 1
    FROM public.products p
    WHERE p.id = product_id
      AND p.is_free = true
      AND p.is_published = true
  )
);

-- Admins can insert/delete entitlements (optional, for manual grants).
CREATE POLICY "Admins manage product entitlements"
ON public.product_entitlements
FOR ALL
USING ( (select public.is_admin()) )
WITH CHECK ( (select public.is_admin()) );


