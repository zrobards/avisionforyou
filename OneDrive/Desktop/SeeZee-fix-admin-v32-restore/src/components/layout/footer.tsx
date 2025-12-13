import Link from 'next/link'
import { LogoMinimal } from '@/components/Logo'
import { FaInstagram, FaLinkedin, FaGithub } from 'react-icons/fa'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const navigation = {
    main: [
      { name: 'Services', href: '/services' },
      { name: 'Work', href: '/work' },
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/legal/privacy' },
      { name: 'Terms of Service', href: '/legal/terms' },
    ],
    social: [
      { name: 'GitHub', href: 'https://github.com/SeanSpon' },
      { name: 'LinkedIn', href: 'https://www.linkedin.com/in/sean-mcculloch-58a3761a9/' },
      { name: 'Instagram', href: 'https://www.instagram.com/sean.mcculloch7/?hl=en' },
    ]
  }

  return (
    <footer className="relative mt-16 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 backdrop-blur-xl border-t border-red-900/20">
      {/* Gradient separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
      
      <div className="container-custom pt-24 pb-12">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
          {/* Brand section */}
          <div className="md:col-span-5 mt-8">
            <div className="flex items-center gap-3 mb-6">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <LogoMinimal size={100} />
              </Link>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-6">
              Professional websites built in 48 hours. Fully managed, beautifully designed, and maintained for life through your SeeZee Dashboard.
            </p>
            
            {/* Social links */}
            <div className="flex gap-3">
              <Link
                href="https://github.com/SeanSpon"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-red-950/30 backdrop-blur-xl border border-red-900/30 flex items-center justify-center hover:bg-red-900/50 hover:border-red-500/50 transition-all duration-300 group"
                aria-label="GitHub"
              >
                <FaGithub className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors" />
              </Link>
              <Link
                href="https://www.linkedin.com/in/sean-mcculloch-58a3761a9/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-red-950/30 backdrop-blur-xl border border-red-900/30 flex items-center justify-center hover:bg-red-900/50 hover:border-red-500/50 transition-all duration-300 group"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors" />
              </Link>
              <Link
                href="https://www.instagram.com/sean.mcculloch7/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-red-950/30 backdrop-blur-xl border border-red-900/30 flex items-center justify-center hover:bg-red-900/50 hover:border-red-500/50 transition-all duration-300 group"
                aria-label="Instagram"
              >
                <FaInstagram className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors" />
              </Link>
            </div>
          </div>

          {/* Navigation columns */}
          <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8 mt-8">
            {/* Main nav */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Navigate</h4>
              <nav className="space-y-3">
                {navigation.main.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block text-gray-400 text-sm hover:text-red-400 transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h4>
              <nav className="space-y-3">
                {navigation.legal.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block text-gray-400 text-sm hover:text-red-400 transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Contact CTA */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Get Started</h4>
              <Link
                href="/start"
                className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-semibold hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] transition-all duration-300 hover:from-red-700 hover:to-red-800"
              >
                Start Project
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-12 pb-8 border-t border-red-900/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {currentYear} SeeZee Studio. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Louisville, KY
              </span>
              <span>•</span>
              <span>Built Fast</span>
              <span>•</span>
              <span>Maintained Forever</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}