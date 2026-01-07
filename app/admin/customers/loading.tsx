export default function CustomersLoading() {
  return (
    <div className="space-y-8">
      <div>
        <div className="h-8 w-32 bg-white/5 rounded animate-pulse" />
        <div className="h-4 w-64 bg-white/5 rounded animate-pulse mt-2" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/5 rounded-lg animate-pulse" />
              <div className="space-y-2">
                <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
                <div className="h-6 w-16 bg-white/5 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}




