import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Accessibility Statement',
  description: 'SeeZee Studio Accessibility Statement - Our commitment to digital accessibility and inclusion.',
}

export default function AccessibilityPage() {
  return (
    <div className="w-full min-h-screen bg-gray-900 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <article className="text-white">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-white">Accessibility Statement</h1>
          <p className="text-gray-400 mb-12 text-sm">
            <strong>Last updated: December 13, 2025</strong>
          </p>
          
          <div className="space-y-8">
            <p className="text-gray-300 text-lg leading-relaxed">
              SeeZee Studio is committed to digital accessibility and inclusion. We believe technology should work for everyone.
            </p>

            <section>
              <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-4 text-white">Our Commitment</h2>
              <p className="text-gray-300 mb-4 leading-relaxed">
                We strive to ensure our website meets or exceeds <strong>WCAG 2.1 AA accessibility standards</strong> wherever reasonably possible.
              </p>
              <p className="text-gray-300 mb-4 leading-relaxed">Our efforts include:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 leading-relaxed">
                <li>Semantic HTML and proper heading structure</li>
                <li>Keyboard-accessible navigation</li>
                <li>Readable color contrast</li>
                <li>Screen-reader compatibility</li>
                <li>Clear and simple language</li>
                <li>Cognitive accessibility considerations</li>
                <li>Large, readable fonts</li>
                <li>Predictable navigation patterns</li>
                <li>Minimal distractions and clutter</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-4 text-white">Why Accessibility Matters to Us</h2>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Accessibility isn't just a checklist for us — it's our foundation. We design websites for people with memory challenges, processing differences, anxiety, sensory sensitivities, and other cognitive needs.
              </p>
              <p className="text-gray-300 leading-relaxed">
                We build with empathy first, because we believe the internet should include everyone.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-4 text-white">Ongoing Improvements</h2>
              <p className="text-gray-300 leading-relaxed">
                Accessibility is an ongoing process. We regularly review and improve our site as technologies and standards evolve.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-4 text-white">Need Help?</h2>
              <p className="text-gray-300 mb-4 leading-relaxed">
                If you experience difficulty accessing any part of our website or need accommodations, please contact us. We take accessibility feedback seriously and will work with you to provide the information or service you need.
              </p>
              <p className="text-gray-300 mb-4 leading-relaxed">
                We aim to respond to accessibility requests within a reasonable timeframe.
              </p>
              <p className="text-gray-300 mb-2 leading-relaxed">
                <strong>Email:</strong>{' '}
                <a href="mailto:seezee.enterprises@gmail.com" className="text-[#DC143C] hover:underline">
                  seezee.enterprises@gmail.com
                </a>
              </p>
              <p className="text-gray-300 leading-relaxed"><strong>Location:</strong> Louisville, Kentucky</p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-4 text-white">Feedback</h2>
              <p className="text-gray-300 mb-4 leading-relaxed">
                We welcome your feedback on the accessibility of our website. Please let us know if you encounter accessibility barriers:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 leading-relaxed">
                <li>What page or section you were trying to access</li>
                <li>What problem you encountered</li>
                <li>What assistive technology you were using (if applicable)</li>
              </ul>
              <p className="text-gray-300 mt-4 leading-relaxed">
                We'll respond as quickly as possible and work to resolve the issue.
              </p>
            </section>

            <hr className="border-gray-800 my-8" />
            <p className="text-gray-400 italic text-sm leading-relaxed">
              This Accessibility Statement reflects our genuine commitment to creating inclusive digital experiences. Accessibility is not just what we promise — it's what we practice.
            </p>
          </div>
        </article>
      </div>
    </div>
  )
}

