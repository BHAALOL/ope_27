export default function Loading() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="h-5 w-24 bg-white/5 rounded animate-pulse mb-3" />
          <div className="h-10 w-64 bg-white/5 rounded animate-pulse mb-3" />
          <div className="h-5 w-80 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="space-y-8">
          <div className="glass rounded-2xl h-80 animate-pulse" />
          <div className="glass rounded-2xl h-64 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
