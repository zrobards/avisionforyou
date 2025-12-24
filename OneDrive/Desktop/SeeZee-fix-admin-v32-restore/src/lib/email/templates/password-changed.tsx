import { renderEmailLayout } from "../send";

export interface PasswordChangedEmailProps {
  name: string;
  timestamp: string;
  ipAddress?: string;
  location?: string;
  deviceInfo?: string;
}

export function renderPasswordChangedEmail({
  name,
  timestamp,
  ipAddress,
  location,
  deviceInfo,
}: PasswordChangedEmailProps): { html: string; text: string } {
  const html = renderEmailLayout(`
    <h1 style="margin: 0 0 20px 0; font-size: 28px; font-weight: 700; color: #111827;">
      Password Changed
    </h1>
    
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #374151;">
      Hi ${name},
    </p>
    
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #374151;">
      Your password was successfully changed.
    </p>
    
    <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280;">
        <strong style="color: #111827;">Time:</strong> ${timestamp}
      </p>
      ${ipAddress ? `
        <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280;">
          <strong style="color: #111827;">IP Address:</strong> ${ipAddress}
        </p>
      ` : ''}
      ${location ? `
        <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280;">
          <strong style="color: #111827;">Location:</strong> ${location}
        </p>
      ` : ''}
      ${deviceInfo ? `
        <p style="margin: 0; font-size: 14px; color: #6b7280;">
          <strong style="color: #111827;">Device:</strong> ${deviceInfo}
        </p>
      ` : ''}
    </div>
    
    <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 24px 0; border-radius: 6px;">
      <p style="margin: 0; font-size: 14px; color: #991b1b;">
        <strong style="color: #7f1d1d;">If you didn't make this change:</strong><br>
        Your account may be compromised. Please contact our support team immediately and consider enabling two-factor authentication to secure your account.
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://see-zee.com'}/settings/security" class="button" style="background: #dc2626; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; display: inline-block; font-weight: 600;">
        Review Security Settings
      </a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    
    <p style="margin: 0; font-size: 14px; color: #6b7280;">
      Need help? <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://see-zee.com'}/support" style="color: #dc2626; text-decoration: none;">Contact our support team</a>
    </p>
  `);
  
  const text = `
Password Changed

Hi ${name},

Your password was successfully changed.

Details:
Time: ${timestamp}
${ipAddress ? `IP Address: ${ipAddress}` : ''}
${location ? `Location: ${location}` : ''}
${deviceInfo ? `Device: ${deviceInfo}` : ''}

If you didn't make this change, your account may be compromised. Please contact our support team immediately and consider enabling two-factor authentication.

Review your security settings: ${process.env.NEXT_PUBLIC_APP_URL || 'https://see-zee.com'}/settings/security

Need help? Contact support at ${process.env.NEXT_PUBLIC_APP_URL || 'https://see-zee.com'}/support

--
SeeZee Studio
Accessible web development for nonprofits & mental health organizations
  `.trim();
  
  return { html, text };
}









