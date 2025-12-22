-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE (Securely linked to auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT DEFAULT '/images/default-avatar.png',
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. CATEGORIES TABLE
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('project', 'product')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Seed Categories
INSERT INTO public.categories (name, slug, type) VALUES
  ('AI Images', 'ai-images', 'project'),
  ('AI Videos', 'ai-videos', 'project'),
  ('Digital Prints', 'digital-prints', 'product'),
  ('Source Material', 'source-material', 'product'),
  ('Assets', 'assets', 'product'),
  ('Blueprints', 'blueprints', 'product')
ON CONFLICT (slug) DO NOTHING;

-- 3. PROJECTS TABLE
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.categories(id),
  year TEXT,
  thumbnail TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  -- SEO Fields
  meta_title TEXT,
  meta_description TEXT,
  og_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 4. PROJECT MEDIA TABLE
CREATE TABLE public.project_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  video_provider TEXT CHECK (video_provider IN ('supabase', 'mux', 'youtube', 'vimeo', 'cloudflare')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.project_media ENABLE ROW LEVEL SECURITY;

-- 5. PRODUCTS TABLE
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  thumbnail TEXT,
  file_url TEXT, -- Path in private bucket
  paddle_product_id TEXT,
  paddle_price_id TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  -- SEO Fields
  meta_title TEXT,
  meta_description TEXT,
  og_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 6. PRODUCT IMAGES TABLE
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- 7. PRODUCT KEYWORDS TABLE
CREATE TABLE public.product_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.product_keywords ENABLE ROW LEVEL SECURITY;

-- 8. ORDERS TABLE
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  paddle_transaction_id TEXT UNIQUE,
  paddle_subscription_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'refunded', 'failed')),
  total DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  customer_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 9. ORDER ITEMS TABLE
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Idempotency for webhooks / purchases: prevent duplicates per order+product
ALTER TABLE public.order_items
  ADD CONSTRAINT order_items_order_id_product_id_unique UNIQUE (order_id, product_id);

-- 10. INQUIRIES TABLE
CREATE TABLE public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  project_type TEXT,
  budget TEXT,
  message TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

----------------------------------------------------------------
-- SECURITY & TRIGGERS
----------------------------------------------------------------

-- Helper Function: Check if user is super_admin via JWT Claim
-- This is much faster than querying the database for every request
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin-only aggregated stats for dashboards (used by RPC in the app)
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

-- Admin-only customer list with aggregated stats (used by RPC in the app)
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

-- Trigger: Automatically create public.users profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '/images/default-avatar.png')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

----------------------------------------------------------------
-- RLS POLICIES
----------------------------------------------------------------

-- USERS
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
-- Admins can view/manage all users
CREATE POLICY "Admins can view all profiles" ON public.users FOR SELECT USING (is_admin());

-- CATEGORIES
CREATE POLICY "Public view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (is_admin());

-- PROJECTS
CREATE POLICY "Public view published projects" ON public.projects FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage projects" ON public.projects FOR ALL USING (is_admin());

-- PROJECT MEDIA
CREATE POLICY "Public view project media" ON public.project_media FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_media.project_id AND is_published = true));
CREATE POLICY "Admins manage project media" ON public.project_media FOR ALL USING (is_admin());

-- PRODUCTS
CREATE POLICY "Public view published products" ON public.products FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage products" ON public.products FOR ALL USING (is_admin());

-- PRODUCT IMAGES & KEYWORDS
CREATE POLICY "Public view product details" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Admins manage product images" ON public.product_images FOR ALL USING (is_admin());
CREATE POLICY "Public view keywords" ON public.product_keywords FOR SELECT USING (true);
CREATE POLICY "Admins manage keywords" ON public.product_keywords FOR ALL USING (is_admin());

-- ORDERS
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all orders" ON public.orders FOR SELECT USING (is_admin());
CREATE POLICY "Service role manages orders" ON public.orders FOR ALL USING (is_admin()); -- Or service role

-- ORDER ITEMS
CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND user_id = auth.uid()));
CREATE POLICY "Admins view all order items" ON public.order_items FOR SELECT USING (is_admin());

-- INQUIRIES
CREATE POLICY "Admins manage inquiries" ON public.inquiries FOR ALL USING (is_admin());
CREATE POLICY "Public create inquiries" ON public.inquiries FOR INSERT WITH CHECK (true);

----------------------------------------------------------------
-- STORAGE BUCKETS (Setup in Dashboard, but here are policies)
----------------------------------------------------------------
-- Note: You must create 'public-assets' and 'product-files' buckets in the Storage dashboard first.

-- Policy for 'public-assets' (Public Read)
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'public-assets');
-- CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'public-assets' AND is_admin());

-- Policy for 'product-files' (Private, Admin Upload Only)
-- CREATE POLICY "Admin Upload Private" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-files' AND is_admin());
