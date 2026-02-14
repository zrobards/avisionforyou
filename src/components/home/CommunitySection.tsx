import Link from 'next/link'

export default function CommunitySection() {
  return (
    <section className="bg-gradient-to-br from-purple-50 to-green-50 py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Join Our Recovery Community</h2>
            <p className="text-xl text-gray-700 mb-6">Connect with thousands of people on their recovery journey. Share experiences, celebrate milestones, and find support from people who truly understand.</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-gray-700">
                <span className="text-green-500">{"\u2713"}</span>
                <span>24/7 Support Groups &amp; Peer Mentoring</span>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <span className="text-green-500">{"\u2713"}</span>
                <span>Recovery Resources &amp; Success Stories</span>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <span className="text-green-500">{"\u2713"}</span>
                <span>Community Events &amp; Celebrations</span>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <span className="text-green-500">{"\u2713"}</span>
                <span>Safe, Moderated, &amp; Private Community</span>
              </li>
            </ul>
            <Link href="/community" className="px-8 py-3 bg-brand-purple text-white rounded-lg font-semibold hover:bg-purple-700 inline-block">
              Explore Our Community
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-xl p-8 border-l-4 border-brand-purple">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Join?</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-100 text-brand-purple font-bold">1</div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Real Connection</h4>
                  <p className="text-gray-600 text-sm">Connect with people who understand your journey</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-100 text-brand-purple font-bold">2</div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">24/7 Support</h4>
                  <p className="text-gray-600 text-sm">Get help and encouragement whenever you need it</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-100 text-brand-purple font-bold">3</div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Safe Space</h4>
                  <p className="text-gray-600 text-sm">A moderated community focused on recovery</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
