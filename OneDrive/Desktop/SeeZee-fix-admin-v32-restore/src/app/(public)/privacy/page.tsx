import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'SeeZee Studio Privacy Policy - How we collect, use, and protect your information.',
}

export default function PrivacyPage() {
  return (
    <div className="w-full min-h-screen bg-gray-900 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <article className="text-white">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-white">Privacy Policy</h1>
          <p className="text-gray-400 mb-12 text-sm">
            <strong>Last updated: December 13, 2025</strong>
          </p>
          
          <div className="space-y-8">
            <p className="text-gray-300 text-lg leading-relaxed">
              SeeZee Studio ("SeeZee," "we," "us," or "our") respects your privacy and is committed to protecting the personal information you share with us.
            </p>

            <section>
              <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-4 text-white">Information We Collect</h2>
              <p className="text-gray-300 mb-4 leading-relaxed">We may collect the following information when you interact with our website:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 leading-relaxed">
                <li>Name</li>
                <li>Email address</li>
                <li>Organization name</li>
                <li>Messages or project inquiries submitted through forms</li>
                <li>Technical data such as browser type, device information, and pages visited</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-4 text-white">How We Collect Information</h2>
              <p className="text-gray-300 mb-4 leading-relaxed">Information is collected when you:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 leading-relaxed">
                <li>Submit a contact or intake form</li>
                <li>Request services or a consultation</li>
                <li>Use or browse our website</li>
              </ul>
              <p className="text-gray-300 mt-4 leading-relaxed">
                We also collect limited analytics data through Vercel Analytics to understand site performance and usage. This data is aggregated and does not personally identify you.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-4 text-white">How We Use Your Information</h2>
              <p className="text-gray-300 mb-4 leading-relaxed">We use your information to:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 leading-relaxed">
                <li>Respond to inquiries and communicate with you</li>
                <li>Evaluate and manage project requests</li>
                <li>Improve our website and services</li>
                <li>Comply with legal or business obligations</li>
              </ul>
              <p className="text-gray-300 mt-4 font-semibold leading-relaxed">
                We do not sell your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-4 text-white">Payments & Third-Party Services</h2>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Payments referenced on this site may be processed through third-party providers (such as Stripe) and may be handled under a separate affiliated business entity. SeeZee Studio does not store full payment details.
              </p>
              <p className="text-gray-300 mb-4 leading-relaxed">Third-party services we may use include:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 leading-relaxed">
                <li>Hosting and analytics (Vercel)</li>
                <li>Email communication tools</li>
                <li>Payment processors</li>
              </ul>
              <p className="text-gray-300 mt-4 leading-relaxed">
                These providers have their own privacy policies governing their use of your data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-4 text-white">Data Security</h2>
              <p className="text-gray-300 mb-4 leading-relaxed">
                We take reasonable steps to protect your information, but no method of transmission over the internet is 100% secure. You share information at your own risk.
              </p>
              <p className="text-gray-300 leading-relaxed">
                We retain personal information only as long as necessary for business, legal, or operational purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-4 text-white">Your Rights</h2>
              <p className="text-gray-300 mb-4 leading-relaxed">You may request to:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 leading-relaxed">
                <li>Access or update your personal information</li>
                <li>Request deletion of your information (subject to legal or business requirements)</li>
              </ul>
              <p className="text-gray-300 mt-4 leading-relaxed">
                To make a request, contact us using the information below.
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
              This Privacy Policy is written in plain English to ensure accessibility for all users. If you need any clarification or have questions, please don't hesitate to reach out.
            </p>
          </div>
        </article>
      </div>
    </div>
  )
}

