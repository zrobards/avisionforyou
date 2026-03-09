export default function NewsletterLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header skeleton */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded bg-gray-200 animate-pulse" />
            <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-5 w-80 max-w-full bg-gray-100 rounded mx-auto animate-pulse" />
        </div>

        {/* Grid skeleton */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-6">
                <div className="h-6 w-3/4 bg-gray-200 rounded mb-3" />
                <div className="h-4 w-full bg-gray-100 rounded mb-2" />
                <div className="h-4 w-2/3 bg-gray-100 rounded mb-4" />
                <div className="flex items-center gap-4">
                  <div className="h-3 w-24 bg-gray-100 rounded" />
                  <div className="h-3 w-20 bg-gray-100 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
