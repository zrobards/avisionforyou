export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-green mx-auto mb-4"></div>
        <p className="text-gray-300">Loading admin dashboard…</p>
      </div>
    </div>
  )
}
