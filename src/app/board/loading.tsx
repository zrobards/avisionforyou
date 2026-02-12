export default function BoardLoading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-8">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-brand-purple/30 border-t-brand-purple rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Loading board portal...</p>
      </div>
    </div>
  )
}
