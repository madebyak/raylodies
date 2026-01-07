export default function ProductsLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-32 bg-white/5 rounded animate-pulse" />
          <div className="h-4 w-64 bg-white/5 rounded mt-2 animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-white/5 rounded-lg animate-pulse" />
      </div>

      {/* Filter Bar Skeleton */}
      <div className="h-14 bg-white/5 rounded-lg animate-pulse" />

      {/* Table Skeleton */}
      <div className="bg-[#050505] border border-white/5 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="p-6 border-b border-white/5 flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-white/5 rounded animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 bg-white/5 rounded animate-pulse" />
              <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
            </div>
            <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
            <div className="h-6 w-20 bg-white/5 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
