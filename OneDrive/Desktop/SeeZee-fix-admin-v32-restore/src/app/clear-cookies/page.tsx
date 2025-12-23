'use client';

import { useEffect } from 'react';

export default function ClearCookiesPage() {
  useEffect(() => {
    // Redirect to static HTML file that clears cookies
    // This works even when cookies are too large (431 error) because
    // static files don't go through Next.js middleware or server processing
    // The static HTML file clears cookies client-side without needing to send them in the request
    window.location.href = '/clear-cookies.html';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Clearing Session Cookies
          </h1>
          <p className="text-gray-600">
            Please wait while we clear your session data...
          </p>
        </div>
      </div>
    </div>
  );
}






