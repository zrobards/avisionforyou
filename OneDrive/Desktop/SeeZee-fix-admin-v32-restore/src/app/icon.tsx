import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = {
  width: 512,
  height: 512,
}
export const contentType = 'image/png'

export default async function Icon() {
  // Try to fetch the bus image from the public folder
  // Try production URL first, then fallback to localhost for dev
  const productionUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://see-zee.com'
  const localhostUrl = 'http://localhost:3000'
  
  // Try production first, then localhost
  let busImageResponse = await fetch(`${productionUrl}/big-red-bus-1.png`).catch(() => null)
  if (!busImageResponse?.ok) {
    busImageResponse = await fetch(`${localhostUrl}/big-red-bus-1.png`).catch(() => null)
  }
  
  const busImageBase64 = busImageResponse?.ok 
    ? await busImageResponse.arrayBuffer().then(buffer => {
        const base64 = Buffer.from(buffer).toString('base64')
        return `data:image/png;base64,${base64}`
      })
    : null

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          borderRadius: '20%',
          overflow: 'hidden',
          background: busImageBase64 
            ? `url(${busImageBase64})` 
            : '#0A0E27',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {!busImageBase64 && (
          // Fallback to SZ monogram if image fails to load
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {/* S Letter */}
            <div
              style={{
                fontSize: 280,
                fontWeight: 900,
                background: 'linear-gradient(135deg, #DC143C 0%, #FFA500 50%, #DC143C 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                lineHeight: 1,
                textShadow: '0 0 40px rgba(220, 20, 60, 0.6)',
                letterSpacing: '-10px',
              }}
            >
              S
            </div>
            
            {/* Z Letter */}
            <div
              style={{
                fontSize: 280,
                fontWeight: 900,
                background: 'linear-gradient(135deg, #DC143C 0%, #FFA500 50%, #DC143C 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                lineHeight: 1,
                textShadow: '0 0 40px rgba(220, 20, 60, 0.6)',
                letterSpacing: '-10px',
              }}
            >
              Z
            </div>
          </div>
        )}
      </div>
    ),
    {
      ...size,
    }
  )
}





