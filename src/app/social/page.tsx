'use client'

import { Facebook, Instagram, Twitter, Linkedin, Youtube, Mail, Phone, MapPin, ExternalLink, Music } from 'lucide-react'

export default function SocialMediaPage() {
  const socialChannels = [
    {
      name: 'Facebook',
      icon: Facebook,
      handle: '@AVisionForYouRecovery',
      url: 'https://facebook.com/avisionforyourecovery',
      description: 'Join our community for daily inspiration, event updates, and recovery resources',
      followers: '2.3K',
      color: 'from-blue-600 to-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      handle: '@avisionforyourecovery',
      url: 'https://instagram.com/avisionforyourecovery',
      description: 'Follow us for recovery stories, program highlights, and community celebrations',
      followers: '1.8K',
      color: 'from-pink-600 to-purple-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200'
    },
    {
      name: 'TikTok',
      icon: Music,
      handle: '@AVFYRecovery',
      url: 'https://tiktok.com/@avfyrecovery',
      description: 'Short-form recovery content, day-in-the-life videos, and community moments',
      followers: '450',
      color: 'from-gray-900 to-black',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    },
    {
      name: 'Twitter / X',
      icon: Twitter,
      handle: '@AVFYRecovery',
      url: 'https://twitter.com/avfyrecovery',
      description: 'Stay updated with recovery news, advocacy efforts, and community announcements',
      followers: '1.2K',
      color: 'from-sky-500 to-sky-600',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      handle: 'A Vision For You Recovery',
      url: 'https://linkedin.com/company/avisionforyourecovery',
      description: 'Connect with us professionally and explore career opportunities',
      followers: '850',
      color: 'from-blue-700 to-blue-800',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300'
    },
    {
      name: 'YouTube',
      icon: Youtube,
      handle: '@AVisionForYouRecovery',
      url: 'https://youtube.com/@avisionforyourecovery',
      description: 'Watch testimonials, program tours, educational content, and recovery resources',
      followers: '920',
      color: 'from-red-600 to-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  ]

  const contentHighlights = [
    {
      title: 'Recovery Stories',
      description: 'Real testimonials from graduates sharing their journey to sobriety',
      platforms: ['Instagram', 'Facebook', 'YouTube', 'TikTok']
    },
    {
      title: 'Event Updates',
      description: 'Stay informed about community meetings, workshops, and fundraisers',
      platforms: ['Facebook', 'Twitter', 'Instagram', 'TikTok']
    },
    {
      title: 'Educational Content',
      description: 'Tips, resources, and evidence-based recovery information',
      platforms: ['YouTube', 'LinkedIn', 'Twitter', 'TikTok']
    },
    {
      title: 'Program Highlights',
      description: 'Behind-the-scenes looks at our programs and facilities',
      platforms: ['Instagram', 'YouTube', 'Facebook', 'TikTok']
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

      {/* Social Channels Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">Our Social Channels</h2>
          <p className="text-center text-gray-600 text-lg mb-16 max-w-3xl mx-auto">
            Follow us on your favorite platforms to stay connected with the A Vision For You Recovery community
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {socialChannels.map((channel) => {
              const Icon = channel.icon
              return (
                <a
                  key={channel.name}
                  href={channel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-200 overflow-hidden hover:border-brand-purple"
                >
                  <div className={`bg-gradient-to-br ${channel.color} p-8 text-white`}>
                    <Icon className="w-12 h-12 mb-4" />
                    <h3 className="text-2xl font-bold mb-2">{channel.name}</h3>
                    <p className="text-sm opacity-90">{channel.handle}</p>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-gray-700 mb-4">{channel.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-brand-purple">{channel.followers} followers</span>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-brand-purple transition-colors" />
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      </section>

      {/* Content Highlights */}
      <section className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">What We Share</h2>
          <p className="text-center text-gray-600 text-lg mb-16 max-w-3xl mx-auto">
            Discover the diverse content we create across our social channels
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {contentHighlights.map((highlight, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-8 border-l-4 border-brand-purple">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{highlight.title}</h3>
                <p className="text-gray-600 mb-6">{highlight.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  {highlight.platforms.map((platform) => (
                    <span
                      key={platform}
                      className="px-3 py-1 bg-purple-100 text-brand-purple rounded-full text-sm font-semibold"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-brand-purple to-purple-900 text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Join Our Community?</h2>
          <p className="text-xl text-purple-100 mb-8">
            Pick your favorite platform and start following us today. Let's build a stronger, more connected recovery community together.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            {socialChannels.slice(0, 3).map((channel) => (
              <a
                key={channel.name}
                href={channel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white text-brand-purple rounded-lg font-semibold hover:bg-brand-green hover:text-white transition-all duration-300 inline-flex items-center gap-2"
              >
                <channel.icon className="w-5 h-5" />
                Follow on {channel.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">Other Ways to Connect</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8 text-center border border-blue-200">
              <Mail className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
              <a href="mailto:info@avisionforyou.org" className="text-blue-600 hover:text-blue-800 font-semibold">
                info@avisionforyou.org
              </a>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-8 text-center border border-green-200">
              <Phone className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Phone</h3>
              <a href="tel:+15027496344" className="text-green-600 hover:text-green-800 font-semibold">
                (502) 749-6344
              </a>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-8 text-center border border-purple-200">
              <MapPin className="w-12 h-12 text-brand-purple mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Visit Us</h3>
              <p className="text-gray-700 font-semibold">
                Louisville, KY<br/>
                <span className="text-sm text-gray-600">Recovery facilities open daily</span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
