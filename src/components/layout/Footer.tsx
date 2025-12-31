'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Linkedin, Instagram, Heart, Twitter } from 'lucide-react';
import NewsletterSignup from '@/components/shared/NewsletterSignup';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* About Section */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">A Vision For You</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Empowering individuals and communities through recovery, hope, and transformation. Building a world where everyone has a vision for their future.
              </p>
              <div className="flex gap-4">
                <a href="https://www.facebook.com/avisionforyourecovery" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://www.instagram.com/avision_foryourecovery/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-400 transition">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://www.linkedin.com/company/a-vision-for-you-inc-addiction-recovery-program/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="https://twitter.com/search?q=avisionforyourecovery" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-sky-400 transition">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-white transition text-sm">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/programs" className="text-gray-400 hover:text-white transition text-sm">
                    Programs
                  </Link>
                </li>
                <li>
                  <Link href="/team" className="text-gray-400 hover:text-white transition text-sm">
                    Our Team
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-gray-400 hover:text-white transition text-sm">
                    Resources
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-white transition text-sm">
                    About Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Services</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/assessment" className="text-gray-400 hover:text-white transition text-sm">
                    Recovery Assessment
                  </Link>
                </li>
                <li>
                  <Link href="/meetings" className="text-gray-400 hover:text-white transition text-sm">
                    Meetings & Groups
                  </Link>
                </li>
                <li>
                  <Link href="/donation" className="text-gray-400 hover:text-white transition text-sm">
                    Donate
                  </Link>
                </li>
                <li>
                  <Link href="/admission" className="text-gray-400 hover:text-white transition text-sm">
                    Get Help
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition text-sm">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Contact</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-400">Call us anytime</p>
                    <p className="text-white font-semibold">(502) 749-6344</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white font-semibold">info@avisionforyourecovery.org</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-400">Address</p>
                    <p className="text-white font-semibold">1675 Story Ave<br />Louisville, KY 40206</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Boxes */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <h3 className="text-white font-bold text-lg mb-6">Connect With Us On Social Media</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <a href="https://www.facebook.com/avisionforyourecovery" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-blue-600 transition rounded-lg p-4 text-center">
                <Facebook className="w-6 h-6 mx-auto mb-2" />
                <p className="text-white text-sm font-semibold">Facebook</p>
                <p className="text-gray-400 text-xs">869 followers</p>
              </a>
              <a href="https://www.instagram.com/avision_foryourecovery/" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-pink-600 transition rounded-lg p-4 text-center">
                <Instagram className="w-6 h-6 mx-auto mb-2" />
                <p className="text-white text-sm font-semibold">Instagram</p>
                <p className="text-gray-400 text-xs">112 followers</p>
              </a>
              <a href="https://twitter.com/search?q=avisionforyourecovery" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-sky-500 transition rounded-lg p-4 text-center">
                <Twitter className="w-6 h-6 mx-auto mb-2" />
                <p className="text-white text-sm font-semibold">Twitter/X</p>
                <p className="text-gray-400 text-xs">70 followers</p>
              </a>
              <a href="https://www.linkedin.com/company/a-vision-for-you-inc-addiction-recovery-program/" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-blue-700 transition rounded-lg p-4 text-center">
                <Linkedin className="w-6 h-6 mx-auto mb-2" />
                <p className="text-white text-sm font-semibold">LinkedIn</p>
                <p className="text-gray-400 text-xs">23 followers</p>
              </a>
              <a href="https://www.tiktok.com/@avisionforyourecovery?_r=1&_t=ZP-92h34Bcel0Y" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-black transition rounded-lg p-4 text-center">
                <svg className="w-6 h-6 mx-auto mb-2 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.1 1.74 2.89 2.89 0 0 1 2.31-4.64 2.86 2.86 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.54-.05z" />
                </svg>
                <p className="text-white text-sm font-semibold">TikTok</p>
                <p className="text-gray-400 text-xs">41 followers</p>
              </a>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="mt-12">
            <NewsletterSignup />
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800 bg-gray-950 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              <p>© 2025 A Vision For You Recovery. All rights reserved.</p>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link href="#" className="hover:text-white transition">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-white transition">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-white transition">
                Cookie Policy
              </Link>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>for recovery</span>
            </div>
          </div>

          {/* Crisis Line */}
          <div className="mt-6 pt-6 border-t border-gray-800 text-center">
            <p className="text-gray-400 text-sm mb-2">Need immediate help?</p>
            <p className="text-red-400 font-semibold text-lg">
              National Suicide Prevention Lifeline: 1-800-273-8255 (Available 24/7)
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
