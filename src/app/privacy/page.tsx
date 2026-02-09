'use client'

import Link from 'next/link'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-brand-purple to-purple-900 text-white py-10 sm:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl opacity-95">How we protect and use your information</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-12">
            {/* Last Updated */}
            <div className="text-gray-600 mb-8 pb-8 border-b border-gray-200">
              <p className="text-sm">Last Updated: February 2026</p>
              <p className="text-sm mt-2">A Vision For You ("we," "us," "our," or "the Organization") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.</p>
            </div>

            {/* 1. Information We Collect */}
            <div>
              <h2 className="text-3xl font-bold text-brand-purple mb-4">1. Information We Collect</h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Information You Provide Directly</h3>
                  <p className="leading-relaxed mb-3">We collect information you voluntarily provide through:</p>
                  <ul className="list-disc list-inside space-y-2 ml-2">
                    <li>Contact forms and inquiry submissions</li>
                    <li>Donation and payment processing</li>
                    <li>Program registration and intake forms</li>
                    <li>Email communications and newsletter subscriptions</li>
                    <li>Support requests and inquiries</li>
                    <li>Social media interactions</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Information Collected Automatically</h3>
                  <p className="leading-relaxed mb-3">When you visit our website, we automatically collect certain information about your device and browsing activity through cookies and similar technologies:</p>
                  <ul className="list-disc list-inside space-y-2 ml-2">
                    <li>IP address and device identifiers</li>
                    <li>Browser type and operating system</li>
                    <li>Pages visited and time spent on site</li>
                    <li>Referring source and links clicked</li>
                    <li>Aggregate usage patterns and analytics data</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 2. How We Use Your Information */}
            <div>
              <h2 className="text-3xl font-bold text-brand-purple mb-4">2. How We Use Your Information</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">We use the information we collect for the following purposes:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Processing donations and managing donor records</li>
                  <li>Responding to inquiries and providing support</li>
                  <li>Delivering requested programs and services</li>
                  <li>Sending newsletters and updates (with your consent)</li>
                  <li>Improving our website and user experience</li>
                  <li>Analyzing usage trends and measuring program effectiveness</li>
                  <li>Complying with legal obligations and nonprofit reporting requirements</li>
                  <li>Preventing fraud and maintaining security</li>
                </ul>
              </div>
            </div>

            {/* 3. Payment Processing */}
            <div>
              <h2 className="text-3xl font-bold text-brand-purple mb-4">3. Payment Processing & Financial Data</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">A Vision For You uses third-party payment processors for secure donation and payment handling:</p>
                <div className="bg-blue-50 p-4 sm:p-6 rounded-lg mt-4 space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Stripe</h4>
                    <p className="text-sm">Credit card payments are processed through Stripe. We do not store full credit card information on our servers. Stripe handles Payment Card Industry (PCI) compliance and data security. For Stripe's privacy practices, visit <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">stripe.com/privacy</a></p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Square</h4>
                    <p className="text-sm">Recurring donations and additional payment methods are processed through Square. Square securely handles payment data in compliance with PCI DSS standards. For Square's privacy practices, visit <a href="https://squareup.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">squareup.com/privacy</a></p>
                  </div>
                </div>
                <p className="leading-relaxed mt-4">We collect and retain donor information (name, email, donation amount, frequency) for tax receipts, donor recognition, and impact reporting. This information is kept confidential and is not shared with external parties except as required by law.</p>
              </div>
            </div>

            {/* 4. Cookies & Analytics */}
            <div>
              <h2 className="text-3xl font-bold text-brand-purple mb-4">4. Cookies & Analytics</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">We use cookies and tracking technologies to enhance your browsing experience and understand how our website is used:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li><strong>Essential Cookies:</strong> Required for website functionality</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand visitor behavior and improve our site</li>
                  <li><strong>Marketing Cookies:</strong> Allow us to measure campaign effectiveness</li>
                </ul>
                <p className="leading-relaxed mt-3">Most web browsers allow you to control cookies through browser settings. You can opt out of analytics tracking without impacting basic site functionality.</p>
              </div>
            </div>

            {/* 5. Data Security */}
            <div>
              <h2 className="text-3xl font-bold text-brand-purple mb-4">5. Data Security</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">We implement comprehensive security measures to protect your personal information:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>HTTPS encryption for all data transmission</li>
                  <li>Secure password protection and authentication</li>
                  <li>Limited access to personal information (staff only)</li>
                  <li>Regular security audits and updates</li>
                  <li>Compliance with data protection best practices</li>
                </ul>
                <p className="leading-relaxed mt-3">While we strive to maintain security, no method of transmission over the Internet is completely secure. We cannot guarantee absolute security, but we are committed to protecting your information using industry-standard practices.</p>
              </div>
            </div>

            {/* 6. Data Retention */}
            <div>
              <h2 className="text-3xl font-bold text-brand-purple mb-4">6. Data Retention</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">We retain personal data only as long as necessary for the purposes outlined in this policy or as required by law. Below are our standard retention periods:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li><strong>Contact form submissions:</strong> Retained for 2 years from the date of submission</li>
                  <li><strong>Assessment data:</strong> Encrypted and retained for 1 year</li>
                  <li><strong>Donation records:</strong> Retained for 7 years as required by IRS regulations for nonprofit organizations</li>
                  <li><strong>Newsletter subscriptions:</strong> Retained until you unsubscribe</li>
                  <li><strong>Account data:</strong> Retained until account deletion is requested</li>
                  <li><strong>Server logs:</strong> Retained for 90 days</li>
                </ul>
                <p className="leading-relaxed mt-3">After the applicable retention period, data is securely deleted or anonymized in accordance with our data management procedures.</p>
              </div>
            </div>

            {/* 7. Data Deletion */}
            <div>
              <h2 className="text-3xl font-bold text-brand-purple mb-4">7. Data Deletion</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">You have the right to request deletion of your personal data. To submit a deletion request, please email us at <a href="mailto:info@avisionforyourecovery.org" className="text-blue-600 hover:underline">info@avisionforyourecovery.org</a> with the subject line "Data Deletion Request."</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Deletion requests will be processed within <strong>30 days</strong> of receipt</li>
                  <li>You will receive a confirmation email once your data has been deleted</li>
                  <li>Some data may be retained where required for legal or tax compliance (e.g., donation records must be kept for 7 years per IRS requirements)</li>
                </ul>
                <p className="leading-relaxed mt-3">If you have any questions about the deletion process, please do not hesitate to contact us.</p>
              </div>
            </div>

            {/* 8. Third-Party Services */}
            <div>
              <h2 className="text-3xl font-bold text-brand-purple mb-4">8. Third-Party Services</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">Our website uses the following third-party services that may collect or process information about you:</p>
                <div className="bg-blue-50 p-4 sm:p-6 rounded-lg mt-4 space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Square (Payment Processing)</h4>
                    <p className="text-sm">Processes donations and class payments securely in compliance with PCI DSS standards. For Square's privacy practices, visit <a href="https://squareup.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">squareup.com/privacy</a></p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Resend (Email Delivery)</h4>
                    <p className="text-sm">Handles transactional email delivery such as donation receipts, contact form confirmations, and account notifications. For Resend's privacy practices, visit <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">resend.com/legal/privacy-policy</a></p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Vercel (Hosting)</h4>
                    <p className="text-sm">Provides website hosting and analytics infrastructure. For Vercel's privacy practices, visit <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">vercel.com/legal/privacy-policy</a></p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Google (Authentication & Analytics)</h4>
                    <p className="text-sm">Provides sign-in authentication and site analytics to help us understand visitor behavior and improve our services. For Google's privacy practices, visit <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">policies.google.com/privacy</a></p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Neon (Database)</h4>
                    <p className="text-sm">Provides secure cloud database storage for application data. For Neon's privacy practices, visit <a href="https://neon.tech/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">neon.tech/privacy</a></p>
                  </div>
                </div>
                <p className="leading-relaxed mt-3">We encourage you to review the privacy policies of these third-party services. We are not responsible for their privacy practices.</p>
              </div>
            </div>

            {/* 9. Data Breach Notification */}
            <div>
              <h2 className="text-3xl font-bold text-brand-purple mb-4">9. Data Breach Notification</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">In the event of a data breach affecting your personal information, A Vision For You is committed to notifying affected users within <strong>72 hours</strong> via email. The notification will include:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>A description of the nature of the breach</li>
                  <li>The types of personal data affected</li>
                  <li>Steps we are taking to address and mitigate the breach</li>
                  <li>Recommended actions you can take to protect yourself</li>
                  <li>Contact information for further questions or concerns</li>
                </ul>
                <p className="leading-relaxed mt-3">We will also notify applicable regulatory authorities as required by law.</p>
              </div>
            </div>

            {/* 10. Your Privacy Rights */}
            <div>
              <h2 className="text-3xl font-bold text-brand-purple mb-4">10. Your Privacy Rights</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Access and review the personal information we hold about you</li>
                  <li>Request corrections to inaccurate information</li>
                  <li>Opt out of marketing communications and newsletters</li>
                  <li>Request deletion of your information (where legally permitted)</li>
                  <li>Withdraw consent for data processing at any time</li>
                </ul>
                <p className="leading-relaxed mt-3">To exercise these rights, please contact us using the information provided in the Contact section below.</p>
              </div>
            </div>

            {/* 11. Children's Privacy */}
            <div>
              <h2 className="text-3xl font-bold text-brand-purple mb-4">11. Children's Privacy</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">Our website is not directed to children under 13. We do not knowingly collect personal information from children. If we become aware that we have collected information from a child under 13, we will take steps to delete such information and terminate the child's account promptly.</p>
              </div>
            </div>

            {/* 12. Changes to This Privacy Policy */}
            <div>
              <h2 className="text-3xl font-bold text-brand-purple mb-4">12. Changes to This Privacy Policy</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of material changes by updating the "Last Updated" date at the top of this page. Your continued use of our website following such modifications constitutes your acceptance of the updated Privacy Policy.</p>
              </div>
            </div>

            {/* 13. Contact Information */}
            <div className="bg-purple-50 p-4 sm:p-6 md:p-8 rounded-lg">
              <h2 className="text-3xl font-bold text-brand-purple mb-4">13. Questions & Contact Information</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">If you have questions about this Privacy Policy or our privacy practices, please contact us:</p>
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
      <section className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Your Privacy Matters to Us</h3>
          <p className="mb-6 opacity-95">Questions? We're here to help and ensure you understand how we protect your information.</p>
          <a href="mailto:info@avisionforyourecovery.org" className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-50 transition">Contact Us</a>
        </div>
      </section>
    </div>
  )
}
