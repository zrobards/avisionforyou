/**
 * Lead Scoring Algorithm for Nonprofit Client Finder
 * Calculates a score from 0-100 based on various factors
 */

export interface LeadForScoring {
  hasWebsite: boolean;
  websiteQuality?: "POOR" | "FAIR" | "GOOD" | "EXCELLENT" | null;
  annualRevenue?: number | null;
  category?: string | null;
  city?: string | null;
  state?: string | null;
  employeeCount?: number | null;
  email?: string | null;
  phone?: string | null;
  emailsSent?: number;
  convertedAt?: Date | null;
}

// Priority categories for SeeZee (nonprofits we specialize in)
const PRIORITY_CATEGORIES = [
  "Healthcare",
  "Mental Health",
  "Education",
  "Community Development",
  "Social Services",
  "Family Services",
  "Youth Development",
  "Substance Abuse",
  "Housing",
  "Food Security",
];

// Louisville metro area and surrounding states
const TARGET_STATES = ["KY", "IN", "OH", "TN", "WV"];
const HOME_CITY = "Louisville";
const HOME_STATE = "KY";

export function calculateLeadScore(lead: LeadForScoring): number {
  // Already converted = not a lead anymore
  if (lead.convertedAt) return 0;

  let score = 0;

  // ═══════════════════════════════════════
  // WEBSITE QUALITY (0-30 points)
  // Most important factor - no website = highest opportunity
  // ═══════════════════════════════════════
  if (!lead.hasWebsite) {
    score += 30; // No website = highest priority
  } else {
    switch (lead.websiteQuality) {
      case "POOR":
        score += 25; // Bad website = high priority
        break;
      case "FAIR":
        score += 15; // Mediocre = medium priority
        break;
      case "GOOD":
        score += 5; // Good = low priority
        break;
      case "EXCELLENT":
        score += 0; // Excellent = don't bother
        break;
      default:
        score += 20; // Unknown quality = assume decent opportunity
    }
  }

  // ═══════════════════════════════════════
  // REVENUE (0-25 points)
  // Higher revenue = can afford our services
  // ═══════════════════════════════════════
  if (lead.annualRevenue) {
    if (lead.annualRevenue >= 1000000) {
      score += 25; // $1M+ = can definitely afford us
    } else if (lead.annualRevenue >= 500000) {
      score += 20; // $500K-1M = good budget
    } else if (lead.annualRevenue >= 100000) {
      score += 15; // $100K-500K = decent budget
    } else if (lead.annualRevenue >= 50000) {
      score += 10; // $50K-100K = tight budget
    } else {
      score += 5; // <$50K = very limited budget
    }
  } else {
    score += 12; // Unknown revenue = assume mid-tier
  }

  // ═══════════════════════════════════════
  // CATEGORY FIT (0-20 points)
  // Priority categories align with SeeZee's mission
  // ═══════════════════════════════════════
  if (lead.category) {
    const isPriority = PRIORITY_CATEGORIES.some(
      (cat) =>
        lead.category?.toLowerCase().includes(cat.toLowerCase()) ||
        cat.toLowerCase().includes(lead.category?.toLowerCase() || "")
    );
    if (isPriority) {
      score += 20; // Perfect fit for SeeZee mission
    } else {
      score += 10; // Other nonprofits still viable
    }
  } else {
    score += 10; // Unknown category = default to mid-tier
  }

  // ═══════════════════════════════════════
  // LOCATION PROXIMITY (0-15 points)
  // Closer = easier to meet in person
  // ═══════════════════════════════════════
  const cityMatch = lead.city?.toLowerCase() === HOME_CITY.toLowerCase();
  const stateMatch = lead.state?.toUpperCase() === HOME_STATE;

  if (cityMatch && stateMatch) {
    score += 15; // Louisville = easy to meet in person
  } else if (stateMatch) {
    score += 12; // Kentucky = drivable
  } else if (lead.state && TARGET_STATES.includes(lead.state.toUpperCase())) {
    score += 7; // Neighboring states = regional
  } else {
    score += 3; // Other states = remote only
  }

  // ═══════════════════════════════════════
  // EMPLOYEE COUNT (0-10 points)
  // Larger orgs = more complex needs = higher project value
  // ═══════════════════════════════════════
  if (lead.employeeCount) {
    if (lead.employeeCount >= 50) {
      score += 10; // Large org = complex needs
    } else if (lead.employeeCount >= 20) {
      score += 7; // Medium org
    } else if (lead.employeeCount >= 10) {
      score += 5; // Small but established
    } else {
      score += 3; // Very small = limited capacity
    }
  } else {
    score += 5; // Unknown = assume small-medium
  }

  // ═══════════════════════════════════════
  // BONUS POINTS
  // ═══════════════════════════════════════
  // Has contact info (easier to reach)
  if (lead.email || lead.phone) score += 5;

  // ═══════════════════════════════════════
  // PENALTIES
  // ═══════════════════════════════════════
  // Already contacted but never converted = lower priority
  if (lead.emailsSent && lead.emailsSent > 0 && !lead.convertedAt) {
    score -= 10;
  }

  // Ensure score is between 0-100
  return Math.min(100, Math.max(0, score));
}

