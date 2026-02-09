'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Linkedin, Instagram, Heart, Shield, ExternalLink } from 'lucide-react';
import NewsletterSignup from '@/components/shared/NewsletterSignup';

interface SocialStat {
  followers: number;
  handle: string;
  url: string;
}

export default function Footer() {
  const [socialStats, setSocialStats] = useState<Record<string, SocialStat>>({
    facebook: { followers: 869, handle: '@AVisionForYouRecovery', url: 'https://www.facebook.com/avisionforyourecovery' },
    instagram: { followers: 112, handle: '@avisionforyourecovery', url: 'https://www.instagram.com/avision_foryourecovery/' },
    linkedin: { followers: 23, handle: 'A Vision For You', url: 'https://www.linkedin.com/company/a-vision-for-you-inc-addiction-recovery-program/' },
    tiktok: { followers: 41, handle: '@avisionforyourecovery', url: 'https://www.tiktok.com/@avisionforyourecovery' }
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/public/social-stats', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setSocialStats(data);
        }
      } catch (error) {
        // silently fail - use defaults
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="bg-slate-950 text-white/70">
      {/* Social Media Banner */}
      <div className="border-t border-white/10 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <h3 className="text-white font-bold text-xl mb-2 text-center">Follow Our Journey</h3>
          <p className="text-white/40 text-sm text-center mb-8">Every follow helps us reach someone in need</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <a href={socialStats.facebook.url} target="_blank" rel="noopener noreferrer" className="group bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl p-4 sm:p-5 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-600/20">
              <Facebook className="w-7 h-7 mx-auto mb-2 text-white" />
              <p className="text-white font-bold text-sm">Facebook</p>
              <p className="text-white/70 text-xs">{socialStats.facebook.followers} followers</p>
              <span className="inline-flex items-center gap-1 text-white/50 text-xs mt-2 group-hover:text-white/80 transition-colors">Follow <ExternalLink className="w-3 h-3" /></span>
            </a>
            <a href={socialStats.instagram.url} target="_blank" rel="noopener noreferrer" className="group bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl p-4 sm:p-5 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-pink-500/20">
              <Instagram className="w-7 h-7 mx-auto mb-2 text-white" />
              <p className="text-white font-bold text-sm">Instagram</p>
              <p className="text-white/70 text-xs">{socialStats.instagram.followers} followers</p>
              <span className="inline-flex items-center gap-1 text-white/50 text-xs mt-2 group-hover:text-white/80 transition-colors">Follow <ExternalLink className="w-3 h-3" /></span>
            </a>
            <a href={socialStats.tiktok.url} target="_blank" rel="noopener noreferrer" className="group bg-gradient-to-br from-gray-800 to-black hover:from-gray-700 hover:to-gray-900 rounded-xl p-4 sm:p-5 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-gray-600/20">
              <svg className="w-7 h-7 mx-auto mb-2 fill-white" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.1 1.74 2.89 2.89 0 0 1 2.31-4.64 2.86 2.86 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.54-.05z" />
              </svg>
              <p className="text-white font-bold text-sm">TikTok</p>
              <p className="text-white/70 text-xs">{socialStats.tiktok.followers} followers</p>
              <span className="inline-flex items-center gap-1 text-white/50 text-xs mt-2 group-hover:text-white/80 transition-colors">Follow <ExternalLink className="w-3 h-3" /></span>
            </a>
            <a href={socialStats.linkedin.url} target="_blank" rel="noopener noreferrer" className="group bg-gradient-to-br from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 rounded-xl p-4 sm:p-5 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-700/20">
              <Linkedin className="w-7 h-7 mx-auto mb-2 text-white" />
              <p className="text-white font-bold text-sm">LinkedIn</p>
              <p className="text-white/70 text-xs">{socialStats.linkedin.followers} followers</p>
              <span className="inline-flex items-center gap-1 text-white/50 text-xs mt-2 group-hover:text-white/80 transition-colors">Follow <ExternalLink className="w-3 h-3" /></span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* About */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">A Vision For You</h3>
              <p className="text-white/50 text-sm leading-relaxed mb-4">
                Empowering the homeless, addicted, and mentally ill to lead productive lives through housing, treatment, education, and community support.
              </p>
              <div className="flex items-center gap-2 bg-brand-green/10 border border-brand-green/20 rounded-lg px-3 py-2">
                <Shield className="w-4 h-4 text-brand-green flex-shrink-0" />
                <span className="text-brand-green text-xs font-semibold">501(c)(3) Tax-Exempt Organization</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2.5">
                {[
                  { href: '/', label: 'Home' },
                  { href: '/programs', label: 'Programs' },
                  { href: '/about', label: 'About Us' },
                  { href: '/impact', label: 'Our Impact' },
                  { href: '/blog', label: 'Blog' },
                  { href: '/team', label: 'Our Team' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-white/50 hover:text-white transition text-sm">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Get Involved */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Get Involved</h3>
              <ul className="space-y-2.5">
                {[
                  { href: '/donate', label: 'Donate' },
                  { href: '/assessment', label: 'Recovery Assessment' },
                  { href: '/meetings', label: 'Meetings & Groups' },
                  { href: '/admission', label: 'Apply for Help' },
                  { href: '/contact', label: 'Contact Us' },
                  { href: '/contact?department=volunteer', label: 'Volunteer' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-white/50 hover:text-white transition text-sm">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Contact</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-brand-green mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-white/40">Call us anytime</p>
                    <a href="tel:+15027496344" className="text-white font-semibold hover:text-brand-green transition">(502) 749-6344</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-brand-green mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-white/40">Email</p>
                    <a href="mailto:info@avisionforyourecovery.org" className="text-white font-semibold hover:text-brand-green transition text-sm break-all">info@avisionforyourecovery.org</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand-green mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-white/40">Visit us</p>
                    <p className="text-white font-semibold text-sm">1675 Story Ave<br />Louisville, KY 40206</p>
                  </div>
                </div>
              </div>

              {/* Ways to Give */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <p className="text-xs text-white/40 font-semibold uppercase mb-2">Ways to Give</p>
                <p className="text-white/50 text-xs leading-relaxed">
                  Online, By Phone, or By Mail. Send checks to: A Vision For You Inc., 1675 Story Ave, Louisville, KY 40206
                </p>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="border-t border-white/10 pt-8 mb-8">
            <NewsletterSignup />
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-white/10 bg-black/30 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="text-white/40 text-sm text-center md:text-left">
              <p>&copy; {new Date().getFullYear()} A Vision For You Inc. All rights reserved.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-white/40">
              <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition">Terms of Use</Link>
              <Link href="/donate" className="hover:text-white transition">Donate</Link>
            </div>
            <div className="flex items-center gap-2 text-white/30 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>for recovery</span>
            </div>
          </div>

          {/* Emergency Resources */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <p className="text-white/30 text-xs text-center font-semibold uppercase tracking-wider">Emergency Resources</p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6 text-center">
              <p className="text-red-400 font-semibold text-sm">
                Suicide & Crisis Lifeline: <a href="tel:988" className="underline hover:text-red-300">988</a> (call or text 24/7)
              </p>
              <span className="hidden sm:inline text-white/20">|</span>
              <p className="text-amber-400 font-semibold text-sm">
                SAMHSA Helpline: <a href="tel:18006624357" className="underline hover:text-amber-300">1-800-662-4357</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
