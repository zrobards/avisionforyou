import { describe, it, expect } from 'vitest'

// Test the formatContent logic directly
function formatContent(raw: string): string {
  // If content already has block-level HTML tags, return as-is
  if (/<(p|h[1-6]|div|ul|ol|li|blockquote|table|figure|pre|hr)\b/i.test(raw)) {
    return raw
  }

  return raw
    .split(/\n{2,}/)
    .map(block => {
      const trimmed = block.trim()
      if (!trimmed) return ''
      const withBreaks = trimmed.replace(/\n/g, '<br />')
      return `<p>${withBreaks}</p>`
    })
    .filter(Boolean)
    .join('\n')
}

describe('Blog formatContent', () => {
  it('passes through HTML content unchanged', () => {
    const html = '<h2>Title</h2><p>Content</p>'
    expect(formatContent(html)).toBe(html)
  })

  it('wraps plain text in paragraphs', () => {
    const text = 'First paragraph\n\nSecond paragraph'
    const result = formatContent(text)
    expect(result).toContain('<p>First paragraph</p>')
    expect(result).toContain('<p>Second paragraph</p>')
  })

  it('converts single newlines to br tags', () => {
    const text = 'Line one\nLine two\n\nNew paragraph'
    const result = formatContent(text)
    expect(result).toContain('Line one<br />Line two')
  })

  it('handles empty string', () => {
    expect(formatContent('')).toBe('')
  })
})
