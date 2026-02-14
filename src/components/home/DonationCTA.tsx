import Link from 'next/link'

export default function DonationCTA() {
  return (
    <section className="py-20 bg-green-50">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-6">Your Impact Matters</h2>
        <p className="text-xl text-gray-700 mb-8">Every donation supports safe shelter, meals, recovery beds, and vital services for people facing homelessness and addiction.</p>
        <Link href="/donate" className="px-12 py-4 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 inline-block text-lg">Make a Donation Today</Link>
      </div>
    </section>
  )
}
