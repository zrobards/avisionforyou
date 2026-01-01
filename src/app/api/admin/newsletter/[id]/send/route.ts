import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// POST - Send newsletter to all subscribers
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const newsletter = await prisma.newsletter.findUnique({
      where: { id: params.id }
    })

    if (!newsletter) {
      return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 })
    }

    // Get all subscribed users
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { subscribed: true }
    })

    if (subscribers.length === 0) {
      return NextResponse.json({ error: 'No subscribers found' }, { status: 400 })
    }

    // Send emails in batches (Resend allows batch sending)
    const fromEmail = process.env.EMAIL_FROM || 'noreply@avisionforyou.org'
    const baseUrl = process.env.NEXTAUTH_URL || 'https://avisionforyou.vercel.app'
    
    let successCount = 0
    let failureCount = 0
    
    // Resend batch API limit is 100 emails per request
    const batchSize = 100
    
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize)
      
      try {
        // Send to multiple recipients
        await Promise.all(
          batch.map(async (subscriber) => {
            try {
              await resend.emails.send({
                from: fromEmail,
                to: subscriber.email,
                subject: newsletter.title,
                html: `
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <meta charset="utf-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <title>${newsletter.title}</title>
                    </head>
                    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 40px 20px;">
                            <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                              <!-- Header -->
                              <tr>
                                <td style="padding: 40px 40px 20px; background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%); border-radius: 8px 8px 0 0;">
                                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">${newsletter.title}</h1>
                                </td>
                              </tr>
                              
                              ${newsletter.imageUrl ? `
                              <!-- Featured Image -->
                              <tr>
                                <td style="padding: 0;">
                                  <img src="${newsletter.imageUrl}" alt="${newsletter.title}" style="width: 100%; height: auto; display: block;">
                                </td>
                              </tr>
                              ` : ''}
                              
                              ${newsletter.excerpt ? `
                              <!-- Excerpt -->
                              <tr>
                                <td style="padding: 30px 40px 20px;">
                                  <p style="margin: 0; color: #666666; font-size: 18px; line-height: 1.6; font-style: italic;">${newsletter.excerpt}</p>
                                </td>
                              </tr>
                              ` : ''}
                              
                              <!-- Content -->
                              <tr>
                                <td style="padding: 20px 40px 40px;">
                                  <div style="color: #333333; font-size: 16px; line-height: 1.8;">
                                    ${newsletter.content.replace(/\n/g, '<br>')}
                                  </div>
                                </td>
                              </tr>
                              
                              <!-- CTA Button -->
                              <tr>
                                <td style="padding: 0 40px 40px; text-align: center;">
                                  <a href="${baseUrl}/newsletter" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Read More on Our Website</a>
                                </td>
                              </tr>
                              
                              <!-- Footer -->
                              <tr>
                                <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
                                  <p style="margin: 0 0 15px; color: #666666; font-size: 14px; text-align: center;">
                                    <strong>A Vision For You Recovery</strong><br>
                                    1675 Story Ave, Louisville, KY 40206<br>
                                    <a href="tel:+15027496344" style="color: #7c3aed; text-decoration: none;">(502) 749-6344</a>
                                  </p>
                                  <p style="margin: 15px 0 0; color: #999999; font-size: 12px; text-align: center;">
                                    You're receiving this because you subscribed to our newsletter.<br>
                                    <a href="${baseUrl}/newsletter/unsubscribe?email=${encodeURIComponent(subscriber.email)}" style="color: #7c3aed; text-decoration: underline;">Unsubscribe</a>
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </body>
                  </html>
                `
              })
              successCount++
            } catch (emailError) {
              console.error(`Failed to send to ${subscriber.email}:`, emailError)
              failureCount++
            }
          })
        )
        
        // Small delay between batches to avoid rate limiting
        if (i + batchSize < subscribers.length) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      } catch (batchError) {
        console.error(`Batch sending error:`, batchError)
        failureCount += batch.length
      }
    }

    // Update newsletter status
    const now = new Date()
    const updatedNewsletter = await prisma.newsletter.update({
      where: { id: params.id },
      data: {
        sentAt: now,
        sentCount: successCount,
        status: 'PUBLISHED',
        publishedAt: now
      }
    })

    console.log('Newsletter sent and published:', {
      id: updatedNewsletter.id,
      title: updatedNewsletter.title,
      status: updatedNewsletter.status,
      publishedAt: updatedNewsletter.publishedAt,
      successCount,
      failureCount
    })

    return NextResponse.json({ 
      success: true, 
      sentCount: successCount,
      failureCount,
      totalSubscribers: subscribers.length,
      newsletter: updatedNewsletter
    })
  } catch (error) {
    console.error('Error sending newsletter:', error)
    return NextResponse.json({ error: 'Failed to send newsletter' }, { status: 500 })
  }
}
