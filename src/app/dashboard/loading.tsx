export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-purple mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your dashboard…</p>
      </div>
    </div>
  )
}
