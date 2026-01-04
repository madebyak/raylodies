-- Supabase Advisor performance: RLS policy optimizations
-- Date: 2026-01-04
--
-- Fixes:
-- 1) auth_rls_initplan:
--    Use (select auth.uid()) / (select public.is_admin()) so Postgres evaluates once per query,
--    not once per row.
-- 2) multiple_permissive_policies:
--    Reduce overlapping permissive policies (e.g. "Public view ..." + "Admins manage ... FOR ALL")
--    by combining SELECT logic and moving admin management to INSERT/UPDATE/DELETE policies.
--
-- Run in Supabase Dashboard → SQL Editor.
-- Note: This changes policy definitions but preserves intended access:
-- - Public can read published projects/products (and public lists where applicable)
-- - Admins can read all + manage (insert/update/delete)
-- - Users can read their own orders/order_items

------------------------------------------------------------
-- USERS
------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users/Admins can view profiles"
ON public.users
FOR SELECT
USING ( (select public.is_admin()) OR id = (select auth.uid()) );

CREATE POLICY "Users/Admins can update profiles"
ON public.users
FOR UPDATE
USING ( (select public.is_admin()) OR id = (select auth.uid()) )
WITH CHECK ( (select public.is_admin()) OR id = (select auth.uid()) );

------------------------------------------------------------
-- CATEGORIES
------------------------------------------------------------
-- Keep public SELECT; move admin manage off SELECT to avoid overlapping permissive policies.
DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;

CREATE POLICY "Admins insert categories"
ON public.categories
FOR INSERT
WITH CHECK ( (select public.is_admin()) );

CREATE POLICY "Admins update categories"
ON public.categories
FOR UPDATE
USING ( (select public.is_admin()) )
WITH CHECK ( (select public.is_admin()) );

CREATE POLICY "Admins delete categories"
ON public.categories
FOR DELETE
USING ( (select public.is_admin()) );

------------------------------------------------------------
-- PROJECTS
------------------------------------------------------------
DROP POLICY IF EXISTS "Public view published projects" ON public.projects;
DROP POLICY IF EXISTS "Admins manage projects" ON public.projects;

CREATE POLICY "Public/Admin view projects"
ON public.projects
FOR SELECT
USING ( is_published = true OR (select public.is_admin()) );

CREATE POLICY "Admins insert projects"
ON public.projects
FOR INSERT
WITH CHECK ( (select public.is_admin()) );

CREATE POLICY "Admins update projects"
ON public.projects
FOR UPDATE
USING ( (select public.is_admin()) )
WITH CHECK ( (select public.is_admin()) );

CREATE POLICY "Admins delete projects"
ON public.projects
FOR DELETE
USING ( (select public.is_admin()) );

------------------------------------------------------------
-- PROJECT MEDIA
------------------------------------------------------------
DROP POLICY IF EXISTS "Public view project media" ON public.project_media;
DROP POLICY IF EXISTS "Admins manage project media" ON public.project_media;

CREATE POLICY "Public/Admin view project media"
ON public.project_media
FOR SELECT
USING (
  (select public.is_admin())
  OR EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.id = project_media.project_id
      AND p.is_published = true
  )
);

CREATE POLICY "Admins insert project media"
ON public.project_media
FOR INSERT
WITH CHECK ( (select public.is_admin()) );

CREATE POLICY "Admins update project media"
ON public.project_media
FOR UPDATE
USING ( (select public.is_admin()) )
WITH CHECK ( (select public.is_admin()) );

CREATE POLICY "Admins delete project media"
ON public.project_media
FOR DELETE
USING ( (select public.is_admin()) );

------------------------------------------------------------
-- PRODUCTS
------------------------------------------------------------
DROP POLICY IF EXISTS "Public view published products" ON public.products;
DROP POLICY IF EXISTS "Admins manage products" ON public.products;

CREATE POLICY "Public/Admin view products"
ON public.products
FOR SELECT
USING ( is_published = true OR (select public.is_admin()) );

CREATE POLICY "Admins insert products"
ON public.products
FOR INSERT
WITH CHECK ( (select public.is_admin()) );

CREATE POLICY "Admins update products"
ON public.products
FOR UPDATE
USING ( (select public.is_admin()) )
WITH CHECK ( (select public.is_admin()) );

CREATE POLICY "Admins delete products"
ON public.products
FOR DELETE
USING ( (select public.is_admin()) );

------------------------------------------------------------
-- PRODUCT IMAGES
------------------------------------------------------------
-- Keep public SELECT; move admin manage off SELECT to avoid overlapping permissive policies.
DROP POLICY IF EXISTS "Admins manage product images" ON public.product_images;

CREATE POLICY "Admins insert product images"
ON public.product_images
FOR INSERT
WITH CHECK ( (select public.is_admin()) );

CREATE POLICY "Admins update product images"
ON public.product_images
FOR UPDATE
USING ( (select public.is_admin()) )
WITH CHECK ( (select public.is_admin()) );

CREATE POLICY "Admins delete product images"
ON public.product_images
FOR DELETE
USING ( (select public.is_admin()) );

------------------------------------------------------------
-- PRODUCT KEYWORDS
------------------------------------------------------------
-- Keep public SELECT; move admin manage off SELECT to avoid overlapping permissive policies.
DROP POLICY IF EXISTS "Admins manage keywords" ON public.product_keywords;

CREATE POLICY "Admins insert product keywords"
ON public.product_keywords
FOR INSERT
WITH CHECK ( (select public.is_admin()) );

CREATE POLICY "Admins update product keywords"
ON public.product_keywords
FOR UPDATE
USING ( (select public.is_admin()) )
WITH CHECK ( (select public.is_admin()) );

CREATE POLICY "Admins delete product keywords"
ON public.product_keywords
FOR DELETE
USING ( (select public.is_admin()) );

------------------------------------------------------------
-- INQUIRIES
------------------------------------------------------------
-- Avoid overlap on INSERT by restricting admin policy to SELECT/UPDATE/DELETE only.
DROP POLICY IF EXISTS "Admins manage inquiries" ON public.inquiries;

CREATE POLICY "Admins view inquiries"
ON public.inquiries
FOR SELECT
USING ( (select public.is_admin()) );

CREATE POLICY "Admins update inquiries"
ON public.inquiries
FOR UPDATE
USING ( (select public.is_admin()) )
WITH CHECK ( (select public.is_admin()) );

CREATE POLICY "Admins delete inquiries"
ON public.inquiries
FOR DELETE
USING ( (select public.is_admin()) );

------------------------------------------------------------
-- ORDERS
------------------------------------------------------------
DROP POLICY IF EXISTS "Users view own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins view all orders" ON public.orders;
DROP POLICY IF EXISTS "Service role manages orders" ON public.orders;

CREATE POLICY "Users/Admins view orders"
ON public.orders
FOR SELECT
USING ( (select public.is_admin()) OR user_id = (select auth.uid()) );

-- Optional: allow admins to update order status in dashboard (keep off INSERT)
CREATE POLICY "Admins update orders"
ON public.orders
FOR UPDATE
USING ( (select public.is_admin()) )
WITH CHECK ( (select public.is_admin()) );

------------------------------------------------------------
-- ORDER ITEMS
------------------------------------------------------------
DROP POLICY IF EXISTS "Users view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins view all order items" ON public.order_items;

CREATE POLICY "Users/Admins view order items"
ON public.order_items
FOR SELECT
USING (
  (select public.is_admin())
  OR EXISTS (
    SELECT 1
    FROM public.orders o
    WHERE o.id = order_items.order_id
      AND o.user_id = (select auth.uid())
  )
);


