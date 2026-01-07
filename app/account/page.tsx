import { createClient } from "@/lib/supabase/server";
import { User } from "lucide-react";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch recent orders
  const { data: orders } = await supabase
    .from("orders")
    .select("id, total, status, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <div className="space-y-8">
      {/* Profile Card */}
      <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white/40">
            <User size={32} />
          </div>
          <div>
            <h2 className="text-xl font-light text-white">
              {user?.user_metadata?.full_name || "Customer"}
            </h2>
            <p className="text-white/40 text-sm">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6">
          <h3 className="text-white/40 text-sm font-light mb-2">
            Total Orders
          </h3>
          <p className="text-3xl font-light text-white">
            {orders?.length || 0}
          </p>
        </div>
        <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6">
          <h3 className="text-white/40 text-sm font-light mb-2">
            Member Since
          </h3>
          <p className="text-xl font-light text-white">
            {user?.created_at
              ? new Date(user.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })
              : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}
