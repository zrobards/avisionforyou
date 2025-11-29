/**
 * SEO Utility Functions
 * Helper functions for SEO optimization across the site
 */

/**
 * Truncate text to a specific length for meta descriptions
 * Ensures descriptions don't exceed optimal length for search results
 */
export function truncateDescription(
  text: string,
  maxLength: number = 160
): string {
  if (text.length <= maxLength) return text

  // Find the last complete word before maxLength
  const truncated = text.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')

  return lastSpace > 0
    ? `${truncated.slice(0, lastSpace)}...`
    : `${truncated}...`
}

/**
 * Generate SEO-friendly URL slugs
 * Converts text to lowercase, removes special characters, replaces spaces with hyphens
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Generate breadcrumb JSON-LD structured data
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/**
 * Generate FAQ JSON-LD structured data
 */
export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

/**
 * Generate Article JSON-LD structured data
 */
export function generateArticleSchema(article: {
  headline: string
  description: string
  image: string
  datePublished: string
  dateModified?: string
  authorName: string
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline,
    description: article.description,
    image: article.image,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      '@type': 'Person',
      name: article.authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'SeeZee Studio',
      logo: {
        '@type': 'ImageObject',
        url: 'https://see-zee.com/favicon.svg',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
  }
}

/**
 * Generate Review/Testimonial JSON-LD structured data
 */
export function generateReviewSchema(review: {
  itemName: string
  ratingValue: number
  reviewBody: string
  authorName: string
  datePublished: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Service',
      name: review.itemName,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.ratingValue.toString(),
      bestRating: '5',
      worstRating: '1',
    },
    reviewBody: review.reviewBody,
    author: {
      '@type': 'Person',
      name: review.authorName,
    },
    datePublished: review.datePublished,
  }
}

/**
 * Generate AggregateRating JSON-LD structured data
 */
export function generateAggregateRatingSchema(rating: {
  itemName: string
  ratingValue: number
  reviewCount: number
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: rating.itemName,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: rating.ratingValue.toString(),
      reviewCount: rating.reviewCount.toString(),
      bestRating: '5',
      worstRating: '1',
    },
  }
}

/**
 * Extract keywords from text
 * Simple keyword extraction based on word frequency
 */
export function extractKeywords(text: string, limit: number = 10): string[] {
  // Common stop words to exclude
  const stopWords = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'from',
    'as',
    'is',
    'was',
    'are',
    'were',
    'be',
    'been',
    'being',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'could',
    'should',
    'may',
    'might',
    'can',
    'this',
    'that',
    'these',
    'those',
  ])

  // Extract words, convert to lowercase, and filter
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.has(word))

  // Count word frequency
  const frequency = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Sort by frequency and return top keywords
  return Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([word]) => word)
}

/**
 * Validate and format URL for canonical tags
 */
export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    // Remove trailing slash, convert to lowercase
    return `${urlObj.origin}${urlObj.pathname.replace(/\/$/, '')}${urlObj.search}`
  } catch {
    // If URL parsing fails, return as-is
    return url
  }
}

/**
 * Generate reading time estimate for blog posts
 * Assumes average reading speed of 200 words per minute
 */
export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200
  const wordCount = text.trim().split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

/**
 * Format date for structured data (ISO 8601)
 */
export function formatDateForSchema(date: Date): string {
  return date.toISOString()
}

/**
 * Check if URL is internal
 */
export function isInternalUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return (
      urlObj.hostname === 'see-zee.com' ||
      urlObj.hostname === 'www.see-zee.com' ||
      urlObj.hostname === 'localhost'
    )
  } catch {
    // Relative URLs are internal
    return !url.startsWith('http')
  }
}

/**
 * Generate hreflang tags for multi-language support (future use)
 */
export function generateHreflangTags(
  languages: Array<{ locale: string; url: string }>
) {
  return languages.map((lang) => ({
    rel: 'alternate',
    hrefLang: lang.locale,
    href: lang.url,
  }))
}

/**
 * SEO-friendly title case conversion
 * Capitalizes first letter of each major word
 */
export function toTitleCase(text: string): string {
  const smallWords = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'with'])
  
  return text
    .split(' ')
    .map((word, index) => {
      // Always capitalize first and last word
      if (index === 0 || index === text.split(' ').length - 1) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      }
      // Don't capitalize small words unless they're first/last
      if (smallWords.has(word.toLowerCase())) {
        return word.toLowerCase()
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
}

/**
 * Constants for SEO best practices
 */
export const SEO_CONSTANTS = {
  META_DESCRIPTION_MIN_LENGTH: 120,
  META_DESCRIPTION_MAX_LENGTH: 160,
  TITLE_MIN_LENGTH: 30,
  TITLE_MAX_LENGTH: 60,
  OG_IMAGE_WIDTH: 1200,
  OG_IMAGE_HEIGHT: 630,
  TWITTER_IMAGE_WIDTH: 1200,
  TWITTER_IMAGE_HEIGHT: 675,
} as const
















