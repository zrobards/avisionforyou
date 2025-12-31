'use client'

import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin, ExternalLink } from 'lucide-react'

// TikTok Icon Component
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.1 1.75 2.9 2.9 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.96-.1z" />
  </svg>
)

export default function SocialMediaPage() {
  const socialChannels = [
    {
      name: 'Facebook',
      icon: Facebook,
      handle: '@AVisionForYouRecovery',
      url: 'https://www.facebook.com/avisionforyourecovery',
      description: 'Join our community for daily inspiration, event updates, and recovery resources',
      followers: '2.5K',
      color: 'from-blue-600 to-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      handle: '@avisionforyourecovery',
      url: 'https://www.instagram.com/avision_foryourecovery/',
      description: 'Follow us for recovery stories, program highlights, and community celebrations',
      followers: '2.1K',
      color: 'from-pink-600 to-purple-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200'
    },
    {
      name: 'Twitter / X',
      icon: Twitter,
      handle: '@AVFYRecovery',
      url: 'https://twitter.com/avfyrecovery',
      description: 'Stay updated with recovery news, advocacy efforts, and community announcements',
      followers: '890',
      color: 'from-sky-500 to-sky-600',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      handle: 'A Vision For You Recovery',
      url: 'https://www.linkedin.com/company/a-vision-for-you-inc-addiction-recovery-program/',
      description: 'Connect with us professionally and explore career opportunities',
      followers: '1.2K',
      color: 'from-blue-700 to-blue-800',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300'
    },
    {
      name: 'TikTok',
      icon: TikTokIcon,
      handle: '@avisionforyourecovery',
      url: 'https://www.tiktok.com/@avisionforyourecovery?_r=1&_t=ZP-92h34Bcel0Y',
      description: 'Watch short-form recovery tips, success stories, and community highlights',
      followers: '3.2K',
      color: 'from-gray-800 to-black',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    }
  ]

  const contentHighlights = [
    {
      title: 'Recovery Stories',
      description: 'Real testimonials from graduates sharing their journey to sobriety',
      platforms: ['Instagram', 'Facebook', 'TikTok']
    },
    {
      title: 'Event Updates',
      description: 'Stay informed about community meetings, workshops, and fundraisers',
      platforms: ['Facebook', 'Twitter', 'Instagram']
    },
    {
      title: 'Quick Tips & Insights',
      description: 'Short-form recovery tips, resources, and evidence-based information',
      platforms: ['TikTok', 'Instagram', 'Twitter']
    },
    {
      title: 'Program Highlights',
      description: 'Behind-the-scenes looks at our programs and community impact',
      platforms: ['Instagram', 'TikTok', 'Facebook']
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-brand-purple to-purple-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-green rounded-full mb-6">
              <Instagram className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-4">Connect With Us</h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              Join our online community for daily inspiration, recovery resources, and stories of hope
            </p>
          </div>
        </div>
      </section>

      {/* Social Media Channels */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Follow Us</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Stay connected across all your favorite platforms
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {socialChannels.map((channel, idx) => {
              const Icon = channel.icon
              return (
                <a
                  key={idx}
                  href={channel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${channel.bgColor} border-2 ${channel.borderColor} rounded-xl p-6 hover:shadow-xl transition-all duration-300 group`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${channel.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-brand-purple transition-colors" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{channel.name}</h3>
                  <p className="text-sm text-gray-600 font-medium mb-3">{channel.handle}</p>
                  <p className="text-gray-700 mb-4">{channel.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-sm text-gray-500">Followers</span>
                    <span className="text-lg font-bold text-brand-purple">{channel.followers}</span>
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      </section>

      {/* Content Highlights */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What We Share</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the type of content you'll find on our social channels
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contentHighlights.map((content, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-brand-purple">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{content.title}</h3>
                <p className="text-gray-600 mb-4">{content.description}</p>
                <div className="flex flex-wrap gap-2">
                  {content.platforms.map((platform, pIdx) => (
                    <span key={pIdx} className="px-3 py-1 bg-purple-100 text-brand-purple rounded-full text-sm font-medium">
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hashtags Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Join the Conversation</h2>
          <p className="text-lg text-gray-600 mb-8">
            Use these hashtags to share your recovery journey and connect with our community
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {['#AVisionForYou', '#RecoveryIsPossible', '#SurrenderToRecover', '#MindBodySoul', '#MovingMountains', '#LouisvilleRecovery'].map((tag, idx) => (
              <span key={idx} className="px-4 py-2 bg-gradient-to-r from-brand-purple to-purple-700 text-white rounded-full font-semibold text-sm hover:shadow-lg transition-shadow cursor-pointer">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-gradient-to-r from-brand-purple to-purple-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Mail className="w-12 h-12 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter for monthly recovery resources, success stories, and event announcements
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-green"
            />
            <button className="px-8 py-3 bg-brand-green text-brand-purple font-bold rounded-lg hover:bg-green-400 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-purple-50 to-green-50 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Prefer Direct Contact?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <a href="tel:(502)749-6344" className="flex flex-col items-center gap-2 text-brand-purple hover:text-purple-700 transition-colors">
                <div className="w-12 h-12 bg-brand-purple rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <span className="font-semibold">(502) 749-6344</span>
              </a>
              <a href="mailto:info@avisionforyourecovery.org" className="flex flex-col items-center gap-2 text-brand-purple hover:text-purple-700 transition-colors">
                <div className="w-12 h-12 bg-brand-purple rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <span className="font-semibold">Email Us</span>
              </a>
              <a href="https://maps.google.com/?q=1675+Story+Ave,+Louisville,+KY+40206" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 text-brand-purple hover:text-purple-700 transition-colors">
                <div className="w-12 h-12 bg-brand-purple rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <span className="font-semibold">Visit Us</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
