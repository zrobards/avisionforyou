'use client'

import Link from 'next/link'

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-brand-purple to-purple-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">Terms of Use</h1>
          <p className="text-xl opacity-95">Please read these terms carefully before using our website</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-12">
            {/* Last Updated */}
            <div className="text-gray-600 mb-8 pb-8 border-b border-gray-200">
              <p className="text-sm">Last Updated: February 2026</p>
              <p className="text-sm mt-2">These Terms of Use govern your access to and use of the A Vision For You website and services. By accessing or using our website, you agree to be bound by these terms. If you do not agree with any part of these terms, please do not use our website.</p>
            </div>

            {/* 1. Acceptance of Terms */}
            <div>
              <h2 className="text-3xl font-bold text-brand-purple mb-4">1. Acceptance of Terms</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">By visiting and using this website, you accept and agree to be bound by this Terms of Use agreement. A Vision For You reserves the right to change, modify, add, or remove portions of these terms at any time. Your continued use of the website following such modifications constitutes your acceptance of the updated Terms of Use.</p>
              </div>
            </div>

            {/* 2. Nonprofit Informational Purpose */}
            <div>
              <h2 className="text-3xl font-bold text-brand-purple mb-4">2. Nonprofit Informational Purpose</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">A Vision For You is a nonprofit 501(c)(3) organization. This website is provided for informational and educational purposes to support our mission of helping individuals recover and build stable lives. Content provided on this website is intended to inform and inspire, not to provide professional medical, legal, financial, or therapeutic advice.</p>
                <p className="leading-relaxed"><strong>If you require professional services, please consult with qualified healthcare providers, legal professionals, or financial advisors.</strong></p>
              </div>
            </div>

            {/* 3. Use of Website */}
            <div>
              <h2 className="text-3xl font-bold text-brand-purple mb-4">3. Permitted Use of Website</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">You agree to use this website only for lawful purposes and in a way that does not infringe upon the rights of others or restrict their use and enjoyment of the website. Prohibited behavior includes:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Harassing or causing distress or inconvenience to any person</li>
                  <li>Obscene or offensive language</li>
                  <li>Disrupting the normal flow of dialogue within our website</li>
                  <li>Attempting to gain unauthorized access to systems or data</li>
                  <li>Transmitting obscene, abusive, or unlawful content</li>
                  <li>Interrupting the flow of dialogue with vulgar language, insults, or attacks</li>
                </ul>
              </div>
            </div>

            {/* 4. Intellectual Property Rights */}
            <div>
              <h2 className="text-3xl font-bold text-brand-purple mb-4">4. Intellectual Property Rights</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">All content on this website, including text, graphics, logos, images, audio clips, digital downloads, and data compilations, is the property of A Vision For You or its content suppliers and is protected by international copyright laws. You may not reproduce, distribute, transmit, display, or create derivative works of any content without explicit permission from A Vision For You.</p>
                <p className="leading-relaxed">You may print or download materials for personal, non-commercial use only, provided you retain all copyright and other proprietary notices.</p>
              </div>
            </div>

            {/* 5. No Warranties */}
            <div>
              <h2 className="text-3xl font-bold text-brand-purple mb-4">5. Disclaimers & No Warranties</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed"><strong>THIS WEBSITE AND ALL CONTENT ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND.</strong> A Vision For You makes no representations or warranties, express or implied, regarding the website or its content, including but not limited to:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Accuracy, completeness, or reliability of any content</li>
                  <li>Suitability for any particular purpose</li>
                  <li>Non-infringement of third-party rights</li>
                  <li>Uninterrupted or error-free access</li>
                  <li>Security or absence of viruses</li>
                </ul>
                <p className="leading-relaxed mt-3"><strong>Medical & Professional Disclaimer:</strong> Content on this website is not a substitute for professional medical diagnosis, treatment, or advice. Recovery is complex and individualized. We do not guarantee specific outcomes or results. Always consult qualified professionals for medical, mental health, or legal matters.</p>
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mt-4">
                  <p className="text-red-800 font-semibold">If you are experiencing a medical emergency, call 911.</p>
                  <p className="text-red-700 mt-1">If you or someone you know is in crisis, call or text <strong>988</strong> (Suicide &amp; Crisis Lifeline) for immediate support, available 24/7.</p>
                </div>
              </div>
            </div>

            {/* 6. Limitation of Liability */}
            <div>
              <h2 className="text-3xl font-bold text-brand-purple mb-4">6. Limitation of Liability</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed"><strong>TO THE FULLEST EXTENT PERMITTED BY LAW,</strong> A Vision For You shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or use, arising out of or in connection with:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Your use of or inability to use the website</li>
                  <li>Reliance on content provided</li>
                  <li>Unauthorized access or transmission of data</li>
                  <li>Third-party interference with your use</li>
                  <li>Any other matter relating to the website</li>
                </ul>
                <p className="leading-relaxed mt-3">This limitation applies even if A Vision For You has been advised of the possibility of such damages.</p>
              </div>
            </div>

            {/* 7. Third-Party Services & Links */}
            <div>
              <h2 className="text-3xl font-bold text-brand-purple mb-4">7. Third-Party Services & External Links</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">This website may contain links to third-party websites and services, including payment processors and external resources. <strong>A Vision For You is not responsible for the content, accuracy, or practices of external websites.</strong> Your use of third-party services is governed by their own terms and privacy policies.</p>
                <div className="bg-blue-50 p-4 rounded-lg mt-4 space-y-2 text-sm">
                  <p><strong>Third-Party Payment Processors:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Stripe - <a href="https://stripe.com/ssa" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">stripe.com/ssa</a></li>
                    <li>Square - <a href="https://squareup.com/legal/ssa" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">squareup.com/legal/ssa</a></li>
                  </ul>
                  <p className="mt-2">These services have their own terms, privacy policies, and security standards. By using our donation system, you agree to their terms as well.</p>
                </div>
              </div>
            </div>

            {/* 8. Donation Terms */}
            <div>
              <h2 className="text-3xl font-bold text-brand-purple mb-4">8. Donation Terms</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">By making a donation to A Vision For You through this website, you agree to:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Provide accurate and current payment information</li>
                  <li>Authorize charges to your payment method</li>
                  <li>Comply with all payment processor terms and conditions</li>
                  <li>Acknowledge that donations are generally non-refundable</li>
                </ul>
                <p className="leading-relaxed mt-3">A Vision For You Inc. is a 501(c)(3) tax-exempt nonprofit organization. Contributions are tax-deductible to the extent permitted by law. No goods or services were provided in exchange for your contribution. For tax records and receipts, contact our office. We do not sell or share donor information.</p>
              </div>
            </div>

            {/* 9. User Content & Comments */}
            <div>
              <h2 className="text-3xl font-bold text-brand-purple mb-4">9. User Content & Comments</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">If you submit content, comments, or suggestions to our website, you grant A Vision For You the right to use, reproduce, and display such content without restriction or compensation. You warrant that:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>You own or have permission to use the content</li>
                  <li>Content does not violate any laws or third-party rights</li>
                  <li>Content is not defamatory, obscene, or offensive</li>
                </ul>
              </div>
            </div>

            {/* 10. Governing Law */}
            <div>
              <h2 className="text-3xl font-bold text-brand-purple mb-4">10. Governing Law & Jurisdiction</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">These Terms of Use are governed by and construed in accordance with the laws of the Commonwealth of Kentucky, USA, without regard to its conflict of law principles. Any legal action or proceeding relating to these terms shall be brought exclusively in the state or federal courts located in Kentucky, and you consent to the jurisdiction and venue of such courts.</p>
              </div>
            </div>

            {/* 11. Severability */}
            <div>
              <h2 className="text-3xl font-bold text-brand-purple mb-4">11. Severability</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">If any provision of these Terms of Use is found to be invalid or unenforceable, that provision shall be severed, and the remaining provisions shall continue in full force and effect.</p>
              </div>
            </div>

            {/* 12. Contact Information */}
            <div className="bg-purple-50 p-8 rounded-lg">
              <h2 className="text-3xl font-bold text-brand-purple mb-4">12. Questions & Contact Information</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">If you have questions about these Terms of Use, please contact us:</p>
                <div className="mt-6 space-y-2 text-gray-900 font-semibold">
                  <p><strong>A Vision For You</strong></p>
                  <p className="text-sm">1675 Story Ave, Louisville, Kentucky 40206</p>
                  <p className="text-blue-600 hover:underline"><a href="tel:+15027496344">(502) 749-6344</a></p>
                  <p className="text-blue-600 hover:underline"><a href="mailto:info@avisionforyourecovery.org">info@avisionforyourecovery.org</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Questions About Our Policies?</h3>
          <p className="mb-6 opacity-95">We're committed to transparency. Contact us if you need clarification on any of our terms.</p>
          <a href="mailto:info@avisionforyourecovery.org" className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-50 transition">Get in Touch</a>
        </div>
      </section>
    </div>
  )
}
