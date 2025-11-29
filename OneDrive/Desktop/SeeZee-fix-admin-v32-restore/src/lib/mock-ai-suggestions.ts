/**
 * Mock AI Suggestions for Client Dashboard
 * Phase 1: Hardcoded suggestions that look realistic
 * Phase 2: Replace with real AI integration
 */

export interface MockAISuggestion {
  id: string;
  projectId: string;
  type: string;
  title: string;
  description: string;
  confidence: number; // 0-100
  source: string;
  status: 'NEW' | 'ACCEPTED' | 'DISMISSED';
  icon: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const suggestionTemplates = [
  {
    type: 'design',
    title: 'Add mobile menu animation',
    description: '76% of your target audience uses mobile. A smooth menu animation improves UX and keeps users engaged.',
    confidence: 87,
    source: 'competitor analysis',
    icon: '📱',
  },
  {
    type: 'content',
    title: 'Add testimonials section',
    description: 'Sites with testimonials convert 34% better. We can help you collect and showcase client feedback.',
    confidence: 92,
    source: 'industry best practices',
    icon: '⭐',
  },
  {
    type: 'performance',
    title: 'Optimize image loading',
    description: 'Your images could be 60% smaller without quality loss. Faster load times improve SEO rankings.',
    confidence: 95,
    source: 'performance analysis',
    icon: '⚡',
  },
  {
    type: 'accessibility',
    title: 'Improve contrast ratios',
    description: 'Some text elements have low contrast. Better accessibility reaches more users and improves SEO.',
    confidence: 78,
    source: 'WCAG guidelines',
    icon: '♿',
  },
  {
    type: 'marketing',
    title: 'Add newsletter signup',
    description: 'Capture visitor emails to build your audience. Average conversion rate is 2-4% for well-placed forms.',
    confidence: 84,
    source: 'conversion optimization',
    icon: '📧',
  },
  {
    type: 'seo',
    title: 'Add meta descriptions',
    description: 'Missing meta descriptions reduce click-through rates. Well-crafted descriptions improve search visibility.',
    confidence: 89,
    source: 'SEO audit',
    icon: '🔍',
  },
  {
    type: 'feature',
    title: 'Add live chat widget',
    description: 'Websites with live chat see 45% higher engagement. Instant support converts more visitors to customers.',
    confidence: 81,
    source: 'customer engagement data',
    icon: '💬',
  },
];

export function getMockAISuggestions(
  projectId: string,
  count: number = 3
): MockAISuggestion[] {
  // Return random subset of suggestions
  const shuffled = [...suggestionTemplates].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, Math.min(count, suggestionTemplates.length));
  
  return selected.map((template, index) => ({
    id: `mock-ai-${projectId}-${index}`,
    projectId,
    type: template.type,
    title: template.title,
    description: template.description,
    confidence: template.confidence,
    source: template.source,
    status: 'NEW',
    icon: template.icon,
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last 7 days
  }));
}

export function getAllMockAISuggestions(projectId: string): MockAISuggestion[] {
  return getMockAISuggestions(projectId, suggestionTemplates.length);
}

