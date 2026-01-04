-- Supabase Advisor performance: add indexes for unindexed foreign keys
-- Date: 2026-01-04
--
-- Why:
-- Postgres does not automatically create indexes for foreign key columns.
-- Missing indexes can slow down joins and can make deletes/updates on the parent table
-- much slower (because Postgres must scan the child table to enforce the FK).
--
-- Run in Supabase Dashboard → SQL Editor.

-- orders.user_id -> users.id
CREATE INDEX IF NOT EXISTS idx_orders_user_id_status
  ON public.orders (user_id, status);

-- order_items.product_id -> products.id
CREATE INDEX IF NOT EXISTS idx_order_items_product_id
  ON public.order_items (product_id);

-- (Often useful for joins too; safe to add)
CREATE INDEX IF NOT EXISTS idx_order_items_order_id
  ON public.order_items (order_id);

-- product_images.product_id -> products.id
-- We also order by display_order in the app, so make it a covering index.
CREATE INDEX IF NOT EXISTS idx_product_images_product_id_order
  ON public.product_images (product_id, display_order);

-- product_keywords.product_id -> products.id
CREATE INDEX IF NOT EXISTS idx_product_keywords_product_id
  ON public.product_keywords (product_id);

-- products.category_id -> categories.id
CREATE INDEX IF NOT EXISTS idx_products_category_id
  ON public.products (category_id);

-- projects.category_id -> categories.id
CREATE INDEX IF NOT EXISTS idx_projects_category_id
  ON public.projects (category_id);


