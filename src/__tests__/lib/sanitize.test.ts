import { describe, it, expect } from 'vitest'
import { escapeHtml } from '@/lib/sanitize'

describe('escapeHtml', () => {
  it('escapes HTML entities', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
  })

  it('escapes ampersands', () => {
    expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry')
  })

  it('escapes single quotes', () => {
    const result = escapeHtml("it's")
    // Different implementations use &#039; or &#x27;
    expect(result).toMatch(/it&#(039|x27);s/)
  })

  it('returns empty string for empty input', () => {
    expect(escapeHtml('')).toBe('')
  })

  it('handles null/undefined gracefully', () => {
    expect(escapeHtml(null as any)).toBeFalsy()
    expect(escapeHtml(undefined as any)).toBeFalsy()
  })
})
