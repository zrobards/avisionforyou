import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-brand-green font-semibold mb-2">A Vision For You</p>
        <h1 className="text-5xl font-bold text-white mt-3 mb-4">Page Not Found</h1>
        <p className="text-purple-200 mb-8 text-lg">
          The page you&apos;re looking for may have moved or no longer exists. Let&apos;s get you back on track.
        </p>

        <div className="flex flex-wrap gap-4 justify-center mb-10">
          <Link
            href="/"
            className="px-6 py-3 bg-brand-green text-brand-purple rounded-lg font-bold hover:bg-green-400 transition"
          >
            Home
          </Link>
          <Link
            href="/programs"
            className="px-6 py-3 bg-white/10 text-white border border-purple-500 rounded-lg font-semibold hover:bg-white/20 transition"
          >
            Programs
          </Link>
          <Link
            href="/contact"
            className="px-6 py-3 bg-white/10 text-white border border-purple-500 rounded-lg font-semibold hover:bg-white/20 transition"
          >
            Contact
          </Link>
          <Link
            href="/donate"
            className="px-6 py-3 bg-white/10 text-white border border-purple-500 rounded-lg font-semibold hover:bg-white/20 transition"
          >
            Donate
          </Link>
        </div>

        <div className="pt-6 border-t border-purple-700">
          <p className="text-purple-200">Need help now?</p>
          <p className="text-white font-semibold mt-1">
            Call <a href="tel:988" className="text-brand-green hover:underline">988</a> — Suicide &amp; Crisis Lifeline (24/7)
          </p>
        </div>
      </div>
    </div>
  )
}
