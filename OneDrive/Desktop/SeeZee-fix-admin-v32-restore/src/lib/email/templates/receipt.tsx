import { renderEmailLayout } from "../send";

export type ReceiptType = 
  | 'invoice' 
  | 'hour-pack' 
  | 'maintenance-plan' 
  | 'subscription' 
  | 'deposit' 
  | 'questionnaire';

export interface ReceiptEmailProps {
  customerName: string;
  customerEmail: string;
  receiptType: ReceiptType;
  amount: number;
  currency?: string;
  transactionId: string;
  invoiceNumber?: string;
  description?: string;
  items?: Array<{
    name: string;
    quantity: number;
    amount: number;
  }>;
  instructions?: string;
  dashboardUrl?: string;
  invoiceUrl?: string;
  // Hour pack specific
  hours?: number;
  expirationDays?: number | null;
  // Subscription specific
  subscriptionTier?: string;
  nextBillingDate?: Date;
}

export function renderReceiptEmail({
  customerName,
  customerEmail,
  receiptType,
  amount,
  currency = 'USD',
  transactionId,
  invoiceNumber,
  description,
  items = [],
  instructions,
  dashboardUrl,
  invoiceUrl,
  hours,
  expirationDays,
  subscriptionTier,
  nextBillingDate,
}: ReceiptEmailProps): { html: string; text: string } {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);

  const receiptTypeLabels: Record<ReceiptType, string> = {
    invoice: 'Invoice Payment',
    'hour-pack': 'Hour Pack Purchase',
    'maintenance-plan': 'Maintenance Plan Subscription',
    subscription: 'Subscription Payment',
    deposit: 'Project Deposit',
    questionnaire: 'Project Request Payment',
  };

  const receiptTitle = receiptTypeLabels[receiptType] || 'Payment Receipt';

  // Build items list HTML
  let itemsHtml = '';
  if (items.length > 0) {
    itemsHtml = `
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
            <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Item</th>
            <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">Quantity</th>
            <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item, idx) => `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; color: #374151;">${item.name}</td>
              <td style="padding: 12px; text-align: right; color: #6b7280;">${item.quantity}</td>
              <td style="padding: 12px; text-align: right; color: #374151; font-weight: 500;">${new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(item.amount)}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 12px; text-align: right; font-weight: 600; color: #111827;">Total:</td>
            <td style="padding: 12px; text-align: right; font-weight: 700; color: #111827; font-size: 18px;">${formattedAmount}</td>
          </tr>
        </tfoot>
      </table>
    `;
  }

  // Build type-specific instructions
  let typeInstructions = '';
  
  if (receiptType === 'hour-pack' && hours) {
    const expirationText = expirationDays 
      ? `These hours are valid for ${expirationDays} days from purchase.`
      : 'These hours never expire.';
    typeInstructions = `
      <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 6px;">
        <p style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #1e40af;">
          Your Hour Pack Details
        </p>
        <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
          <li style="margin-bottom: 8px;"><strong>${hours} hours</strong> have been added to your account</li>
          <li style="margin-bottom: 8px;">${expirationText}</li>
          <li style="margin-bottom: 8px;">You can view your available hours in your <a href="${dashboardUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://see-zee.com'}/client/hours`}" style="color: #3b82f6; text-decoration: underline;">client dashboard</a></li>
        </ul>
      </div>
    `;
  } else if (receiptType === 'maintenance-plan' || receiptType === 'subscription') {
    const nextBillingText = nextBillingDate 
      ? `Your next billing date is ${nextBillingDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`
      : '';
    typeInstructions = `
      <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0; border-radius: 6px;">
        <p style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #065f46;">
          Your Subscription is Active
        </p>
        <ul style="margin: 0; padding-left: 20px; color: #065f46;">
          ${subscriptionTier ? `<li style="margin-bottom: 8px;"><strong>Plan:</strong> ${subscriptionTier}</li>` : ''}
          ${nextBillingText ? `<li style="margin-bottom: 8px;">${nextBillingText}</li>` : ''}
          <li style="margin-bottom: 8px;">You can manage your subscription in your <a href="${dashboardUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://see-zee.com'}/client/subscriptions`}" style="color: #10b981; text-decoration: underline;">client dashboard</a></li>
        </ul>
      </div>
    `;
  } else if (receiptType === 'invoice') {
    typeInstructions = `
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 6px;">
        <p style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #92400e;">
          Payment Confirmed
        </p>
        <p style="margin: 0; color: #92400e;">
          Your invoice payment has been successfully processed. ${invoiceUrl ? `You can view your invoice <a href="${invoiceUrl}" style="color: #f59e0b; text-decoration: underline;">here</a>.` : ''}
        </p>
      </div>
    `;
  } else if (receiptType === 'deposit' || receiptType === 'questionnaire') {
    typeInstructions = `
      <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0; border-radius: 6px;">
        <p style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #065f46;">
          What's Next?
        </p>
        <ul style="margin: 0; padding-left: 20px; color: #065f46;">
          <li style="margin-bottom: 8px;">Our team will review your project request within 24 hours</li>
          <li style="margin-bottom: 8px;">You'll receive an email with next steps and project details</li>
          <li style="margin-bottom: 8px;">Track your project progress in your <a href="${dashboardUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://see-zee.com'}/client`}" style="color: #10b981; text-decoration: underline;">client dashboard</a></li>
        </ul>
      </div>
    `;
  }

  // Custom instructions override
  if (instructions) {
    typeInstructions = `
      <div style="background: #f9fafb; border-left: 4px solid #6b7280; padding: 16px; margin: 24px 0; border-radius: 6px;">
        <p style="margin: 0; color: #374151; white-space: pre-line;">${instructions}</p>
      </div>
    `;
  }

  const html = renderEmailLayout(`
    <h1 style="margin: 0 0 20px 0; font-size: 28px; font-weight: 700; color: #111827;">
      Payment Receipt - ${receiptTitle}
    </h1>
    
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #374151;">
      Hi ${customerName || customerEmail.split('@')[0]},
    </p>
    
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #374151;">
      Thank you for your payment! This email confirms your transaction has been successfully processed.
    </p>
    
    <div style="background: #ffffff; border: 2px solid #e5e7eb; border-radius: 8px; padding: 24px; margin: 24px 0;">
      <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: #111827;">
        Receipt Details
      </h2>
      
      ${invoiceNumber ? `
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">
          <strong>Invoice Number:</strong> ${invoiceNumber}
        </p>
      ` : ''}
      
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">
        <strong>Transaction ID:</strong> ${transactionId}
      </p>
      
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">
        <strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        })}
      </p>
      
      ${description ? `
        <p style="margin: 16px 0 8px 0; font-size: 14px; color: #6b7280;">
          <strong>Description:</strong>
        </p>
        <p style="margin: 0 0 16px 0; font-size: 14px; color: #374151;">
          ${description}
        </p>
      ` : ''}
      
      ${itemsHtml}
      
      ${!itemsHtml ? `
        <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 18px; font-weight: 600; color: #111827;">Total Amount:</span>
            <span style="font-size: 24px; font-weight: 700; color: #dc2626;">${formattedAmount}</span>
          </div>
        </div>
      ` : ''}
    </div>
    
    ${typeInstructions}
    
    ${dashboardUrl ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${dashboardUrl}" class="button" style="background: #dc2626; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; display: inline-block; font-weight: 600;">
          View Dashboard
        </a>
      </div>
    ` : ''}
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    
    <div style="background: #f9fafb; padding: 16px; border-radius: 6px; margin: 24px 0;">
      <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #374151;">
        Need Help?
      </p>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">
        If you have any questions about this receipt or your purchase, please don't hesitate to contact us:
      </p>
      <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px;">
        <li style="margin-bottom: 4px;">Email: <a href="mailto:support@see-zee.com" style="color: #dc2626; text-decoration: none;">support@see-zee.com</a></li>
        <li style="margin-bottom: 4px;">Phone: <a href="tel:5024352986" style="color: #dc2626; text-decoration: none;">(502) 435-2986</a></li>
        <li style="margin-bottom: 4px;">Visit: <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://see-zee.com'}/contact" style="color: #dc2626; text-decoration: none;">Contact Us</a></li>
      </ul>
    </div>
    
    <p style="margin: 24px 0 0 0; font-size: 12px; color: #9ca3af; text-align: center;">
      This is an automated receipt. Please save this email for your records.
    </p>
  `);

  // Plain text version
  const text = `
Payment Receipt - ${receiptTitle}

Hi ${customerName || customerEmail.split('@')[0]},

Thank you for your payment! This email confirms your transaction has been successfully processed.

RECEIPT DETAILS
${invoiceNumber ? `Invoice Number: ${invoiceNumber}\n` : ''}Transaction ID: ${transactionId}
Date: ${new Date().toLocaleDateString('en-US', { 
  month: 'long', 
  day: 'numeric', 
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
})}
${description ? `Description: ${description}\n` : ''}
${items.length > 0 ? items.map(item => `${item.name} (Qty: ${item.quantity}) - ${new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(item.amount)}`).join('\n') + '\n' : ''}Total Amount: ${formattedAmount}

${receiptType === 'hour-pack' && hours ? `HOUR PACK DETAILS\n${hours} hours have been added to your account. ${expirationDays ? `These hours are valid for ${expirationDays} days from purchase.` : 'These hours never expire.'}\n` : ''}
${receiptType === 'maintenance-plan' || receiptType === 'subscription' ? `SUBSCRIPTION DETAILS\n${subscriptionTier ? `Plan: ${subscriptionTier}\n` : ''}${nextBillingDate ? `Next billing date: ${nextBillingDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n` : ''}` : ''}
${instructions ? `\n${instructions}\n` : ''}
${dashboardUrl ? `View Dashboard: ${dashboardUrl}\n` : ''}
${invoiceUrl ? `View Invoice: ${invoiceUrl}\n` : ''}

Need Help?
If you have any questions about this receipt or your purchase, please contact us:
- Email: support@see-zee.com
- Phone: (502) 435-2986
- Visit: ${process.env.NEXT_PUBLIC_APP_URL || 'https://see-zee.com'}/contact

This is an automated receipt. Please save this email for your records.

--
SeeZee Studio
Accessible web development for nonprofits & mental health organizations
  `.trim();

  return { html, text };
}



