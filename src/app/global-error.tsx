'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #1e1b4b 100%)',
          padding: '24px',
        }}>
          <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '36px',
            }}>
              &#x2764;
            </div>
            <h1 style={{ color: 'white', fontSize: '28px', marginBottom: '12px' }}>
              Something Went Wrong
            </h1>
            <p style={{ color: '#c4b5fd', marginBottom: '32px', lineHeight: 1.6 }}>
              We encountered a critical error. Please try refreshing the page.
            </p>
            <button
              onClick={reset}
              style={{
                padding: '12px 32px',
                backgroundColor: '#7f3d8b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
            <p style={{ color: 'rgba(196, 181, 253, 0.6)', fontSize: '14px', marginTop: '32px' }}>
              Need help? Call{' '}
              <a href="tel:+15027496344" style={{ color: '#b6e41f' }}>(502) 749-6344</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}
