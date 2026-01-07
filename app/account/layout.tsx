import AccountSidebar from "@/components/account/AccountSidebar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 md:px-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-light text-white mb-8">My Account</h1>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          <AccountSidebar />
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
