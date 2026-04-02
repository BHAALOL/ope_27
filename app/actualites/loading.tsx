export default function Loading() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="h-5 w-24 bg-white/5 rounded animate-pulse mb-3" />
          <div className="h-10 w-56 bg-white/5 rounded animate-pulse mb-3" />
          <div className="h-5 w-80 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass rounded-2xl h-32 animate-pulse" />
            ))}
          </div>
          <div className="lg:w-64 space-y-6">
            <div className="glass rounded-2xl h-48 animate-pulse" />
            <div className="glass rounded-2xl h-32 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
