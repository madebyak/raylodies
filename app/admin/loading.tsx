import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
        <p className="text-sm text-white/40 font-light">Loading...</p>
      </div>
    </div>
  );
}


