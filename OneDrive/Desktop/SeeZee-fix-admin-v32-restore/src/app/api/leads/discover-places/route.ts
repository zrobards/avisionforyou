import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
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

    // Analyze up to 50 places for better coverage
    // Google Places can return up to 50, so we can analyze all of them
    const placesToAnalyze = filteredPlaces.slice(0, 50);
    console.log(`🤖 Analyzing ${placesToAnalyze.length} leads with AI...`);

    const analyzedResults = await batchAnalyzeLeads(placesToAnalyze, {
      maxConcurrent: 3,
      delayMs: 1000
    });

    // Step 4: Save ALL analyzed leads to database (let user filter later)
    const savedLeads: any[] = [];
    const minimumScore = 25; // Lower threshold - save more leads, let user filter manually

    for (const { place, analysis } of analyzedResults) {
      if (analysis.leadScore < minimumScore) {
        console.log(`⏭️  Skipping ${place.name} (score: ${analysis.leadScore})`);
        continue;
      }

      try {
        // Extract city and state from address FIRST (before using in queries)
        let city = '';
        let state = '';
        let zipCode = '';
        
        if (place.address) {
          const addressParts = place.address.split(',').map(p => p.trim());
          city = addressParts[addressParts.length - 3] || '';
          const stateZip = addressParts[addressParts.length - 2] || '';
          state = stateZip.split(' ')[0] || '';
          zipCode = stateZip.split(' ')[1] || '';
        }

        // Build OR conditions array for duplicate check
        const orConditions: any[] = [];
        if (place.placeId) {
          orConditions.push({ googlePlaceId: place.placeId });
        }
        if (city && state) {
          orConditions.push({ name: place.name, city, state });
        } else {
          orConditions.push({ name: place.name });
        }

        // Check if prospect or lead already exists by googlePlaceId or name
        const existingProspect = await prisma.prospect.findFirst({
          where: {
            OR: orConditions,
            convertedAt: null // Only check unconverted prospects
          }
        });

        const existingLead = await prisma.lead.findFirst({
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

        // Calculate scoring breakdown using actual data from place and analysis
        // Use the rule-based scoring system to calculate accurate breakdown
        const { calculateLeadScoreDetailed } = await import('@/lib/leads/scoring');
        
        // Build lead data for scoring calculation
        const leadForScoring = {
          hasWebsite: !!place.website,
          websiteQuality: !place.website ? undefined : 
            (analysis.opportunities?.some(o => o.toLowerCase().includes('website')) ? 'POOR' : 
             place.rating && place.rating < 4.0 ? 'FAIR' : 
             place.totalRatings && place.totalRatings > 50 ? 'GOOD' : 'FAIR') as any,
          annualRevenue: null, // Not available from Places API
          category: analysis.category || place.types?.[0] || null,
          city,
          state,
          employeeCount: place.totalRatings ? 
            (place.totalRatings > 100 ? 50 : 
             place.totalRatings > 50 ? 20 : 
             place.totalRatings > 20 ? 10 : 5) : null,
          email: null,
          phone: place.phone || null,
          emailsSent: 0,
          convertedAt: null,
        };

        // Calculate detailed score breakdown from actual data
        const detailedScore = calculateLeadScoreDetailed(leadForScoring);
        
        // Use AI score as primary, but use rule-based breakdown for transparency
        // Take the higher of AI score or rule-based score (they should be close)
        // This gives us best of both worlds - AI insights + data-driven breakdown
        const finalScore = Math.max(analysis.leadScore, detailedScore.total);
        
        // Use the calculated breakdown values (more accurate than proportional distribution)
        const websiteQualityScore = detailedScore.breakdown.websiteScore;
        const revenuePotential = detailedScore.breakdown.revenueScore;
        const categoryFit = detailedScore.breakdown.categoryScore;
        const locationScore = detailedScore.breakdown.locationScore;
        const organizationSize = detailedScore.breakdown.sizeScore;

        // Create new prospect (not a lead yet - user must click "Reach Out" to convert)
        const prospect = await prisma.prospect.create({
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
            
            // Google Places data
            googlePlaceId: place.placeId,
            googleRating: place.rating,
            googleReviews: place.totalRatings,
            
            // Scoring - use the final calculated score
            leadScore: finalScore,
            websiteQualityScore,
            revenuePotential,
            categoryFit,
            locationScore,
            organizationSize,
            urgencyLevel: analysis.urgencyLevel,
            category: analysis.category,
            
            // AI Analysis
            aiAnalysis: {
              keyInsights: analysis.keyInsights,
              opportunities: analysis.opportunities,
              redFlags: analysis.redFlags,
              reasoning: analysis.reasoning,
              contactStrategy: analysis.contactStrategy,
              urgencyLevel: analysis.urgencyLevel,
              estimatedBudget: analysis.estimatedBudget,
            },
            
            // Opportunities and red flags
            opportunities: analysis.opportunities || [],
            redFlags: analysis.redFlags || [],
            
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
            ],
            
            // Create DISCOVERED activity
            activities: {
              create: {
                type: 'DISCOVERED',
                description: `Discovered via Google Places API with lead score of ${analysis.leadScore}`,
                metadata: {
                  source: 'GOOGLE_PLACES',
                  location,
                  searchRadius: radius,
                  searchType: type,
                  keyword,
                  placeId: place.placeId,
                }
              }
            }
          },
          include: {
            activities: true
          }
        });

        console.log(`✅ Saved prospect: ${place.name} (score: ${analysis.leadScore})`);

        // Create ANALYZED activity
        await prisma.prospectActivity.create({
          data: {
            prospectId: prospect.id,
            type: 'ANALYZED',
            description: `AI analyzed with score of ${analysis.leadScore}. Urgency: ${analysis.urgencyLevel}`,
            metadata: {
              leadScore: analysis.leadScore,
              urgencyLevel: analysis.urgencyLevel,
              estimatedBudget: analysis.estimatedBudget,
            }
          }
        });

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
