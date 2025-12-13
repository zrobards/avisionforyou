import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          color: 'white',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Grid background pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              'linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '40px',
            zIndex: 1,
          }}
        >
          {/* Logo/Brand */}
          <div
            style={{
              fontSize: 120,
              fontWeight: 900,
              background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              marginBottom: 30,
            }}
          >
            SZ
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 70,
              fontWeight: 'bold',
              marginBottom: 20,
              lineHeight: 1.2,
            }}
          >
            SeeZee Studio
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 36,
              color: '#D1D5DB',
              marginBottom: 30,
              maxWidth: 900,
            }}
          >
            Custom Web & App Development
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 28,
              color: '#DC2626',
              fontWeight: 600,
            }}
          >
            Built in 48 Hours • Maintained for Life
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            right: 40,
            fontSize: 24,
            color: '#9CA3AF',
          }}
        >
          see-zee.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}

