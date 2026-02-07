import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

function htmlResponse(title: string, heading: string, message: string, success: boolean) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} | A Vision For You</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f5;
      color: #1f2937;
    }
    .container {
      max-width: 520px;
      width: 100%;
      margin: 24px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #7f3d8b 0%, #5a2d62 100%);
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      color: #b6e41f;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .body {
      padding: 40px 32px;
      text-align: center;
    }
    .icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 28px;
      background-color: ${success ? '#f0fdf4' : '#fef2f2'};
      color: ${success ? '#16a34a' : '#dc2626'};
    }
    .body h2 {
      font-size: 20px;
      margin-bottom: 12px;
      color: #1f2937;
    }
    .body p {
      color: #6b7280;
      line-height: 1.6;
      font-size: 15px;
    }
    .footer {
      padding: 20px 32px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      background-color: #fafafa;
    }
    .footer a {
      color: #7f3d8b;
      text-decoration: none;
      font-weight: 500;
      font-size: 14px;
    }
    .footer a:hover { text-decoration: underline; }
    .footer p {
      color: #9ca3af;
      font-size: 12px;
      margin-top: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>A Vision For You</h1>
    </div>
    <div class="body">
      <div class="icon">${success ? '&#10003;' : '&#10007;'}</div>
      <h2>${heading}</h2>
      <p>${message}</p>
    </div>
    <div class="footer">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://avisionforyourecovery.org'}">Return to Website</a>
      <p>&copy; ${new Date().getFullYear()} A Vision For You | 501(c)(3) Nonprofit</p>
    </div>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    status: success ? 200 : 400,
    headers: { 'Content-Type': 'text/html' },
  })
}

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get('email')

    if (!email || !email.includes('@')) {
      return htmlResponse(
        'Invalid Request',
        'Invalid Unsubscribe Link',
        'This unsubscribe link is missing a valid email address. If you believe this is an error, please contact us directly.',
        false,
      )
    }

    const subscriber = await db.newsletterSubscriber.findUnique({
      where: { email },
    })

    if (!subscriber) {
      return htmlResponse(
        'Not Found',
        'Email Not Found',
        `We could not find a subscription for <strong>${email}</strong>. You may have already been removed, or the email address may be incorrect.`,
        false,
      )
    }

    if (!subscriber.subscribed) {
      return htmlResponse(
        'Already Unsubscribed',
        'Already Unsubscribed',
        `<strong>${email}</strong> is already unsubscribed from our newsletter. No further action is needed.`,
        true,
      )
    }

    await db.newsletterSubscriber.update({
      where: { email },
      data: {
        subscribed: false,
        unsubscribedAt: new Date(),
      },
    })

    return htmlResponse(
      'Unsubscribed',
      'Successfully Unsubscribed',
      `<strong>${email}</strong> has been removed from our mailing list. You will no longer receive newsletter emails from A Vision For You. We wish you all the best.`,
      true,
    )
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error)
    return htmlResponse(
      'Error',
      'Something Went Wrong',
      'We were unable to process your unsubscribe request. Please try again later or contact us directly for assistance.',
      false,
    )
  }
}
