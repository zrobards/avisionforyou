import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl text-center bg-white shadow-xl rounded-2xl p-10 border border-purple-100">
        <p className="text-sm uppercase tracking-[0.2em] text-brand-purple font-semibold">A Vision For You</p>
        <h1 className="text-4xl font-bold text-gray-900 mt-3 mb-4">We can’t find that page</h1>
        <p className="text-gray-600 mb-6">
          The page you’re looking for may have moved. Let’s get you back to safety.
        </p>
        <Link
          href="/"
          className="inline-block bg-brand-purple text-white px-8 py-3 rounded-lg font-bold hover:bg-purple-800 transition"
        >
          Go Home
        </Link>
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-gray-600">Need immediate help?</p>
          <p className="text-red-500 font-semibold">Suicide & Crisis Lifeline: 988 (call or text, available 24/7)</p>
        </div>
      </div>
    </div>
  )
}
