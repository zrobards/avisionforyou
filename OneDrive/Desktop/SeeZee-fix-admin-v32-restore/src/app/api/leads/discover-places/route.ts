import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/server/db';
import { searchPlaces, filterPlaces, PlaceDetails } from '@/lib/leads/places-finder';
import { analyzeLeadWithAI, batchAnalyzeLeads } from '@/lib/leads/ai-lead-analyzer';

export const maxDuration = 300; // 5 minutes for long-running discovery

interface DiscoverPlacesRequest {
  location: string;
  radius: number;
  type?: string;
  keyword?: string;
  analyzeWithAI: boolean;
  filters?: {
    hasWebsite?: boolean;
    minRating?: number;
    minReviews?: number;
  };
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || session.user.role !== 'CEO') {
      return NextResponse.json(
        { error: 'Unauthorized - CEO access required' },
        { status: 401 }
      );
    }

    const body: DiscoverPlacesRequest = await req.json();
    const {
      location = 'Louisville, KY',
      radius = 16000, // 10 miles
      type,
      keyword,
      analyzeWithAI = false,
      filters = {}
    } = body;

    console.log('🔍 Starting Places discovery...', {
      location,
      radius,
      type,
      keyword,
      analyzeWithAI
    });

    // Step 1: Search Google Places
    const allPlaces = await searchPlaces({
      location,
      radius,
      type,
      keyword
    });

    console.log(`📍 Found ${allPlaces.length} places`);

    // Step 2: Apply filters (relaxed - prioritize places WITHOUT websites for web agency leads)
    const filteredPlaces = filterPlaces(allPlaces, {
      hasWebsite: filters.hasWebsite, // undefined = accept all, false = only no website, true = require website
      minRating: filters.minRating,
      minReviews: filters.minReviews,
      prioritizeNoWebsite: true // Places without websites are better leads for a web agency!
    });

    console.log(`✅ ${filteredPlaces.length} places passed filters`);

    if (filteredPlaces.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No places found matching criteria',
        totalFound: allPlaces.length,
        filtered: 0,
        analyzed: 0,
        saved: 0,
        leads: []
      });
    }

    // Step 3: Analyze with AI (if requested)
    if (!analyzeWithAI) {
      // Return prospects without saving (user can analyze later)
      return NextResponse.json({
        success: true,
        totalFound: allPlaces.length,
        filtered: filteredPlaces.length,
        analyzed: 0,
        saved: 0,
        prospects: filteredPlaces.map(p => ({
          name: p.name,
          address: p.address,
          phone: p.phone,
          website: p.website,
          rating: p.rating,
          totalRatings: p.totalRatings
        }))
      });
    }

    // Limit to top 20 for AI analysis to get more leads
    const placesToAnalyze = filteredPlaces.slice(0, 20);
    console.log(`🤖 Analyzing ${placesToAnalyze.length} leads with AI...`);

    const analyzedResults = await batchAnalyzeLeads(placesToAnalyze, {
      maxConcurrent: 3,
      delayMs: 1000
    });

    // Step 4: Save ALL analyzed leads to database (let user filter later)
    const savedLeads: any[] = [];
    const minimumScore = 30; // Lower threshold - save more leads, let user filter

    for (const { place, analysis } of analyzedResults) {
      if (analysis.leadScore < minimumScore) {
        console.log(`⏭️  Skipping ${place.name} (score: ${analysis.leadScore})`);
        continue;
      }

      try {
        // Check if prospect or lead already exists
        const existingProspect = await db.prospect.findFirst({
          where: {
            OR: [
              { name: place.name },
              { email: place.name.toLowerCase().replace(/\s+/g, '') + '@placeholder.com' }
            ],
            convertedAt: null // Only check unconverted prospects
          }
        });

        const existingLead = await db.lead.findFirst({
          where: {
            OR: [
              { name: place.name },
              { company: place.name }
            ]
          }
        });

        if (existingProspect || existingLead) {
          console.log(`📋 Prospect/Lead already exists: ${place.name}`);
          savedLeads.push({
            ...place,
            analysis,
            prospectId: existingProspect?.id,
            leadId: existingLead?.id,
            status: 'existing'
          });
          continue;
        }

        // Extract city and state from address
        const addressParts = place.address.split(',').map(p => p.trim());
        const city = addressParts[addressParts.length - 3] || '';
        const stateZip = addressParts[addressParts.length - 2] || '';
        const state = stateZip.split(' ')[0] || '';
        const zipCode = stateZip.split(' ')[1] || '';

        // Create new prospect (not a lead yet - user must click "Reach Out" to convert)
        const prospect = await db.prospect.create({
          data: {
            name: place.name,
            email: '', // No email from Places API
            phone: place.phone || '',
            company: place.name,
            source: 'GOOGLE_PLACES',
            
            // Address fields
            address: place.address,
            city,
            state,
            zipCode,
            country: 'US',
            latitude: place.geometry?.lat,
            longitude: place.geometry?.lng,
            
            // Website fields
            websiteUrl: place.website,
            hasWebsite: !!place.website,
            
            // Scoring
            leadScore: analysis.leadScore,
            category: analysis.category,
            
            // AI Analysis
            aiAnalysis: {
              keyInsights: analysis.keyInsights,
              opportunities: analysis.opportunities,
              reasoning: analysis.reasoning,
              contactStrategy: analysis.contactStrategy,
              urgencyLevel: analysis.urgencyLevel,
              estimatedBudget: analysis.estimatedBudget,
            },
            
            // Discovery metadata
            discoveryMetadata: {
              googlePlaceId: place.placeId,
              rating: place.rating,
              totalRatings: place.totalRatings,
              businessStatus: place.businessStatus,
              types: place.types,
              priceLevel: place.priceLevel,
              discoveredAt: new Date().toISOString(),
              reviews: place.reviews?.slice(0, 5).map(r => ({
                author: r.author_name,
                rating: r.rating,
                text: r.text.substring(0, 500) // Truncate long reviews
              }))
            },
            
            internalNotes: `AI Analysis:\n${analysis.reasoning}\n\nOpportunities:\n${analysis.opportunities.map(o => `• ${o}`).join('\n')}\n\nContact Strategy:\n${analysis.contactStrategy}`,
            
            tags: [
              `score-${Math.floor(analysis.leadScore / 10) * 10}`,
              analysis.urgencyLevel.toLowerCase(),
              analysis.category.toLowerCase().replace(/\s+/g, '-'),
              place.website ? 'has-website' : 'no-website'
            ]
          }
        });

        console.log(`✅ Saved prospect: ${place.name} (score: ${analysis.leadScore})`);

        savedLeads.push({
          ...place,
          analysis,
          prospectId: prospect.id,
          status: 'new'
        });

      } catch (error) {
        console.error(`Failed to save lead ${place.name}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      totalFound: allPlaces.length,
      filtered: filteredPlaces.length,
      analyzed: analyzedResults.length,
      saved: savedLeads.filter(l => l.status === 'new').length,
      skippedExisting: savedLeads.filter(l => l.status === 'existing').length,
      skippedLowScore: analyzedResults.length - savedLeads.length,
      prospects: savedLeads.map(l => ({
        id: l.prospectId,
        name: l.name,
        address: l.address,
        phone: l.phone,
        website: l.website,
        rating: l.rating,
        totalRatings: l.totalRatings,
        leadScore: l.analysis.leadScore,
        category: l.analysis.category,
        urgencyLevel: l.analysis.urgencyLevel,
        estimatedBudget: l.analysis.estimatedBudget,
        opportunities: l.analysis.opportunities,
        status: l.status
      }))
    });

  } catch (error) {
    console.error('Places discovery error:', error);
    return NextResponse.json(
      {
        error: 'Failed to discover places',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
