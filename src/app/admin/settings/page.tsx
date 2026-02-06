import Link from 'next/link'

export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 py-6">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-3xl font-bold">Admin Settings</h1>
          <p className="text-gray-400 mt-1">Manage platform configuration</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/admin/settings/social"
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-purple-500 transition"
          >
            <h2 className="text-xl font-semibold">Social Settings</h2>
            <p className="text-gray-400 mt-2">Update social links and embed settings.</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
