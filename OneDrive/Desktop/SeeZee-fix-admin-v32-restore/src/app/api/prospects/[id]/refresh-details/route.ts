import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

/**
 * POST /api/prospects/[id]/refresh-details
 * Fetch updated details from Google Places API for a prospect
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allowedRoles = ['CEO', 'CFO', 'OUTREACH'];
    if (!allowedRoles.includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      );
    }

    // Get prospect
    const prospect = await prisma.prospect.findUnique({
      where: { id },
    });

    if (!prospect) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
    }

    if (!prospect.googlePlaceId) {
      return NextResponse.json(
        { error: 'Prospect does not have a Google Place ID' },
        { status: 400 }
      );
    }

    // Fetch details from Google Places API
    const placeDetailsUrl = 'https://places.googleapis.com/v1/places/' + prospect.googlePlaceId;
    
    const response = await axios.get(placeDetailsUrl, {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'id,displayName,formattedAddress,nationalPhoneNumber,internationalPhoneNumber,websiteUri,rating,userRatingCount,reviews,photos,types,businessStatus,priceLevel,location,currentOpeningHours,regularOpeningHours,editorialSummary,paymentOptions,accessibilityOptions,utcOffset,adrAddress'
      }
    });

    const place = response.data;

    // Update prospect with fresh data
    const updatedProspect = await prisma.prospect.update({
      where: { id },
      data: {
        name: place.displayName?.text || prospect.name,
        address: place.formattedAddress || place.adrAddress || prospect.address,
        phone: place.nationalPhoneNumber || place.internationalPhoneNumber || prospect.phone,
        websiteUrl: place.websiteUri || prospect.websiteUrl,
        hasWebsite: !!place.websiteUri,
        googleRating: place.rating || prospect.googleRating,
        googleReviews: place.userRatingCount || prospect.googleReviews,
        latitude: place.location?.latitude || prospect.latitude,
        longitude: place.location?.longitude || prospect.longitude,
        discoveryMetadata: {
          ...((prospect.discoveryMetadata as any) || {}),
          lastRefreshed: new Date().toISOString(),
          businessStatus: place.businessStatus,
          priceLevel: place.priceLevel,
          openingHours: place.currentOpeningHours || place.regularOpeningHours,
          editorialSummary: place.editorialSummary?.text,
          reviews: place.reviews?.slice(0, 10).map((r: any) => ({
            author: r.authorAttribution?.displayName,
            rating: r.rating,
            text: r.text?.text,
            publishTime: r.publishTime,
            relativePublishTimeDescription: r.relativePublishTimeDescription,
          })),
          photos: place.photos?.slice(0, 5).map((p: any) => ({
            name: p.name,
            widthPx: p.widthPx,
            heightPx: p.heightPx,
          })),
        },
      },
    });

    // Create activity log
    try {
      await prisma.prospectActivity.create({
        data: {
          prospectId: id,
          type: 'REFRESHED_DETAILS' as any, // Will be available after Prisma client regeneration
          description: 'Refreshed details from Google Places API',
          metadata: {
            refreshedAt: new Date().toISOString(),
            rating: place.rating,
            reviews: place.userRatingCount,
            hasWebsite: !!place.websiteUri,
          },
        },
      });
    } catch (activityError) {
      console.warn('Failed to create activity log:', activityError);
      // Don't fail the whole request if activity logging fails
    }

    return NextResponse.json({
      success: true,
      prospect: updatedProspect,
      message: 'Prospect details refreshed successfully',
    });
  } catch (error: any) {
    console.error('[POST /api/prospects/:id/refresh-details]', error);
    
    if (error.response) {
      console.error('Google Places API error:', {
        status: error.response.status,
        data: error.response.data,
      });
    }

    return NextResponse.json(
      {
        error: error.response?.data?.error?.message || error.message || 'Failed to refresh prospect details',
      },
      { status: error.response?.status || 500 }
    );
  }
}

