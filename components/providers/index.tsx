"use client";

import { ReactNode } from "react";
import SmoothScroll from "./SmoothScroll";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return <SmoothScroll>{children}</SmoothScroll>;
}

