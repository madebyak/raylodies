"use client";

import { ReactNode } from "react";
import SmoothScroll from "./SmoothScroll";
import { AuthProvider } from "./AuthProvider";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <SmoothScroll>{children}</SmoothScroll>
    </AuthProvider>
  );
}
