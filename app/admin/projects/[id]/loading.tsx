import { ArrowLeft } from "lucide-react";

export default function ProjectEditorLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-white/5">
            <ArrowLeft size={20} className="text-white/20" />
          </div>
          <div>
            <div className="h-7 w-32 bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-48 bg-white/5 rounded mt-2 animate-pulse" />
          </div>
        </div>
        <div className="h-8 w-24 bg-white/5 rounded-lg animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="bg-[#050505] border border-white/5 rounded-xl p-6 space-y-6">
            <div className="h-6 w-40 bg-white/5 rounded animate-pulse" />
            <div className="space-y-4">
              <div className="h-10 w-full bg-white/5 rounded animate-pulse" />
              <div className="h-10 w-full bg-white/5 rounded animate-pulse" />
              <div className="h-32 w-full bg-white/5 rounded animate-pulse" />
            </div>
          </div>

          {/* Media Card */}
          <div className="bg-[#050505] border border-white/5 rounded-xl p-6 space-y-6">
            <div className="h-6 w-32 bg-white/5 rounded animate-pulse" />
            <div className="h-40 w-full bg-white/5 rounded-xl animate-pulse border border-dashed border-white/10" />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-[#050505] border border-white/5 rounded-xl p-6 space-y-6">
            <div className="h-6 w-24 bg-white/5 rounded animate-pulse" />
            <div className="space-y-4">
              <div className="h-10 w-full bg-white/5 rounded animate-pulse" />
              <div className="h-10 w-full bg-white/5 rounded animate-pulse" />
              <div className="h-6 w-full bg-white/5 rounded animate-pulse" />
              <div className="h-6 w-full bg-white/5 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-12 w-full bg-white/10 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}




