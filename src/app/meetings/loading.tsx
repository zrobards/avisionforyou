export default function MeetingsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-r from-brand-purple to-purple-900 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-10 w-64 bg-white/20 rounded mb-4 animate-pulse" />
          <div className="h-5 w-80 max-w-full bg-white/10 rounded animate-pulse" />
        </div>
      </div>

      {/* Meetings list skeleton */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-5 border border-gray-100 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-gray-200 flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-5 w-48 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-32 bg-gray-100 rounded mb-1" />
                  <div className="h-3 w-24 bg-gray-100 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
