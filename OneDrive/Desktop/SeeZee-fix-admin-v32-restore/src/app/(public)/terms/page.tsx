import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'SeeZee Studio Terms of Service - Terms and conditions for using our services.',
}

export default function TermsPage() {
  return (
    <div className="w-full min-h-screen bg-gray-900 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <article className="text-white">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-white">Terms of Service</h1>
          <p className="text-gray-400 mb-12 text-sm">
            <strong>Last updated: December 13, 2025</strong>
          </p>
          
          <div className="space-y-8">
            <p className="text-gray-300 text-lg leading-relaxed">
              By accessing or using the SeeZee Studio website, you agree to these Terms of Service.
            </p>

            <section>
              <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-4 text-white">Services</h2>
              <p className="text-gray-300 mb-4 leading-relaxed">
                SeeZee Studio provides web development, digital infrastructure, and consulting services, primarily for nonprofits, community organizations, and accessibility-focused initiatives.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Information on this website is for general informational purposes only and does not constitute professional, legal, or medical advice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-4 text-white">No Medical or Mental Health Services</h2>
              <p className="text-gray-300 mb-4 font-semibold leading-relaxed">
                SeeZee Studio is not a healthcare provider and does not provide medical, mental health, or therapeutic services.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Clients are solely responsible for ensuring compliance with any healthcare, privacy, or regulatory laws applicable to their organization, including HIPAA where applicable.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-4 text-white">Payments</h2>
              <p className="text-gray-300 leading-relaxed">
                Any pricing, invoices, or payments referenced may be processed through a third-party payment provider and may be issued under an affiliated business entity. Payment terms will be outlined in individual agreements or invoices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-4 text-white">Intellectual Property</h2>
              <p className="text-gray-300 leading-relaxed">
                All content on this site, including text, design, graphics, and code, is the property of SeeZee Studio unless otherwise stated. You may not copy or reuse materials without written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-4 text-white">Limitation of Liability</h2>
              <p className="text-gray-300 leading-relaxed">
                To the fullest extent permitted by law, SeeZee Studio is not liable for any indirect, incidental, or consequential damages arising from your use of this website or services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-4 text-white">Termination</h2>
              <p className="text-gray-300 leading-relaxed">
                We reserve the right to refuse service or terminate access for any reason, including misuse of the website or violation of these terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-4 text-white">Changes</h2>
              <p className="text-gray-300 leading-relaxed">
                We may update these Terms at any time. Continued use of the site constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-4 text-white">Governing Law</h2>
              <p className="text-gray-300 leading-relaxed">
                These Terms are governed by the laws of the Commonwealth of Kentucky, without regard to conflict of law principles.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-4 text-white">Contact</h2>
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
              These Terms of Service are written in plain English to ensure accessibility for all users. If you have questions about any of these terms, please contact us.
            </p>
          </div>
        </article>
      </div>
    </div>
  )
}

