import { renderEmailLayout } from "../send";

export interface EmailChangedEmailProps {
  name: string;
  oldEmail: string;
  newEmail: string;
  timestamp: string;
}

export function renderEmailChangedEmail({
  name,
  oldEmail,
  newEmail,
  timestamp,
}: EmailChangedEmailProps): { html: string; text: string } {
  const html = renderEmailLayout(`
    <h1 style="margin: 0 0 20px 0; font-size: 28px; font-weight: 700; color: #111827;">
      Email Address Changed
    </h1>
    
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #374151;">
      Hi ${name},
    </p>
    
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #374151;">
      The email address associated with your SeeZee Studio account has been changed.
    </p>
    
    <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280;">
        <strong style="color: #111827;">Old Email:</strong> ${oldEmail}
      </p>
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280;">
        <strong style="color: #111827;">New Email:</strong> ${newEmail}
      </p>
      <p style="margin: 0; font-size: 14px; color: #6b7280;">
        <strong style="color: #111827;">Time:</strong> ${timestamp}
      </p>
    </div>
    
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #374151;">
      All future communications will be sent to <strong>${newEmail}</strong>.
    </p>
    
    <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 24px 0; border-radius: 6px;">
      <p style="margin: 0; font-size: 14px; color: #991b1b;">
        <strong style="color: #7f1d1d;">If you didn't make this change:</strong><br>
        Please contact our support team immediately to secure your account.
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://see-zee.com'}/support" class="button" style="background: #dc2626; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; display: inline-block; font-weight: 600;">
        Contact Support
      </a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    
    <p style="margin: 0; font-size: 14px; color: #6b7280;">
      This notification was sent to your old email address for security purposes.
    </p>
  `);
  
  const text = `
Email Address Changed

Hi ${name},

The email address associated with your SeeZee Studio account has been changed.

Old Email: ${oldEmail}
New Email: ${newEmail}
Time: ${timestamp}

All future communications will be sent to ${newEmail}.

If you didn't make this change, please contact our support team immediately to secure your account.

Contact Support: ${process.env.NEXT_PUBLIC_APP_URL || 'https://see-zee.com'}/support

This notification was sent to your old email address for security purposes.

--
SeeZee Studio
Accessible web development for nonprofits & mental health organizations
  `.trim();
  
  return { html, text };
}










