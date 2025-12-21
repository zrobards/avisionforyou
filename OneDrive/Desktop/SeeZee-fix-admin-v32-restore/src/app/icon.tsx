import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = {
  width: 512,
  height: 512,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0A0E27',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* SZ Text */}
        <div
          style={{
            fontSize: 200,
            fontWeight: 900,
            background: 'linear-gradient(135deg, #DC143C 0%, #b91c1c 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            letterSpacing: '10px',
            marginBottom: 20,
          }}
        >
          SZ
        </div>
        
        {/* Studio Text */}
        <div
          style={{
            fontSize: 40,
            fontWeight: 600,
            color: '#64748b',
            letterSpacing: '12px',
          }}
        >
          STUDIO
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}





