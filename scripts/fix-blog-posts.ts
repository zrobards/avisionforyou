/**
 * Fix blog posts:
 * 1. Reassign author from "Admin User" to "Lucas Bennett"
 * 2. Clean up Works Cited / References sections — remove duplicate paragraph citations
 *    and format the list version properly
 */

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const ADMIN_USER_ID = 'cmkga6i7c0004quh2p30cpx99'
const LUCAS_ID = 'cmm9qahuo0000s31mhrl0a6ax'

/**
 * Cleans up the Works Cited / References section of a blog post.
 *
 * The Wix migration left citations duplicated: once inside a <ul><li> block,
 * then again as loose <p> tags. This function:
 *  - Finds the Works Cited/References heading
 *  - Keeps the <ul> list if present, removes the duplicate <p> citations
 *  - If there's no <ul> list, converts the <p> citations into a proper <ul> list
 *  - Formats the section with a styled container
 */
function cleanWorksCited(html: string): string {
  // Find the Works Cited / References section
  // Match: <h2> or <h3> or <h4> containing "Works Cited" or "References"
  const headingRegex = /<h([2-4])>((?:Works Cited|References|Works Cited:)(?:.*?))<\/h\1>/i
  const headingMatch = html.match(headingRegex)

  if (!headingMatch) {
    return html
  }

  const headingIndex = html.indexOf(headingMatch[0])
  const beforeCited = html.substring(0, headingIndex)
  const citedSection = html.substring(headingIndex)

  // Check if there's a <ul> list in the cited section
  const ulMatch = citedSection.match(/<ul>([\s\S]*?)<\/ul>/)

  // Collect all <p> tags after the heading (these are the duplicates or standalone citations)
  // We need to identify which <p> tags are citation entries vs regular content
  const afterHeading = citedSection.substring(headingMatch[0].length)

  // Split into the UL block (if any) and the trailing <p> tags
  let cleanedCitedSection: string

  if (ulMatch) {
    // There's a UL list — keep it, remove trailing duplicate <p> citation entries
    const ulEndIndex = afterHeading.indexOf('</ul>') + 5
    const ulBlock = afterHeading.substring(0, ulEndIndex)

    // Everything after the </ul> — these are the duplicate <p> tags
    const afterUl = afterHeading.substring(ulEndIndex).trim()

    // Check if there's a meaningful non-citation paragraph after the citations
    // (like "Created with assistance from generative AI")
    const trailingParagraphs = afterUl.match(/<p>[\s\S]*?<\/p>/g) || []
    const nonCitationTrailing: string[] = []

    for (const p of trailingParagraphs) {
      const text = p.replace(/<[^>]+>/g, '').trim()
      // Keep short attribution notes like "Created with assistance from generative AI"
      if (text.length < 80 && !text.includes('http') && !text.includes('Retrieved from') && !text.includes('Accessed')) {
        nonCitationTrailing.push(p)
      }
      // Skip citation duplicates (they contain URLs or look like academic references)
    }

    // Format the list items with proper styling — make URLs clickable
    const formattedUl = formatCitationList(ulBlock)

    cleanedCitedSection = `
<div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 2px solid #e5e7eb;">
<h3>Works Cited</h3>
${formattedUl}
${nonCitationTrailing.join('\n')}
</div>`
  } else {
    // No UL list — the citations are all in <p> tags
    // Convert them into a proper <ul> list
    const paragraphs = afterHeading.match(/<p>[\s\S]*?<\/p>/g) || []
    const citationItems: string[] = []
    const nonCitationTrailing: string[] = []

    // Also check for <h4> tags that are actually citation entries (malformed)
    const h4Citations = afterHeading.match(/<h4>[\s\S]*?<\/h4>/g) || []

    for (const h4 of h4Citations) {
      const text = h4.replace(/<[^>]+>/g, '').trim()
      if (text.includes('http') || text.includes('doi.org') || text.match(/\(\d{4}\)/)) {
        citationItems.push(`<li>${text}</li>`)
      }
    }

    for (const p of paragraphs) {
      const text = p.replace(/<[^>]+>/g, '').trim()
      if (!text) continue

      // Determine if this looks like a citation
      const isCitation = text.includes('http') ||
        text.includes('Retrieved from') ||
        text.includes('Accessed') ||
        text.includes('doi.org') ||
        text.match(/\(\d{4}\)/) ||
        text.match(/\d{4},/) ||
        text.match(/vol\.\s*\d+/) ||
        text.match(/pp\.\s*\d+/)

      if (isCitation) {
        citationItems.push(`<li>${text}</li>`)
      } else if (text.length < 80) {
        // Short non-citation text (attribution notes)
        nonCitationTrailing.push(`<p>${text}</p>`)
      }
    }

    if (citationItems.length === 0) {
      return html // No citations found, return unchanged
    }

    cleanedCitedSection = `
<div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 2px solid #e5e7eb;">
<h3>Works Cited</h3>
<ul>
${citationItems.join('\n')}
</ul>
${nonCitationTrailing.join('\n')}
</div>`
  }

  return beforeCited + cleanedCitedSection
}

/**
 * Makes URLs in citation list items clickable and applies proper formatting
 */
function formatCitationList(ulBlock: string): string {
  // Process each <li> to make URLs clickable
  return ulBlock.replace(/<li>([\s\S]*?)<\/li>/g, (_, content: string) => {
    // Find URLs and wrap them in <a> tags (if not already wrapped)
    const formatted = content.replace(
      /(?<!href=")(https?:\/\/[^\s<,;]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    )
    return `<li>${formatted}</li>`
  })
}

async function main() {
  console.log('=== Fixing Blog Posts ===\n')

  // 1. Reassign all posts from Admin User to Lucas Bennett
  const updated = await db.blogPost.updateMany({
    where: { authorId: ADMIN_USER_ID },
    data: { authorId: LUCAS_ID },
  })
  console.log(`✓ Reassigned ${updated.count} posts from "Admin User" to "Lucas Bennett"\n`)

  // 2. Fix Works Cited formatting in all posts
  const posts = await db.blogPost.findMany({
    select: { id: true, title: true, content: true },
  })

  let fixedCount = 0
  for (const post of posts) {
    const cleaned = cleanWorksCited(post.content)
    if (cleaned !== post.content) {
      await db.blogPost.update({
        where: { id: post.id },
        data: { content: cleaned },
      })
      console.log(`✓ Fixed Works Cited in: "${post.title}"`)
      fixedCount++
    } else {
      console.log(`  (no changes needed) "${post.title}"`)
    }
  }

  console.log(`\n=== Done: ${updated.count} posts reassigned, ${fixedCount} posts reformatted ===`)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
