import Anthropic from '@anthropic-ai/sdk';
import { PlaceDetails } from './places-finder';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

export interface LeadAnalysis {
  leadScore: number; // 0-100
  reasoning: string;
  redFlags: string[];
  opportunities: string[];
  estimatedBudget: string;
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  category: string;
  contactStrategy: string;
  keyInsights: string[];
}

/**
 * Analyze a place as a potential web development lead using Claude AI
 */
export async function analyzeLeadWithAI(place: PlaceDetails): Promise<LeadAnalysis> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }

  // Build context from reviews
  const reviewContext = place.reviews
    ?.slice(0, 5)
    .map(r => `Rating: ${r.rating}/5 - "${r.text}"`)
    .join('\n\n') || 'No reviews available';

  // Build types context
  const businessTypes = place.types
    .filter(t => !t.includes('_'))
    .join(', ');

  const prompt = `Analyze this business as a potential web development client for SeeZee Studio, a Louisville-based web agency:

**Business Information:**
Name: ${place.name}
Type: ${businessTypes}
Rating: ${place.rating || 'N/A'} stars (${place.totalRatings || 0} reviews)
Has Website: ${place.website ? 'Yes - ' + place.website : 'No'}
Phone: ${place.phone || 'Not listed'}
Address: ${place.address}
Business Status: ${place.businessStatus}
Price Level: ${place.priceLevel ? '$'.repeat(place.priceLevel) : 'Not specified'}

**Recent Google Reviews:**
${reviewContext}

**Your Task:**
Evaluate this lead and provide a comprehensive analysis for outreach purposes. Focus on identifying digital presence pain points and opportunities.

Consider:
1. If they lack a website, that's a major opportunity
2. Review sentiment about finding them online or digital frustrations
3. Business size/activity indicators (review count, rating, etc.)
4. Type of business and typical web needs
5. Signs of professionalism and budget capacity
6. Specific customer complaints that a website could solve

**Return your analysis as valid JSON in this exact format:**
{
  "leadScore": 85,
  "reasoning": "Brief explanation of the score",
  "redFlags": ["concern1", "concern2"],
  "opportunities": ["opportunity1", "opportunity2", "opportunity3"],
  "estimatedBudget": "$1,500-3,000",
  "urgencyLevel": "HIGH",
  "category": "Nonprofit / Small Business / Restaurant / Retail / Service Provider",
  "contactStrategy": "How to approach this lead (1-2 sentences)",
  "keyInsights": ["insight1", "insight2", "insight3"]
}

**Scoring Guidelines:**
- 90-100: Perfect lead (no website, great reviews, clear need, established business)
- 75-89: Strong lead (some website issues or clear opportunities)
- 60-74: Good lead (potential but may need more qualification)
- 40-59: Medium lead (some concerns or lower urgency)
- 0-39: Weak lead (major red flags or poor fit)

Return ONLY the JSON object, no additional text.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from AI response');
    }

    const analysis: LeadAnalysis = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (
      typeof analysis.leadScore !== 'number' ||
      !analysis.reasoning ||
      !analysis.category ||
      !analysis.urgencyLevel
    ) {
      throw new Error('Invalid AI response format');
    }

    return analysis;
  } catch (error) {
    console.error('AI analysis error:', error);
    
    // Return fallback analysis if AI fails
    return {
      leadScore: 50,
      reasoning: 'AI analysis failed, manual review required',
      redFlags: ['Could not analyze with AI'],
      opportunities: ['Requires manual evaluation'],
      estimatedBudget: 'Unknown',
      urgencyLevel: 'MEDIUM',
      category: place.types[0] || 'Unknown',
      contactStrategy: 'Manual review and outreach needed',
      keyInsights: ['AI analysis unavailable']
    };
  }
}

/**
 * Batch analyze multiple leads with rate limiting
 */
export async function batchAnalyzeLeads(
  places: PlaceDetails[],
  options: {
    maxConcurrent?: number;
    delayMs?: number;
  } = {}
): Promise<Array<{ place: PlaceDetails; analysis: LeadAnalysis }>> {
  const { maxConcurrent = 3, delayMs = 1000 } = options;
  const results: Array<{ place: PlaceDetails; analysis: LeadAnalysis }> = [];

  // Process in batches to respect rate limits
  for (let i = 0; i < places.length; i += maxConcurrent) {
    const batch = places.slice(i, i + maxConcurrent);
    
    const batchResults = await Promise.all(
      batch.map(async (place) => {
        try {
          const analysis = await analyzeLeadWithAI(place);
          return { place, analysis };
        } catch (error) {
          console.error(`Failed to analyze ${place.name}:`, error);
          return {
            place,
            analysis: {
              leadScore: 0,
              reasoning: 'Analysis failed',
              redFlags: ['Failed to analyze'],
              opportunities: [],
              estimatedBudget: 'Unknown',
              urgencyLevel: 'LOW' as const,
              category: 'Unknown',
              contactStrategy: 'Skip',
              keyInsights: []
            }
          };
        }
      })
    );

    results.push(...batchResults);

    // Rate limiting delay between batches
    if (i + maxConcurrent < places.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

/**
 * Generate personalized outreach email using AI
 */
export async function generateOutreachEmail(
  place: PlaceDetails,
  analysis: LeadAnalysis
): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }

  const reviewInsights = place.reviews
    ?.slice(0, 3)
    .map(r => r.text)
    .join('\n') || '';

  const prompt = `Write a personalized cold outreach email for this potential client:

**Business:** ${place.name}
**Type:** ${analysis.category}
**Rating:** ${place.rating || 'N/A'} stars
**Has Website:** ${place.website ? 'Yes' : 'No'}
**Key Opportunities:** ${analysis.opportunities.join(', ')}
**Review Insights:** ${reviewInsights}

**Sender:** Sean McCulloch, SeeZee Studio (Louisville web agency)
**Contact:** (502) 435-2986

Write a brief, personalized email (150-200 words) that:
1. References their Google reviews or rating
2. Mentions specific pain points (e.g., "customers say they can't find your hours online")
3. Shows we've researched them specifically
4. Offers concrete value (not generic)
5. Clear call-to-action
6. Professional but friendly tone

Return just the email body, no subject line.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    return message.content[0].type === 'text' 
      ? message.content[0].text 
      : 'Failed to generate email';
  } catch (error) {
    console.error('Email generation error:', error);
    throw error;
  }
}
