"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import type { User } from "@supabase/supabase-js";

interface ConditionalLayoutProps {
  children: ReactNode;
  user: User | null;
}

// Routes that should NOT show the main Header/Footer
const EXCLUDED_ROUTES = ["/admin"];

export default function ConditionalLayout({ children, user }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Check if current route should hide the main layout
  const shouldHideLayout = EXCLUDED_ROUTES.some(route => pathname.startsWith(route));

  if (shouldHideLayout) {
    // Admin and other excluded routes - render children only (they have their own layout)
    return <>{children}</>;
  }

  // Regular pages - render with Header and Footer
  return (
    <>
      <Header user={user} />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
