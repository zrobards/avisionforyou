export default function TeamLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-r from-brand-purple to-purple-900 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-white/20 mx-auto mb-6 animate-pulse" />
          <div className="h-10 w-64 bg-white/20 rounded mx-auto mb-4 animate-pulse" />
          <div className="h-5 w-96 max-w-full bg-white/10 rounded mx-auto animate-pulse" />
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="h-8 w-48 bg-gray-200 rounded mx-auto mb-8 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex-shrink-0" />
                <div>
                  <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-20 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-full bg-gray-100 rounded mb-1" />
              <div className="h-3 w-3/4 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
