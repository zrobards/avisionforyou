import { renderEmailLayout } from "../send";

interface PasswordResetEmailProps {
  name: string;
  resetCode: string;
  expiresIn: number; // minutes
}

export function renderPasswordResetEmail({
  name,
  resetCode,
  expiresIn,
}: PasswordResetEmailProps): { html: string; text: string } {
  const content = `
    <h1 style="font-size: 28px; font-weight: bold; color: #111827; margin-bottom: 16px;">
      Reset Your Password
    </h1>
    
    <p style="font-size: 16px; color: #4b5563; margin-bottom: 24px;">
      Hi ${name},
    </p>
    
    <p style="font-size: 16px; color: #4b5563; margin-bottom: 24px;">
      We received a request to reset your password. Use the code below to reset your password:
    </p>
    
    <div style="background: #f3f4f6; border: 2px dashed #d1d5db; border-radius: 12px; padding: 24px; margin: 32px 0; text-align: center;">
      <div style="font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
        Your Reset Code
      </div>
      <div style="font-size: 42px; font-weight: bold; color: #dc2626; letter-spacing: 8px; font-family: 'Courier New', monospace;">
        ${resetCode}
      </div>
      <div style="font-size: 13px; color: #9ca3af; margin-top: 12px;">
        Valid for ${expiresIn} minutes
      </div>
    </div>
    
    <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; border-radius: 8px; margin: 24px 0;">
      <p style="font-size: 14px; color: #991b1b; margin: 0;">
        <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email. 
        Your account is safe and no changes will be made.
      </p>
    </div>
    
    <p style="font-size: 16px; color: #4b5563; margin-bottom: 12px;">
      To reset your password:
    </p>
    
    <ol style="font-size: 16px; color: #4b5563; line-height: 1.8; padding-left: 20px;">
      <li>Enter the code above on the password reset page</li>
      <li>Create a new strong password</li>
      <li>You'll be logged out of all devices for security</li>
    </ol>
    
    <p style="font-size: 14px; color: #6b7280; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
      Need help? Contact us at <a href="mailto:support@see-zee.com" style="color: #dc2626; text-decoration: none;">support@see-zee.com</a>
    </p>
  `;

  const text = `
Reset Your Password

Hi ${name},

We received a request to reset your password. Use the code below to reset your password:

YOUR RESET CODE: ${resetCode}
(Valid for ${expiresIn} minutes)

⚠️ Security Notice: If you didn't request this password reset, please ignore this email. Your account is safe and no changes will be made.

To reset your password:
1. Enter the code above on the password reset page
2. Create a new strong password
3. You'll be logged out of all devices for security

Need help? Contact us at support@see-zee.com

---
SeeZee Studio
Accessible web development for nonprofits & mental health organizations
  `.trim();

  return {
    html: renderEmailLayout(content),
    text,
  };
}




