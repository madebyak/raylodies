# Raylodies Backend & Database Architecture

## Executive Summary

This document outlines the recommended backend architecture for Raylodies, covering database design, authentication, admin dashboard, customer portal, and payment integration.

---

## Table of Contents

1. [Tech Stack Recommendation](#tech-stack-recommendation)
2. [User Roles & Permissions](#user-roles--permissions)
3. [Database Schema Design](#database-schema-design)
4. [Authentication Strategy](#authentication-strategy)
5. [Admin Dashboard Features](#admin-dashboard-features)
6. [Customer Portal Features](#customer-portal-features)
7. [File Storage Strategy](#file-storage-strategy)
8. [Payment Integration (Paddle)](#payment-integration-paddle)
9. [SEO Strategy for Product & Work Pages](#seo-strategy-for-product--work-pages)
10. [API Architecture](#api-architecture)
11. [Security Considerations](#security-considerations)
12. [Implementation Phases](#implementation-phases)

---

## Tech Stack Recommendation

### Primary Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Database** | Supabase (PostgreSQL) | Real-time, Row Level Security, excellent DX |
| **Auth** | Supabase Auth | Built-in, supports OAuth, magic links |
| **Storage** | Supabase Storage | Integrated with auth, CDN-ready |
| **Payments** | Paddle.com | Handles taxes, global payments, digital products |
| **API** | Next.js Server Actions + API Routes | Type-safe, serverless, integrated |
| **Admin UI** | Custom Next.js pages under `/admin` | Full control, matches site design |

### Why Supabase Over Alternatives?

1. **vs Firebase**: Better SQL support, open-source, PostgreSQL power
2. **vs Prisma + PlanetScale**: All-in-one solution, less configuration
3. **vs Custom Backend**: Faster development, built-in auth/storage
4. **vs Headless CMS**: More flexibility, no vendor lock-in

---

## User Roles & Permissions

### Role Hierarchy

```
┌─────────────────────────────────────────────────┐
│                    SUPER_ADMIN                   │
│         (Ranya - Full system access)             │
├─────────────────────────────────────────────────┤
│                     CUSTOMER                     │
│    (Registered users who purchase products)      │
├─────────────────────────────────────────────────┤
│                      GUEST                       │
│       (Anonymous visitors, browse only)          │
└─────────────────────────────────────────────────┘
```

### Permission Matrix

| Action | Guest | Customer | Super Admin |
|--------|-------|----------|-------------|
| View Work | ✅ | ✅ | ✅ |
| View Store | ✅ | ✅ | ✅ |
| Purchase Products | ❌ | ✅ | ✅ |
| View Purchase History | ❌ | ✅ (own) | ✅ (all) |
| Download Purchased Files | ❌ | ✅ (own) | ✅ |
| Access Dashboard | ❌ | ❌ | ✅ |
| Manage Work/Projects | ❌ | ❌ | ✅ |
| Manage Products | ❌ | ❌ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |
| View Analytics | ❌ | ❌ | ✅ |

---

## Database Schema Design

### Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    users     │       │   projects   │       │  categories  │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │       │ id (PK)      │
│ email        │       │ title        │       │ name         │
│ full_name    │       │ slug         │       │ slug         │
│ avatar_url   │       │ description  │       │ type         │
│ role         │       │ category_id  │──────▶│ created_at   │
│ created_at   │       │ year         │       └──────────────┘
│ updated_at   │       │ thumbnail    │
└──────────────┘       │ is_featured  │
        │              │ is_published │
        │              │ order        │
        │              │ created_at   │
        │              │ updated_at   │
        │              └──────────────┘
        │                     │
        │                     ▼
        │              ┌──────────────┐
        │              │project_media │
        │              ├──────────────┤
        │              │ id (PK)      │
        │              │ project_id   │
        │              │ type         │
        │              │ url          │
        │              │ order        │
        │              └──────────────┘
        │
        │              ┌──────────────┐       ┌──────────────┐
        │              │   products   │       │product_images│
        │              ├──────────────┤       ├──────────────┤
        │              │ id (PK)      │       │ id (PK)      │
        │              │ title        │       │ product_id   │
        │              │ slug         │       │ url          │
        │              │ description  │       │ order        │
        │              │ price        │       └──────────────┘
        │              │ category_id  │
        │              │ thumbnail    │       ┌──────────────┐
        │              │ file_url     │       │product_keywords│
        │              │ is_published │       ├──────────────┤
        │              │ paddle_id    │       │ id (PK)      │
        │              │ created_at   │       │ product_id   │
        │              │ updated_at   │       │ keyword      │
        │              └──────────────┘       └──────────────┘
        │                     │
        │                     │
        ▼                     ▼
┌──────────────┐       ┌──────────────┐
│   orders     │       │ order_items  │
├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │
│ user_id (FK) │◀──────│ order_id     │
│ paddle_txn   │       │ product_id   │
│ status       │       │ price        │
│ total        │       │ created_at   │
│ created_at   │       └──────────────┘
│ updated_at   │
└──────────────┘

┌──────────────┐
│   inquiries  │
├──────────────┤
│ id (PK)      │
│ name         │
│ email        │
│ project_type │
│ budget       │
│ message      │
│ status       │
│ created_at   │
└──────────────┘
```

### Detailed Table Schemas

#### `users` Table

> ⚠️ **CRITICAL**: The `users` table MUST reference `auth.users(id)` - NOT generate its own UUID!

```sql
-- ✅ CORRECT: References auth.users (Supabase's built-in auth table)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT DEFAULT '/images/default-avatar.png',
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ❌ WRONG: This breaks RLS because auth.uid() won't match!
-- id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```

**Why this matters:**
- Supabase Auth creates users in `auth.users` table
- Your `public.users` is a "profile" table extending auth
- `auth.uid()` in RLS policies returns the auth.users ID
- If you generate your own ID, `auth.uid() = id` will NEVER match!

**Auto-create profile on signup (Database Trigger):**
```sql
-- Trigger function to create profile when user signs up
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

-- Trigger that fires after auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

This trigger:
- Automatically creates a `public.users` row when someone signs up
- Syncs the avatar from Google OAuth if available
- Prevents "User not found" errors in your app

#### `categories` Table
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('project', 'product')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data
INSERT INTO categories (name, slug, type) VALUES
  ('AI Images', 'ai-images', 'project'),
  ('AI Videos', 'ai-videos', 'project'),
  ('Digital Prints', 'digital-prints', 'product'),
  ('Source Material', 'source-material', 'product'),
  ('Assets', 'assets', 'product'),
  ('Blueprints', 'blueprints', 'product');
```

> ⚠️ **ADMIN UI NOTE**: Filter categories by `type` in your forms!

The `type` field prevents mixing up project and product categories, but the database doesn't enforce this at the FK level. Your admin UI must filter:

```typescript
// In Project edit form - only show project categories
const { data: categories } = await supabase
  .from('categories')
  .select('*')
  .eq('type', 'project');

// In Product edit form - only show product categories
const { data: categories } = await supabase
  .from('categories')
  .select('*')
  .eq('type', 'product');
```

Without this, you could accidentally assign a product to "AI Images" (a project category).

#### `projects` Table
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id),
  year TEXT,
  thumbnail TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `project_media` Table
```sql
CREATE TABLE project_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- This table supports FLEXIBLE media per project:
-- ✅ Single image projects
-- ✅ Multiple image projects (gallery)
-- ✅ Single video projects
-- ✅ Mixed image + video projects
-- 
-- Example: A project with 3 images and 1 video
-- INSERT INTO project_media (project_id, type, url, display_order) VALUES
--   ('proj-uuid', 'image', 'https://...img1.jpg', 0),
--   ('proj-uuid', 'image', 'https://...img2.jpg', 1),
--   ('proj-uuid', 'video', 'https://...video.mp4', 2),
--   ('proj-uuid', 'image', 'https://...img3.jpg', 3);
```

#### `products` Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category_id UUID REFERENCES categories(id),
  thumbnail TEXT,
  file_url TEXT, -- Secure download URL
  paddle_product_id TEXT, -- Paddle.com product ID
  paddle_price_id TEXT, -- Paddle.com price ID
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `product_images` Table
```sql
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supports MULTIPLE gallery images per product
-- The 'thumbnail' in products table is the main/hero image
-- product_images stores additional gallery images for the product detail page
--
-- Example: Product with 4 gallery images
-- INSERT INTO product_images (product_id, url, display_order) VALUES
--   ('prod-uuid', 'https://...gallery1.jpg', 0),
--   ('prod-uuid', 'https://...gallery2.jpg', 1),
--   ('prod-uuid', 'https://...gallery3.jpg', 2),
--   ('prod-uuid', 'https://...gallery4.jpg', 3);
```

#### `product_keywords` Table
```sql
CREATE TABLE product_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `orders` Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  paddle_transaction_id TEXT UNIQUE,
  paddle_subscription_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'refunded', 'failed')),
  total DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  customer_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `order_items` Table
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `inquiries` Table (Contact Form)
```sql
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  project_type TEXT,
  budget TEXT,
  message TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Authentication Strategy

### Recommended Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  CUSTOMER SIGNUP/LOGIN                                       │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │ Magic Link  │ OR │   Google    │ OR │   Email +   │      │
│  │   (Email)   │    │   OAuth     │    │  Password   │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            ▼                                 │
│                   ┌─────────────────┐                        │
│                   │  Supabase Auth  │                        │
│                   │   (JWT Token)   │                        │
│                   └─────────────────┘                        │
│                            │                                 │
│                            ▼                                 │
│                   ┌─────────────────┐                        │
│                   │  Row Level      │                        │
│                   │  Security (RLS) │                        │
│                   └─────────────────┘                        │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ADMIN ACCESS (Super Admin Only)                             │
│  ┌─────────────────────────────────────────────────┐        │
│  │ 1. Login via Supabase Auth                      │        │
│  │ 2. Check role === 'super_admin'                 │        │
│  │ 3. Middleware protects /admin/* routes          │        │
│  │ 4. RLS policies enforce database access         │        │
│  └─────────────────────────────────────────────────┘        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Supabase Auth Configuration

```typescript
// Recommended auth options
const authOptions = {
  providers: ['google', 'email'],
  emailAuth: {
    enableMagicLink: true,
    enablePassword: true,
  },
  redirectTo: '/auth/callback',
};
```

### Protected Routes Middleware

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check for valid session and super_admin role
  }
  
  // Protect customer account routes
  if (request.nextUrl.pathname.startsWith('/account')) {
    // Check for valid session
  }
}
```

---

## Admin Dashboard Features (Comprehensive)

### Complete Dashboard URL Structure

```
/admin
├── /admin                        # Dashboard overview with analytics
├── /admin/analytics              # Detailed analytics & reports
│   ├── /admin/analytics/sales    # Sales analytics
│   └── /admin/analytics/traffic  # Traffic analytics (from GA)
├── /admin/projects               # Manage work/projects
│   ├── /admin/projects/new       # Create new project
│   └── /admin/projects/[id]      # Edit project
├── /admin/products               # Manage store products
│   ├── /admin/products/new       # Create new product
│   └── /admin/products/[id]      # Edit product
├── /admin/orders                 # View all orders
│   └── /admin/orders/[id]        # Order details + customer info
├── /admin/customers              # Customer list & details
│   └── /admin/customers/[id]     # Customer profile + order history
├── /admin/inquiries              # Contact form submissions
│   └── /admin/inquiries/[id]     # Inquiry details + reply
├── /admin/media                  # Media library (all uploads)
└── /admin/settings               # Site settings
    ├── /admin/settings/general   # Site name, logo, social links
    ├── /admin/settings/seo       # Default SEO settings
    └── /admin/settings/integrations  # Paddle, GA, etc.
```

---

### Page 1: Dashboard Overview (`/admin`)

The main dashboard provides an at-a-glance view of everything important.

#### Layout
```
┌─────────────────────────────────────────────────────────────────┐
│  SIDEBAR          │  MAIN CONTENT                               │
│  ──────────       │  ───────────────────────────────────────── │
│  📊 Dashboard     │  Good morning, Ranya 👋                     │
│  📈 Analytics     │                                             │
│  🎨 Projects      │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────┐│
│  🛒 Products      │  │ Revenue │ │ Orders  │ │ Customers│ │Inqui││
│  📦 Orders        │  │ $4,250  │ │   47    │ │   128   │ │  3  ││
│  👥 Customers     │  │ ↑ 12%   │ │ ↑ 8%    │ │ ↑ 15%   │ │ new ││
│  ✉️ Inquiries     │  └─────────┘ └─────────┘ └─────────┘ └─────┘│
│  🖼️ Media         │                                             │
│  ⚙️ Settings      │  ┌─────────────────────────────────────────┐│
│                   │  │  REVENUE CHART (Last 30 days)           ││
│                   │  │  📈 Line graph showing daily revenue    ││
│                   │  └─────────────────────────────────────────┘│
│                   │                                             │
│                   │  ┌──────────────────┐ ┌────────────────────┐│
│                   │  │ RECENT ORDERS    │ │ RECENT INQUIRIES   ││
│                   │  │ • Order #1234... │ │ • John: "I need.." ││
│                   │  │ • Order #1233... │ │ • Sarah: "Hello.." ││
│                   │  │ • Order #1232... │ │ • Mike: "Quick..." ││
│                   │  └──────────────────┘ └────────────────────┘│
│                   │                                             │
│                   │  ┌─────────────────────────────────────────┐│
│                   │  │ TOP SELLING PRODUCTS                    ││
│                   │  │ 1. Cinematic Landscapes - 23 sales      ││
│                   │  │ 2. Portrait Master - 18 sales           ││
│                   │  │ 3. Neon Cyberpunk - 12 sales            ││
│                   │  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

#### Key Metrics Cards

| Metric | Description | Comparison |
|--------|-------------|------------|
| **Revenue** | Total revenue this month | vs last month % |
| **Orders** | Total orders this month | vs last month % |
| **Customers** | New customers this month | vs last month % |
| **Inquiries** | Pending inquiries count | Badge if > 0 |
| **Conversion Rate** | Orders / Product Views | vs last month % |
| **Avg Order Value** | Revenue / Orders | vs last month % |

#### Dashboard Widgets

1. **Revenue Chart** - Line graph (last 30 days)
2. **Recent Orders** - Last 5 orders with status
3. **Recent Inquiries** - Last 5 with preview
4. **Top Products** - Best sellers this month
5. **Quick Actions** - Add Project, Add Product buttons

---

### Page 2: Analytics (`/admin/analytics`)

#### Sales Analytics (`/admin/analytics/sales`)

```
┌─────────────────────────────────────────────────────────────────┐
│  DATE RANGE PICKER: [Last 7 days ▼] [Custom Range]             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  REVENUE OVER TIME                                          ││
│  │  [Line Chart - Daily/Weekly/Monthly toggle]                 ││
│  │  Shows: Revenue, Orders count                               ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐│
│  │ REVENUE BY PRODUCT   │  │ REVENUE BY CATEGORY              ││
│  │ [Pie Chart]          │  │ [Bar Chart]                      ││
│  │ • Landscapes: 35%    │  │ Digital Prints ████████ 45%     ││
│  │ • Portraits: 28%     │  │ Assets ██████ 30%               ││
│  │ • Cyberpunk: 22%     │  │ Blueprints ████ 25%             ││
│  │ • Other: 15%         │  │                                  ││
│  └──────────────────────┘  └──────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ SALES TABLE                                                 ││
│  │ Product          | Units | Revenue | Avg Price | Trend     ││
│  │ ─────────────────────────────────────────────────────────── ││
│  │ Landscapes Pack  |   23  | $667    |   $29     |    ↑      ││
│  │ Portrait Master  |   18  | $702    |   $39     |    ↑      ││
│  │ Neon Cyberpunk   |   12  | $408    |   $34     |    →      ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [Export CSV] [Export PDF]                                       │
└─────────────────────────────────────────────────────────────────┘
```

**Metrics Available:**
- Total Revenue (with period comparison)
- Total Orders
- Average Order Value
- Refund Rate
- Revenue by Product
- Revenue by Category
- Revenue by Country (from Paddle data)
- Best/Worst Performing Products
- Sales Trends

#### Traffic Analytics (`/admin/analytics/traffic`)

This page displays data from **Google Analytics 4** (or alternative).

```
┌─────────────────────────────────────────────────────────────────┐
│  TRAFFIC OVERVIEW                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│  │ Visitors│ │Pageviews│ │Avg Time │ │Bounce % │               │
│  │  2,450  │ │  8,320  │ │  2:34   │ │  42%    │               │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘               │
│                                                                  │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐│
│  │ TRAFFIC SOURCES      │  │ TOP PAGES                        ││
│  │ [Pie Chart]          │  │ 1. /store - 2,100 views         ││
│  │ • Organic: 45%       │  │ 2. /work - 1,800 views          ││
│  │ • Direct: 30%        │  │ 3. /store/landscapes - 890      ││
│  │ • Social: 15%        │  │ 4. /about - 650 views           ││
│  │ • Referral: 10%      │  │ 5. /work/neon-futures - 420     ││
│  └──────────────────────┘  └──────────────────────────────────┘│
│                                                                  │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐│
│  │ GEOGRAPHY            │  │ DEVICES                          ││
│  │ [World Map]          │  │ [Donut Chart]                    ││
│  │ 🇺🇸 USA: 35%         │  │ • Desktop: 58%                   ││
│  │ 🇬🇧 UK: 15%          │  │ • Mobile: 38%                    ││
│  │ 🇩🇪 Germany: 10%     │  │ • Tablet: 4%                     ││
│  └──────────────────────┘  └──────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

### Analytics Integration Options

#### Option 1: Google Analytics 4 (Recommended)

**Pros:**
- Free and powerful
- Industry standard
- E-commerce tracking
- Audience insights
- Conversion funnels

**Integration:**
```typescript
// app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
      <GoogleAnalytics gaId="G-XXXXXXXXXX" />
    </html>
  );
}
```

**E-commerce Events to Track:**
```typescript
// Track product view
gtag('event', 'view_item', {
  currency: 'USD',
  value: 29.00,
  items: [{
    item_id: 'product-123',
    item_name: 'Cinematic Landscapes',
    price: 29.00,
  }]
});

// Track purchase (after Paddle webhook)
gtag('event', 'purchase', {
  transaction_id: 'txn_123',
  value: 29.00,
  currency: 'USD',
  items: [...]
});
```

**Display in Admin Dashboard:**
- Use **Google Analytics Data API** to fetch data
- Or embed GA4 reports via iframe (simpler)
- Or use a library like `@google-analytics/data`

#### Option 2: Vercel Analytics (If hosting on Vercel)

**Pros:**
- Zero config
- Privacy-focused
- Real-time
- Core Web Vitals

**Integration:**
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

#### Option 3: Plausible (Privacy-Focused Alternative)

**Pros:**
- GDPR compliant (no cookie banner needed)
- Simple, clean dashboard
- Self-hostable or cloud
- Lightweight (< 1KB)

**Cons:**
- Paid ($9/month for 10k views)
- Less detailed than GA4

#### Option 4: PostHog (Product Analytics)

**Pros:**
- Session recordings
- Feature flags
- A/B testing
- Funnels
- Self-hostable

**Best for:** If you want to see how users interact with the site.

### Recommended Analytics Stack

| Tool | Purpose | Cost |
|------|---------|------|
| **Google Analytics 4** | Traffic, audience, conversions | Free |
| **Vercel Analytics** | Performance, Core Web Vitals | Free tier |
| **Custom Dashboard** | Sales data from Supabase | Built-in |

**Why this combo?**
1. **GA4** handles traffic analytics (no need to rebuild this)
2. **Vercel Analytics** for performance monitoring
3. **Custom dashboard** for sales/order data from your database

---

### Page 3: Projects Management (`/admin/projects`)

#### List View
```
┌─────────────────────────────────────────────────────────────────┐
│  PROJECTS                                    [+ New Project]     │
├─────────────────────────────────────────────────────────────────┤
│  Search: [_______________]  Category: [All ▼]  Status: [All ▼] │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────┬────────────────────┬──────────┬────────┬─────┬───────┐│
│  │ ⋮⋮  │ Project            │ Category │ Year   │ Pub │ Actions││
│  ├─────┼────────────────────┼──────────┼────────┼─────┼───────┤│
│  │ ⋮⋮  │ 🖼️ Ethereal Land... │ AI Images│ 2024   │ ✅  │ ✏️ 🗑️ ││
│  │ ⋮⋮  │ 🖼️ Neon Futures     │ AI Images│ 2024   │ ✅  │ ✏️ 🗑️ ││
│  │ ⋮⋮  │ 🎬 Abstract Motion  │ AI Videos│ 2024   │ ❌  │ ✏️ 🗑️ ││
│  │ ⋮⋮  │ 🖼️ Digital Portraits│ AI Images│ 2023   │ ✅  │ ✏️ 🗑️ ││
│  └─────┴────────────────────┴──────────┴────────┴─────┴───────┘│
│                                                                  │
│  ⋮⋮ = Drag handle for reordering                               │
│  Showing 1-10 of 24 projects                    [< 1 2 3 >]     │
└─────────────────────────────────────────────────────────────────┘
```

#### Edit View (`/admin/projects/[id]`)
```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Projects           EDIT PROJECT            [Save]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  BASIC INFO                                                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Title: [Ethereal Landscapes___________________________]     ││
│  │ Slug:  [ethereal-landscapes] (auto-generated)               ││
│  │ Year:  [2024]  Category: [AI Images ▼]  Featured: [✓]       ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  DESCRIPTION                                                     │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ [Rich text editor with formatting options]                  ││
│  │ A collection of dreamlike landscapes generated through...   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  THUMBNAIL                                                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ [🖼️ Current thumbnail preview]        [Upload New]          ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  MEDIA GALLERY                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ [+ Add Images]  [+ Add Video]                               ││
│  │                                                              ││
│  │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                            ││
│  │ │ 🖼️1 │ │ 🖼️2 │ │ 🎬3 │ │ 🖼️4 │  (drag to reorder)         ││
│  │ │  ✕  │ │  ✕  │ │  ✕  │ │  ✕  │                            ││
│  │ └─────┘ └─────┘ └─────┘ └─────┘                            ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  SEO SETTINGS                                                    │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Meta Title: [Ethereal Landscapes | Raylodies__________]     ││
│  │ Meta Description: [A collection of dreamlike landscapes...] ││
│  │ OG Image: [Use thumbnail ▼] or [Upload custom]              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  PUBLISH SETTINGS                                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Status: (○) Draft  (●) Published                            ││
│  │ Created: Dec 10, 2024    Last Updated: Dec 14, 2024        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [Delete Project]                                    [Save]      │
└─────────────────────────────────────────────────────────────────┘
```

---

### Page 4: Products Management (`/admin/products`)

Similar to Projects but with additional fields:

#### Product Edit View
```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Products          EDIT PRODUCT            [Save]     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  BASIC INFO                                                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Title: [Cinematic Landscapes Preset Pack________________]   ││
│  │ Slug:  [cinematic-landscapes-preset]                        ││
│  │ Category: [Digital Prints ▼]                                ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  PRICING                                                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Price: $ [29.00]  Currency: [USD ▼]                         ││
│  │                                                              ││
│  │ PADDLE INTEGRATION                                          ││
│  │ Paddle Price ID: [pri_01abc123...] [Verify ✓]               ││
│  │ Status: ✅ Synced with Paddle                                ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  DESCRIPTION (Long-form for SEO)                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ [Rich text editor - 300+ words recommended for SEO]        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  KEYWORDS / TAGS                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ [landscapes] [cinematic] [prompts] [+ Add]                  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  IMAGES                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Thumbnail (Main):  [🖼️ Preview]  [Upload]                   ││
│  │ Gallery Images:    [🖼️1] [🖼️2] [🖼️3] [+ Add]                ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  DOWNLOADABLE FILE                                               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Current File: Cinematic-Landscapes-v1.0.zip (24.5 MB)       ││
│  │ [Upload New Version]                                        ││
│  │                                                              ││
│  │ ⚠️ Uploading new file will replace the existing one.        ││
│  │ Customers who purchased will get the new version.           ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  SEO SETTINGS (Same as Projects)                                │
│  PUBLISH SETTINGS (Same as Projects)                            │
│                                                                  │
│  [Delete Product]                                    [Save]      │
└─────────────────────────────────────────────────────────────────┘
```

---

### Page 5: Orders (`/admin/orders`)

```
┌─────────────────────────────────────────────────────────────────┐
│  ORDERS                                                          │
├─────────────────────────────────────────────────────────────────┤
│  Search: [_______________]  Status: [All ▼]  Date: [All Time ▼]│
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────┬─────────────────┬─────────┬────────┬───────────┐│
│  │ Order ID  │ Customer        │ Total   │ Status │ Date      ││
│  ├───────────┼─────────────────┼─────────┼────────┼───────────┤│
│  │ #ORD-1234 │ john@email.com  │ $29.00  │ ✅ Paid│ Dec 14    ││
│  │ #ORD-1233 │ sarah@email.com │ $68.00  │ ✅ Paid│ Dec 13    ││
│  │ #ORD-1232 │ mike@email.com  │ $39.00  │ 🔄 Refund│ Dec 12  ││
│  │ #ORD-1231 │ anna@email.com  │ $34.00  │ ✅ Paid│ Dec 11    ││
│  └───────────┴─────────────────┴─────────┴────────┴───────────┘│
│                                                                  │
│  [Export CSV]                               Showing 1-20 of 47  │
└─────────────────────────────────────────────────────────────────┘
```

#### Order Detail View (`/admin/orders/[id]`)
- Order summary
- Customer info (link to customer profile)
- Products purchased
- Payment details (Paddle transaction ID)
- Download history (if tracked)
- Refund button (triggers Paddle API)

---

### Page 6: Customers (`/admin/customers`)

```
┌─────────────────────────────────────────────────────────────────┐
│  CUSTOMERS                                                       │
├─────────────────────────────────────────────────────────────────┤
│  Search: [_______________]                                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────┬───────────┬──────────┬─────────────┐│
│  │ Customer               │ Orders    │ Spent    │ Joined      ││
│  ├────────────────────────┼───────────┼──────────┼─────────────┤│
│  │ 👤 john@email.com      │     3     │  $97.00  │ Dec 1, 2024 ││
│  │ 👤 sarah@email.com     │     2     │  $68.00  │ Nov 28, 2024││
│  │ 👤 mike@email.com      │     1     │  $39.00  │ Nov 15, 2024││
│  └────────────────────────┴───────────┴──────────┴─────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

#### Customer Detail (`/admin/customers/[id]`)
- Profile info
- Order history
- Total lifetime value
- Download history
- Notes (admin can add notes about customer)

---

### Page 7: Inquiries (`/admin/inquiries`)

```
┌─────────────────────────────────────────────────────────────────┐
│  INQUIRIES                                        3 new          │
├─────────────────────────────────────────────────────────────────┤
│  Status: [All ▼]  Type: [All ▼]                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────┬────────────────────────────┬──────────┬────────────┐│
│  │ Status │ From                       │ Type     │ Date       ││
│  ├────────┼────────────────────────────┼──────────┼────────────┤│
│  │ 🔴 New │ john@email.com             │ Branding │ 2 hrs ago  ││
│  │        │ "I'm looking for help..." │          │            ││
│  ├────────┼────────────────────────────┼──────────┼────────────┤│
│  │ 🟡 Read│ sarah@email.com            │ AI Video │ 1 day ago  ││
│  │        │ "Hi, I have a project..." │          │            ││
│  ├────────┼────────────────────────────┼──────────┼────────────┤│
│  │ 🟢 Done│ mike@email.com             │ Consult  │ 3 days ago ││
│  │        │ "Quick question about..." │          │            ││
│  └────────┴────────────────────────────┴──────────┴────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

#### Inquiry Detail (`/admin/inquiries/[id]`)
- Full message
- Customer info
- Budget range
- Project type
- Quick reply (opens email client or sends from app)
- Status toggle (New → Read → Replied → Archived)
- Notes

---

### Page 8: Settings (`/admin/settings`)

#### General Settings
- Site name
- Logo upload
- Contact email
- Social media links (Instagram, Twitter, LinkedIn)
- Default currency

#### SEO Settings
- Default meta title template
- Default meta description
- Default OG image
- Google Search Console verification

#### Integration Settings
- **Paddle**
  - API Key (masked)
  - Webhook Secret (masked)
  - Environment (Sandbox/Production)
  - Test connection button
  
- **Google Analytics**
  - GA4 Measurement ID
  - Enable/Disable toggle
  
- **Email (Future)**
  - SMTP settings or Resend API key
  - Email templates

---

### Database Tables for Analytics

```sql
-- Optional: Track page views for internal analytics
CREATE TABLE page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: Track product views for conversion rate
CREATE TABLE product_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for fast queries
CREATE INDEX idx_page_views_date ON page_views(created_at);
CREATE INDEX idx_product_views_product ON product_views(product_id);
```

---

### Admin Dashboard Tech Stack

| Component | Technology |
|-----------|------------|
| **Charts** | Recharts or Chart.js |
| **Tables** | TanStack Table (sorting, filtering, pagination) |
| **Forms** | React Hook Form + Zod validation |
| **Rich Text** | Tiptap or Slate |
| **Drag & Drop** | @dnd-kit/core |
| **Date Picker** | react-day-picker |
| **File Upload** | react-dropzone |
| **Toasts** | Sonner |
| **Modals** | Radix UI Dialog |

### Project Management Features

- Create/Edit/Delete projects
- Upload multiple images/videos
- Set featured projects
- Publish/Unpublish toggle
- Drag-and-drop reordering
- Category assignment
- SEO fields (meta description, etc.)

### Product Management Features

- Create/Edit/Delete products
- Upload thumbnail and gallery images
- Upload downloadable files (securely)
- Set pricing
- Sync with Paddle.com
- Keywords/tags management
- Category assignment
- Publish/Unpublish toggle

---

## Customer Portal Features

### Customer URL Structure

```
/account
├── /account                  # Account overview
├── /account/purchases        # Purchase history
│   └── /account/purchases/[id]  # Order details + downloads
├── /account/settings         # Profile settings
└── /account/downloads        # All downloadable files
```

### Customer Features

1. **Easy Onboarding**
   - Simple signup (Magic Link recommended)
   - No password to remember
   - Optional: Google OAuth

2. **Purchase History**
   - List of all orders
   - Order status
   - Download links for purchased products

3. **Profile Management**
   - Update name
   - Update email
   - Delete account option

---

## File Storage Strategy

### Storage Provider Comparison

| Provider | Free Tier | Pricing | Best For | Recommendation |
|----------|-----------|---------|----------|----------------|
| **Supabase Storage** | 1GB | $0.021/GB/month | Integrated solution | ✅ **Recommended** |
| **Vercel Blob** | 1GB | $0.15/GB/month | Edge delivery | Alternative |
| **Cloudinary** | 25GB | Complex pricing | Image transforms | Overkill |
| **AWS S3** | 5GB (12mo) | $0.023/GB/month | Enterprise scale | Too complex |

### Why Supabase Storage?

1. **Already using Supabase** - No additional service to manage
2. **RLS Integration** - Secure private files with database policies
3. **CDN Built-in** - Fast global delivery via Supabase CDN
4. **Handles Both** - Images AND videos up to 5GB per file
5. **Simple API** - Easy upload from Next.js Server Actions
6. **Cost Effective** - 1GB free, then very affordable scaling

### Video Hosting Strategy

> ⚠️ **IMPORTANT**: Supabase Storage is NOT a video streaming server!

**The Problem:**
- Supabase serves files as direct downloads
- A 100MB video must download significantly before playback starts
- No adaptive bitrate streaming (quality doesn't adjust to internet speed)
- No HLS/DASH support

**When Supabase Storage is OK for videos:**
- ✅ Short loops (< 10 seconds, < 20MB)
- ✅ Background videos that can buffer
- ✅ Downloadable video products (not streaming)

**When you need a dedicated video service:**
- ❌ Long-form portfolio videos (> 30 seconds)
- ❌ Cinematic showreels
- ❌ Videos that need instant playback
- ❌ Mobile users on slow connections

#### Recommended Video Hosting Options

| Service | Best For | Pricing | Features |
|---------|----------|---------|----------|
| **Mux** | Professional streaming | $0.007/min watched | HLS, analytics, thumbnails |
| **Cloudflare Stream** | Simple & cheap | $5/1000 min stored | HLS, no egress fees |
| **YouTube/Vimeo** | Free embedding | Free | Easy, but branded |
| **Bunny Stream** | Budget option | $0.005/min | HLS, global CDN |

#### Hybrid Approach (Recommended)

```
┌─────────────────────────────────────────────────────────────┐
│  STORAGE STRATEGY                                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  SUPABASE STORAGE (public-assets bucket)                    │
│  ├── Images (thumbnails, galleries) ✅                      │
│  ├── Short video loops (< 10s, hero backgrounds) ✅         │
│  └── Downloadable files (.zip products) ✅                  │
│                                                              │
│  MUX / CLOUDFLARE STREAM                                    │
│  └── Long portfolio videos (showreels, project videos) ✅   │
│      - Adaptive streaming                                   │
│      - Instant playback                                     │
│      - Mobile-optimized                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Database Schema for Video URLs

```sql
-- In project_media table, store either:
-- 1. Supabase URL for images/short clips
-- 2. Mux playback ID for streaming videos

ALTER TABLE project_media ADD COLUMN video_provider TEXT 
  CHECK (video_provider IN ('supabase', 'mux', 'cloudflare', 'youtube', 'vimeo'));

-- Example entries:
-- type: 'image', url: 'https://xxx.supabase.co/storage/...', video_provider: NULL
-- type: 'video', url: 'short-loop.mp4', video_provider: 'supabase'
-- type: 'video', url: 'a1b2c3d4e5', video_provider: 'mux' (this is the Mux playback ID)
```

#### Video Player Component

```typescript
// components/VideoPlayer.tsx
import MuxPlayer from '@mux/mux-player-react';

export function VideoPlayer({ 
  url, 
  provider 
}: { 
  url: string; 
  provider: 'supabase' | 'mux' | 'youtube' 
}) {
  if (provider === 'mux') {
    return <MuxPlayer playbackId={url} />;
  }
  
  if (provider === 'youtube') {
    return <iframe src={`https://youtube.com/embed/${url}`} />;
  }
  
  // Supabase / direct URL
  return <video src={url} controls />;
}
```

### Supabase Storage Buckets

```
┌─────────────────────────────────────────────────────────────┐
│                    STORAGE BUCKETS                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  PUBLIC BUCKET: "public-assets"                              │
│  ├── /projects/{project_id}/thumbnail.jpg                   │
│  ├── /projects/{project_id}/media/{filename}                │
│  ├── /products/{product_id}/thumbnail.jpg                   │
│  ├── /products/{product_id}/gallery/{filename}              │
│  └── /site/logo.svg, hero-video.mp4, etc.                   │
│                                                              │
│  Access: Public (CDN cached)                                 │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  PRIVATE BUCKET: "product-files"                             │
│  └── /products/{product_id}/files/{filename}                │
│                                                              │
│  Access: Authenticated users who purchased the product       │
│  Delivery: Signed URLs (time-limited, 1 hour expiry)         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Downloadable Product Files (.zip)

**Where to store:** Private Supabase Storage bucket `product-files`

**File structure:**
```
product-files/                          # PRIVATE BUCKET
├── products/
│   ├── cinematic-landscapes-preset/
│   │   └── Cinematic-Landscapes-Pack-v1.0.zip
│   ├── portrait-master-prompts/
│   │   └── Portrait-Master-Prompts-v2.1.zip
│   └── neon-cyberpunk-collection/
│       └── Neon-Cyberpunk-Collection.zip
```

**Database storage:**
```sql
-- The file_url in products table stores the path within the bucket
UPDATE products 
SET file_url = 'products/cinematic-landscapes-preset/Cinematic-Landscapes-Pack-v1.0.zip'
WHERE slug = 'cinematic-landscapes-preset';
```

**Why Supabase Storage for .zip files?**
| Feature | Supabase Storage |
|---------|------------------|
| Max file size | **5GB per file** ✅ (plenty for .zip) |
| Private buckets | ✅ Yes, with RLS |
| Signed URLs | ✅ Time-limited access |
| CDN delivery | ✅ Fast downloads globally |
| Cost | $0.021/GB/month after 1GB free |

**Alternative for very large files (>5GB):**
- Use **Backblaze B2** + Cloudflare R2 (S3-compatible, cheaper)
- But for typical preset/asset .zip files (10MB - 500MB), Supabase is perfect

### Secure Download Flow

```
Customer clicks "Download"
         │
         ▼
┌─────────────────────────┐
│ 1. API Route: /api/downloads/[productId]
│    - Verify user is authenticated
│    - Check order_items table for purchase
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ 2. If verified, generate signed URL
│    from Supabase Storage
│    (60 minute expiry)
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ 3. Redirect user to signed URL
│    Browser downloads the .zip
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ 4. After 60 mins, URL expires
│    (Cannot be shared/resold)
└─────────────────────────┘
```

### Download API Implementation

```typescript
// app/api/downloads/[productId]/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  // 1. Get authenticated user
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { cookies }
  );
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 2. Verify user purchased this product
  const { data: purchase } = await supabase
    .from('order_items')
    .select(`
      id,
      order:orders!inner(user_id, status),
      product:products!inner(file_url, title)
    `)
    .eq('product_id', params.productId)
    .eq('order.user_id', user.id)
    .eq('order.status', 'completed')
    .single();
  
  if (!purchase) {
    return NextResponse.json(
      { error: 'Product not purchased' }, 
      { status: 403 }
    );
  }
  
  // 3. Generate signed URL (60 minute expiry)
  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role for storage access
  );
  
  const { data: signedUrl, error } = await supabaseAdmin
    .storage
    .from('product-files')
    .createSignedUrl(purchase.product.file_url, 3600); // 3600 seconds = 1 hour
  
  if (error || !signedUrl) {
    return NextResponse.json(
      { error: 'Failed to generate download' }, 
      { status: 500 }
    );
  }
  
  // 4. Redirect to signed URL (browser will download)
  return NextResponse.redirect(signedUrl.signedUrl);
}
```

### Storage Bucket Setup (Supabase Dashboard)

1. **Create private bucket:**
   - Go to Supabase Dashboard → Storage
   - Create new bucket: `product-files`
   - Set to **Private** (not public)

2. **RLS Policy for bucket:**
   ```sql
   -- Only allow service role to access (via API)
   -- No direct user access to this bucket
   CREATE POLICY "Service role only"
   ON storage.objects FOR ALL
   USING (bucket_id = 'product-files' AND auth.role() = 'service_role');
   ```

3. **Upload files via Admin Dashboard:**
   - Admin uploads .zip in product edit form
   - Server Action uses service role to upload to bucket
   - Stores the path in `products.file_url`

### Admin Upload Implementation

```typescript
// actions/products.ts
'use server'

import { createClient } from '@supabase/supabase-js';

export async function uploadProductFile(productId: string, formData: FormData) {
  // Use service role for admin operations
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const file = formData.get('file') as File;
  const fileName = `products/${productId}/${file.name}`;
  
  // Upload to private bucket
  const { error } = await supabase.storage
    .from('product-files')
    .upload(fileName, file, {
      upsert: true, // Replace if exists
    });
  
  if (error) throw error;
  
  // Update product with file path
  await supabase
    .from('products')
    .update({ file_url: fileName })
    .eq('id', productId);
  
  return { success: true };
}
```

---

## Payment Integration (Paddle)

### Why Paddle Over Stripe?

| Feature | Paddle | Stripe |
|---------|--------|--------|
| **Merchant of Record** | ✅ Yes (handles everything) | ❌ No (you handle taxes) |
| **Tax Compliance** | ✅ Automatic global VAT/GST | ❌ Stripe Tax (extra setup) |
| **Invoicing** | ✅ Paddle handles | ❌ You handle |
| **Chargebacks** | ✅ Paddle handles | ❌ You handle |
| **Digital Products** | ✅ Designed for this | ✅ Works but generic |
| **Setup Complexity** | ✅ Simple | ⚠️ More configuration |
| **Fees** | 5% + $0.50 | 2.9% + $0.30 |

**Verdict:** For digital products sold globally, Paddle's higher fee is worth it because it eliminates tax compliance headaches.

### Paddle Billing (Latest API - 2024)

Paddle has two APIs:
- **Paddle Classic** (Legacy) - Being phased out
- **Paddle Billing** (Current) - Use this one ✅

### Setup Requirements

1. **Paddle Account**: https://paddle.com (sandbox available for testing)
2. **API Keys**: 
   - `PADDLE_API_KEY` (Server-side)
   - `PADDLE_CLIENT_TOKEN` (Client-side, for Paddle.js)
3. **Webhook Secret**: For verifying webhook signatures

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=your_client_token
PADDLE_API_KEY=your_api_key
PADDLE_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox  # or 'production'
```

### Paddle.js Integration (Frontend)

```typescript
// lib/paddle/client.ts
import { initializePaddle, Paddle } from '@paddle/paddle-js';

let paddleInstance: Paddle | null = null;

export async function getPaddle(): Promise<Paddle> {
  if (paddleInstance) return paddleInstance;
  
  paddleInstance = await initializePaddle({
    environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as 'sandbox' | 'production',
    token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
  });
  
  return paddleInstance;
}

// Open checkout
export async function openCheckout(priceId: string, customerEmail?: string) {
  const paddle = await getPaddle();
  
  paddle.Checkout.open({
    items: [{ priceId, quantity: 1 }],
    customer: customerEmail ? { email: customerEmail } : undefined,
    settings: {
      displayMode: 'overlay',
      theme: 'dark',
      successUrl: `${window.location.origin}/checkout/success?txn={transaction_id}`,
    },
  });
}
```

### Checkout Component

> ⚠️ **CRITICAL**: Always pass the logged-in user's ID as `customData` to Paddle!

**Why?** The customer might use a different email at checkout (e.g., billing@company.com) than their login email (dev@personal.com). If you only match by email, they won't get access to their purchase!

```typescript
// components/store/BuyButton.tsx
'use client';

import { openCheckout } from '@/lib/paddle/client';
import { useUser } from '@/hooks/useUser'; // Your auth hook

export function BuyButton({ 
  priceId, 
  productId,
}: { 
  priceId: string; 
  productId: string;
}) {
  const { user } = useUser();
  
  const handleBuy = async () => {
    if (!user) {
      // Redirect to login first
      window.location.href = '/login?redirect=/store/' + productId;
      return;
    }
    
    await openCheckout(priceId, {
      userId: user.id,        // ✅ CRITICAL: Pass user ID
      userEmail: user.email,  // For reference
      productId: productId,   // For webhook processing
    });
  };
  
  return (
    <button onClick={handleBuy}>
      Buy Now
    </button>
  );
}
```

**Updated openCheckout function:**
```typescript
// lib/paddle/client.ts
export async function openCheckout(
  priceId: string, 
  customData: { userId: string; userEmail: string; productId: string }
) {
  const paddle = await getPaddle();
  
  paddle.Checkout.open({
    items: [{ priceId, quantity: 1 }],
    customData: customData,  // ✅ Pass user ID to webhook
    customer: { email: customData.userEmail },
    settings: {
      displayMode: 'overlay',
      theme: 'dark',
      successUrl: `${window.location.origin}/checkout/success?txn={transaction_id}`,
    },
  });
}
```
```

### Paddle Integration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    CHECKOUT FLOW                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Customer clicks "Buy" on product page                    │
│         │                                                    │
│         ▼                                                    │
│  2. Initialize Paddle.js with client token                   │
│         │                                                    │
│         ▼                                                    │
│  3. Open Paddle Checkout Overlay                             │
│     paddle.Checkout.open({                                   │
│       items: [{ priceId: 'pri_xxx', quantity: 1 }],         │
│       customer: { email: 'user@example.com' },              │
│     })                                                       │
│         │                                                    │
│         ▼                                                    │
│  4. Customer completes payment in Paddle                     │
│         │                                                    │
│         ▼                                                    │
│  5. Paddle sends webhook to /api/webhooks/paddle             │
│     Event: "transaction.completed"                           │
│         │                                                    │
│         ▼                                                    │
│  6. Webhook handler:                                         │
│     - Verify signature with PADDLE_WEBHOOK_SECRET            │
│     - Extract customer email, transaction ID                 │
│     - Create/update user if needed                           │
│     - Create order record                                    │
│     - Create order_items                                     │
│     - Grant download access                                  │
│         │                                                    │
│         ▼                                                    │
│  7. Customer redirected to success page                      │
│     successUrl: /checkout/success?txn={transaction_id}       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Webhook Handler

```typescript
// app/api/webhooks/paddle/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for webhooks
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('paddle-signature');
  
  // 1. Verify webhook signature
  if (!verifyPaddleSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  const event = JSON.parse(body);
  
  // 2. Handle event types
  switch (event.event_type) {
    case 'transaction.completed':
      await handleTransactionCompleted(event.data);
      break;
    case 'transaction.refunded':
      await handleTransactionRefunded(event.data);
      break;
  }
  
  return NextResponse.json({ received: true });
}

async function handleTransactionCompleted(data: any) {
  const { id, customer, items, details, custom_data } = data;
  
  // ✅ CRITICAL: Use userId from customData first, fallback to email matching
  let userId: string | null = null;
  
  // Priority 1: Use the logged-in user ID we passed to Paddle
  if (custom_data?.userId) {
    // Verify this user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', custom_data.userId)
      .single();
    
    if (existingUser) {
      userId = existingUser.id;
    }
  }
  
  // Priority 2: Fallback to email matching (for guest checkout or edge cases)
  if (!userId) {
    const { data: userByEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', customer.email)
      .single();
    
    if (userByEmail) {
      userId = userByEmail.id;
    } else {
      // Create new user (guest checkout scenario)
      // Note: This creates a user without auth.users entry
      // Consider sending them an invite to claim their account
      const { data: newUser } = await supabase
        .from('users')
        .insert({ 
          id: crypto.randomUUID(), // Only for guest checkout!
          email: customer.email 
        })
        .select('id')
        .single();
      userId = newUser?.id || null;
    }
  }
  
  if (!userId) {
    console.error('Failed to identify user for transaction:', id);
    return;
  }
  
  // Create order
  const { data: order } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      paddle_transaction_id: id,
      status: 'completed',
      total: details.totals.total / 100, // Paddle uses cents
      currency: details.totals.currency_code,
      customer_email: customer.email,
    })
    .select('id')
    .single();
  
  // Create order items
  for (const item of items) {
    // Map Paddle price_id to our product
    const { data: product } = await supabase
      .from('products')
      .select('id')
      .eq('paddle_price_id', item.price.id)
      .single();
      
    if (product) {
      await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: product.id,
        price: item.price.unit_price.amount / 100,
      });
    }
  }
  
  // Optional: Send confirmation email
  // await sendOrderConfirmationEmail(customer.email, order.id);
}

function verifyPaddleSignature(payload: string, signature: string | null): boolean {
  if (!signature) return false;
  
  const secret = process.env.PADDLE_WEBHOOK_SECRET!;
  const parts = signature.split(';');
  const timestamp = parts.find(p => p.startsWith('ts='))?.split('=')[1];
  const hash = parts.find(p => p.startsWith('h1='))?.split('=')[1];
  
  const signedPayload = `${timestamp}:${payload}`;
  const expectedHash = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');
  
  return hash === expectedHash;
}
```

### Paddle Webhook Events to Handle

| Event | Action |
|-------|--------|
| `transaction.completed` | Create order, grant download access |
| `transaction.refunded` | Update order status to 'refunded', revoke access |
| `transaction.payment_failed` | Log failure, notify user |
| `customer.created` | Sync customer to users table |
| `customer.updated` | Update user email if changed |

### Product Setup in Paddle

1. **Create Product in Paddle Dashboard**
   - Name: "Cinematic Landscapes Preset Pack"
   - Type: One-time purchase
   - Tax category: "Digital Goods"

2. **Create Price for Product**
   - Amount: $29.00
   - Currency: USD
   - Copy the `price_id` (e.g., `pri_01abc123...`)

3. **Store in Database**
   ```sql
   UPDATE products 
   SET paddle_price_id = 'pri_01abc123...'
   WHERE slug = 'cinematic-landscapes-preset';
   ```

### Testing with Paddle Sandbox

1. Use `sandbox` environment in Paddle
2. Test card: `4242 4242 4242 4242`
3. Any future expiry, any CVV
4. Webhooks work in sandbox too (use ngrok for local testing)

---

## API Architecture

### Next.js Server Actions (Recommended)

```typescript
// app/actions/projects.ts
'use server'

export async function createProject(formData: FormData) {
  // Verify admin role
  // Validate input
  // Upload files to Supabase Storage
  // Insert into database
  // Revalidate cache
}

export async function updateProject(id: string, formData: FormData) { ... }
export async function deleteProject(id: string) { ... }
```

### API Routes (For Webhooks & External)

```
/api
├── /api/webhooks
│   └── /api/webhooks/paddle    # Paddle payment webhooks
├── /api/downloads
│   └── /api/downloads/[id]     # Generate signed download URL
└── /api/contact                # Contact form submission
```

### Data Fetching Strategy

| Location | Method | Caching |
|----------|--------|---------|
| Public pages (Work, Store) | Server Components + fetch | ISR (revalidate: 3600) |
| Admin pages | Server Components | No cache (dynamic) |
| Customer account | Server Components | No cache (dynamic) |
| Real-time updates | Supabase Realtime | N/A |

---

## SEO Strategy for Product & Work Pages

### Critical SEO Elements (Must Have)

#### 1. Dynamic Meta Tags (Next.js Metadata API)

```typescript
// app/store/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProduct(params.slug);
  
  return {
    title: `${product.title} | Raylodies Store`,
    description: product.description.slice(0, 160),
    keywords: product.keywords.join(', '),
    
    // Open Graph (Facebook, LinkedIn)
    openGraph: {
      title: product.title,
      description: product.description,
      images: [
        {
          url: product.thumbnail,
          width: 1200,
          height: 630,
          alt: product.title,
        }
      ],
      type: 'product',
      siteName: 'Raylodies',
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: product.description,
      images: [product.thumbnail],
    },
    
    // Canonical URL (prevents duplicate content)
    alternates: {
      canonical: `https://raylodies.com/store/${params.slug}`,
    },
  };
}
```

#### 2. JSON-LD Structured Data (Google Rich Results)

```typescript
// components/seo/ProductJsonLd.tsx
export function ProductJsonLd({ product }: { product: Product }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images,
    brand: {
      '@type': 'Brand',
      name: 'Raylodies',
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: `https://raylodies.com/store/${product.slug}`,
      seller: {
        '@type': 'Organization',
        name: 'Raylodies',
      },
    },
    // For digital products
    isAccessibleForFree: false,
    category: product.category,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
```

#### 3. Work/Project Page Structured Data

```typescript
// For creative work pages
const creativeWorkData = {
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: project.title,
  description: project.description,
  image: project.media.filter(m => m.type === 'image').map(m => m.url),
  video: project.media.filter(m => m.type === 'video').map(m => ({
    '@type': 'VideoObject',
    contentUrl: m.url,
    name: project.title,
  })),
  author: {
    '@type': 'Person',
    name: 'Ranya',
    url: 'https://raylodies.com/about',
  },
  dateCreated: project.year,
  genre: 'AI Generated Art',
};
```

### Additional SEO Database Fields

Add these fields to the database for maximum SEO control:

```sql
-- Add to products table
ALTER TABLE products ADD COLUMN meta_title TEXT;
ALTER TABLE products ADD COLUMN meta_description TEXT;
ALTER TABLE products ADD COLUMN og_image TEXT; -- Custom OG image if different from thumbnail

-- Add to projects table  
ALTER TABLE projects ADD COLUMN meta_title TEXT;
ALTER TABLE projects ADD COLUMN meta_description TEXT;
ALTER TABLE projects ADD COLUMN og_image TEXT;
```

### SEO Checklist for Product Pages

#### Technical SEO
- [x] Dynamic `<title>` tag with product name
- [x] Meta description (150-160 chars)
- [x] Canonical URL
- [x] Open Graph tags
- [x] Twitter Card tags
- [x] JSON-LD Product schema
- [x] Semantic HTML (`<article>`, `<h1>`, etc.)
- [x] Image `alt` attributes
- [x] Fast loading (Next.js Image optimization)

#### Content SEO
- [x] Unique, descriptive product titles
- [x] Detailed product descriptions (300+ words ideal)
- [x] Keywords in title, description, and content
- [x] High-quality images with descriptive filenames
- [x] Internal linking to related products
- [x] Breadcrumb navigation

#### URL Structure
```
✅ Good: /store/cinematic-landscapes-preset
❌ Bad:  /store/product?id=12345
```

### Sitemap Generation

```typescript
// app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts();
  const projects = await getAllProjects();
  
  const productUrls = products.map((product) => ({
    url: `https://raylodies.com/store/${product.slug}`,
    lastModified: product.updated_at,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
  
  const projectUrls = projects.map((project) => ({
    url: `https://raylodies.com/work/${project.slug}`,
    lastModified: project.updated_at,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));
  
  return [
    { url: 'https://raylodies.com', priority: 1.0 },
    { url: 'https://raylodies.com/about', priority: 0.8 },
    { url: 'https://raylodies.com/work', priority: 0.9 },
    { url: 'https://raylodies.com/store', priority: 0.9 },
    ...productUrls,
    ...projectUrls,
  ];
}
```

### robots.txt

```typescript
// app/robots.ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/account/', '/api/'],
    },
    sitemap: 'https://raylodies.com/sitemap.xml',
  };
}
```

---

## Security Considerations

### Row Level Security (RLS) Policies

> ⚠️ **PERFORMANCE TIP**: Use Custom Claims instead of subqueries for admin checks!

#### Setup Custom Claims for Admin Role

When making a user an admin, set their `app_metadata`:

```sql
-- Function to set admin role (run once per admin user)
-- Call this from Supabase Dashboard SQL Editor
UPDATE auth.users 
SET raw_app_meta_data = raw_app_meta_data || '{"role": "super_admin"}'::jsonb
WHERE email = 'ranya@raylodies.com';
```

Or via Supabase Admin API:
```typescript
// Use service role key
const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
  app_metadata: { role: 'super_admin' }
});
```

#### Optimized RLS Policies

```sql
-- ✅ FAST: Check JWT claims (no database query!)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users can only read their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- ✅ FAST: Admins can manage projects (uses JWT, no subquery!)
CREATE POLICY "Admins can manage projects"
  ON projects FOR ALL
  USING (is_admin());

-- Anyone can view published projects
CREATE POLICY "Public can view published projects"
  ON projects FOR SELECT
  USING (is_published = true);

-- ✅ FAST: Admins can manage products
CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (is_admin());

-- Anyone can view published products
CREATE POLICY "Public can view published products"
  ON products FOR SELECT
  USING (is_published = true);

-- Customers can view their own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (is_admin());

-- Admins can manage all orders
CREATE POLICY "Admins can manage orders"
  ON orders FOR ALL
  USING (is_admin());

-- Similar policies for order_items, inquiries, etc.
```

**Why Custom Claims are faster:**
- ❌ **Subquery**: `EXISTS (SELECT 1 FROM users WHERE ...)` = 1 DB query per row
- ✅ **JWT Claim**: `auth.jwt() -> 'app_metadata'` = 0 DB queries (reads from token)

On a dashboard loading 50 orders, that's **50 queries saved** per page load!

### Security Checklist

- [ ] Enable RLS on all tables
- [ ] Validate all user inputs (Zod schemas)
- [ ] Sanitize file uploads (check MIME types)
- [ ] Use signed URLs for private downloads
- [ ] Verify Paddle webhook signatures
- [ ] Rate limit API endpoints
- [ ] CSRF protection on forms
- [ ] Secure HTTP headers (Next.js handles most)
- [ ] Environment variables for secrets

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)

1. **Supabase Setup**
   - Create project
   - Set up database tables
   - Configure RLS policies
   - Set up storage buckets

2. **Authentication**
   - Supabase Auth integration
   - Login/Signup pages
   - Protected routes middleware

3. **Migrate Existing Data**
   - Convert hardcoded projects to database
   - Convert hardcoded products to database

### Phase 2: Admin Dashboard (Week 3-4)

1. **Dashboard Layout**
   - Admin layout with sidebar
   - Overview page with stats

2. **Project Management**
   - CRUD operations
   - Image/video uploads
   - Publishing workflow

3. **Product Management**
   - CRUD operations
   - File uploads
   - Paddle product sync

### Phase 3: Customer Portal (Week 5)

1. **Account Pages**
   - Profile settings
   - Purchase history
   - Download center

2. **Checkout Flow**
   - Paddle integration
   - Success/failure pages

### Phase 4: Payment Integration (Week 6)

1. **Paddle Setup**
   - Create Paddle account
   - Set up products in Paddle
   - Configure webhooks

2. **Webhook Handler**
   - Order creation
   - Email notifications

### Phase 5: Polish & Launch (Week 7-8)

1. **Testing**
   - End-to-end testing
   - Payment testing (sandbox)
   - Security audit

2. **Performance**
   - Image optimization
   - Caching strategy
   - CDN configuration

3. **Monitoring**
   - Error tracking (Sentry)
   - Analytics (Vercel/Plausible)

---

## File Structure (After Implementation)

```
raylodies/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── auth/callback/route.ts
│   ├── (main)/
│   │   ├── page.tsx
│   │   ├── about/page.tsx
│   │   ├── work/page.tsx
│   │   ├── store/page.tsx
│   │   └── start-a-project/page.tsx
│   ├── account/
│   │   ├── page.tsx
│   │   ├── purchases/page.tsx
│   │   └── settings/page.tsx
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── projects/page.tsx
│   │   ├── products/page.tsx
│   │   ├── orders/page.tsx
│   │   └── inquiries/page.tsx
│   └── api/
│       ├── webhooks/paddle/route.ts
│       └── downloads/[id]/route.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── admin.ts
│   ├── paddle/
│   │   └── client.ts
│   └── validations/
│       ├── project.ts
│       └── product.ts
├── actions/
│   ├── projects.ts
│   ├── products.ts
│   ├── orders.ts
│   └── auth.ts
└── types/
    ├── database.ts
    └── paddle.ts
```

---

## Summary

This architecture provides:

✅ **Scalable** - PostgreSQL + Supabase handles growth  
✅ **Secure** - RLS, signed URLs, webhook verification  
✅ **Simple** - Minimal moving parts, integrated stack  
✅ **Fast** - Edge functions, CDN, ISR caching  
✅ **Maintainable** - Clear separation, type-safe  

The recommended approach prioritizes:
1. **Speed to market** - Use managed services
2. **Developer experience** - Type-safe, good tooling
3. **Security by default** - RLS, proper auth
4. **Future flexibility** - Can scale or migrate if needed

---

*Document created: December 2024*  
*Last updated: December 2024*

