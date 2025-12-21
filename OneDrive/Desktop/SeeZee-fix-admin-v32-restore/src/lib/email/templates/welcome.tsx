import { renderEmailLayout } from "../send";

export interface WelcomeEmailProps {
  name: string;
  dashboardUrl: string;
}

export function renderWelcomeEmail({
  name,
  dashboardUrl,
}: WelcomeEmailProps): { html: string; text: string } {
  const html = renderEmailLayout(`
    <h1 style="margin: 0 0 20px 0; font-size: 28px; font-weight: 700; color: #111827;">
      Welcome to SeeZee Studio! 🎉
    </h1>
    
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #374151;">
      Hi ${name},
    </p>
    
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #374151;">
      Your email has been verified and your account is now active! We're excited to have you join the SeeZee Studio community.
    </p>
    
    <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0; border-radius: 6px;">
      <p style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #065f46;">
        What's Next?
      </p>
      <ul style="margin: 0; padding-left: 20px; color: #065f46;">
        <li style="margin-bottom: 8px;">Complete your profile to get personalized recommendations</li>
        <li style="margin-bottom: 8px;">Explore our services and pricing</li>
        <li style="margin-bottom: 8px;">Start your first project with us</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${dashboardUrl}" class="button" style="background: #dc2626; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; display: inline-block; font-weight: 600;">
        Go to Dashboard
      </a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    
    <p style="margin: 0 0 16px 0; font-size: 14px; color: #6b7280;">
      <strong>Need help getting started?</strong><br>
      Check out our <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://see-zee.com'}/docs" style="color: #dc2626; text-decoration: none;">documentation</a> or <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://see-zee.com'}/support" style="color: #dc2626; text-decoration: none;">contact support</a>.
    </p>
  `);
  
  const text = `
Welcome to SeeZee Studio!

Hi ${name},

Your email has been verified and your account is now active! We're excited to have you join the SeeZee Studio community.

What's Next?
• Complete your profile to get personalized recommendations
• Explore our services and pricing
• Start your first project with us

Get started: ${dashboardUrl}

Need help? Check out our documentation at ${process.env.NEXT_PUBLIC_APP_URL || 'https://see-zee.com'}/docs or contact support at ${process.env.NEXT_PUBLIC_APP_URL || 'https://see-zee.com'}/support

--
SeeZee Studio
Accessible web development for nonprofits & mental health organizations
  `.trim();
  
  return { html, text };
}




