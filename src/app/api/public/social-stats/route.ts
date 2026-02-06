import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Fetch all social stats from database
    // If table doesn't exist, return defaults
    let stats
    try {
      stats = await db.socialStats.findMany({
        select: {
          platform: true,
          followers: true,
          handle: true,
          url: true
        },
        orderBy: { platform: 'asc' }
      })
    } catch (error: any) {
      // If table doesn't exist, return defaults
      if (error?.message?.includes('does not exist') || error?.code === '42P01') {
        console.warn('Social stats table does not exist, returning defaults')
        return NextResponse.json({
          facebook: { followers: 869, handle: '@AVisionForYouRecovery', url: 'https://www.facebook.com/avisionforyourecovery' },
          instagram: { followers: 112, handle: '@avisionforyourecovery', url: 'https://www.instagram.com/avision_foryourecovery/' },
          linkedin: { followers: 23, handle: 'A Vision For You', url: 'https://www.linkedin.com/company/a-vision-for-you-inc-addiction-recovery-program/' },
          tiktok: { followers: 41, handle: '@avisionforyourecovery', url: 'https://www.tiktok.com/@avisionforyourecovery' }
        })
      }
      throw error
    }

    // If no stats in database, return defaults
    if (stats.length === 0) {
      return NextResponse.json({
        facebook: { followers: 869, handle: '@AVisionForYouRecovery', url: 'https://www.facebook.com/avisionforyourecovery' },
        instagram: { followers: 112, handle: '@avisionforyourecovery', url: 'https://www.instagram.com/avision_foryourecovery/' },
        linkedin: { followers: 23, handle: 'A Vision For You', url: 'https://www.linkedin.com/company/a-vision-for-you-inc-addiction-recovery-program/' },
        tiktok: { followers: 41, handle: '@avisionforyourecovery', url: 'https://www.tiktok.com/@avisionforyourecovery' }
      })
    }

    // Convert to object format
    const statsObj = stats.reduce((acc, stat) => {
      acc[stat.platform] = {
        followers: stat.followers,
        handle: stat.handle,
        url: stat.url
      }
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json(statsObj)
  } catch (error) {
    console.error('Error fetching public social stats:', error)
    
    // Return defaults on error
    return NextResponse.json({
      facebook: { followers: 869, handle: '@AVisionForYouRecovery', url: 'https://www.facebook.com/avisionforyourecovery' },
      instagram: { followers: 112, handle: '@avisionforyourecovery', url: 'https://www.instagram.com/avision_foryourecovery/' },
      linkedin: { followers: 23, handle: 'A Vision For You Recovery', url: 'https://www.linkedin.com/company/a-vision-for-you-inc-addiction-recovery-program/' },
      tiktok: { followers: 41, handle: '@avisionforyourecovery', url: 'https://www.tiktok.com/@avisionforyourecovery' }
    })
  }
}
