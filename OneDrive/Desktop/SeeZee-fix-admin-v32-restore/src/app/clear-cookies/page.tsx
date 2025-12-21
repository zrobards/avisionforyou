'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClearCookiesPage() {
  const [status, setStatus] = useState<'clearing' | 'success' | 'error'>('clearing');
  const router = useRouter();

  useEffect(() => {
    const clearCookies = async () => {
      try {
        const response = await fetch('/api/auth/clear-session', {
          method: 'POST',
        });
        
        if (response.ok) {
          setStatus('success');
          // Wait 2 seconds then redirect to login
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Error clearing cookies:', error);
        setStatus('error');
      }
    };

    clearCookies();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {status === 'clearing' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Clearing Session Cookies
              </h1>
              <p className="text-gray-600">
                Please wait while we clear your session data...
              </p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="text-green-600 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Cookies Cleared Successfully
              </h1>
              <p className="text-gray-600">
                Redirecting to login page...
              </p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="text-red-600 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Error Clearing Cookies
              </h1>
              <p className="text-gray-600 mb-4">
                There was an error clearing your cookies. Please try manually clearing your browser cookies.
              </p>
              <button
                onClick={() => window.location.href = '/login'}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