export function getScoreLabel(score: number): { label: string; color: string; emoji: string } {
  if (score >= 90) {
    return { label: "Hot Lead", color: "red", emoji: "🔥" };
  } else if (score >= 80) {
    return { label: "Warm Lead", color: "orange", emoji: "🔥" };
  } else if (score >= 70) {
    return { label: "Good Lead", color: "yellow", emoji: "⭐" };
  } else if (score >= 60) {
    return { label: "Warm Lead", color: "amber", emoji: "☀️" };
  } else if (score >= 40) {
    return { label: "Cool Lead", color: "orange", emoji: "🌤️" };
  } else {
    return { label: "Cold Lead", color: "slate", emoji: "❄️" };
  }
}

/**
 * Get score badge CSS classes for Tailwind
 * Matches spec: 90-100 (red), 80-89 (orange), 70-79 (yellow), <70 (gray)
 */
export function getScoreBadgeClasses(score: number): string {
  if (score >= 90) {
    return 'bg-red-100 text-red-800';
  } else if (score >= 80) {
    return 'bg-orange-100 text-orange-800';
  } else if (score >= 70) {
    return 'bg-yellow-100 text-yellow-800';
  } else {
    return 'bg-gray-100 text-gray-800';
  }
}

export function getMarkerColor(score: number): string {
  if (score >= 80) return "#ef4444"; // Red (HOT)
  if (score >= 60) return "#f59e0b"; // Amber (WARM)
  if (score >= 40) return "#fb923c"; // Orange (COOL)
  return "#94a3b8"; // Gray (COLD)
}

// Alias for backward compatibility
export const getScoreColor = getMarkerColor;

/**
 * Extended score calculation that returns breakdown and recommendation
 */
export interface ScoreBreakdown {
  total: number;
  breakdown: {
    websiteScore: number;
    revenueScore: number;
    categoryScore: number;
    locationScore: number;
    sizeScore: number;
  };
  recommendation: string;
}

export function calculateLeadScoreDetailed(lead: LeadForScoring): ScoreBreakdown {
  // Already converted = not a lead anymore
  if (lead.convertedAt) {
    return {
      total: 0,
      breakdown: { websiteScore: 0, revenueScore: 0, categoryScore: 0, locationScore: 0, sizeScore: 0 },
      recommendation: "Already converted to client"
    };
  }

  let websiteScore = 0;
  let revenueScore = 0;
  let categoryScore = 0;
  let locationScore = 0;
  let sizeScore = 0;

  // Website score (0-30)
  if (!lead.hasWebsite) {
    websiteScore = 30;
  } else {
    switch (lead.websiteQuality) {
      case "POOR": websiteScore = 25; break;
      case "FAIR": websiteScore = 15; break;
      case "GOOD": websiteScore = 5; break;
      case "EXCELLENT": websiteScore = 0; break;
      default: websiteScore = 20;
    }
  }

  // Revenue score (0-25)
  if (lead.annualRevenue) {
    if (lead.annualRevenue >= 1000000) revenueScore = 25;
    else if (lead.annualRevenue >= 500000) revenueScore = 20;
    else if (lead.annualRevenue >= 100000) revenueScore = 15;
    else if (lead.annualRevenue >= 50000) revenueScore = 10;
    else revenueScore = 5;
  } else {
    revenueScore = 12;
  }

  // Category score (0-20)
  if (lead.category) {
    const isPriority = PRIORITY_CATEGORIES.some(
      (cat) =>
        lead.category?.toLowerCase().includes(cat.toLowerCase()) ||
        cat.toLowerCase().includes(lead.category?.toLowerCase() || "")
    );
    categoryScore = isPriority ? 20 : 10;
  } else {
    categoryScore = 10;
  }

  // Location score (0-15)
  const cityMatch = lead.city?.toLowerCase() === HOME_CITY.toLowerCase();
  const stateMatch = lead.state?.toUpperCase() === HOME_STATE;
  if (cityMatch && stateMatch) {
    locationScore = 15;
  } else if (stateMatch) {
    locationScore = 12;
  } else if (lead.state && TARGET_STATES.includes(lead.state.toUpperCase())) {
    locationScore = 7;
  } else {
    locationScore = 3;
  }

  // Size score (0-10)
  if (lead.employeeCount) {
    if (lead.employeeCount >= 50) sizeScore = 10;
    else if (lead.employeeCount >= 20) sizeScore = 7;
    else if (lead.employeeCount >= 10) sizeScore = 5;
    else sizeScore = 3;
  } else {
    sizeScore = 5;
  }

  const total = Math.min(100, Math.max(0, websiteScore + revenueScore + categoryScore + locationScore + sizeScore));

  // Generate recommendation
  let recommendation = "";
  if (total >= 80) {
    recommendation = "High priority - reach out immediately";
  } else if (total >= 60) {
    recommendation = "Good prospect - add to outreach queue";
  } else if (total >= 40) {
    recommendation = "Worth pursuing - gather more info";
  } else {
    recommendation = "Lower priority - may not be ideal fit";
  }

  return {
    total,
    breakdown: { websiteScore, revenueScore, categoryScore, locationScore, sizeScore },
    recommendation,
  };
}

/**
 * Batch recalculate scores for multiple leads
 */
export function recalculateLeadScores(
  leads: LeadForScoring[]
): Map<number, number> {
  const scores = new Map<number, number>();
  leads.forEach((lead, index) => {
    scores.set(index, calculateLeadScore(lead));
  });
  return scores;
}
