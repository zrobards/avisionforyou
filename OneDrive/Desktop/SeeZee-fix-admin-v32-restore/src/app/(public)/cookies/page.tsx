import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'SeeZee Studio Cookie Policy - How we use cookies and tracking technologies.',
}

export default function CookiesPage() {
  return (
    <div className="w-full min-h-screen bg-gray-900 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <article className="text-white">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-white">Cookie Policy</h1>
          <p className="text-gray-400 mb-12 text-sm">
            <strong>Last updated: December 13, 2025</strong>
          </p>
          
          <div className="space-y-8">
            <p className="text-gray-300 text-lg leading-relaxed">
              SeeZee Studio uses limited cookies and similar technologies to ensure our website functions properly and to understand how it is used.
            </p>

            <section>
              <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-4 text-white">What We Use</h2>
              <p className="text-gray-300 mb-4 leading-relaxed">We may use:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 leading-relaxed">
                <li><strong>Essential cookies</strong> required for site functionality</li>
                <li><strong>Analytics tools</strong> (such as Vercel Analytics) to measure traffic and performance</li>
              </ul>
              <p className="text-gray-300 mt-4 leading-relaxed">
                These tools collect aggregated, non-identifying data to help us improve your experience.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-4 text-white">What We Don't Do</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 leading-relaxed">
                <li>We <strong>do not</strong> use advertising cookies</li>
                <li>We <strong>do not</strong> sell tracking data</li>
                <li>We <strong>do not</strong> build individual user profiles</li>
                <li>We <strong>do not</strong> track you across other websites</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-4 text-white">Managing Cookies</h2>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Most browsers allow you to control or disable cookies through settings. Disabling cookies may affect site functionality.
              </p>
              <p className="text-gray-300 mb-4 leading-relaxed">To learn how to manage cookies in your browser:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 leading-relaxed">
                <li>
                  <a 
                    href="https://support.google.com/chrome/answer/95647" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#DC143C] hover:underline"
                  >
                    Chrome Cookie Settings
                  </a>
                </li>
                <li>
                  <a 
                    href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#DC143C] hover:underline"
                  >
                    Firefox Cookie Settings
                  </a>
                </li>
                <li>
                  <a 
                    href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#DC143C] hover:underline"
                  >
                    Safari Cookie Settings
                  </a>
                </li>
                <li>
                  <a 
                    href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#DC143C] hover:underline"
                  >
                    Edge Cookie Settings
                  </a>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-4 text-white">Analytics Data</h2>
              <p className="text-gray-300 mb-4 leading-relaxed">We use Vercel Analytics to understand:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 leading-relaxed">
                <li>How many people visit our site</li>
                <li>Which pages are most popular</li>
                <li>How long people spend on the site</li>
                <li>General geographic location (country/region level only)</li>
              </ul>
              <p className="text-gray-300 mt-4 leading-relaxed">
                This data is aggregated and anonymous. We cannot identify individual users from this information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-4 text-white">Contact</h2>
              <p className="text-gray-300 mb-4 leading-relaxed">
                If you have questions about our use of cookies or analytics:
              </p>
              <p className="text-gray-300 mb-2 leading-relaxed">
                <strong>Email:</strong>{' '}
                <a href="mailto:seezee.enterprises@gmail.com" className="text-[#DC143C] hover:underline">
                  seezee.enterprises@gmail.com
                </a>
              </p>
              <p className="text-gray-300 leading-relaxed"><strong>Location:</strong> Louisville, Kentucky</p>
            </section>

            <hr className="border-gray-800 my-8" />
            <p className="text-gray-400 italic text-sm leading-relaxed">
              We believe in transparency. This Cookie Policy is written in plain English so you know exactly what we're doing — and what we're not doing — with your data.
            </p>
          </div>
        </article>
      </div>
    </div>
  )
}

