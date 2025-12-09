'use client';

import Link from 'next/link';

export default function Team() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-2">Our Team</h1>
          <p className="text-blue-100">Meet the people dedicated to your recovery journey</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-8">Team page under maintenance - coming back soon</p>
          <Link 
            href="/" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Return Home
          </Link>
        </div>
      </div>

      <footer className="bg-gray-900 text-gray-300 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p>&copy; 2025 A Vision For You Recovery. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
