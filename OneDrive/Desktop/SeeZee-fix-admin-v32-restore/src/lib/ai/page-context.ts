/**
 * Utility functions to extract page context for the AI chatbot
 */

export interface PageContext {
  url: string;
  title: string;
  headings: string[];
  links: Array<{ text: string; href: string }>;
  mainContent: string;
  metadata?: {
    description?: string;
    keywords?: string[];
  };
}

/**
 * Extract context from the current page
 * This runs in the browser and sends page information to the AI
 */
export function extractPageContext(): PageContext {
  if (typeof window === 'undefined') {
    return {
      url: '/',
      title: '',
      headings: [],
      links: [],
      mainContent: '',
    };
  }

  const url = window.location.pathname;
  const title = document.title || '';
  
  // Extract headings (h1-h3)
  const headings: string[] = [];
  const headingElements = document.querySelectorAll('h1, h2, h3');
  headingElements.forEach((el) => {
    const text = el.textContent?.trim();
    if (text && text.length > 0 && text.length < 200) {
      headings.push(text);
    }
  });

  // Extract links
  const links: Array<{ text: string; href: string }> = [];
  const linkElements = document.querySelectorAll('a[href]');
  linkElements.forEach((el) => {
    const href = (el as HTMLAnchorElement).href;
    const text = el.textContent?.trim();
    if (text && href && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
      try {
        const urlObj = new URL(href);
        if (urlObj.origin === window.location.origin) {
          links.push({
            text: text.substring(0, 100),
            href: urlObj.pathname,
          });
        }
      } catch {
        // Invalid URL, skip
      }
    }
  });

  // Extract main content (from main, article, or body)
  let mainContent = '';
  const mainEl = document.querySelector('main') || 
                 document.querySelector('article') || 
                 document.body;
  
  if (mainEl) {
    // Get text content, but limit it
    const text = mainEl.innerText || mainEl.textContent || '';
    // Take first 2000 characters
    mainContent = text.substring(0, 2000).trim();
  }

  // Extract meta description
  const metaDesc = document.querySelector('meta[name="description"]');
  const description = metaDesc?.getAttribute('content') || undefined;

  return {
    url,
    title,
    headings: headings.slice(0, 10), // Limit to 10 headings
    links: links.slice(0, 20), // Limit to 20 links
    mainContent,
    metadata: {
      description,
    },
  };
}

/**
 * Format page context for AI prompt
 */
export function formatPageContextForAI(context: PageContext): string {
  if (!context.url || context.url === '/') {
    return 'User is on the homepage.';
  }

  let prompt = `User is currently on: ${context.url}\n`;
  
  if (context.title) {
    prompt += `Page title: ${context.title}\n`;
  }

  if (context.metadata?.description) {
    prompt += `Page description: ${context.metadata.description}\n`;
  }

  if (context.headings.length > 0) {
    prompt += `\nPage sections:\n${context.headings.map((h, i) => `${i + 1}. ${h}`).join('\n')}\n`;
  }

  if (context.mainContent) {
    prompt += `\nPage content preview:\n${context.mainContent}\n`;
  }

  if (context.links.length > 0) {
    prompt += `\nAvailable links on this page:\n${context.links.map((l, i) => `${i + 1}. ${l.text} → ${l.href}`).join('\n')}\n`;
  }

  return prompt;
}


