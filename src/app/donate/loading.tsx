export default function DonateLoading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-8">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-brand-green/30 border-t-brand-green rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Loading donation page...</p>
      </div>
    </div>
  )
}
