"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface ConditionalLayoutProps {
  children: ReactNode;
}

// Routes that should NOT show the main Header/Footer
const EXCLUDED_ROUTES = ["/admin"];

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
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
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}


