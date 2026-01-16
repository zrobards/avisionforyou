'use client';

import { useState, useEffect } from 'react';
import { Facebook, Instagram, Twitter, Youtube, ExternalLink, Shield } from 'lucide-react';

interface SocialFeedProps {
  /**
   * Show embed widgets or just links
   */
  mode?: 'embed' | 'links';
  /**
   * Lazy load embeds for privacy
   */
  lazyLoad?: boolean;
  /**
   * Limit number of platforms to show
   */
  limit?: number;
}

interface SocialPlatform {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  embedCode: string | null;
  link: string;
  handle: string;
  color: string;
}

export default function SocialFeed({ 
  mode = 'embed', 
  lazyLoad = true,
  limit 
}: SocialFeedProps) {
  const [loadedEmbeds, setLoadedEmbeds] = useState<Set<string>>(new Set());
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(lazyLoad);

  // Social media configuration
  const platforms: SocialPlatform[] = [
    {
      name: 'Facebook',
      icon: Facebook,
      embedCode: null, // To be configured with actual Facebook Page Plugin
      link: 'https://facebook.com/avisionforyourecovery',
      handle: '@avisionforyourecovery',
      color: 'text-blue-600',
    },
    {
      name: 'Instagram',
      icon: Instagram,
      embedCode: null, // Instagram embed requires OAuth
      link: 'https://instagram.com/avisionforyourecovery',
      handle: '@avisionforyourecovery',
      color: 'text-pink-600',
    },
    {
      name: 'Twitter',
      icon: Twitter,
      embedCode: null, // Twitter timeline embed
      link: 'https://twitter.com/avfy_recovery',
      handle: '@avfy_recovery',
      color: 'text-blue-400',
    },
    {
      name: 'YouTube',
      icon: Youtube,
      embedCode: null, // YouTube channel embed
      link: 'https://youtube.com/@avisionforyourecovery',
      handle: '@avisionforyourecovery',
      color: 'text-red-600',
    },
  ];

  const displayedPlatforms = limit ? platforms.slice(0, limit) : platforms;

  function handleLoadEmbed(platformName: string) {
    setLoadedEmbeds(new Set([...loadedEmbeds, platformName]));
    setShowPrivacyNotice(false);
  }

  function handleLoadAllEmbeds() {
    setLoadedEmbeds(new Set(platforms.map(p => p.name)));
    setShowPrivacyNotice(false);
  }

  // Link mode - just show social links
  if (mode === 'links') {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Follow Us</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayedPlatforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <a
                key={platform.name}
                href={platform.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow hover:shadow-lg transition border-2 border-transparent hover:border-indigo-200"
              >
                <Icon className={`w-10 h-10 ${platform.color} mb-2`} />
                <span className="font-semibold text-gray-900">{platform.name}</span>
                <span className="text-xs text-gray-500">{platform.handle}</span>
              </a>
            );
          })}
        </div>
      </div>
    );
  }

  // Embed mode - show social media feed embeds
  return (
    <div className="space-y-6">
      {showPrivacyNotice && lazyLoad && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">Privacy Notice</h3>
              <p className="text-blue-800 text-sm mb-4">
                Social media embeds may load tracking cookies from third-party platforms. Click below
                to load the social media feeds and connect with our community updates.
              </p>
              <button
                onClick={handleLoadAllEmbeds}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
              >
                Load Social Media Feeds
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayedPlatforms.map((platform) => {
          const Icon = platform.icon;
          const isLoaded = loadedEmbeds.has(platform.name) || !lazyLoad;

          return (
            <div key={platform.name} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Platform Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4">
                <div className="flex items-center gap-3">
                  <Icon className="w-6 h-6" />
                  <div>
                    <h3 className="font-bold">{platform.name}</h3>
                    <p className="text-xs opacity-90">{platform.handle}</p>
                  </div>
                </div>
              </div>

              {/* Embed Content or Placeholder */}
              <div className="p-4">
                {isLoaded ? (
                  // If embed code is configured, show it; otherwise show "Coming Soon"
                  platform.embedCode ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: platform.embedCode }}
                      className="min-h-[300px]"
                    />
                  ) : (
                    <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-lg">
                      <Icon className={`w-12 h-12 ${platform.color} mb-3`} />
                      <p className="text-gray-600 mb-4">
                        Connect with us on {platform.name}
                      </p>
                      <a
                        href={platform.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-semibold"
                      >
                        <span>Visit Page</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )
                ) : (
                  <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-lg">
                    <Icon className={`w-12 h-12 ${platform.color} mb-3 opacity-50`} />
                    <button
                      onClick={() => handleLoadEmbed(platform.name)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-semibold"
                    >
                      Load {platform.name} Feed
                    </button>
                  </div>
                )}
              </div>

              {/* Footer Link */}
              <div className="border-t border-gray-200 p-3 bg-gray-50">
                <a
                  href={platform.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold flex items-center justify-center gap-2"
                >
                  <span>Follow us on {platform.name}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg p-8 text-center">
        <h3 className="text-2xl font-bold mb-2">Stay Connected</h3>
        <p className="text-indigo-100 mb-6">
          Follow us on social media for recovery stories, event updates, and community support
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <a
                key={platform.name}
                href={platform.link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition"
                title={`Follow us on ${platform.name}`}
              >
                <Icon className="w-6 h-6" />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Compact social media links bar
 */
export function SocialLinksBar() {
  const platforms = [
    { name: 'Facebook', icon: Facebook, link: 'https://facebook.com/avisionforyourecovery' },
    { name: 'Instagram', icon: Instagram, link: 'https://instagram.com/avisionforyourecovery' },
    { name: 'Twitter', icon: Twitter, link: 'https://twitter.com/avfy_recovery' },
    { name: 'YouTube', icon: Youtube, link: 'https://youtube.com/@avisionforyourecovery' },
  ];

  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-600 font-semibold">Follow Us:</span>
      {platforms.map((platform) => {
        const Icon = platform.icon;
        return (
          <a
            key={platform.name}
            href={platform.link}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-600 hover:text-indigo-600 transition"
            title={platform.name}
          >
            <Icon className="w-5 h-5" />
          </a>
        );
      })}
    </div>
  );
}
