export default function SettingsLoading() {
  return (
    <div className="space-y-8">
      <div>
        <div className="h-8 w-32 bg-white/5 rounded animate-pulse" />
        <div className="h-4 w-64 bg-white/5 rounded animate-pulse mt-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
            <div className="h-32 bg-white/5 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
