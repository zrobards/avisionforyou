'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FaInstagram, FaLinkedin, FaGithub } from 'react-icons/fa'
import LogoHeader from './LogoHeader'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300 border-t-2 border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link
              href="/"
              className="flex items-center mb-4 focus:outline-none focus:ring-2 focus:ring-trinity-red focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md px-2 py-1"
              aria-label="SeeZee Studio Home"
            >
              <div className="[&_.logo-header-text]:!text-white [&_.logo-header-text]:!opacity-100 [&_.logo-header-capsule]:!bg-trinity-red [&_.logo-header-capsule]:!text-white [&_.logo-header-capsule]:!opacity-100">
                <LogoHeader />
              </div>
            </Link>
            <p className="text-white mb-6 max-w-md leading-relaxed">
              Professional websites for small businesses — quick, affordable, and fully managed through your own dashboard.
            </p>
            <div className="flex space-x-4">
              <motion.a
                href="https://www.instagram.com/sean.mcculloch7/?hl=en"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="text-white hover:text-trinity-red transition-colors focus:outline-none focus:ring-2 focus:ring-trinity-red focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md p-1"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram className="h-6 w-6" />
              </motion.a>
              <motion.a
                href="https://www.linkedin.com/in/sean-mcculloch-58a3761a9/"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="text-white hover:text-trinity-red transition-colors focus:outline-none focus:ring-2 focus:ring-trinity-red focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md p-1"
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaLinkedin className="h-6 w-6" />
              </motion.a>
              <motion.a
                href="https://github.com/SeanSpon"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="text-white hover:text-trinity-red transition-colors focus:outline-none focus:ring-2 focus:ring-trinity-red focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md p-1"
                aria-label="GitHub"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaGithub className="h-6 w-6" />
              </motion.a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-heading font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-white hover:text-trinity-red transition-colors focus:outline-none focus:ring-2 focus:ring-trinity-red focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md px-1"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-white hover:text-trinity-red transition-colors focus:outline-none focus:ring-2 focus:ring-trinity-red focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md px-1"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="text-white hover:text-trinity-red transition-colors focus:outline-none focus:ring-2 focus:ring-trinity-red focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md px-1"
                >
                  Projects
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-white hover:text-trinity-red transition-colors focus:outline-none focus:ring-2 focus:ring-trinity-red focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md px-1"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/philosophy"
                  className="text-white hover:text-trinity-red transition-colors focus:outline-none focus:ring-2 focus:ring-trinity-red focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md px-1"
                >
                  Philosophy
                </Link>
              </li>
              <li>
                <Link
                  href="/case-studies/big-red-bus"
                  className="text-white hover:text-trinity-red transition-colors focus:outline-none focus:ring-2 focus:ring-trinity-red focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md px-1"
                >
                  Case Studies
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-heading font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-white">
              <li>
                <a
                  href="mailto:seezee.enterprises@gmail.com"
                  className="text-white hover:text-trinity-red transition-colors focus:outline-none focus:ring-2 focus:ring-trinity-red focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md px-1"
                >
                  seezee.enterprises@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+15024352986"
                  className="text-white hover:text-trinity-red transition-colors focus:outline-none focus:ring-2 focus:ring-trinity-red focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md px-1"
                >
                  1(502) 435-2986
                </a>
              </li>
              <li>louisville kentucky</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-white">
          <p>&copy; {currentYear} SeeZee Studio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

