interface WebsiteAnalysis {
  quality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  issues: string[];
  scores: {
    reachable: boolean;
    hasSSL: boolean;
    responseTime: number;
    hasMobileViewport: boolean;
  };
}

export async function checkWebsite(url: string): Promise<WebsiteAnalysis> {
  const issues: string[] = [];
  let qualityScore = 100;

  // Normalize URL
  if (!url.startsWith('http')) {
    url = 'https://' + url;
  }

  try {
    // 1. Check if reachable
    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      issues.push('Website is unreachable or down');
      qualityScore -= 40;
    }

    // 2. Check SSL
    const hasSSL = url.startsWith('https://');
    if (!hasSSL) {
      issues.push('No SSL certificate (insecure - http only)');
      qualityScore -= 30;
    }

    // 3. Check response time
    if (responseTime > 3000) {
      issues.push(`Slow loading speed (${(responseTime / 1000).toFixed(1)} seconds)`);
      qualityScore -= 15;
    }

    // 4. Fetch page content to check basics
    const pageResponse = await fetch(url, {
      signal: AbortSignal.timeout(10000)
    });
    const html = await pageResponse.text();

    // Check for mobile viewport
    const hasMobileViewport = html.includes('viewport') && html.includes('width=device-width');
    if (!hasMobileViewport) {
      issues.push('Not mobile responsive (no viewport meta tag)');
      qualityScore -= 20;
    }

    // Check for basic accessibility
    const hasAltTags = html.includes('alt=');
    if (!hasAltTags) {
      issues.push('Poor accessibility (no alt tags found)');
      qualityScore -= 15;
    }

    // Check for outdated copyright
    const copyrightMatch = html.match(/copyright.*?(\d{4})/i);
    if (copyrightMatch) {
      const year = parseInt(copyrightMatch[1]);
      const currentYear = new Date().getFullYear();
      if (year < currentYear - 2) {
        issues.push(`Outdated website (copyright year: ${year})`);
        qualityScore -= 10;
      }
    }

    // Determine quality
    let quality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
    if (qualityScore >= 90) quality = 'EXCELLENT';
    else if (qualityScore >= 70) quality = 'GOOD';
    else if (qualityScore >= 50) quality = 'FAIR';
    else quality = 'POOR';

    return {
      quality,
      issues,
      scores: {
        reachable: response.ok,
        hasSSL,
        responseTime,
        hasMobileViewport
      }
    };

  } catch (error) {
    // Website completely unreachable
    return {
      quality: 'POOR',
      issues: ['Website is completely unreachable or does not exist'],
      scores: {
        reachable: false,
        hasSSL: false,
        responseTime: 0,
        hasMobileViewport: false
      }
    };
  }
}
