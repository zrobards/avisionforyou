export default function ProgramsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-r from-brand-purple to-purple-900 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-10 w-56 bg-white/20 rounded mb-4 animate-pulse" />
          <div className="h-5 w-96 max-w-full bg-white/10 rounded animate-pulse" />
        </div>
      </div>

      {/* Programs grid skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gray-200" />
                <div className="h-6 w-16 bg-gray-200 rounded-full" />
              </div>
              <div className="h-6 w-3/4 bg-gray-200 rounded mb-3" />
              <div className="h-4 w-full bg-gray-100 rounded mb-2" />
              <div className="h-4 w-2/3 bg-gray-100 rounded mb-4" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
